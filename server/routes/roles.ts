import { Router } from 'express';
import { storage } from '../storage';
import { verifyFirebaseToken } from '../firebase-auth';
import { z } from 'zod';
import { 
  createUserWithRole, 
  changeUserRole, 
  updateUserStatus,
  requestAccountDeletion,
  handleDeletionRequest,
  deleteUser
} from '../utils/roles';

const router = Router();

// Middleware to check if user has required role
const hasRole = (allowedRoles: string[]) => async (req, res, next) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get user from database using Firebase UID
    const user = await storage.getUserByFirebaseUid(req.firebaseUser.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has any of the allowed roles
    if (allowedRoles.includes(user.role)) {
      req.userId = user.id; // Store user ID for convenience
      req.userRole = user.role; // Store user role for convenience
      return next();
    }
    
    return res.status(403).json({ message: 'Insufficient permissions' });
  } catch (error) {
    console.error('Error in hasRole middleware:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
// Schema for creating users
const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  fullName: z.string().optional(),
  bloodType: z.string(),
  role: z.enum(['admin', 'moderator', 'volunteer', 'donor', 'user']),
});

// Schema for changing user role
const changeRoleSchema = z.object({
  userId: z.number(),
  newRole: z.enum(['admin', 'moderator', 'volunteer', 'donor', 'user']),
});

// Schema for updating user status
const updateStatusSchema = z.object({
  userId: z.number(),
  status: z.enum(['active', 'suspended', 'banned']),
  reason: z.string().optional(),
  suspensionEndDate: z.string().optional(), // ISO date string
});

// Schema for requesting account deletion
const deletionRequestSchema = z.object({
  userId: z.number(),
  reason: z.string(),
});

// Schema for handling deletion requests
const handleDeletionSchema = z.object({
  requestId: z.number(),
  approve: z.boolean(),
});
// Route for creating a new user with role (superadmin, admin)
router.post(
  '/create-user',
  verifyFirebaseToken,
  hasRole(['superadmin', 'admin']),
  async (req, res) => {
    try {
      const validationResult = createUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid input',
          errors: validationResult.error.errors 
        });
      }
      
      const userData = validationResult.data;
      
      // Create user
      const newUser = await createUserWithRole(
        req.userId,
        userData,
        userData.role,
        userData.email,
        userData.password
      );
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: error.message || 'Failed to create user' });
    }
  }
);

// Route for changing a user's role (superadmin, admin)
router.post(
  '/change-role',
  verifyFirebaseToken,
  hasRole(['superadmin', 'admin']),
  async (req, res) => {
    try {
      const validationResult = changeRoleSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid input',
          errors: validationResult.error.errors 
        });
      }
      
      const { userId, newRole } = validationResult.data;
      
      // Change user role
      const updatedUser = await changeUserRole(req.userId, userId, newRole);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Error changing role:', error);
      return res.status(500).json({ message: error.message || 'Failed to change role' });
    }
  }
);
// Route for updating a user's status (superadmin, admin, moderator)
router.post(
  '/update-status',
  verifyFirebaseToken,
  hasRole(['superadmin', 'admin', 'moderator']),
  async (req, res) => {
    try {
      const validationResult = updateStatusSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid input',
          errors: validationResult.error.errors 
        });
      }
      
      const { userId, status, reason, suspensionEndDate } = validationResult.data;
      
      // Parse suspension end date if provided
      const endDate = suspensionEndDate ? new Date(suspensionEndDate) : undefined;
      
      // Update user status
      const updatedUser = await updateUserStatus(
        req.userId,
        userId,
        status,
        reason,
        endDate
      );
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating status:', error);
      return res.status(500).json({ message: error.message || 'Failed to update status' });
    }
  }
);

// Route for requesting account deletion (admin)
router.post(
  '/request-deletion',
  verifyFirebaseToken,
  hasRole(['admin']),
  async (req, res) => {
    try {
      const validationResult = deletionRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid input',
          errors: validationResult.error.errors 
        });
      }
      
      const { userId, reason } = validationResult.data;
      
      // Request account deletion
      await requestAccountDeletion(req.userId, userId, reason);
      
      return res.status(200).json({ message: 'Deletion request submitted for approval' });
    } catch (error) {
      console.error('Error requesting deletion:', error);
      return res.status(500).json({ message: error.message || 'Failed to request deletion' });
    }
  }
);
// Route for direct user deletion (superadmin only)
router.delete(
  '/user/:userId',
  verifyFirebaseToken,
  hasRole(['superadmin']),
  async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      // Delete user
      await deleteUser(req.userId, userId);
      
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ message: error.message || 'Failed to delete user' });
    }
  }
);

// Route for handling deletion requests (superadmin only)
router.post(
  '/handle-deletion',
  verifyFirebaseToken,
  hasRole(['superadmin']),
  async (req, res) => {
    try {
      const validationResult = handleDeletionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid input',
          errors: validationResult.error.errors 
        });
      }
      
      const { requestId, approve } = validationResult.data;
      
      // Handle deletion request
      await handleDeletionRequest(req.userId, requestId, approve);
      
      return res.status(200).json({ 
        message: approve 
          ? 'Deletion request approved and account deleted' 
          : 'Deletion request rejected'
      });
    } catch (error) {
      console.error('Error handling deletion request:', error);
      return res.status(500).json({ message: error.message || 'Failed to handle deletion request' });
    }
  }
);

// Route to get all users (with role filtering)
router.get(
  '/users',
  verifyFirebaseToken,
  hasRole(['superadmin', 'admin', 'moderator']),
  async (req, res) => {
    try {
      const role = req.query.role as string | undefined;
      const page = parseInt(req.query.page as string || '1') || 1;
      const limit = parseInt(req.query.limit as string || '20') || 20;
      
      // Get users based on requester's role access
      let users;
      
      if (req.userRole === 'superadmin') {
        // Superadmin can see all users
        users = await storage.getUsers({ role, page, limit });
      } else if (req.userRole === 'admin') {
        // Admin can see all except superadmins
        users = await storage.getUsers({ 
          role: role || undefined,
          excludeRoles: ['superadmin'],
          page, 
          limit 
        });
      } else if (req.userRole === 'moderator') {
        // Moderator can only see volunteers and regular users
        const allowedRoles = ['volunteer', 'donor', 'user'];
        const filteredRole = role && allowedRoles.includes(role) ? role : undefined;
        
        users = await storage.getUsers({ 
          role: filteredRole, 
          onlyRoles: allowedRoles,
          page, 
          limit 
        });
      }
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      console.error('Error getting users:', error);
      return res.status(500).json({ message: error.message || 'Failed to get users' });
    }
  }
);
// Route to get all deletion requests (superadmin only)
router.get(
  '/deletion-requests',
  verifyFirebaseToken,
  hasRole(['superadmin']),
  async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const page = parseInt(req.query.page as string || '1') || 1;
      const limit = parseInt(req.query.limit as string || '20') || 20;
      
      const requests = await storage.getDeletionRequests({ 
        status, 
        page, 
        limit,
        includeRequester: true,
        includeTargetUser: true
      });
      
      return res.status(200).json(requests);
    } catch (error) {
      console.error('Error getting deletion requests:', error);
      return res.status(500).json({ message: error.message || 'Failed to get deletion requests' });
    }
  }
);

export default router;