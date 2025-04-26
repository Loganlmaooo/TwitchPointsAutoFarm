// We don't need useToast here as it's a React hook

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

class TwitchService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private stateKey = 'twitch_auth_state';

  constructor() {
    // These values will be set server-side, no need to expose them in the client
    this.clientId = '';  
    this.clientSecret = '';
    this.redirectUri = `${window.location.origin}/twitch/callback`;
  }

  getAuthUrl(): string {
    // We don't need to implement this on the client-side
    // The server will provide the auth URL
    return '';
  }

  async getAccessToken(code: string): Promise<TwitchAuthResponse> {
    // We'll let the server handle this exchange to keep the client_secret secure
    return {} as TwitchAuthResponse;
  }

  async getUserInfo(accessToken: string): Promise<TwitchUser> {
    // We'll let the server handle this to avoid exposing the access token
    return {} as TwitchUser;
  }

  async linkAccount(code: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/twitch/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state: localStorage.getItem(this.stateKey) }),
      });

      if (!response.ok) {
        throw new Error('Failed to link Twitch account');
      }

      // Clear the state from localStorage
      localStorage.removeItem(this.stateKey);
      
      return true;
    } catch (error) {
      console.error('Error linking Twitch account:', error);
      return false;
    }
  }
  
  async disconnectAccount(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/twitch/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect Twitch account');
      }
      
      return true;
    } catch (error) {
      console.error('Error disconnecting Twitch account:', error);
      return false;
    }
  }

  private generateRandomState(): string {
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => dec.toString(16).padStart(2, '0')).join('');
  }

  verifyState(returnedState: string): boolean {
    const storedState = localStorage.getItem(this.stateKey);
    return storedState === returnedState;
  }
  
  async getChannelInfo(channelName: string): Promise<any> {
    try {
      // In a production app, we would make an API call to get channel info
      // For this template, we'll return mock data since we don't want to require Twitch API keys
      return {
        avatarUrl: `https://ui-avatars.com/api/?name=${channelName}&background=random`,
        game: 'Just Chatting',
        status: 'active'
      };
    } catch (error) {
      console.error('Error fetching channel info:', error);
      return {};
    }
  }
}

export const twitchService = new TwitchService();