import { users, type User, type InsertUser } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser, role?: string): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getUserByTwitchId(twitchId: string): Promise<User | undefined>;
  saveData(): Promise<void>;
  loadData(): Promise<void>;
}

export class FileStorage implements IStorage {
  private users: Map<number, User>;
  private userCurrentId: number;
  private dataFilePath: string;

  constructor() {
    this.users = new Map();
    this.userCurrentId = 1;
    this.dataFilePath = path.join(process.cwd(), 'user_data.json');
    
    // Load data from file or create default admin if no file exists
    this.loadData().catch(() => {
      // Create default admin user if data file doesn't exist
      const admin = {
        username: "admin",
        password: "admin123",
        email: "admin@example.com"
      };
      
      this.createUser(admin, "admin").then(() => this.saveData());
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByTwitchId(twitchId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.twitchId === twitchId
    );
  }

  async createUser(insertUser: InsertUser, role: string = "user"): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: role,
      isActive: true,
      twitchId: insertUser.twitchId || null,
      twitchUsername: insertUser.twitchUsername || null,
      twitchAccessToken: insertUser.twitchAccessToken || null,
      twitchRefreshToken: insertUser.twitchRefreshToken || null,
      twitchTokenExpiry: insertUser.twitchTokenExpiry || null
    };
    this.users.set(id, user);
    await this.saveData();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    await this.saveData();
    return updatedUser;
  }

  async saveData(): Promise<void> {
    try {
      const data = {
        users: Array.from(this.users.values()),
        nextUserId: this.userCurrentId
      };
      await fs.promises.writeFile(this.dataFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  async loadData(): Promise<void> {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const fileData = await fs.promises.readFile(this.dataFilePath, 'utf8');
        const data = JSON.parse(fileData);
        
        // Reset the maps
        this.users = new Map();
        
        // Load users
        if (data.users && Array.isArray(data.users)) {
          for (const user of data.users) {
            this.users.set(user.id, user);
          }
        }
        
        // Set the next IDs
        this.userCurrentId = data.nextUserId || 1;
      }
    } catch (error) {
      throw new Error('Error loading data from file');
    }
  }
}

export const storage = new FileStorage();
