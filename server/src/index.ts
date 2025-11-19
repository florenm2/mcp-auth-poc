// Main server entry point
import express from 'express';
import cors from 'cors';
import { handleClientRegistration } from './dcr.js';
import { handleAuthorize, handleToken } from './oauth.js';
import { MCPAuthServer } from './mcp-server.js';

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const USE_STDIO = process.env.USE_STDIO === 'true';

async function main() {
  console.log('🎯 MCP Authorization Server POC');
  console.log('================================\n');

  if (USE_STDIO) {
    // Run in stdio mode for MCP client connection
    console.log('Running in STDIO mode for MCP protocol...');
    const mcpServer = new MCPAuthServer();
    await mcpServer.start();
  } else {
    // Run HTTP server for DCR and OAuth endpoints
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    app.use((req, _res, next) => {
      console.log(`📥 ${req.method} ${req.path}`);
      next();
    });

    // Health check
    app.get('/', (_req, res) => {
      res.json({
        server: 'MCP Auth Server',
        version: '1.0.0',
        endpoints: {
          registration: 'POST /register',
          authorize: 'GET /oauth/authorize',
          token: 'POST /oauth/token',
        },
      });
    });

    // Dynamic Client Registration endpoint (RFC 7591)
    app.post('/register', handleClientRegistration);

    // OAuth 2.0 endpoints (RFC 6749)
    app.get('/oauth/authorize', handleAuthorize);
    app.post('/oauth/token', handleToken);

    // Start HTTP server
    app.listen(HTTP_PORT, () => {
      console.log(`✅ HTTP server running on http://localhost:${HTTP_PORT}`);
      console.log(`\nAvailable endpoints:`);
      console.log(`  - POST http://localhost:${HTTP_PORT}/register (DCR)`);
      console.log(`  - GET  http://localhost:${HTTP_PORT}/oauth/authorize`);
      console.log(`  - POST http://localhost:${HTTP_PORT}/oauth/token`);
      console.log(`\nTo run MCP server in stdio mode, set USE_STDIO=true`);
    });
  }
}

main().catch((error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});
