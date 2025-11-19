// MCP Client implementation
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export class MCPClient {
  private client: Client;
  private transport?: StdioClientTransport;

  constructor() {
    this.client = new Client(
      {
        name: 'mcp-auth-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  async connect(command: string, args: string[], env?: Record<string, string>): Promise<void> {
    console.log('🔌 Connecting to MCP server...');

    const combinedEnv = env ? { ...process.env as Record<string, string>, ...env } : undefined;

    this.transport = new StdioClientTransport({
      command,
      args,
      env: combinedEnv,
    });

    await this.client.connect(this.transport);
    console.log('✅ Connected to MCP server');
  }

  async listTools(): Promise<Tool[]> {
    console.log('📋 Fetching available tools...');
    const response = await this.client.listTools();
    return response.tools;
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<any> {
    console.log(`🔧 Calling tool: ${name}`);
    const response = await this.client.callTool({ name, arguments: args });
    return response;
  }

  async close(): Promise<void> {
    if (this.transport) {
      await this.client.close();
      console.log('👋 Disconnected from MCP server');
    }
  }
}
