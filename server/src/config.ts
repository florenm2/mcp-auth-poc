/**
 * Server configuration
 */

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
  },
  oauth: {
    issuer: process.env.OAUTH_ISSUER || 'http://localhost:3000',
    jwtSecret: process.env.JWT_SECRET || 'development-secret-key',
  },
  mcp: {
    name: process.env.MCP_SERVER_NAME || 'mcp-auth-demo',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
  },
  dcr: {
    enabled: process.env.ALLOW_DCR !== 'false',
  },
};

export function validateConfig() {
  if (config.oauth.jwtSecret === 'development-secret-key') {
    console.warn('[Config] WARNING: Using default JWT secret. Set JWT_SECRET in production!');
  }

  console.log('[Config] Server configuration loaded');
  console.log(`[Config] - Server: ${config.server.host}:${config.server.port}`);
  console.log(`[Config] - OAuth Issuer: ${config.oauth.issuer}`);
  console.log(`[Config] - DCR Enabled: ${config.dcr.enabled}`);
}
