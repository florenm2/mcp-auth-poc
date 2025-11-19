# MCP Authorization Proof of Concept

A complete implementation demonstrating the Model Context Protocol (MCP) Authorization Spec with Dynamic Client Registration (DCR) and OAuth 2.0 flow.

## Overview

This project showcases how an MCP client can:
1. **Self-register** with an MCP server using Dynamic Client Registration (RFC 7591)
2. **Authenticate** using OAuth 2.0 authorization code flow (RFC 6749)
3. **Access protected tools** using the obtained access token

This approach enables dynamic, scalable access to enterprise tools and datasets without requiring pre-configured client credentials.

## Project Structure

```
mcp-auth-poc/
├── server/              # MCP server with DCR and OAuth provider
│   ├── src/
│   │   ├── index.ts         # Main server entry point
│   │   ├── dcr.ts           # Dynamic Client Registration handler
│   │   ├── oauth.ts         # OAuth 2.0 authorization & token endpoints
│   │   ├── mcp-server.ts    # MCP protocol server with tools
│   │   ├── storage.ts       # Token and client storage
│   │   └── file-storage.ts  # File-based persistence
│   └── package.json
├── client/              # MCP client with self-registration
│   ├── src/
│   │   ├── index.ts         # Main client orchestration
│   │   ├── dcr-client.ts    # DCR registration client
│   │   ├── oauth-client.ts  # OAuth authorization flow
│   │   └── mcp-client.ts    # MCP protocol client
│   └── package.json
├── shared/              # Shared TypeScript types
│   └── src/types.ts
└── README.md
```

## Prerequisites

- Node.js 20+ and npm
- A web browser (for OAuth authorization flow)

## Installation

```bash
# Install all dependencies
npm install

# Build all packages
npm run build
```

## Usage

### Running the Complete Flow

**Terminal 1 - Start the HTTP Server** (for DCR and OAuth):
```bash
cd server
npm start
```

You should see:
```
🎯 MCP Authorization Server POC
================================

✅ HTTP server running on http://localhost:3000

Available endpoints:
  - POST http://localhost:3000/register (DCR)
  - GET  http://localhost:3000/oauth/authorize
  - POST http://localhost:3000/oauth/token
```

**Terminal 2 - Run the Client**:
```bash
cd client
npm start
```

The client will:
1. ✅ Register itself with the server (DCR)
2. 🌐 Open your browser for OAuth authorization
3. ✅ Exchange the auth code for an access token
4. 🔌 Connect to the MCP server via stdio
5. 📋 List available tools
6. 🔓 Call the public tool
7. 🔐 Call the auth-protected echo tool with the access token

### Expected Output

```
🎯 MCP Authorization Client POC
=================================

Step 1: Dynamic Client Registration
------------------------------------
📝 Registering client with server...
✅ Client registration successful!
   Client ID: client_f343ef7a-cab6-4b24-a4f5-f925ac931848

Step 2: OAuth Authorization Flow
--------------------------------
🔐 Starting OAuth authorization flow...
   Callback server listening on port 3001
🌐 Opening browser for authorization...
✅ Authorization code received

Step 3: Token Exchange
----------------------
🔄 Exchanging authorization code for access token...
✅ Access token received!
   Token type: Bearer
   Expires in: 3600 seconds

Step 4: MCP Tool Access
-----------------------
🔌 Connecting to MCP server...
✅ Connected to MCP server
📋 Fetching available tools...
📋 Available tools: echo, public_info

🔓 Testing public tool...
Response: { server: 'MCP Auth Server', version: '1.0.0', ... }

🔐 Testing auth-protected tool...
Response: { echo: 'Hello from authenticated client!', authorized: true }

✅ Authorization flow complete!
```

## Architecture

### Server Components

#### 1. HTTP Server (port 3000)
- **DCR Endpoint** (`POST /register`): Handles client registration per RFC 7591
- **OAuth Authorize** (`GET /oauth/authorize`): Authorization endpoint (auto-approves for POC)
- **OAuth Token** (`POST /oauth/token`): Token exchange endpoint

#### 2. MCP Server (stdio mode)
- **Tools**:
  - `public_info`: Public tool, no auth required
  - `echo`: Auth-protected tool, requires valid access token
