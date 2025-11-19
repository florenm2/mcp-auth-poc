/**
 * MCP Server with OAuth and Dynamic Client Registration
 * Entry point for the server application
 */

import dotenv from 'dotenv';
import app from './server.js';
import { config, validateConfig } from './config.js';

// Load environment variables
dotenv.config();

console.log('='.repeat(60));
console.log('MCP Auth Server - Starting...');
console.log('='.repeat(60));

// Validate configuration
validateConfig();

// Determine mode: HTTP server for OAuth endpoints, or MCP server for stdio
const mode = process.env.SERVER_MODE || 'http';

if (mode === 'http') {
  // HTTP mode: Start Express server for OAuth endpoints
  const port = config.server.port;
  const host = config.server.host;

  app.listen(port, host, () => {
    console.log('='.repeat(60));
    console.log('[HTTP Server] Server is running');
    console.log(`[HTTP Server] OAuth Endpoints: http://${host}:${port}`);
    console.log(`[HTTP Server] - Register: POST /oauth/register`);
    console.log(`[HTTP Server] - Authorize: GET /oauth/authorize`);
    console.log(`[HTTP Server] - Token: POST /oauth/token`);
    console.log(`[HTTP Server] - Discovery: GET /.well-known/oauth-authorization-server`);
    console.log('='.repeat(60));
  });
} else if (mode === 'mcp') {
  // MCP mode: Start MCP server with stdio transport
  console.log('[MCP Mode] Starting MCP server with stdio transport...');
  console.log('[MCP Mode] Note: OAuth endpoints are NOT available in this mode');
  console.log('[MCP Mode] Use HTTP mode for OAuth flow');
  console.log('='.repeat(60));

  // Import and start MCP server
  import('./mcp/server.js').then(async ({ startMCPServer }) => {
    await startMCPServer();
  }).catch((error) => {
    console.error('[MCP Mode] Failed to start MCP server:', error);
    process.exit(1);
  });
} else {
  console.error(`[Error] Invalid SERVER_MODE: ${mode}`);
  console.error('[Error] Valid modes: http, mcp');
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Server] Shutting down gracefully...');
  process.exit(0);
});
