import admin from '../firebase/admin';
import { storage } from '../storage';
import { User } from '@shared/schema';

// Role hierarchy (higher index means more permissions)
const roleHierarchy = ['user', 'donor', 'volunteer', 'moderator', 'admin', 'superadmin'];

/**
 * Check if a user has permission to perform an action
 * @param actorRole Role of the user performing the action
 * @param targetRole Role of the user being acted upon
 */
export function canManageRole(actorRole: string, targetRole: string): boolean {
  const actorIndex = roleHierarchy.indexOf(actorRole);
  const targetIndex = roleHierarchy.indexOf(targetRole);
  
  // Actor must have higher role than target to manage them
  return actorIndex > targetIndex && actorIndex > 0;
}

/**
 * Check if a user can create a user with a specific role
 * @param actorRole Role of the user creating another user
 * @param roleToCreate Role of the user being created
 */
export function canCreateRole(actorRole: string, roleToCreate: string): boolean {
  const actorIndex = roleHierarchy.indexOf(actorRole);
  const createIndex = roleHierarchy.indexOf(roleToCreate);
  
  // Only super admin can create admins
  if (roleToCreate === 'admin' && actorRole !== 'superadmin') {
    return false;
  }
  
  // Actor must have higher role than what they're trying to create
  return actorIndex > createIndex && actorIndex > 0;
}

/**
 * Set custom Firebase claims based on user role
 * @param uid Firebase user ID
 * @param role Role to set
 */
export async function setUserRoleClaims(uid: string, role: string): Promise<void> {
  try {
    const customClaims: Record<string, boolean> = {};
    
    // Set appropriate claims based on role
    switch (role) {
      case 'superadmin':
        customClaims.superadmin = true;
        customClaims.admin = true;
        break;
      case 'admin':
        customClaims.admin = true;
        break;
      case 'moderator':
        customClaims.moderator = true;
        break;
      case 'volunteer':
        customClaims.volunteer = true;
        break;
      default:
        // For donor/user roles, don't set any special claims
        break;
    }
    
    // Set the custom claims
    await admin.auth.setCustomUserClaims(uid, customClaims);
    
    console.log(`Set custom claims for ${uid}: ${JSON.stringify(customClaims)}`);
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw error;
  }
}

/**
 * Create a user with the specified role
 */
export async function createUserWithRole(
  creatorId: number,
  userData: Partial<User>,
  role: string,
  firebaseEmail?: string,
  firebasePassword?: string
): Promise<User> {
  const creator = await storage.getUser(creatorId);
  
  // Check if creator has permission to create this role
  if (!canCreateRole(creator.role, role)) {
    throw new Error(`You don't have permission to create ${role} accounts`);
  }
  
  // Create Firebase user if email and password are provided
  let firebaseUid: string | undefined = undefined;
  if (firebaseEmail && firebasePassword) {
    try {
      const userRecord = await admin.auth.createUser({
        email: firebaseEmail,
        password: firebasePassword,
        displayName: userData.fullName || userData.username,
      });
      
      firebaseUid = userRecord.uid;
      
      // Set appropriate Firebase claims
      await setUserRoleClaims(firebaseUid, role);
    } catch (error) {
      console.error('Error creating Firebase user:', error);
      throw error;
    }
  }
  
  // Create user in our database
  const newUser = await storage.createUser({
    ...userData,
    role,
    firebaseUid,
    createdBy: creatorId,
    status: 'active',
  });
  
  return newUser;
}

/**
 * Change a user's role
 */
export async function changeUserRole(
  actorId: number,
  userId: number,
  newRole: string
): Promise<User> {
  const actor = await storage.getUser(actorId);
  const user = await storage.getUser(userId);
  
  // Check if actor has permission to change this role
  if (!canManageRole(actor.role, user.role) || !canCreateRole(actor.role, newRole)) {
    throw new Error(`You don't have permission to change this user to ${newRole}`);
  }
  
  // Update Firebase claims if the user has a Firebase account
  if (user.firebaseUid) {
    await setUserRoleClaims(user.firebaseUid, newRole);
  }
  
  // Update user in our database
  const updatedUser = await storage.updateUser(userId, { role: newRole });
  
  return updatedUser;
}

