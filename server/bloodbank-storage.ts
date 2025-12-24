import { 
  BloodBank,
  InsertBloodBank,
  bloodBanks
} from "@shared/schema";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Add these methods to the MemStorage class
export class BloodBankStorage {
  private bloodBanks: Map<number, BloodBank>;
  private bloodBankIdCounter: number;

  constructor() {
    this.bloodBanks = new Map();
    this.bloodBankIdCounter = 1;
  }

  async createBloodBank(bloodBankData: InsertBloodBank): Promise<BloodBank> {
    const id = this.bloodBankIdCounter++;
    const now = new Date();
    
    const bloodBank: BloodBank = {
      id,
      ...bloodBankData,
      createdAt: now,
      updatedAt: now
    };
    
    this.bloodBanks.set(id, bloodBank);
    return bloodBank;
  }
  
  async getBloodBankById(id: number): Promise<BloodBank | undefined> {
    return this.bloodBanks.get(id);
  }
  
  async getAllBloodBanks(): Promise<BloodBank[]> {
    return Array.from(this.bloodBanks.values());
  }
  
  async updateBloodBank(id: number, bloodBankData: Partial<BloodBank>): Promise<BloodBank> {
    const bloodBank = await this.getBloodBankById(id);
    if (!bloodBank) {
      throw new Error("Blood bank not found");
    }
    
    const updatedBloodBank: BloodBank = {
      ...bloodBank,
      ...bloodBankData,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };
    
    this.bloodBanks.set(id, updatedBloodBank);
    return updatedBloodBank;
  }
  
  async deleteBloodBank(id: number): Promise<void> {
    const exists = this.bloodBanks.has(id);
    if (!exists) {
      throw new Error("Blood bank not found");
    }
    
    this.bloodBanks.delete(id);
  }
}

// Add these methods to the DatabaseStorage class 
export class BloodBankDatabaseStorage {
  async createBloodBank(bloodBankData: InsertBloodBank): Promise<BloodBank> {
    const [bloodBank] = await db
      .insert(bloodBanks)
      .values({
        ...bloodBankData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return bloodBank;
  }
  
  async getBloodBankById(id: number): Promise<BloodBank | undefined> {
    const [bloodBank] = await db
      .select()
      .from(bloodBanks)
      .where(eq(bloodBanks.id, id));
    return bloodBank;
  }
  
  async getAllBloodBanks(): Promise<BloodBank[]> {
    return db.select().from(bloodBanks);
  }
  
  async updateBloodBank(id: number, bloodBankData: Partial<BloodBank>): Promise<BloodBank> {
    const [updatedBloodBank] = await db
      .update(bloodBanks)
      .set({
        ...bloodBankData,
        updatedAt: new Date()
      })
      .where(eq(bloodBanks.id, id))
      .returning();
      
    if (!updatedBloodBank) {
      throw new Error("Blood bank not found");
    }
    
    return updatedBloodBank;
  }
  
  async deleteBloodBank(id: number): Promise<void> {
    await db.delete(bloodBanks).where(eq(bloodBanks.id, id));
  }
}

// Extension methods to add to the FirebaseDatabase class
export class BloodBankFirebaseStorage {
  private db: any; // firebase database reference

  async createBloodBank(bloodBankData: InsertBloodBank): Promise<BloodBank> {
    // Get a new key from Firebase
    const newBloodBankRef = this.db.ref('bloodBanks').push();
    const id = Number(newBloodBankRef.key);
    const now = new Date();
    
    const bloodBank: BloodBank = {
      id,
      ...bloodBankData,
      createdAt: now,
      updatedAt: now
    };
    
    // Use the key as an ID property in the data as well
    await newBloodBankRef.set({
      ...bloodBank,
      id: id.toString() // Store as string for consistency in Firebase
    });
    
    return bloodBank;
  }
  
  async getBloodBankById(id: number): Promise<BloodBank | undefined> {
    const snapshot = await this.db.ref(`bloodBanks/${id}`).once('value');
    const bloodBank = snapshot.val();
    
    if (!bloodBank) return undefined;
    
    return {
      ...bloodBank,
      id: Number(bloodBank.id)
    };
  }
  
  async getAllBloodBanks(): Promise<BloodBank[]> {
    const snapshot = await this.db.ref('bloodBanks').once('value');
    const bloodBanksData = snapshot.val();
    
    if (!bloodBanksData) return [];
    
    return Object.keys(bloodBanksData).map(key => {
      const bloodBank = bloodBanksData[key];
      return {
        ...bloodBank,
        id: Number(bloodBank.id)
      };
    });
  }
  
  async updateBloodBank(id: number, bloodBankData: Partial<BloodBank>): Promise<BloodBank> {
    const bloodBankRef = this.db.ref(`bloodBanks/${id}`);
    const snapshot = await bloodBankRef.once('value');
    
    if (!snapshot.exists()) {
      throw new Error("Blood bank not found");
    }
    
    const updatedData = {
      ...bloodBankData,
      updatedAt: new Date()
    };
    
    await bloodBankRef.update(updatedData);
    
    // Get the updated blood bank data
    const updatedSnapshot = await bloodBankRef.once('value');
    const updatedBloodBank = updatedSnapshot.val();
    
    return {
      ...updatedBloodBank,
      id: Number(updatedBloodBank.id)
    };
  }
  
  async deleteBloodBank(id: number): Promise<void> {
    await this.db.ref(`bloodBanks/${id}`).remove();
  }
}

// Extend the existing storage object with the blood bank methods
export function extendStorageWithBloodBankMethods() {
  // MemStorage extension
  storage.createBloodBank = async function(this: any, bloodBankData: InsertBloodBank): Promise<BloodBank> {
    if (!this.bloodBanks) {
      this.bloodBanks = new Map();
      this.bloodBankIdCounter = 1;
    }
    
    const id = this.bloodBankIdCounter++;
    const now = new Date();
    
    const bloodBank: BloodBank = {
      id,
      ...bloodBankData,
      createdAt: now,
      updatedAt: now
    };
    
    this.bloodBanks.set(id, bloodBank);
    return bloodBank;
  };
  
  storage.getBloodBankById = async function(this: any, id: number): Promise<BloodBank | undefined> {
    if (!this.bloodBanks) {
      this.bloodBanks = new Map();
      return undefined;
    }
    return this.bloodBanks.get(id);
  };
  
  storage.getAllBloodBanks = async function(this: any): Promise<BloodBank[]> {
    if (!this.bloodBanks) {
      this.bloodBanks = new Map();
      return [];
    }
    return Array.from(this.bloodBanks.values());
  };
  
  storage.updateBloodBank = async function(this: any, id: number, bloodBankData: Partial<BloodBank>): Promise<BloodBank> {
    if (!this.bloodBanks) {
      this.bloodBanks = new Map();
      throw new Error("Blood bank not found");
    }
    
    const bloodBank = await this.getBloodBankById(id);
    if (!bloodBank) {
      throw new Error("Blood bank not found");
    }
    
    const updatedBloodBank: BloodBank = {
      ...bloodBank,
      ...bloodBankData,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };
    
    this.bloodBanks.set(id, updatedBloodBank);
    return updatedBloodBank;
  };
  
  storage.deleteBloodBank = async function(this: any, id: number): Promise<void> {
    if (!this.bloodBanks) {
      this.bloodBanks = new Map();
      throw new Error("Blood bank not found");
    }
    
    const exists = this.bloodBanks.has(id);
    if (!exists) {
      throw new Error("Blood bank not found");
    }
    
    this.bloodBanks.delete(id);
  };
}