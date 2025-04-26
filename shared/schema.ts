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
});

// Define insert schema for users
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  role: true,
  isActive: true
});

// Define types using the schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Login form schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password is required"),
});
