
  // ============= BloodBank Methods =============
  
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