import type { Express, Request as ExpressRequest, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, loginSchema, twitchAuthSchema } from "@shared/schema";
import session from "express-session";
import memorystore from "memorystore";
import crypto from "crypto";
import axios from "axios";
import { twitchAPI } from "./twitch";
import config from "./config";

// Extend Session interface
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    twitchState?: string;
  }
}

// Extend the Express Request type to include session
interface Request extends ExpressRequest {
  session: session.Session & Partial<session.SessionData>;
}

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
    secret: config.sessionSecret
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
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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

  // Twitch authentication routes
  app.get("/api/auth/twitch", (req, res) => {
    try {
      // Generate state for security
      const state = crypto.randomBytes(16).toString('hex');
      req.session.twitchState = state;
      
      // Build Twitch OAuth URL
      const clientId = config.twitch.clientId;
      const redirectUri = config.twitch.redirectUri || `${req.protocol}://${req.get('host')}/api/auth/twitch/callback`;
      
      // Check if Twitch credentials are configured
      if (!clientId) {
        console.warn('Twitch client ID is not configured');
      }
      
      const scope = 'user:read:email channel:read:subscriptions';
      
      const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
      
      res.json({ url: authUrl });
    } catch (error) {
      console.error('Twitch auth error:', error);
      res.status(500).json({ message: "Failed to generate Twitch auth URL" });
    }
  });
  
  app.get("/api/auth/twitch/callback", async (req, res) => {
    try {
      const { code, state } = req.query as { code?: string, state?: string };
      
      // Validate state to prevent CSRF attacks
      if (!state || state !== req.session.twitchState) {
        return res.status(400).json({ message: "Invalid state parameter" });
      }
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code is required" });
      }
      
      // Exchange code for access token
      const tokenData = await twitchAPI.getAccessToken(code as string);
      
      // Get Twitch user info
      const twitchUser = await twitchAPI.getUserInfo(tokenData.access_token);
      
      // Check if we have this Twitch user in our database
      let user = await storage.getUserByTwitchId(twitchUser.id);
      
      if (user) {
        // User exists, update Twitch credentials
        user = await storage.updateUser(user.id, {
          twitchUsername: twitchUser.login,
          twitchAccessToken: tokenData.access_token,
          twitchRefreshToken: tokenData.refresh_token,
          twitchTokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000)
        });
      } else if (req.session.userId) {
        // User is logged in but not connected to Twitch yet
        const existingUser = await storage.getUser(req.session.userId);
        if (existingUser) {
          user = await storage.updateUser(existingUser.id, {
            twitchId: twitchUser.id,
            twitchUsername: twitchUser.login,
            twitchAccessToken: tokenData.access_token,
            twitchRefreshToken: tokenData.refresh_token,
            twitchTokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000)
          });
        }
      } else {
        // New user via Twitch, create account
        const newUserData = {
          username: twitchUser.login,
          password: crypto.randomBytes(16).toString('hex'), // Generate random password
          email: twitchUser.email || `${twitchUser.login}@twitch.tv`,
          twitchId: twitchUser.id,
          twitchUsername: twitchUser.login,
          twitchAccessToken: tokenData.access_token,
          twitchRefreshToken: tokenData.refresh_token,
          twitchTokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000)
        };
        
        user = await storage.createUser(newUserData);
      }
      
      // Set session
      if (user) {
        req.session.userId = user.id;
        
        // Redirect to frontend
        res.redirect('/dashboard');
      } else {
        // Something went wrong
        res.status(500).json({ message: "Failed to create or update user" });
      }
    } catch (error) {
      console.error('Twitch callback error:', error);
      res.status(500).json({ message: "Failed to authenticate with Twitch" });
    }
  });
  
  app.post("/api/auth/twitch/link", requireAuth, async (req, res) => {
    try {
      const { code } = twitchAuthSchema.parse(req.body);
      
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Exchange code for access token
      const tokenData = await twitchAPI.getAccessToken(code);
      
      // Get Twitch user info
      const twitchUser = await twitchAPI.getUserInfo(tokenData.access_token);
      
      // Update user record with Twitch info
      const user = await storage.updateUser(req.session.userId, {
        twitchId: twitchUser.id,
        twitchUsername: twitchUser.login,
        twitchAccessToken: tokenData.access_token,
        twitchRefreshToken: tokenData.refresh_token,
        twitchTokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000)
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error('Twitch link error:', error);
        res.status(500).json({ message: "Failed to link Twitch account" });
      }
    }
  });
  
  app.post("/api/auth/twitch/disconnect", requireAuth, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If the user has a Twitch token, revoke it
      if (user.twitchAccessToken) {
        try {
          // Attempt to revoke the token with Twitch
          // This is a best effort - we'll update our database regardless
          await axios.post(`https://id.twitch.tv/oauth2/revoke`, null, {
            params: {
              client_id: config.twitch.clientId,
              token: user.twitchAccessToken
            }
          });
        } catch (error) {
          console.error('Error revoking Twitch token:', error);
          // Continue anyway - we'll still disconnect locally
        }
      }
      
      // Update user to remove Twitch info
      const updatedUser = await storage.updateUser(req.session.userId, {
        twitchId: null,
        twitchUsername: null,
        twitchAccessToken: null,
        twitchRefreshToken: null,
        twitchTokenExpiry: null
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Twitch disconnect error:', error);
      res.status(500).json({ message: "Failed to disconnect Twitch account" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
