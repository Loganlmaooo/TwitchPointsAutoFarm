import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("user").notNull(),
  twitchUsername: text("twitch_username"),
  twitchAccessToken: text("twitch_access_token"),
  twitchRefreshToken: text("twitch_refresh_token"),
  twitchTokenExpiry: timestamp("twitch_token_expiry"),
  isActive: boolean("is_active").default(true).notNull(),
});

// License keys schema
export const licenseKeys = pgTable("license_keys", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  keyType: text("key_type").notNull(), // standard, premium, lifetime
  durationDays: integer("duration_days").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
  usedBy: integer("used_by").references(() => users.id),
  revokedAt: timestamp("revoked_at"),
  revokedBy: integer("revoked_by").references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
});

// Channel tracking schema
export const channelTracking = pgTable("channel_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  channelName: text("channel_name").notNull(),
  pointsPerHour: integer("points_per_hour").default(0).notNull(),
  totalWatchTimeMinutes: integer("total_watch_time_minutes").default(0).notNull(),
  totalPointsEarned: integer("total_points_earned").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity logs schema
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Define insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  role: true,
  isActive: true
});

export const insertLicenseKeySchema = createInsertSchema(licenseKeys).omit({
  id: true,
  createdAt: true,
  usedAt: true,
  usedBy: true,
  revokedAt: true,
  revokedBy: true,
  isActive: true
});

export const insertChannelTrackingSchema = createInsertSchema(channelTracking).omit({
  id: true,
  createdAt: true,
  lastActive: true,
  totalPointsEarned: true,
  totalWatchTimeMinutes: true
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true
});

// Define types using the schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLicenseKey = z.infer<typeof insertLicenseKeySchema>;
export type LicenseKey = typeof licenseKeys.$inferSelect;

export type InsertChannelTracking = z.infer<typeof insertChannelTrackingSchema>;
export type ChannelTracking = typeof channelTracking.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Login form schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password is required"),
});

// Activate key schema
export const activateKeySchema = z.object({
  key: z.string().min(10, "License key is required"),
});
