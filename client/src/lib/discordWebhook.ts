import axios from 'axios';

// Discord webhook URL - using environment variable with fallback
const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL || 
  "https://discord.com/api/webhooks/1365508833815953518/i6QoxKXSD75Yp-F1zmeVEga1K_DKt3J4xAOdMe_TGWXjWPmBkAbhCB9l4dyfoQtC7Yl8";

/**
 * Send a log message to Discord webhook
 */
export async function logToDiscord(message: string, username: string = 'TwitchFarm Pro', details?: Record<string, any>): Promise<boolean> {
  try {
    const payload = {
      content: message,
      username: username,
      avatar_url: "https://cdn-icons-png.flaticon.com/512/5968/5968819.png",
      embeds: details ? [
        {
          title: 'Details',
          color: 0x9147FF,
          fields: Object.entries(details).map(([name, value]) => ({
            name,
            value: String(value),
            inline: true
          })),
          timestamp: new Date().toISOString()
        }
      ] : undefined
    };

    await axios.post(DISCORD_WEBHOOK_URL, payload);
    return true;
  } catch (error) {
    console.error('Failed to send Discord webhook:', error);
    return false;
  }
}

export default {
  logToDiscord
};
