import axios from 'axios';
import config from './config';

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  email: string;
}

export interface TwitchAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
}

export class TwitchAPI {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = config.twitch.clientId;
    this.clientSecret = config.twitch.clientSecret;
    this.redirectUri = config.twitch.redirectUri || `${config.appUrl}/twitch/callback`;
  }

  async getAccessToken(code: string): Promise<TwitchAuthResponse> {
    const url = 'https://id.twitch.tv/oauth2/token';
    
    try {
      const response = await axios.post(url, null, {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error exchanging Twitch auth code:', error);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  async getUserInfo(accessToken: string): Promise<TwitchUser> {
    const url = 'https://api.twitch.tv/helix/users';
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('No user data returned from Twitch');
      }

      return response.data.data[0];
    } catch (error) {
      console.error('Error fetching Twitch user info:', error);
      throw new Error('Failed to fetch Twitch user information');
    }
  }

  async refreshToken(refreshToken: string): Promise<TwitchAuthResponse> {
    const url = 'https://id.twitch.tv/oauth2/token';
    
    try {
      const response = await axios.post(url, null, {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing Twitch token:', error);
      throw new Error('Failed to refresh Twitch access token');
    }
  }
}

export const twitchAPI = new TwitchAPI();