  // Implement the new user management functions in MemStorage
  async getUsers(options?: { role?: string; excludeRoles?: string[]; onlyRoles?: string[]; page?: number; limit?: number }): Promise<User[]> {
    let users = Array.from(this.users.values());
    
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
    const exists = this.users.has(id);
    if (!exists) {
      throw new Error("User not found");
    }
    
    // Delete user
    this.users.delete(id);
    
    // Delete associated data
    // (donor profile, documents, etc.)
    const profileId = Array.from(this.donorProfiles.values())
      .find(profile => profile.userId === id)?.id;
      
    if (profileId) {
      this.donorProfiles.delete(profileId);
    }
    
    // Delete documents
    Array.from(this.documents.values())
      .filter(doc => doc.userId === id)
      .forEach(doc => this.documents.delete(doc.id));
  }
  
  private deletionRequests = new Map<number, DeletionRequest>();
  private deletionRequestIdCounter = 1;
  
  async createDeletionRequest(request: { requesterId: number; targetUserId: number; reason: string; status: string; createdAt: Date }): Promise<DeletionRequest> {
    const id = this.deletionRequestIdCounter++;
    
    const deletionRequest: DeletionRequest = {
      id,
      requesterId: request.requesterId,
      targetUserId: request.targetUserId,
      reason: request.reason,
      status: request.status as 'pending' | 'approved' | 'rejected',
      createdAt: request.createdAt
    };
    
    this.deletionRequests.set(id, deletionRequest);
    return deletionRequest;
  }
  
  async getDeletionRequest(id: number): Promise<DeletionRequest> {
    const request = this.deletionRequests.get(id);
    if (!request) {
      throw new Error("Deletion request not found");
    }
    
    return request;
  }
  
  async getDeletionRequests(options?: { status?: string; page?: number; limit?: number; includeRequester?: boolean; includeTargetUser?: boolean }): Promise<any[]> {
    let requests = Array.from(this.deletionRequests.values());
    
    // Apply status filter if specified
    if (options?.status) {
      requests = requests.filter(req => req.status === options.status);
    }
    
    // Apply pagination
    if (options?.page && options?.limit) {
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      requests = requests.slice(startIndex, endIndex);
    }
    
    // Add requester and target user info if requested
    if (options?.includeRequester || options?.includeTargetUser) {
      return Promise.all(requests.map(async req => {
        const result: any = { ...req };
        
        if (options.includeRequester) {
          const requester = await this.getUser(req.requesterId);
          if (requester) {
            const { password, ...requesterWithoutPassword } = requester;
            result.requester = requesterWithoutPassword;
          }
        }
        
        if (options.includeTargetUser) {
          const targetUser = await this.getUser(req.targetUserId);
          if (targetUser) {
            const { password, ...targetUserWithoutPassword } = targetUser;
            result.targetUser = targetUserWithoutPassword;
          }
        }
        
        return result;
      }));
    }
    
    return requests;
  }
  
  async updateDeletionRequest(id: number, data: Partial<DeletionRequest>): Promise<DeletionRequest> {
    const request = await this.getDeletionRequest(id);
    
    const updatedRequest: DeletionRequest = {
      ...request,
      ...data
    };
    
    this.deletionRequests.set(id, updatedRequest);
    return updatedRequest;
  }