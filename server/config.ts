// Environment configuration with default values

interface Config {
  port: number;
  sessionSecret: string;
  twitch: {
    clientId: string;
    clientSecret: string; 
    redirectUri: string;
  };
  appUrl: string;
}

// Default to development values
const config: Config = {
  port: Number(process.env.PORT) || 5000,
  sessionSecret: process.env.SESSION_SECRET || 'twitchfarm-development-secret',
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID || '',
    clientSecret: process.env.TWITCH_CLIENT_SECRET || '',
    redirectUri: process.env.TWITCH_REDIRECT_URI || ''
  },
  appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`
};

// Warn about missing Twitch credentials in development
if (process.env.NODE_ENV === 'development') {
  if (!config.twitch.clientId || !config.twitch.clientSecret) {
    console.warn(
      '\n⚠️  Warning: Missing Twitch API credentials.\n' +
      'To use Twitch authentication, you need to set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET.\n' +
      'See README.md for instructions on setting up Twitch API credentials.\n'
    );
  }
}

export default config;