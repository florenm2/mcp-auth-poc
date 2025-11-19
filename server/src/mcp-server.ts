// MCP Server implementation with auth-protected tools
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { storage } from './storage.js';

export class MCPAuthServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-auth-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async (request) => {
      const tools: Tool[] = [
        {
          name: 'echo',
          description: 'Echo back the provided message (requires authorization)',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'The message to echo back',
              },
              access_token: {
                type: 'string',
                description: 'OAuth access token for authorization',
              },
            },
            required: ['message', 'access_token'],
          },
        },
        {
          name: 'public_info',
          description: 'Get public server information (no authorization required)',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'echo': {
          // This tool requires authorization
          const { message, access_token } = args as { message: string; access_token?: string };

          if (!access_token) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    error: 'unauthorized',
                    error_description: 'This tool requires an access_token',
                  }),
                },
              ],
            };
          }

          // Validate the access token
          if (!storage.validateAccessToken(access_token)) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    error: 'invalid_token',
                    error_description: 'The access token is invalid or expired',
                  }),
                },
              ],
            };
          }

          // Token is valid, return the echo response
          console.log(`🔐 Authorized echo call: "${message}"`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  echo: message,
                  authorized: true,
                }),
              },
            ],
          };
        }

        case 'public_info': {
          // This tool does not require authorization
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  server: 'MCP Auth Server',
                  version: '1.0.0',
                  features: ['Dynamic Client Registration', 'OAuth 2.0', 'Protected Tools'],
                }),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('🚀 MCP Server started on stdio');
  }
}
