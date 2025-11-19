/**
 * MCP Server with OAuth and Dynamic Client Registration
 * Entry point for the server application
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('MCP Auth Server - Starting...');
console.log('Configuration:');
console.log(`- Port: ${process.env.PORT || 3000}`);
console.log(`- Host: ${process.env.HOST || 'localhost'}`);
console.log(`- OAuth Issuer: ${process.env.OAUTH_ISSUER || 'http://localhost:3000'}`);

// TODO: Import and start the server
// This will be implemented in the next steps
