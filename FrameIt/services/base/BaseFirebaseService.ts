// Base Firebase service with common utilities
import { db } from "../../config/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

export interface BaseEntity {
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export class BaseFirebaseService {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Generic CRUD operations
  async getById<T>(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as T) : null;
    } catch (error) {
      console.error(`Error getting ${this.collectionName} by ID:`, error);
      return null;
    }
  }

  async create<T = any>(id: string, data: T): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const entityData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await setDoc(docRef, entityData);
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async update<T = any>(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  async getAll<T>(): Promise<T[]> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const snapshot = await getDocs(collectionRef);
      return snapshot.docs.map((doc) => doc.data() as T);
    } catch (error) {
      console.error(`Error getting all ${this.collectionName}:`, error);
      return [];
    }
  }

  async getByField<T>(
    field: string,
    value: any,
    limitCount?: number
  ): Promise<T[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        where(field, "==", value)
      );
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as T);
    } catch (error) {
      console.error(`Error getting ${this.collectionName} by field:`, error);
      return [];
    }
  }

  // Real-time subscription
  subscribe<T>(id: string, callback: (data: T | null) => void): () => void {
    const docRef = doc(db, this.collectionName, id);
    return onSnapshot(docRef, (doc) => {
      callback(doc.exists() ? (doc.data() as T) : null);
    });
  }

  subscribeToCollection<T>(
    callback: (data: T[]) => void,
    queryConstraints?: any[]
  ): () => void {
    let q = collection(db, this.collectionName);
    if (queryConstraints) {
      q = query(q, ...queryConstraints) as any;
    }
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as T);
      callback(data);
    });
  }

  // Utility methods
  protected generateId(prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return prefix
      ? `${prefix}_${timestamp}_${random}`
      : `${timestamp}_${random}`;
  }

  protected handleError(operation: string, error: any): void {
    console.error(`FirebaseService Error - ${operation}:`, error);
  }
}
