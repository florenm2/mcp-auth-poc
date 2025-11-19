/**
 * MCP Client with Dynamic Client Registration and OAuth
 * Entry point for the client application
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('MCP Auth Client - Starting...');
console.log('Configuration:');
console.log(`- Server URL: ${process.env.SERVER_URL || 'http://localhost:3000'}`);
console.log(`- Client Name: ${process.env.CLIENT_NAME || 'MCP Demo Client'}`);

// TODO: Implement client registration and OAuth flow
// This will be implemented in the next steps
