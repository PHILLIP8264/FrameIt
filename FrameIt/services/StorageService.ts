import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../config/firebase";

export interface UploadResult {
  url: string;
  path: string;
}

export class StorageService {
  // Upload a photo to Firebase Storage
  static async uploadPhoto(
    uri: string,
    userId: string,
    fileName?: string
  ): Promise<UploadResult> {
    try {
      // Convert URI to blob for upload
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate filename if not provided
      const finalFileName = fileName || `photo_${Date.now()}.jpg`;

      // Create storage reference
      const storageRef = ref(
        storage,
        `users/${userId}/photos/${finalFileName}`
      );

      // Upload the file
      const snapshot = await uploadBytes(storageRef, blob);

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
      };
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }
  }

  // Upload a framed photo to Firebase Storage
  static async uploadFramedPhoto(
    uri: string,
    userId: string,
    frameId: string,
    fileName?: string
  ): Promise<UploadResult> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const finalFileName = fileName || `framed_${frameId}_${Date.now()}.jpg`;
      const storageRef = ref(
        storage,
        `users/${userId}/framed-photos/${finalFileName}`
      );

      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
      };
    } catch (error) {
      console.error("Error uploading framed photo:", error);
      throw error;
    }
  }

  // Upload user avatar
  static async uploadAvatar(
    uri: string,
    userId: string
  ): Promise<UploadResult> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileName = `avatar_${userId}.jpg`;
      const storageRef = ref(storage, `users/${userId}/avatar/${fileName}`);

      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
      };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  // Delete a file from Firebase Storage
  static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  // Get download URL for a file
  static async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw error;
    }
  }
}
