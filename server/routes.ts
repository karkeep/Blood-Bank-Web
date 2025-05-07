import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { 
  insertEmergencyRequestSchema,
  insertDocumentSchema
} from "@shared/schema";

// Configure storage for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized. Please log in." });
  };

  // Middleware to check if user is an admin
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    res.status(403).json({ message: "Forbidden. Admin access required." });
  };

  // ==== User Routes ====
  
  // Get user profile
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password to client
      const { password, ...userWithoutPassword } = user;
      
      // Get donor profile if user is a donor
      let donorProfile = null;
      if (user.role === 'donor') {
        donorProfile = await storage.getDonorProfileByUserId(user.id);
      }
      
      res.json({
        ...userWithoutPassword,
        donorProfile
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update user profile
  app.put("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user.id, req.body);
      
      // Don't return password to client
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ==== Document Upload Routes ====

  // Upload document for verification
  app.post("/api/documents", isAuthenticated, upload.single('document'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const documentData = insertDocumentSchema.parse({
        userId: req.user.id,
        type: req.body.type,
        fileName: file.originalname,
        filePath: file.path,
        verificationStatus: 'Pending',
        notes: req.body.notes || null
      });

      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get user's documents
  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByUserId(req.user.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ==== Emergency Request Routes ====

  // Create emergency request
  app.post("/api/emergency-requests", async (req, res) => {
    try {
      const requesterId = req.isAuthenticated() ? req.user.id : null;
      
      // Calculate expiration time based on urgency level
      const expiresAtHours = {
        'critical': 3,
        'urgent': 12,
        'standard': 24
      }[req.body.urgencyLevel] || 12;
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresAtHours);
      
      const requestData = insertEmergencyRequestSchema.parse({
        ...req.body,
        requesterId: requesterId,
        expiresAt: expiresAt,
        // Add default location if not provided
        location: req.body.location || {
          latitude: 40.7128,
          longitude: -74.0060
        }
      });

      const emergencyRequest = await storage.createEmergencyRequest(requestData);
      
      // In a real app, we would trigger notifications to matching donors here
      // and handle real-time updates via WebSockets
      
      res.status(201).json(emergencyRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all emergency requests (admin only)
  app.get("/api/emergency-requests", isAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllEmergencyRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get active emergency requests
  app.get("/api/emergency-requests/active", async (req, res) => {
    try {
      const activeRequests = await storage.getActiveEmergencyRequests();
      res.json(activeRequests);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get emergency request by id
  app.get("/api/emergency-requests/:id", async (req, res) => {
    try {
      const request = await storage.getEmergencyRequestById(parseInt(req.params.id));
      if (!request) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update emergency request status (admin only)
  app.put("/api/emergency-requests/:id", isAdmin, async (req, res) => {
    try {
      const updatedRequest = await storage.updateEmergencyRequest(
        parseInt(req.params.id),
        req.body
      );
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ==== Donor Routes ====

  // Get all donors
  app.get("/api/donors", async (req, res) => {
    try {
      const bloodType = req.query.bloodType as string;
      let donors;
      
      if (bloodType) {
        donors = await storage.getDonorsByBloodType(bloodType);
      } else {
        donors = await storage.getAllDonors();
      }
      
      // Remove sensitive information for public API
      const sanitizedDonors = donors.map(donor => {
        const { password, ...userWithoutPassword } = donor;
        return {
          ...userWithoutPassword,
          email: undefined, // Don't expose email to public
          phoneNumber: undefined // Don't expose phone to public
        };
      });
      
      res.json(sanitizedDonors);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get top donors
  app.get("/api/top-donors", async (req, res) => {
    try {
      const topDonors = await storage.getTopDonors();
      
      // Remove sensitive information
      const sanitizedDonors = topDonors.map(donor => {
        const { password, ...userWithoutPassword } = donor;
        return {
          id: donor.id.toString(),
          name: "Anonymous Hero", // Anonymize names
          badge: donor.donorProfile.badge,
          bloodType: donor.bloodType,
          donations: donor.donorProfile.totalDonations,
          liters: donor.donorProfile.litersDonated / 1000, // Convert from ml to liters
          livesSaved: donor.donorProfile.livesSaved
        };
      });
      
      res.json(sanitizedDonors);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ==== Donation Records Routes ====

  // Create donation record
  app.post("/api/donations", isAuthenticated, async (req, res) => {
    try {
      const donationData = {
        ...req.body,
        donorId: req.user.id
      };

      const donation = await storage.createDonationRecord(donationData);
      
      // Update donor profile stats
      await storage.updateDonorStats(req.user.id, donation.volume);
      
      res.status(201).json(donation);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get user donation history
  app.get("/api/donations/history", isAuthenticated, async (req, res) => {
    try {
      const donationHistory = await storage.getDonationsByDonorId(req.user.id);
      res.json(donationHistory);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ==== Analytics Routes ====

  // Get recent activities
  app.get("/api/recent-activities", async (req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get city inventory
  app.get("/api/city-inventory", async (req, res) => {
    try {
      const inventory = await storage.getCityInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get top donor cities
  app.get("/api/top-donor-cities", async (req, res) => {
    try {
      const cities = await storage.getTopDonorCities();
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get cities needing donors
  app.get("/api/cities-needing-donors", async (req, res) => {
    try {
      const cities = await storage.getCitiesNeedingDonors();
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ==== Admin Dashboard Routes ====

  // Get admin dashboard stats
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Verify a document
  app.put("/api/admin/documents/:id/verify", isAdmin, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const status = req.body.status;
      const notes = req.body.notes;
      
      const document = await storage.verifyDocument(documentId, status, notes);
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
