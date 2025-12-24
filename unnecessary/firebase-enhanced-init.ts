// firebase-enhanced-init.ts - Enhanced Firebase Database Structure
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
async function initializeFirebase() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || "jiwandan-blood-bank";
    const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://jiwandan-blood-bank-default-rtdb.firebaseio.com";
    
    console.log("Initializing Firebase Admin SDK...");
    console.log(`Project ID: ${projectId}`);
    console.log(`Database URL: ${databaseURL}`);
    
    const serviceAccountPath = path.join(__dirname, 'firebase-credentials.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      try {
        admin.app();
        console.log("Firebase Admin SDK already initialized");
      } catch (error) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL
        });
        console.log("Firebase Admin SDK initialized successfully");
      }
      
      return true;
    } else {
      console.log("No service account file found at", serviceAccountPath);
      return false;
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    return false;
  }
}

async function initializeEnhancedDatabase() {
  try {
    const firebaseInitialized = await initializeFirebase();
    if (!firebaseInitialized) {
      console.error("Failed to initialize Firebase. Aborting.");
      process.exit(1);
    }
    
    const database = admin.database();
    console.log("Starting enhanced database initialization...");
    
    // Enhanced sample users with comprehensive profiles
    const users = [
      {
        id: "1",
        uid: "sample-firebase-uid-1",
        username: "john_donor",
        email: "john@example.com",
        fullName: "John Doe",
        phoneNumber: "+1234567890",
        bloodType: "O+",
        role: "donor",
        isAdmin: false,
        profileCompleted: true,
        accountStatus: "Active",
        verificationStatus: "Verified",
        location: {
          address: "123 Main St",
          city: "Kathmandu",
          state: "Bagmati",
          country: "Nepal",
          zipCode: "44600",
          latitude: 27.7172,
          longitude: 85.3240
        },
        medicalInfo: {
          weight: 70,
          eligibilityStatus: "Eligible",
          medicalConditions: [],
          allergies: []
        },
        contactPreferences: {
          emailNotifications: true,
          smsNotifications: true,
          emergencyAlerts: true,
          marketingEmails: false
        },
        privacySettings: {
          profileVisibility: "Public",
          showLocation: true,
          showContactInfo: true,
          showDonationHistory: true
        },
        createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000, // 1 year ago
        updatedAt: Date.now(),
        lastLoginAt: Date.now() - 24 * 60 * 60 * 1000 // 1 day ago
      },
      {
        id: "2",
        uid: "sample-firebase-uid-2",
        username: "jane_requester",
        email: "jane@example.com",
        fullName: "Jane Smith",
        phoneNumber: "+1234567891",
        bloodType: "A-",
        role: "requester",
        isAdmin: false,
        profileCompleted: true,
        accountStatus: "Active",
        verificationStatus: "Verified",
        location: {
          address: "456 Hospital Ave",
          city: "Pokhara",
          state: "Gandaki",
          country: "Nepal",
          zipCode: "33700",
          latitude: 28.2096,
          longitude: 83.9856
        },
        contactPreferences: {
          emailNotifications: true,
          smsNotifications: true,
          emergencyAlerts: true,
          marketingEmails: true
        },
        privacySettings: {
          profileVisibility: "DonorsOnly",
          showLocation: true,
          showContactInfo: false,
          showDonationHistory: false
        },
        createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000, // 6 months ago
        updatedAt: Date.now(),
        lastLoginAt: Date.now() - 12 * 60 * 60 * 1000 // 12 hours ago
      },
      {
        id: "3",
        uid: "sample-firebase-uid-3",
        username: "admin_user",
        email: "admin@lifelink.com",
        fullName: "Admin User",
        phoneNumber: "+1234567892",
        bloodType: "AB+",
        role: "admin",
        isAdmin: true,
        profileCompleted: true,
        accountStatus: "Active",
        verificationStatus: "Verified",
        contactPreferences: {
          emailNotifications: true,
          smsNotifications: true,
          emergencyAlerts: true,
          marketingEmails: false
        },
        createdAt: Date.now() - 730 * 24 * 60 * 60 * 1000, // 2 years ago
        updatedAt: Date.now(),
        lastLoginAt: Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago
      }
    ];

    // Enhanced donor profiles
    const donorProfiles = [
      {
        id: "1",
        userId: "1",
        status: "Available",
        badge: "Gold",
        totalDonations: 25,
        litersDonated: 11250, // 25 * 450ml
        livesSaved: 75,
        donationStreak: 5,
        lastDonationDate: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
        nextEligibleDate: Date.now() - 34 * 24 * 60 * 60 * 1000, // Already eligible
        address: "123 Main St",
        city: "Kathmandu",
        state: "Bagmati",
        country: "Nepal",
        zipCode: "44600",
        latitude: 27.7172,
        longitude: 85.3240,
        travelRadius: 15,
        emergencyAvailable: true,
        emergencyContactTime: "Within_1_Hour",
        availableTimeSlots: [
          { day: "Monday", startTime: "09:00", endTime: "17:00", isAvailable: true },
          { day: "Tuesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
          { day: "Wednesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
          { day: "Thursday", startTime: "09:00", endTime: "17:00", isAvailable: true },
          { day: "Friday", startTime: "09:00", endTime: "17:00", isAvailable: true },
          { day: "Saturday", startTime: "10:00", endTime: "14:00", isAvailable: true },
          { day: "Sunday", startTime: "10:00", endTime: "14:00", isAvailable: false }
        ],
        medicalClearance: {
          lastCheckupDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
          clearanceStatus: "Valid",
          expiryDate: Date.now() + 335 * 24 * 60 * 60 * 1000, // 11 months from now
          doctorNotes: "Excellent health, eligible for regular donations"
        },
        verificationStatus: "Verified",
        verifiedAt: Date.now() - 300 * 24 * 60 * 60 * 1000, // 10 months ago
        isVisible: true,
        showContactInfo: true,
        profileDescription: "Regular donor committed to saving lives. Available for emergency calls.",
        transportationNeeded: false,
        languagePreferences: ["English", "Nepali"],
        achievements: [
          {
            type: "donation_milestone",
            title: "25 Donations Milestone",
            description: "Completed 25 successful blood donations",
            earnedAt: Date.now() - 30 * 24 * 60 * 60 * 1000
          },
          {
            type: "emergency_hero",
            title: "Emergency Hero",
            description: "Responded to 5 emergency blood requests",
            earnedAt: Date.now() - 60 * 24 * 60 * 60 * 1000
          }
        ],
        rating: {
          averageRating: 4.8,
          totalReviews: 12,
          lastReviewDate: Date.now() - 15 * 24 * 60 * 60 * 1000
        },
        createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now()
      }
    ];

    // Enhanced emergency requests
    const emergencyRequests = [
      {
        id: "1",
        requesterId: "2",
        patientName: "Alex Smith",
        patientAge: 35,
        patientGender: "Male",
        bloodType: "A-",
        unitsNeeded: 3,
        urgency: "Urgent",
        requestReason: "Emergency surgery due to accident",
        medicalCondition: "Trauma from vehicle accident",
        hospitalName: "Grande International Hospital",
        hospitalAddress: "Dhapasi, Kathmandu",
        hospitalCity: "Kathmandu",
        hospitalState: "Bagmati",
        hospitalCountry: "Nepal",
        hospitalZipCode: "44600",
        latitude: 27.7500,
        longitude: 85.3667,
        hospitalPhone: "+977-1-5159266",
        contactName: "Jane Smith",
        contactPhone: "+1234567891",
        contactEmail: "jane@example.com",
        contactRelation: "Sister",
        alternateContact: {
          name: "Bob Smith",
          phone: "+1234567893",
          relation: "Father"
        },
        status: "Active",
        priority: 8,
        donorIds: [],
        interestedDonorIds: [],
        neededBy: Date.now() + 8 * 60 * 60 * 1000, // 8 hours from now
        createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        updatedAt: Date.now(),
        expiresAt: Date.now() + 22 * 60 * 60 * 1000, // 22 hours from now
        bloodComponents: "Red_Cells",
        specialRequirements: ["CMV Negative"],
        notes: "Patient is stable but needs blood for upcoming surgery",
        hospitalVerified: true,
        requestVerified: true,
        notificationCount: 2,
        lastNotificationSent: Date.now() - 30 * 60 * 1000 // 30 minutes ago
      }
    ];

    // Enhanced donation records
    const donationRecords = [
      {
        id: "1",
        donorId: "1",
        bloodType: "O+",
        donationDate: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
        volume: 450,
        location: "Nepal Red Cross Blood Bank",
        donationType: "Regular",
        status: "Completed",
        verifiedBy: "Dr. Sharma",
        notes: "Smooth donation, donor in excellent health"
      },
      {
        id: "2",
        donorId: "1",
        recipientId: "emergency-patient-001",
        emergencyRequestId: "emergency-001",
        bloodType: "O+",
        donationDate: Date.now() - 150 * 24 * 60 * 60 * 1000, // 5 months ago
        volume: 450,
        location: "Teaching Hospital Blood Bank",
        donationType: "Emergency",
        status: "Completed",
        verifiedBy: "Dr. Patel",
        notes: "Emergency donation for accident victim"
      }
    ];

    // Blood inventory data
    const bloodInventory = [
      {
        id: "1",
        cityId: "ktm-001",
        cityName: "Kathmandu",
        bloodType: "O+",
        unitsAvailable: 45,
        status: "Good",
        lastUpdated: Date.now()
      },
      {
        id: "2",
        cityId: "ktm-001",
        cityName: "Kathmandu",
        bloodType: "A-",
        unitsAvailable: 8,
        status: "Critical",
        lastUpdated: Date.now()
      },
      {
        id: "3",
        cityId: "pkr-001",
        cityName: "Pokhara",
        bloodType: "AB+",
        unitsAvailable: 15,
        status: "Low",
        lastUpdated: Date.now()
      }
    ];

    // Hospital and donation center locations
    const locations = [
      {
        id: "1",
        name: "Nepal Red Cross Society Blood Bank",
        type: "BloodBank",
        address: "Kalimati, Kathmandu",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
        latitude: 27.6915,
        longitude: 85.2919,
        contactPhone: "+977-1-4270513",
        website: "https://www.nrcs.org",
        operatingHours: [
          { day: "Monday", openTime: "06:00", closeTime: "20:00" },
          { day: "Tuesday", openTime: "06:00", closeTime: "20:00" },
          { day: "Wednesday", openTime: "06:00", closeTime: "20:00" },
          { day: "Thursday", openTime: "06:00", closeTime: "20:00" },
          { day: "Friday", openTime: "06:00", closeTime: "20:00" },
          { day: "Saturday", openTime: "07:00", closeTime: "18:00" },
          { day: "Sunday", openTime: "07:00", closeTime: "18:00" }
        ]
      },
      {
        id: "2",
        name: "Tribhuvan University Teaching Hospital",
        type: "Hospital",
        address: "Maharajgunj, Kathmandu",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
        latitude: 27.7394,
        longitude: 85.3206,
        contactPhone: "+977-1-4412303",
        website: "https://www.tuth.edu.np"
      }
    ];

    // Sample notifications
    const notifications = [
      {
        id: "1",
        userId: "1",
        title: "Emergency Blood Request Nearby",
        message: "An urgent A- blood request has been posted 5km from your location.",
        type: "EmergencyRequest",
        read: false,
        relatedEntityId: "1",
        relatedEntityType: "EmergencyRequest",
        createdAt: Date.now() - 30 * 60 * 1000 // 30 minutes ago
      },
      {
        id: "2",
        userId: "1",
        title: "Donation Reminder",
        message: "You're eligible to donate blood again! Your last donation was 90 days ago.",
        type: "DonationReminder",
        read: false,
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
      }
    ];

    // Write all data to Firebase
    console.log("Writing users...");
    await Promise.all(users.map(user => 
      database.ref('users').child(user.id).set(user)
    ));

    console.log("Writing donor profiles...");
    await Promise.all(donorProfiles.map(profile => 
      database.ref('donorProfiles').child(profile.id).set(profile)
    ));

    console.log("Writing emergency requests...");
    await Promise.all(emergencyRequests.map(request => 
      database.ref('emergencyRequests').child(request.id).set(request)
    ));

    console.log("Writing donation records...");
    await Promise.all(donationRecords.map(record => 
      database.ref('donationRecords').child(record.id).set(record)
    ));

    console.log("Writing blood inventory...");
    await Promise.all(bloodInventory.map(inventory => 
      database.ref('bloodInventory').child(inventory.id).set(inventory)
    ));

    console.log("Writing locations...");
    await Promise.all(locations.map(location => 
      database.ref('locations').child(location.id).set(location)
    ));

    console.log("Writing notifications...");
    await Promise.all(notifications.map(notification => 
      database.ref('notifications').child(notification.id).set(notification)
    ));

    console.log("✅ Enhanced Firebase database initialization completed successfully!");
    console.log("\n📊 Database Structure Created:");
    console.log("- Users: Complete profiles with medical info and preferences");
    console.log("- Donor Profiles: Detailed availability and verification status");
    console.log("- Emergency Requests: Comprehensive request management");
    console.log("- Donation Records: Complete donation history");
    console.log("- Blood Inventory: Real-time blood availability");
    console.log("- Locations: Hospitals and blood banks");
    console.log("- Notifications: User communication system");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during enhanced database initialization:", error);
    process.exit(1);
  }
}

// Run the enhanced initialization
initializeEnhancedDatabase();
