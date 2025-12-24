import { Router } from 'express';
import { storage } from '../storage';
import { verifyFirebaseToken } from '../firebase-auth';
import { z } from 'zod';

const router = Router();

// Middleware to check if user is a superadmin
const isSuperAdmin = async (req, res, next) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get user from database using Firebase UID
    const user = await storage.getUserByFirebaseUid(req.firebaseUser.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is a superadmin
    if (user.role === 'superadmin') {
      req.userId = user.id; // Store user ID for convenience
      return next();
    }
    
    return res.status(403).json({ message: 'Super Admin access required' });
  } catch (error) {
    console.error('Error in isSuperAdmin middleware:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Schema for creating/updating blood banks
const bloodBankSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City name must be at least 2 characters"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  email: z.string().email("Invalid email address").optional(),
  website: z.string().url("Invalid website URL").optional(),
  latitude: z.number().or(z.string().transform(val => parseFloat(val)))
    .refine(val => !isNaN(val) && val >= -90 && val <= 90, "Latitude must be between -90 and 90"),
  longitude: z.number().or(z.string().transform(val => parseFloat(val)))
    .refine(val => !isNaN(val) && val >= -180 && val <= 180, "Longitude must be between -180 and 180"),
  status: z.enum(['active', 'inactive']).default('active'),
  inventoryLevels: z.object({
    'A+': z.number().min(0).default(0),
    'A-': z.number().min(0).default(0),
    'B+': z.number().min(0).default(0),
    'B-': z.number().min(0).default(0),
    'AB+': z.number().min(0).default(0),
    'AB-': z.number().min(0).default(0),
    'O+': z.number().min(0).default(0),
    'O-': z.number().min(0).default(0),
  }).optional(),
});

// Schema for updating inventory levels only
const inventoryUpdateSchema = z.object({
  'A+': z.number().min(0),
  'A-': z.number().min(0),
  'B+': z.number().min(0),
  'B-': z.number().min(0),
  'AB+': z.number().min(0),
  'AB-': z.number().min(0),
  'O+': z.number().min(0),
  'O-': z.number().min(0),
});

// Route to create a new blood bank (superadmin only)
router.post(
  '/',
  verifyFirebaseToken,
  isSuperAdmin,
  async (req, res) => {
    try {
      const validationResult = bloodBankSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid input',
          errors: validationResult.error.errors 
        });
      }
      
      const bloodBankData = validationResult.data;
      
      // Create blood bank
      const newBloodBank = await storage.createBloodBank({
        ...bloodBankData,
        createdBy: req.userId
      });
      
      return res.status(201).json(newBloodBank);
    } catch (error) {
      console.error('Error creating blood bank:', error);
      return res.status(500).json({ message: error.message || 'Failed to create blood bank' });
    }
  }
);

// Route to get all blood banks (publicly accessible)
router.get('/', async (req, res) => {
  try {
    const bloodBanks = await storage.getAllBloodBanks();
    return res.status(200).json(bloodBanks);
  } catch (error) {
    console.error('Error getting blood banks:', error);
    return res.status(500).json({ message: error.message || 'Failed to get blood banks' });
  }
});

// Route to get a single blood bank by id (publicly accessible)
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid blood bank ID' });
    }
    
    const bloodBank = await storage.getBloodBankById(id);
    
    if (!bloodBank) {
      return res.status(404).json({ message: 'Blood bank not found' });
    }
    
    return res.status(200).json(bloodBank);
  } catch (error) {
    console.error('Error getting blood bank:', error);
    return res.status(500).json({ message: error.message || 'Failed to get blood bank' });
  }
});

// Route to update a blood bank (superadmin only)
router.put(
  '/:id',
  verifyFirebaseToken,
  isSuperAdmin,
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid blood bank ID' });
      }
      
      const validationResult = bloodBankSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid input',
          errors: validationResult.error.errors 
        });
      }
      
      const bloodBankData = validationResult.data;
      
      // Check if blood bank exists
      const existingBloodBank = await storage.getBloodBankById(id);
      if (!existingBloodBank) {
        return res.status(404).json({ message: 'Blood bank not found' });
      }
      
      // Update blood bank
      const updatedBloodBank = await storage.updateBloodBank(id, bloodBankData);
      
      return res.status(200).json(updatedBloodBank);
    } catch (error) {
      console.error('Error updating blood bank:', error);
      return res.status(500).json({ message: error.message || 'Failed to update blood bank' });
    }
  }
);

// Route to update inventory levels only (superadmin and admin access)
router.patch(
  '/:id/inventory',
  verifyFirebaseToken,
  async (req, res) => {
    try {
      // Check if user is admin or superadmin
      const user = await storage.getUserByFirebaseUid(req.firebaseUser.uid);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.status(403).json({ message: 'Admin or Super Admin access required' });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid blood bank ID' });
      }
      
      const validationResult = inventoryUpdateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid input',
          errors: validationResult.error.errors 
        });
      }
      
      const inventoryLevels = validationResult.data;
      
      // Check if blood bank exists
      const existingBloodBank = await storage.getBloodBankById(id);
      if (!existingBloodBank) {
        return res.status(404).json({ message: 'Blood bank not found' });
      }
      
      // Update inventory levels
      const updatedBloodBank = await storage.updateBloodBank(id, { inventoryLevels });
      
      return res.status(200).json(updatedBloodBank);
    } catch (error) {
      console.error('Error updating inventory levels:', error);
      return res.status(500).json({ message: error.message || 'Failed to update inventory levels' });
    }
  }
);

// Route to delete a blood bank (superadmin only)
router.delete(
  '/:id',
  verifyFirebaseToken,
  isSuperAdmin,
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid blood bank ID' });
      }
      
      // Check if blood bank exists
      const existingBloodBank = await storage.getBloodBankById(id);
      if (!existingBloodBank) {
        return res.status(404).json({ message: 'Blood bank not found' });
      }
      
      // Delete blood bank
      await storage.deleteBloodBank(id);
      
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting blood bank:', error);
      return res.status(500).json({ message: error.message || 'Failed to delete blood bank' });
    }
  }
);

export default router;