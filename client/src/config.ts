/**
 * Client configuration
 */

export const config = {
  server: {
    url: process.env.SERVER_URL || 'http://localhost:3000',
  },
  client: {
    name: process.env.CLIENT_NAME || 'MCP Demo Client',
    uri: process.env.CLIENT_URI || 'http://localhost:8080',
    redirectUri: process.env.REDIRECT_URI || 'http://localhost:8080/callback',
  },
  oauth: {
    scope: process.env.OAUTH_SCOPE || 'mcp:tools mcp:resources',
  },
};

export function validateConfig() {
  console.log('[Config] Client configuration loaded');
  console.log(`[Config] - Server URL: ${config.server.url}`);
  console.log(`[Config] - Client Name: ${config.client.name}`);
  console.log(`[Config] - Redirect URI: ${config.client.redirectUri}`);
}
