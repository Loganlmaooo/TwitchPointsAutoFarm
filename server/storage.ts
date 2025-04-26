import { 
  users, type User, type InsertUser,
  licenseKeys, type LicenseKey, type InsertLicenseKey,
  channelTracking, type ChannelTracking, type InsertChannelTracking,
  activityLogs, type ActivityLog, type InsertActivityLog
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // License key methods
  createLicenseKey(key: InsertLicenseKey): Promise<LicenseKey>;
  getLicenseKey(key: string): Promise<LicenseKey | undefined>;
  getLicenseKeysByUserId(userId: number): Promise<LicenseKey[]>;
  getUnusedLicenseKeys(): Promise<LicenseKey[]>;
  activateLicenseKey(key: string, userId: number): Promise<LicenseKey | undefined>;
  revokeLicenseKey(key: string, revokedBy: number): Promise<LicenseKey | undefined>;
  
  // Channel tracking methods
  createChannelTracking(channel: InsertChannelTracking): Promise<ChannelTracking>;
  getChannelTrackingsByUserId(userId: number): Promise<ChannelTracking[]>;
  updateChannelTracking(id: number, data: Partial<ChannelTracking>): Promise<ChannelTracking | undefined>;
  deleteChannelTracking(id: number): Promise<boolean>;
  
  // Activity logs methods
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogsByUserId(userId: number): Promise<ActivityLog[]>;
  getRecentActivityLogs(limit: number): Promise<ActivityLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private licenseKeys: Map<number, LicenseKey>;
  private channelTracking: Map<number, ChannelTracking>;
  private activityLogs: Map<number, ActivityLog>;
  
  userCurrentId: number;
  licenseKeyCurrentId: number;
  channelTrackingCurrentId: number;
  activityLogCurrentId: number;

  constructor() {
    this.users = new Map();
    this.licenseKeys = new Map();
    this.channelTracking = new Map();
    this.activityLogs = new Map();
    
    this.userCurrentId = 1;
    this.licenseKeyCurrentId = 1;
    this.channelTrackingCurrentId = 1;
    this.activityLogCurrentId = 1;
    
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@twitchfarmpro.com",
      role: "admin",
      isActive: true
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user",
      isActive: true
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // License Key Methods
  async createLicenseKey(insertLicenseKey: InsertLicenseKey): Promise<LicenseKey> {
    const id = this.licenseKeyCurrentId++;
    const now = new Date();
    const licenseKey: LicenseKey = {
      ...insertLicenseKey,
      id,
      createdAt: now,
      isActive: true
    };
    this.licenseKeys.set(id, licenseKey);
    return licenseKey;
  }

  async getLicenseKey(key: string): Promise<LicenseKey | undefined> {
    return Array.from(this.licenseKeys.values()).find(
      (licenseKey) => licenseKey.key === key
    );
  }

  async getLicenseKeysByUserId(userId: number): Promise<LicenseKey[]> {
    return Array.from(this.licenseKeys.values()).filter(
      (licenseKey) => licenseKey.usedBy === userId
    );
  }

  async getUnusedLicenseKeys(): Promise<LicenseKey[]> {
    return Array.from(this.licenseKeys.values()).filter(
      (licenseKey) => !licenseKey.usedBy && !licenseKey.revokedAt && licenseKey.isActive
    );
  }

  async activateLicenseKey(key: string, userId: number): Promise<LicenseKey | undefined> {
    const licenseKey = await this.getLicenseKey(key);
    if (!licenseKey || licenseKey.usedBy || licenseKey.revokedAt || !licenseKey.isActive) {
      return undefined;
    }
    
    const now = new Date();
    const updatedLicenseKey: LicenseKey = {
      ...licenseKey,
      usedAt: now,
      usedBy: userId
    };
    
    this.licenseKeys.set(licenseKey.id, updatedLicenseKey);
    return updatedLicenseKey;
  }

  async revokeLicenseKey(key: string, revokedBy: number): Promise<LicenseKey | undefined> {
    const licenseKey = await this.getLicenseKey(key);
    if (!licenseKey) return undefined;
    
    const now = new Date();
    const updatedLicenseKey: LicenseKey = {
      ...licenseKey,
      revokedAt: now,
      revokedBy,
      isActive: false
    };
    
    this.licenseKeys.set(licenseKey.id, updatedLicenseKey);
    return updatedLicenseKey;
  }

  // Channel Tracking Methods
  async createChannelTracking(insertChannelTracking: InsertChannelTracking): Promise<ChannelTracking> {
    const id = this.channelTrackingCurrentId++;
    const now = new Date();
    const channelTracking: ChannelTracking = {
      ...insertChannelTracking,
      id,
      createdAt: now,
      lastActive: now,
      totalPointsEarned: 0,
      totalWatchTimeMinutes: 0
    };
    this.channelTracking.set(id, channelTracking);
    return channelTracking;
  }

  async getChannelTrackingsByUserId(userId: number): Promise<ChannelTracking[]> {
    return Array.from(this.channelTracking.values()).filter(
      (channelTracking) => channelTracking.userId === userId
    );
  }

  async updateChannelTracking(id: number, data: Partial<ChannelTracking>): Promise<ChannelTracking | undefined> {
    const channelTracking = this.channelTracking.get(id);
    if (!channelTracking) return undefined;
    
    const updatedChannelTracking = { ...channelTracking, ...data };
    this.channelTracking.set(id, updatedChannelTracking);
    return updatedChannelTracking;
  }

  async deleteChannelTracking(id: number): Promise<boolean> {
    return this.channelTracking.delete(id);
  }

  // Activity Logs Methods
  async createActivityLog(insertActivityLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogCurrentId++;
    const now = new Date();
    const activityLog: ActivityLog = {
      ...insertActivityLog,
      id,
      timestamp: now
    };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }

  async getActivityLogsByUserId(userId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getRecentActivityLogs(limit: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
