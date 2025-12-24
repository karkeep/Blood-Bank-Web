import { database } from '../firebase/firebase';
import { ref, update } from 'firebase/database';

/**
 * Update a user's profile information in Firebase Realtime Database
 * @param {string} userId - The user's ID
 * @param {object} profileData - The profile data to update
 * @returns {Promise} - A promise that resolves when the update is complete
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Toggle the user's emergency availability status
 * @param {string} userId - The user's ID
 * @param {boolean} isAvailable - Whether the user is available for emergency donations
 * @returns {Promise} - A promise that resolves when the update is complete
 */
export const toggleEmergencyAvailability = async (userId, isAvailable) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, {
      emergencyAvailable: isAvailable,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating emergency availability:', error);
    throw error;
  }
};
