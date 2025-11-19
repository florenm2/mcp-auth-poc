/**
 * MCP Server implementation with authorization
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { echoTool, getToolsList } from './tools.js';
import { validateAccessToken } from '../auth/oauth.js';

/**
 * Create and configure MCP server with authorization
 */
export async function createMCPServer() {
  const server = new Server(
    {
      name: process.env.MCP_SERVER_NAME || 'mcp-auth-demo',
      version: process.env.MCP_SERVER_VERSION || '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Store authorization state
  let accessToken: string | null = null;
  let isAuthorized = false;

  /**
   * Helper to check if client is authorized
   */
  function requireAuthorization(): boolean {
    if (!accessToken || !isAuthorized) {
      return false;
    }

    // Validate token is still valid
    const tokenData = validateAccessToken(accessToken);
    if (!tokenData) {
      isAuthorized = false;
      accessToken = null;
      return false;
    }

    return true;
  }

  /**
   * Handle tools/list request
   * Note: According to the spec, tools/list can be open or protected.
   * We're making it open but the tools themselves are protected.
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.log('[MCP] Received tools/list request');

    // Return available tools (list is open, but tools require auth)
    return {
      tools: getToolsList(),
    };
  });

  /**
   * Handle tools/call request
   * This is where we enforce authorization
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    console.log(`[MCP] Received tools/call request for: ${request.params.name}`);

    // Check authorization
    if (!requireAuthorization()) {
      console.log('[MCP] Unauthorized tool call attempt');
      throw new Error('Unauthorized: Valid access token required');
    }

    // Handle the tool call
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'echo':
        if (!args || typeof args !== 'object' || !('message' in args)) {
          throw new Error('Invalid arguments: message is required');
        }
        const message = String(args.message);
        const result = echoTool(message);
        console.log(`[MCP] Echo tool executed: ${message}`);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  /**
   * Custom method to set access token
   * This would be called after OAuth flow completes
   */
  (server as any).setAccessToken = (token: string) => {
    const tokenData = validateAccessToken(token);
    if (tokenData) {
      accessToken = token;
      isAuthorized = true;
      console.log(`[MCP] Access token set for client: ${tokenData.client_id}`);
    } else {
      throw new Error('Invalid access token');
    }
  };

  return server;
}

/**
 * Start MCP server with stdio transport
 */
export async function startMCPServer() {
  const server = await createMCPServer();
  const transport = new StdioServerTransport();

  console.log('[MCP] Starting server with stdio transport');

  await server.connect(transport);

  console.log('[MCP] Server started and ready');

  return server;
}
