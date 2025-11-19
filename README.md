# MCP Authorization Proof of Concept

This project demonstrates the MCP (Model Context Protocol) Authorization Specification with Dynamic Client Registration (DCR) and OAuth 2.0 flow.

## Project Structure

```
mcp-auth-poc/
├── server/          # MCP server with OAuth and DCR support
└── client/          # MCP client with auto-registration capabilities
```

## Overview

This POC implements:

1. **Dynamic Client Registration (DCR)**: The client can self-register with the server to obtain credentials
2. **OAuth 2.0 Flow**: Standard OAuth authorization flow for user authentication
3. **Protected MCP Tools**: MCP tools/resources that require authorization

## Architecture

### Server
- MCP server implementation
- OAuth 2.0 authorization server
- Dynamic Client Registration endpoint
- Auth-protected tools/resources

### Client
- MCP client implementation
- Auto-registration via DCR
- OAuth flow handling
- Authenticated tool calls

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies for all workspaces
npm install
```

### Running the Server

```bash
npm run dev:server
```

### Running the Client

```bash
npm run dev:client
```

## Configuration

See `.env.example` files in both `server/` and `client/` directories for required environment variables.

## Development

This project uses TypeScript and is organized as an npm workspace with two packages:
- `server`: MCP server with authorization
- `client`: MCP client with DCR

## Testing the Flow

1. Start the server
2. Run the client
3. The client will:
   - Register itself via DCR
   - Initiate OAuth flow
   - Make authenticated calls to protected MCP tools

## References

- [MCP Authorization Specification](https://github.com/modelcontextprotocol/specification/blob/main/docs/specification/authorization.md)
- [OAuth 2.0 Dynamic Client Registration](https://datatracker.ietf.org/doc/html/rfc7591)
