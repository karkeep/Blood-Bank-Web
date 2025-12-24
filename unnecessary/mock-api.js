// This file provides a mock API endpoint for Google authentication in development
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5173;  // Match the port in vite.config.ts

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Mock user data
const mockUsers = [
  {
    id: 1,
    username: "donor1",
    email: "donor1@example.com",
    bloodType: "O+",
    role: "donor",
    firebaseUid: "mock-uid-123",
    fullName: "Mock Donor",
    isAdmin: false
  }
];

// Google Auth endpoint
app.post('/api/user/google-auth', (req, res) => {
  console.log('Received Google Auth request:', req.body);
  
  // Extract auth token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }
  
  // Create or retrieve mock user
  const email = req.body.email || 'user@example.com';
  let user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    // Create a new user if not found
    user = {
      id: mockUsers.length + 1,
      username: email.split('@')[0],
      email: email,
      bloodType: "O+",
      role: "donor",
      firebaseUid: `mock-uid-${Date.now()}`,
      fullName: req.body.displayName || email.split('@')[0],
      isAdmin: false
    };
    mockUsers.push(user);
  }
  
  // Success response
  res.status(200).json(user);
});

// Firebase user endpoint
app.post('/api/user/firebase', (req, res) => {
  console.log('Received Firebase user request');
  
  // Extract auth token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }
  
  // Find user by firebaseUid (would be extracted from token in a real implementation)
  const user = mockUsers[0]; // Just return the first mock user for testing
  
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Registration endpoint
app.post('/api/register', (req, res) => {
  console.log('Received registration request:', req.body);
  
  const { username, email, bloodType, firebaseUid } = req.body;
  
  // Check if user already exists
  if (mockUsers.some(u => u.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  
  if (mockUsers.some(u => u.email === email)) {
    return res.status(400).json({ message: "Email already exists" });
  }
  
  // Create new user
  const newUser = {
    id: mockUsers.length + 1,
    username,
    email,
    bloodType,
    role: "donor",
    firebaseUid,
    fullName: username,
    isAdmin: false
  };
  
  mockUsers.push(newUser);
  res.status(201).json(newUser);
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
});
