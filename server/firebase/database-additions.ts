import admin from 'firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { IStorage } from '../storage';
import { 
  User, 
  InsertUser,
  DonorProfile,
  InsertDonorProfile,
  EmergencyRequest,
  InsertEmergencyRequest,
  DonationRecord,
  InsertDonationRecord,
  Document,
  InsertDocument,
  DeletionRequest
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';// Add new methods to FirebaseDatabase class

// Convert PostgreSQL numeric IDs to Firebase string IDs
type FirebaseDeletionRequest = Omit<DeletionRequest, 'id' | 'requesterId' | 'targetUserId'> & { 
  id: string, 
  requesterId: string, 
  targetUserId: string 
};// Implementation of new methods for FirebaseDatabase

async getUsers(options?: { role?: string; excludeRoles?: string[]; onlyRoles?: string[]; page?: number; limit?: number }): Promise<User[]> {
  const db = this.ensureDatabase();
  // Get all users
  const snapshot = await db.ref('users').once('value');
  const usersData = snapshot.val();
  
  if (!usersData) return [];
  
  let users = Object.keys(usersData).map(key => {
    const user = usersData[key] as FirebaseUser;
    return {
      ...user,
      id: Number(user.id)
    };
  });
  
  // Apply role filter if specified
  if (options?.role) {
    users = users.filter(user => user.role === options.role);
  }
  
  // Apply excludeRoles filter if specified
  if (options?.excludeRoles?.length) {
    users = users.filter(user => !options.excludeRoles!.includes(user.role));
  }
  
  // Apply onlyRoles filter if specified
  if (options?.onlyRoles?.length) {
    users = users.filter(user => options.onlyRoles!.includes(user.role));
  }
  
  // Apply pagination
  if (options?.page && options?.limit) {
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    users = users.slice(startIndex, endIndex);
  }
  
  return users;
}

async deleteUser(id: number): Promise<void> {
  const db = this.ensureDatabase();
  const user = await this.getUser(id);
  if (!user) {
    throw new Error("User not found");
  }
  
  // Delete associated records
  
  // Delete donor profile if exists
  const profileSnapshot = await db.ref('donorProfiles')
    .orderByChild('userId')
    .equalTo(id.toString())
    .limitToFirst(1)
    .once('value');
  
  const profileData = profileSnapshot.val();
  if (profileData) {
    const profileId = Object.keys(profileData)[0];
    await db.ref(`donorProfiles/${profileId}`).remove();
  }
  
  // Delete documents
  const documentsSnapshot = await db.ref('documents')
    .orderByChild('userId')
    .equalTo(id.toString())
    .once('value');
  
  const documentsData = documentsSnapshot.val();
  if (documentsData) {
    const documentIds = Object.keys(documentsData);
    for (const docId of documentIds) {
      await db.ref(`documents/${docId}`).remove();
    }
  }
  
  // Delete the user
  await db.ref(`users/${id}`).remove();
}

async createDeletionRequest(request: { requesterId: number; targetUserId: number; reason: string; status: string; createdAt: Date }): Promise<DeletionRequest> {
  const db = this.ensureDatabase();
  // Get a new key from Firebase
  const newRequestRef = db.ref('deletionRequests').push();
  const id = Number(newRequestRef.key);
  
  const deletionRequest: DeletionRequest = {
    id,
    requesterId: request.requesterId,
    targetUserId: request.targetUserId,
    reason: request.reason,
    status: request.status as 'pending' | 'approved' | 'rejected',
    createdAt: request.createdAt
  };
  
  // Convert numeric IDs to strings for Firebase
  await newRequestRef.set({
    ...deletionRequest,
    id: id.toString(),
    requesterId: request.requesterId.toString(),
    targetUserId: request.targetUserId.toString()
  });
  
  return deletionRequest;
}

async getDeletionRequest(id: number): Promise<DeletionRequest> {
  const db = this.ensureDatabase();
  const snapshot = await db.ref(`deletionRequests/${id}`).once('value');
  const request = snapshot.val() as FirebaseDeletionRequest | null;
  
  if (!request) {
    throw new Error("Deletion request not found");
  }
  
  return {
    ...request,
    id: Number(request.id),
    requesterId: Number(request.requesterId),
    targetUserId: Number(request.targetUserId)
  };
}

async getDeletionRequests(options?: { status?: string; page?: number; limit?: number; includeRequester?: boolean; includeTargetUser?: boolean }): Promise<any[]> {
  const db = this.ensureDatabase();
  let snapshot: admin.database.DataSnapshot;
  
  // Apply status filter if specified
  if (options?.status) {
    snapshot = await db.ref('deletionRequests')
      .orderByChild('status')
      .equalTo(options.status)
      .once('value');
  } else {
    snapshot = await db.ref('deletionRequests').once('value');
  }
  
  const requestsData = snapshot.val();
  
  if (!requestsData) return [];
  
  // Convert to array
  let requests = Object.keys(requestsData).map(key => {
    const request = requestsData[key] as FirebaseDeletionRequest;
    return {
      ...request,
      id: Number(request.id),
      requesterId: Number(request.requesterId),
      targetUserId: Number(request.targetUserId)
    };
  });
  
  // Apply pagination
  if (options?.page && options?.limit) {
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    requests = requests.slice(startIndex, endIndex);
  }
  
  // Include requester and target user if requested
  if (options?.includeRequester || options?.includeTargetUser) {
    const result = await Promise.all(requests.map(async (req) => {
      const enrichedRequest: any = { ...req };
      
      if (options.includeRequester) {
        const requester = await this.getUser(req.requesterId);
        if (requester) {
          const { password, ...requesterWithoutPassword } = requester;
          enrichedRequest.requester = requesterWithoutPassword;
        }
      }
      
      if (options.includeTargetUser) {
        const targetUser = await this.getUser(req.targetUserId);
        if (targetUser) {
          const { password, ...targetUserWithoutPassword } = targetUser;
          enrichedRequest.targetUser = targetUserWithoutPassword;
        }
      }
      
      return enrichedRequest;
    }));
    
    return result;
  }
  
  return requests;
}

async updateDeletionRequest(id: number, data: Partial<DeletionRequest>): Promise<DeletionRequest> {
  const db = this.ensureDatabase();
  const requestRef = db.ref(`deletionRequests/${id}`);
  const snapshot = await requestRef.once('value');
  
  if (!snapshot.exists()) {
    throw new Error("Deletion request not found");
  }
  
  await requestRef.update(data);
  
  // Get the updated request
  const updatedSnapshot = await requestRef.once('value');
  const updatedRequest = updatedSnapshot.val() as FirebaseDeletionRequest;
  
  return {
    ...updatedRequest,
    id: Number(updatedRequest.id),
    requesterId: Number(updatedRequest.requesterId),
    targetUserId: Number(updatedRequest.targetUserId)
  };
}