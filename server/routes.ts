import type { Express, Request as ExpressRequest, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  loginSchema, 
  activateKeySchema,
  insertLicenseKeySchema,
  insertChannelTrackingSchema,
  insertActivityLogSchema
} from "@shared/schema";
import crypto from "crypto";
import axios from "axios";
import session from "express-session";
import memorystore from "memorystore";

// Extend Session interface
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Extend the Express Request type to include session
interface Request extends ExpressRequest {
  session: session.Session & Partial<session.SessionData>;
}

// Discord webhook URL
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1365508833815953518/i6QoxKXSD75Yp-F1zmeVEga1K_DKt3J4xAOdMe_TGWXjWPmBkAbhCB9l4dyfoQtC7Yl8";

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Admin middleware
const requireAdmin = async (req: Request, res: Response, next: Function) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  
  next();
};

// Helper function to log to Discord webhook
async function logToDiscord(content: string) {
  try {
    await axios.post(DISCORD_WEBHOOK_URL, {
      content,
      username: "TwitchFarm Pro",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/5968/5968819.png"
    });
  } catch (error) {
    console.error("Failed to log to Discord:", error);
  }
}

// Generate a license key
function generateLicenseKey(prefix = "TWITCH"): string {
  const segments = [
    prefix,
    crypto.randomBytes(2).toString("hex").toUpperCase(),
    crypto.randomBytes(2).toString("hex").toUpperCase(),
    crypto.randomBytes(2).toString("hex").toUpperCase()
  ];
  
  return segments.join("-");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up sessions
  const MemoryStore = memorystore(session);
  
  app.use(session({
    cookie: { maxAge: 86400000 }, // 24 hours
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || "twitch-farm-pro-secret"
  }));
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Log to Discord
      await logToDiscord(`New user registered: ${newUser.username}`);
      
      // Create activity log
      await storage.createActivityLog({
        userId: newUser.id,
        action: "user_registered",
        details: `New user registered: ${newUser.username}`
      });
      
      // Set session
      req.session.userId = newUser.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Log to Discord
      await logToDiscord(`User logged in: ${user.username}`);
      
      // Create activity log
      await storage.createActivityLog({
        userId: user.id,
        action: "user_login",
        details: `User logged in: ${user.username}`
      });
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  app.post("/api/auth/logout", requireAuth, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // License Key routes
  app.post("/api/license/activate", requireAuth, async (req, res) => {
    try {
      const { key } = activateKeySchema.parse(req.body);
      
      const licenseKey = await storage.getLicenseKey(key);
      if (!licenseKey) {
        return res.status(404).json({ message: "License key not found" });
      }
      
      if (licenseKey.usedBy) {
        return res.status(400).json({ message: "License key already used" });
      }
      
      if (licenseKey.revokedAt) {
        return res.status(400).json({ message: "License key has been revoked" });
      }
      
      if (!licenseKey.isActive) {
        return res.status(400).json({ message: "License key is inactive" });
      }
      
      const activatedKey = await storage.activateLicenseKey(key, req.session.userId);
      
      // Get user for logging
      const user = await storage.getUser(req.session.userId);
      
      // Log to Discord
      await logToDiscord(`License key activated: ${key} by user ${user?.username || 'Unknown'}`);
      
      // Create activity log
      await storage.createActivityLog({
        userId: req.session.userId,
        action: "license_activated",
        details: `License key activated: ${key}`
      });
      
      res.status(200).json(activatedKey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  app.get("/api/license/status", requireAuth, async (req, res) => {
    try {
      const licenseKeys = await storage.getLicenseKeysByUserId(req.session.userId);
      
      if (licenseKeys.length === 0) {
        return res.status(404).json({ message: "No active license found" });
      }
      
      // Find the latest active license
      const activeLicense = licenseKeys
        .filter(key => key.isActive && !key.revokedAt && key.usedAt !== null)
        .sort((a, b) => {
          const aTime = a.usedAt ? a.usedAt.getTime() : 0;
          const bTime = b.usedAt ? b.usedAt.getTime() : 0;
          return bTime - aTime;
        })[0];
      
      if (!activeLicense) {
        return res.status(404).json({ message: "No active license found" });
      }
      
      res.status(200).json(activeLicense);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin routes - Key Management
  app.post("/api/admin/keys/generate", requireAdmin, async (req, res) => {
    try {
      const { count = 1, keyType, durationDays, prefix = "TWITCH" } = req.body;
      
      if (!keyType || !durationDays) {
        return res.status(400).json({ message: "Key type and duration are required" });
      }
      
      const generatedKeys = [];
      
      for (let i = 0; i < count; i++) {
        const licenseKey = generateLicenseKey(prefix);
        
        const newKey = await storage.createLicenseKey({
          key: licenseKey,
          keyType,
          durationDays: Number(durationDays)
        });
        
        generatedKeys.push(newKey);
      }
      
      // Log to Discord
      await logToDiscord(`Admin generated ${count} new license keys of type ${keyType}`);
      
      // Create activity log
      await storage.createActivityLog({
        userId: req.session.userId,
        action: "keys_generated",
        details: `Generated ${count} new license keys of type ${keyType}`
      });
      
      res.status(201).json(generatedKeys);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/admin/keys", requireAdmin, async (req, res) => {
    try {
      const licenseKeys = Array.from(storage["licenseKeys"].values());
      
      res.status(200).json(licenseKeys);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/admin/keys/revoke", requireAdmin, async (req, res) => {
    try {
      const { key } = req.body;
      
      if (!key) {
        return res.status(400).json({ message: "Key is required" });
      }
      
      const revokedKey = await storage.revokeLicenseKey(key, req.session.userId);
      
      if (!revokedKey) {
        return res.status(404).json({ message: "License key not found" });
      }
      
      // Log to Discord
      await logToDiscord(`Admin revoked license key: ${key}`);
      
      // Create activity log
      await storage.createActivityLog({
        userId: req.session.userId,
        action: "key_revoked",
        details: `Revoked license key: ${key}`
      });
      
      res.status(200).json(revokedKey);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Twitch Channel Tracking routes
  app.post("/api/channels", requireAuth, async (req, res) => {
    try {
      const channelData = {
        ...insertChannelTrackingSchema.parse(req.body),
        userId: req.session.userId
      };
      
      const newChannel = await storage.createChannelTracking(channelData);
      
      // Log to Discord
      await logToDiscord(`User added channel to track: ${channelData.channelName}`);
      
      // Create activity log
      await storage.createActivityLog({
        userId: req.session.userId,
        action: "channel_added",
        details: `Added channel to track: ${channelData.channelName}`
      });
      
      res.status(201).json(newChannel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  app.get("/api/channels", requireAuth, async (req, res) => {
    try {
      const channels = await storage.getChannelTrackingsByUserId(req.session.userId);
      
      res.status(200).json(channels);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/channels/:id", requireAuth, async (req, res) => {
    try {
      const channelId = parseInt(req.params.id);
      
      if (isNaN(channelId)) {
        return res.status(400).json({ message: "Invalid channel ID" });
      }
      
      // Verify ownership
      const channel = await storage["channelTracking"].get(channelId);
      
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      if (channel.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedChannel = await storage.updateChannelTracking(channelId, req.body);
      
      // Create activity log
      await storage.createActivityLog({
        userId: req.session.userId,
        action: "channel_updated",
        details: `Updated channel: ${channel.channelName}`
      });
      
      res.status(200).json(updatedChannel);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/channels/:id", requireAuth, async (req, res) => {
    try {
      const channelId = parseInt(req.params.id);
      
      if (isNaN(channelId)) {
        return res.status(400).json({ message: "Invalid channel ID" });
      }
      
      // Verify ownership
      const channel = await storage["channelTracking"].get(channelId);
      
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      if (channel.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteChannelTracking(channelId);
      
      // Log to Discord
      await logToDiscord(`User removed channel from tracking: ${channel.channelName}`);
      
      // Create activity log
      await storage.createActivityLog({
        userId: req.session.userId,
        action: "channel_removed",
        details: `Removed channel from tracking: ${channel.channelName}`
      });
      
      res.status(200).json({ message: "Channel removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Activity Logs routes
  app.get("/api/logs", requireAuth, async (req, res) => {
    try {
      const logs = await storage.getActivityLogsByUserId(req.session.userId);
      
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/admin/logs", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const logs = await storage.getRecentActivityLogs(limit);
      
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
