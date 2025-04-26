export interface TwitchChannel {
  id: number;
  channelName: string;
  pointsPerHour: number;
  totalWatchTimeMinutes: number;
  totalPointsEarned: number;
  isActive: boolean;
  lastActive: string;
  avatarUrl?: string;
  game?: string;
  status?: 'active' | 'offline' | 'paused';
}

export interface LicenseKey {
  id: number;
  key: string;
  keyType: string;
  durationDays: number;
  createdAt: string;
  usedAt?: string;
  usedBy?: number;
  revokedAt?: string;
  revokedBy?: number;
  isActive: boolean;
}

export interface ActivityLog {
  id: number;
  userId?: number;
  action: string;
  details?: string;
  timestamp: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  twitchUsername?: string;
  twitchAccessToken?: string;
  twitchRefreshToken?: string;
  twitchTokenExpiry?: string;
  isActive: boolean;
}

export interface Stats {
  pointsEarned: number;
  watchTime: string;
  activeChannels: number;
  totalChannels: number;
  pointsRate: string;
  pointsToday: string;
  watchTimeWeek: string;
  licenseStatus: 'active' | 'inactive' | 'expired';
  licenseExpiry?: string;
}