/**
 * Update user account status (active, suspended, banned)
 */
export async function updateUserStatus(
  actorId: number,
  userId: number,
  status: 'active' | 'suspended' | 'banned',
  reason?: string,
  suspensionEndDate?: Date
): Promise<User> {
  const actor = await storage.getUser(actorId);
  const user = await storage.getUser(userId);
  
  // Check if actor has permission to manage this user
  if (!canManageRole(actor.role, user.role)) {
    throw new Error(`You don't have permission to change this user's status`);
  }
  
  // Super admin accounts cannot be banned/suspended by anyone
  if (user.role === 'superadmin') {
    throw new Error(`Super admin accounts cannot be modified`);
  }
  
  // Only super admin can ban/suspend admin accounts
  if (user.role === 'admin' && actor.role !== 'superadmin') {
    throw new Error(`Only super admins can change admin account status`);
  }
  
  // Update Firebase auth if the user has a Firebase account
  if (user.firebaseUid) {
    if (status === 'banned') {
      await admin.auth.updateUser(user.firebaseUid, { disabled: true });
    } else if (status === 'active') {
      await admin.auth.updateUser(user.firebaseUid, { disabled: false });
    }
  }
  
  // Prepare update data
  const updateData: any = { status };
  
  if (status === 'suspended' && suspensionEndDate) {
    updateData.suspension = {
      until: suspensionEndDate,
      reason: reason || 'Violation of terms',
    };
  } else {
    updateData.suspension = null;
  }
  
  // Update user in our database
  const updatedUser = await storage.updateUser(userId, updateData);
  
  return updatedUser;
}

/**
 * Request deletion of an account (for admins to request superadmin approval)
 */
export async function requestAccountDeletion(
  actorId: number,
  userId: number,
  reason: string
): Promise<void> {
  const actor = await storage.getUser(actorId);
  const user = await storage.getUser(userId);
  
  // Check if actor has permission to request deletion of this user
  if (!canManageRole(actor.role, user.role)) {
    throw new Error(`You don't have permission to request deletion of this account`);
  }
  
  // Super admin accounts cannot be deleted by anyone
  if (user.role === 'superadmin') {
    throw new Error(`Super admin accounts cannot be deleted`);
  }
  
  // Create a deletion request
  await storage.createDeletionRequest({
    requesterId: actorId,
    targetUserId: userId,
    reason,
    status: 'pending',
    createdAt: new Date(),
  });
}

/**
 * Approve or deny an account deletion request (superadmin only)
 */
export async function handleDeletionRequest(
  superadminId: number,
  requestId: number,
  approve: boolean
): Promise<void> {
  const superadmin = await storage.getUser(superadminId);
  
  // Only super admin can approve deletion requests
  if (superadmin.role !== 'superadmin') {
    throw new Error('Only super admins can handle deletion requests');
  }
  
  const request = await storage.getDeletionRequest(requestId);
  
  if (approve) {
    const user = await storage.getUser(request.targetUserId);
    
    // Delete from Firebase if the user has a Firebase account
    if (user.firebaseUid) {
      await admin.auth.deleteUser(user.firebaseUid);
    }
    
    // Delete from our database
    await storage.deleteUser(request.targetUserId);
    
    // Update request status
    await storage.updateDeletionRequest(requestId, { status: 'approved' });
  } else {
    // Update request status
    await storage.updateDeletionRequest(requestId, { status: 'rejected' });
  }
}

/**
 * Delete a user (superadmin only)
 */
export async function deleteUser(
  superadminId: number,
  userId: number
): Promise<void> {
  const superadmin = await storage.getUser(superadminId);
  const user = await storage.getUser(userId);
  
  // Only super admin can delete users directly
  if (superadmin.role !== 'superadmin') {
    throw new Error('Only super admins can delete users directly');
  }
  
  // Super admin accounts cannot be deleted by anyone
  if (user.role === 'superadmin') {
    throw new Error(`Super admin accounts cannot be deleted`);
  }
  
  // Delete from Firebase if the user has a Firebase account
  if (user.firebaseUid) {
    await admin.auth.deleteUser(user.firebaseUid);
  }
  
  // Delete from our database
  await storage.deleteUser(userId);
}