- **Protocol**: MCP over stdio transport
- **Validation**: Checks access token against file-based storage

#### 3. Storage Layer
- **In-memory + File persistence**: Shares tokens between HTTP and stdio server processes
- Stores: registered clients, authorization codes, access tokens

### Client Components

#### 1. DCR Client
- Sends registration request to server
- Receives `client_id` and `client_secret`

#### 2. OAuth Client
- Launches local callback server (port 3001)
- Opens browser for user authorization
- Receives authorization code via redirect
- Exchanges code for access token

#### 3. MCP Client
- Connects to MCP server via stdio
- Lists available tools
- Calls tools with access token in arguments

## Authorization Flow

```
┌─────────┐                                  ┌─────────┐
│ Client  │                                  │ Server  │
└────┬────┘                                  └────┬────┘
     │                                            │
     │  1. POST /register (DCR)                  │
     ├──────────────────────────────────────────►│
     │  client_id, client_secret                 │
     │◄──────────────────────────────────────────┤
     │                                            │
     │  2. GET /oauth/authorize                  │
     ├──────────────────────────────────────────►│
     │  (opens browser)                          │
     │                                            │
     │  3. Redirect with auth code               │
     │◄──────────────────────────────────────────┤
     │                                            │
     │  4. POST /oauth/token                     │
     ├──────────────────────────────────────────►│
     │  access_token                             │
     │◄──────────────────────────────────────────┤
     │                                            │
     │  5. MCP connection (stdio)                │
     ├═══════════════════════════════════════════┤
     │  tools/call (with access_token)           │
     ├──────────────────────────────────────────►│
     │  response (authorized)                    │
     │◄──────────────────────────────────────────┤
```

## Key Features

✅ **Dynamic Client Registration (DCR)** - RFC 7591 compliant
✅ **OAuth 2.0 Authorization Code Flow** - RFC 6749 compliant
✅ **MCP Protocol** - Full stdio transport implementation
✅ **Auth-Protected Tools** - Token validation on tool calls
✅ **File-based Token Persistence** - Tokens shared across processes
✅ **Auto-approval OAuth** - Simplified flow for POC demonstration

## Development

```bash
# Run server in development mode
npm run dev:server

# Run client in development mode
npm run dev:client

# Build all packages
npm run build

# Build specific package
npm run build -w server
npm run build -w client
```

## Testing Endpoints Manually

### Register a Client
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Test Client",
    "redirect_uris": ["http://localhost:3001/callback"]
  }'
```

### Start OAuth Flow
Open in browser:
```
http://localhost:3000/oauth/authorize?response_type=code&client_id=<CLIENT_ID>&redirect_uri=http://localhost:3001/callback
```

### Exchange Token
```bash
curl -X POST http://localhost:3000/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "<AUTH_CODE>",
    "redirect_uri": "http://localhost:3001/callback",
    "client_id": "<CLIENT_ID>",
    "client_secret": "<CLIENT_SECRET>"
  }'
```

## Security Notes

This is a **proof of concept** for demonstration purposes. In production:

- ⚠️ Add proper user authentication before OAuth authorization
- ⚠️ Implement PKCE for public clients
- ⚠️ Use HTTPS for all endpoints
- ⚠️ Add proper consent screen
- ⚠️ Implement token refresh flow
- ⚠️ Use a proper database instead of file storage
- ⚠️ Add rate limiting and security headers
- ⚠️ Validate redirect URIs strictly
- ⚠️ Add proper error handling

## Takeaways

### When to Use MCP with DCR + OAuth

✅ **Good fit:**
- Dynamic integration with many enterprise SaaS tools
- Multi-tenant applications where clients register themselves
- Scenarios requiring user-specific data access
- Tools that need both discovery and authorization

❌ **Not ideal for:**
- Simple, single-service integrations (use direct OAuth)
- Scenarios requiring complex permission models (use imperative approach)
- Real-time, high-throughput operations (protocol overhead)

### Benefits of This Approach

1. **No Pre-configuration**: Clients can register dynamically
2. **Standard Protocols**: Built on proven OAuth 2.0 specs
3. **Scalable**: Works across many services without custom integrations
4. **User Control**: OAuth provides clear authorization moments
5. **Tool Discovery**: MCP protocol enables dynamic capability discovery

## License

MIT
