# Architecture Overview

## Project Structure

```
mcp-auth-poc/
├── server/                      # MCP Server with OAuth & DCR
│   ├── src/
│   │   ├── index.ts            # Server entry point
│   │   ├── config.ts           # Server configuration
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript type definitions
│   │   ├── auth/
│   │   │   ├── dcr.ts          # Dynamic Client Registration (RFC 7591)
│   │   │   └── oauth.ts        # OAuth 2.0 Authorization Server
│   │   └── mcp/
│   │       ├── server.ts       # MCP server implementation
│   │       └── tools.ts        # Auth-protected MCP tools
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── client/                      # MCP Client with DCR & OAuth
│   ├── src/
│   │   ├── index.ts            # Client entry point
│   │   ├── config.ts           # Client configuration
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript type definitions
│   │   ├── auth/
│   │   │   ├── dcr.ts          # DCR client implementation
│   │   │   └── oauth.ts        # OAuth 2.0 client flow
│   │   └── mcp/
│   │       └── client.ts       # MCP client implementation
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── package.json                 # Root workspace configuration
├── .gitignore
└── README.md
```

## Component Architecture

### Server Components

1. **Dynamic Client Registration (DCR)**
   - Endpoint: `POST /oauth/register`
   - Implements RFC 7591
   - Allows clients to self-register and obtain credentials
   - Returns `client_id` and `client_secret`

2. **OAuth 2.0 Authorization Server**
   - Authorization endpoint: `GET /oauth/authorize`
   - Token endpoint: `POST /oauth/token`
   - Implements authorization code flow
   - Issues JWT access tokens

3. **MCP Server**
   - Hosts MCP tools and resources
   - Requires valid OAuth token for protected operations
   - Provides auth-protected tools (e.g., echo tool)

### Client Components

1. **DCR Client**
   - Registers with server on first run
   - Stores credentials locally
   - Reuses credentials on subsequent runs

2. **OAuth Client**
   - Implements authorization code flow
   - Handles token exchange
   - Manages token storage and refresh

3. **MCP Client**
   - Connects to MCP server
   - Includes OAuth token in requests
   - Makes authenticated tool calls

## Authentication Flow

```
┌──────────┐                                  ┌──────────┐
│  Client  │                                  │  Server  │
└─────┬────┘                                  └─────┬────┘
      │                                             │
      │ 1. Register (DCR)                          │
      ├───────────────────────────────────────────>│
      │    POST /oauth/register                    │
      │                                             │
      │ 2. Client Credentials                      │
      │<───────────────────────────────────────────┤
      │    {client_id, client_secret}              │
      │                                             │
      │ 3. Authorization Request                   │
      ├───────────────────────────────────────────>│
      │    GET /oauth/authorize                    │
      │                                             │
      │ 4. Authorization Code                      │
      │<───────────────────────────────────────────┤
      │    redirect with code                      │
      │                                             │
      │ 5. Token Request                           │
      ├───────────────────────────────────────────>│
      │    POST /oauth/token                       │
      │                                             │
      │ 6. Access Token                            │
      │<───────────────────────────────────────────┤
      │    {access_token, ...}                     │
      │                                             │
      │ 7. MCP Tool Call (with token)              │
      ├───────────────────────────────────────────>│
      │    Authorization: Bearer <token>           │
      │                                             │
      │ 8. Tool Response                           │
      │<───────────────────────────────────────────┤
      │                                             │
```

## Key Standards & Specifications

1. **RFC 7591** - OAuth 2.0 Dynamic Client Registration Protocol
2. **RFC 6749** - OAuth 2.0 Authorization Framework
3. **MCP Specification** - Model Context Protocol with Authorization

## Technology Stack

- **Language**: TypeScript (Node.js)
- **Server Framework**: Express.js
- **OAuth/JWT**: jsonwebtoken
- **MCP SDK**: @modelcontextprotocol/sdk
- **HTTP Client**: axios (client-side)

## Security Considerations

1. **In-Memory Storage**: Current implementation uses in-memory storage for simplicity. Production systems should use persistent storage (database).

2. **JWT Secret**: Default JWT secret is for development only. Must be set via environment variable in production.

3. **HTTPS**: Should use HTTPS in production for all OAuth flows.

4. **Token Expiry**: Access tokens expire after 1 hour. Refresh tokens can be added for longer sessions.

5. **PKCE**: Can be added for additional security in the authorization code flow.

## Next Steps

This structure provides the foundation for implementing:
1. Complete MCP server with auth middleware
2. Complete MCP client with connection handling
3. OAuth consent screen (currently auto-approved)
4. Token refresh mechanism
5. Persistent storage layer
6. Additional auth-protected tools
