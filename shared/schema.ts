import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  twitchId: text("twitch_id"),
  twitchUsername: text("twitch_username"),
  twitchAccessToken: text("twitch_access_token"),
  twitchRefreshToken: text("twitch_refresh_token"),
  twitchTokenExpiry: timestamp("twitch_token_expiry"),
});

// Extended InsertUser schema with optional Twitch fields
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password is required"),
  email: z.string().email("Valid email is required"),
  twitchId: z.string().optional(),
  twitchUsername: z.string().optional(),
  twitchAccessToken: z.string().optional(),
  twitchRefreshToken: z.string().optional(),
  twitchTokenExpiry: z.date().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Define types using the schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  id: number;
  username: string;
  password: string;
  email: string;
  role: string;
  isActive: boolean;
  twitchId: string | null;
  twitchUsername: string | null;
  twitchAccessToken: string | null;
  twitchRefreshToken: string | null;
  twitchTokenExpiry: Date | null;
};

// Login form schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password is required"),
});

// Twitch login callback schema
export const twitchAuthSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().optional(),
});
