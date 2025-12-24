import { 
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from './firebase';
import { dbService, DocumentSchema, DB_PATHS } from './database';

// Type definitions
export interface UploadProgressCallback {
  (progress: number): void;
}

export interface FileUploadResult {
  url: string;
  fileName: string;
  fileType: string;
  documentId: string;
}

// Storage service for handling document uploads
export const storageService = {
  // Upload document to Firebase Storage
  uploadDocument: async (
    userId: string, 
    file: File, 
    documentType: "ID" | "MedicalRecord" | "BloodTest" | "Other",
    documentName: string = file.name,
    onProgress?: UploadProgressCallback
  ): Promise<FileUploadResult> => {
    try {
      // Create file path
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${userId}_${timestamp}.${extension}`;
      const fullPath = `documents/${userId}/${fileName}`;
      
      // Create storage reference
      const fileRef = storageRef(storage, fullPath);
      
      // Upload file with progress monitoring
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      // Return promise that resolves when upload completes
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Calculate progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            
            // Call progress callback if provided
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error) => {
            // Handle errors
            console.error('Error uploading document:', error);
            reject(error);
          },
          async () => {
            // Upload completed successfully, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Create document record in database
            const documentData: Omit<DocumentSchema, 'id'> = {
              userId,
              documentType,
              documentName,
              fileUrl: downloadURL,
              fileType: file.type,
              verificationStatus: 'Pending',
              uploadedAt: Date.now()
            };
            
            // Create document in database
            const documentId = await dbService.create<Omit<DocumentSchema, 'id'>>(
              DB_PATHS.DOCUMENTS, 
              documentData
            );
            
            // Create notification for document upload
            await dbService.createNotification({
              userId,
              title: 'Document Uploaded',
              message: `Your document "${documentName}" has been uploaded and is pending verification.`,
              type: 'Verification',
              read: false,
              relatedEntityId: documentId,
              relatedEntityType: 'Document'
            });
            
            // Return result
            resolve({
              url: downloadURL,
              fileName,
              fileType: file.type,
              documentId
            });
          }
        );
      });
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      throw error;
    }
  },
  
  // Delete document from Firebase Storage
  deleteDocument: async (documentId: string): Promise<void> => {
    try {
      // Get document data
      const document = await dbService.get<DocumentSchema>(DB_PATHS.DOCUMENTS, documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Extract file path from URL
      const fileUrl = document.fileUrl;
      
      // Create storage reference from URL
      const fileRef = storageRef(storage, fileUrl);
      
      // Delete file from storage
      await deleteObject(fileRef);
      
      // Delete document record from database
      await dbService.delete(DB_PATHS.DOCUMENTS, documentId);
      
      // Create notification for document deletion
      await dbService.createNotification({
        userId: document.userId,
        title: 'Document Deleted',
        message: `Your document "${document.documentName}" has been deleted.`,
        type: 'Verification',
        read: false
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
  
  // Get documents for a user
  getUserDocuments: async (userId: string): Promise<DocumentSchema[]> => {
    try {
      return await dbService.getDocumentsByUserId(userId);
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  },
  
  // Verify a document
  verifyDocument: async (
    documentId: string, 
    verificationStatus: "Unverified" | "Pending" | "Verified",
    notes?: string,
    verifierUserId?: string
  ): Promise<DocumentSchema> => {
    try {
      // Update document in database
      const document = await dbService.verifyDocument(documentId, verificationStatus, notes);
      
      // Create notification for document verification
      let message = '';
      switch (verificationStatus) {
        case 'Verified':
          message = `Your document "${document.documentName}" has been verified.`;
          break;
        case 'Unverified':
          message = `Your document "${document.documentName}" verification failed. Please check the notes.`;
          break;
        default:
          message = `Your document "${document.documentName}" status has been updated.`;
      }
      
      await dbService.createNotification({
        userId: document.userId,
        title: 'Document Verification Update',
        message,
        type: 'Verification',
        read: false,
        relatedEntityId: documentId,
        relatedEntityType: 'Document'
      });
      
      return document;
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  }
};
