// MCP Client with self-registration and OAuth
// Main entry point

import { DCRClient } from './dcr-client.js';
import { OAuthClient } from './oauth-client.js';
import { MCPClient } from './mcp-client.js';

// Configuration
const SERVER_BASE_URL = process.env.SERVER_URL || 'http://localhost:3000';
const DCR_ENDPOINT = `${SERVER_BASE_URL}/register`;
const AUTHORIZE_ENDPOINT = `${SERVER_BASE_URL}/oauth/authorize`;
const TOKEN_ENDPOINT = `${SERVER_BASE_URL}/oauth/token`;
const CALLBACK_URI = 'http://localhost:3001/callback';

async function main() {
  console.log('🎯 MCP Authorization Client POC');
  console.log('=================================\n');

  try {
    // Step 1: Dynamic Client Registration (DCR)
    console.log('Step 1: Dynamic Client Registration');
    console.log('------------------------------------');
    const dcrClient = new DCRClient(DCR_ENDPOINT);
    const clientRegistration = await dcrClient.register({
      client_name: 'MCP Demo Client',
      redirect_uris: [CALLBACK_URI],
      grant_types: ['authorization_code'],
      scope: 'mcp:tools',
    });
    console.log('');

    // Step 2: OAuth Authorization Flow
    console.log('Step 2: OAuth Authorization Flow');
    console.log('--------------------------------');
    const oauthClient = new OAuthClient(
      AUTHORIZE_ENDPOINT,
      TOKEN_ENDPOINT,
      clientRegistration
    );

    const authCode = await oauthClient.authorize('mcp:tools');
    console.log('');

    // Step 3: Exchange code for access token
    console.log('Step 3: Token Exchange');
    console.log('----------------------');
    const tokenResponse = await oauthClient.exchangeCodeForToken(
      authCode,
      CALLBACK_URI
    );
    console.log('');

    // Step 4: Connect to MCP server and call protected tool
    console.log('Step 4: MCP Tool Access');
    console.log('-----------------------');
    const mcpClient = new MCPClient();

    // Connect to MCP server in stdio mode
    await mcpClient.connect('npm', ['start', '--prefix', '../server'], { USE_STDIO: 'true' });

    // List available tools
    const tools = await mcpClient.listTools();
    console.log(`📋 Available tools: ${tools.map(t => t.name).join(', ')}`);
    console.log('');

    // Call the public tool (no auth required)
    console.log('🔓 Testing public tool...');
    const publicResult = await mcpClient.callTool('public_info', {});
    console.log('Response:', JSON.parse(publicResult.content[0].text));
    console.log('');

    // Call the protected echo tool with access token
    console.log('🔐 Testing auth-protected tool...');
    const echoResult = await mcpClient.callTool('echo', {
      message: 'Hello from authenticated client!',
      access_token: tokenResponse.access_token,
    });
    console.log('Response:', JSON.parse(echoResult.content[0].text));
    console.log('');

    // Clean up
    await mcpClient.close();

    console.log('✅ Authorization flow complete!');
    console.log('\nSummary:');
    console.log('--------');
    console.log('✓ Client self-registered with server');
    console.log('✓ Completed OAuth authorization flow');
    console.log('✓ Obtained access token');
    console.log('✓ Successfully called auth-protected MCP tool');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Server response:', error.response.data);
    }
    process.exit(1);
  }
}

main();
