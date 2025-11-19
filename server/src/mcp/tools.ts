/**
 * MCP Tools - Auth-protected tool implementations
 */

/**
 * Simple echo tool (auth-protected)
 */
export function echoTool(message: string): string {
  return `Echo: ${message}`;
}

/**
 * List available tools
 */
export function getToolsList() {
  return [
    {
      name: 'echo',
      description: 'Echo back a message (requires authentication)',
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'The message to echo back',
          },
        },
        required: ['message'],
      },
    },
  ];
}
