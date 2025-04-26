# TwitchFarm Pro Template

A clean template for creating Twitch-integrated web applications with user authentication and Twitch OAuth support.

## Features

- File-based user storage (no database required)
- User registration and authentication
- Twitch OAuth integration
- Account management with Twitch connection
- Premium and modern UI design

## Setup

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server configuration
PORT=5000
SESSION_SECRET=your_session_secret_here

# Twitch API credentials
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
TWITCH_REDIRECT_URI=http://localhost:5000/twitch/callback
```

### Twitch Developer Portal Setup

1. Go to the [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Create a new application
3. Set the name to "TwitchFarm Pro" (or your preferred name)
4. Set the OAuth Redirect URL to `http://localhost:5000/twitch/callback`
5. Set the Category to "Website Integration"
6. Copy the Client ID and generate a Client Secret
7. Add these values to your `.env` file

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Project Structure

- `/client` - Frontend React application
  - `/src/components` - Reusable UI components
  - `/src/lib` - Utility functions and services
  - `/src/pages` - Application pages
  - `/src/hooks` - Custom React hooks
- `/server` - Backend Express server
  - `routes.ts` - API endpoints
  - `storage.ts` - File-based data storage
  - `twitch.ts` - Twitch API integration
- `/shared` - Shared types and schemas

## File-based Storage

User data is stored in a `user_data.json` file in the root directory. This provides a simple storage solution without requiring a database.

## License

MIT