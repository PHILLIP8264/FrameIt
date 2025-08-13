import { storage } from "../config/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const StorageService = {
  // Upload a file to Firebase Storage
  async uploadFile(filePath: string, file: File | Blob): Promise<string> {
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // Get a file's download URL
  async getFileURL(filePath: string): Promise<string> {
    const storageRef = ref(storage, filePath);
    return await getDownloadURL(storageRef);
  },

  // Delete a file from Firebase Storage
  async deleteFile(filePath: string): Promise<void> {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  },
};

export default StorageService;
