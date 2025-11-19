# MCP Authorization Proof of Concept

This project demonstrates the MCP Authorization Spec with Dynamic Client Registration (DCR) and OAuth 2.0 flow.

## Project Structure

```
mcp-auth-poc/
├── server/          # MCP server with DCR and OAuth provider
├── client/          # MCP client with self-registration
├── shared/          # Shared types and utilities
└── README.md
```

## Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build
```

## Running

```bash
# Terminal 1: Start the server
npm run dev:server

# Terminal 2: Run the client
npm run dev:client
```

## Architecture

### Server
- Implements MCP server protocol
- Provides Dynamic Client Registration (DCR) endpoint
- Acts as OAuth 2.0 authorization server
- Exposes auth-protected tools (echo tool)

### Client
- Implements MCP client protocol
- Self-registers with the server using DCR
- Completes OAuth 2.0 flow
- Calls auth-protected tools

## Flow

1. **Client Registration**: Client registers itself with the server via DCR
2. **OAuth Authorization**: Client initiates OAuth flow to get user authorization
3. **Token Exchange**: Client exchanges authorization code for access token
4. **Authorized API Call**: Client calls auth-protected MCP tools with access token

## TODO

- [ ] Implement MCP server
- [ ] Implement DCR endpoint
- [ ] Implement OAuth provider
- [ ] Implement auth-protected echo tool
- [ ] Implement MCP client
- [ ] Implement DCR client registration
- [ ] Implement OAuth flow
- [ ] End-to-end testing
