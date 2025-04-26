import { users, type User, type InsertUser } from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser, role?: string): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userCurrentId: number;

  constructor() {
    this.users = new Map();
    this.userCurrentId = 1;
    
    // Create default admin user
    const admin = {
      username: "admin",
      password: "admin123",
      email: "admin@example.com"
    };
    
    this.createUser(admin, "admin");
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

  async createUser(insertUser: InsertUser, role: string = "user"): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: role,
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
}

export const storage = new MemStorage();
