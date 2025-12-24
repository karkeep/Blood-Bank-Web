import { database } from '@/lib/firebase/api';
import { ref, set, push } from 'firebase/database';

// Sample donor data for seeding
const sampleDonors = [
  {
    username: 'rajesh_donor',
    fullName: 'Rajesh Sharma',
    email: 'rajesh@example.com',
    bloodType: 'O+',
    phone: '+977-9841234567',
    city: 'Kathmandu',
    address: 'Thamel, Kathmandu',
    status: 'available',
    donations: 5,
    badge: 'Silver',
    verificationStatus: 'verified',
    role: 'donor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastDonation: '2 months ago'
  },
  {
    username: 'priya_lifesaver',
    fullName: 'Priya Thapa',
    email: 'priya@example.com',
    bloodType: 'A+',
    phone: '+977-9851234567',
    city: 'Pokhara',
    address: 'Lakeside, Pokhara',
    status: 'available',
    donations: 12,
    badge: 'Gold',
    verificationStatus: 'verified',
    role: 'donor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastDonation: '6 weeks ago'
  }  ,
  {
    username: 'anil_hero',
    fullName: 'Anil Gurung',
    email: 'anil@example.com',
    bloodType: 'B-',
    phone: '+977-9861234567',
    city: 'Lalitpur',
    address: 'Patan Dhoka, Lalitpur',
    status: 'available',
    donations: 8,
    badge: 'Silver',
    verificationStatus: 'verified',
    role: 'donor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastDonation: '3 months ago'
  },
  {
    username: 'maya_angel',
    fullName: 'Maya Rai',
    email: 'maya@example.com',
    bloodType: 'O-',
    phone: '+977-9871234567',
    city: 'Bhaktapur',
    address: 'Durbar Square, Bhaktapur',
    status: 'busy',
    donations: 15,
    badge: 'Gold',
    verificationStatus: 'verified',
    role: 'donor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastDonation: '1 month ago'
  },
  {
    username: 'binod_saver',
    fullName: 'Binod Magar',
    email: 'binod@example.com',
    bloodType: 'AB+',
    phone: '+977-9881234567',
    city: 'Kathmandu',
    address: 'New Baneshwor, Kathmandu',
    status: 'available',
    donations: 3,
    badge: 'Bronze',
    verificationStatus: 'verified',
    role: 'donor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastDonation: '4 months ago'
  }
];
// Function to seed the database with sample data
export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Add sample donors
    for (let i = 0; i < sampleDonors.length; i++) {
      const donor = sampleDonors[i];
      const userRef = ref(database, `users/donor_${i + 1}`);
      await set(userRef, {
        id: `donor_${i + 1}`,
        ...donor
      });
    }
    
    // Add sample emergency requests
    const sampleRequests = [
      {
        patientName: 'Ram Bahadur',
        bloodType: 'O-',
        urgencyLevel: 'critical',
        unitsNeeded: 2,
        hospital: 'Tribhuvan University Teaching Hospital',
        hospitalAddress: 'Maharajgunj, Kathmandu',
        contactName: 'Dr. Shiva Raj',
        contactPhone: '+977-9841111111',
        notes: 'Emergency surgery required',
        status: 'pending',
        location: { latitude: 27.7172, longitude: 85.3240 },
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        patientName: 'Sita Devi',
        bloodType: 'A+',
        urgencyLevel: 'urgent',
        unitsNeeded: 1,
        hospital: 'Bir Hospital',
        hospitalAddress: 'Mahaboudha, Kathmandu',
        contactName: 'Nurse Kamala',
        contactPhone: '+977-9851111111',
        notes: 'Blood transfusion needed',
        status: 'matching',
        location: { latitude: 27.7045, longitude: 85.3104 },
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    for (let i = 0; i < sampleRequests.length; i++) {
      const request = sampleRequests[i];
      const requestRef = push(ref(database, 'emergencyRequests'));
      await set(requestRef, {
        id: requestRef.key,
        ...request
      });
    }
    
    console.log('Database seeding completed successfully!');
    return true;
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}