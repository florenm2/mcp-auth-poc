# Demo Guide

This guide walks through a complete demonstration of the MCP Authorization POC.

## Quick Start Demo

### Step 1: Start the HTTP Server

```bash
cd server
npm start
```

Expected output:
```
🎯 MCP Authorization Server POC
================================

✅ HTTP server running on http://localhost:3000
```

Keep this terminal running.

### Step 2: Test DCR (Dynamic Client Registration)

In a new terminal:

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Demo Client",
    "redirect_uris": ["http://localhost:3001/callback"]
  }'
```

Expected response:
```json
{
  "client_id": "client_...",
  "client_secret": "secret_...",
  "client_id_issued_at": 1763560624,
  "client_secret_expires_at": 0,
  "client_name": "Demo Client",
  "redirect_uris": ["http://localhost:3001/callback"],
  "grant_types": ["authorization_code"]
}
```

✅ **DCR Working!** Save the `client_id` and `client_secret` for the next step.

### Step 3: Test OAuth Authorization Flow

Open in your browser (replace `<CLIENT_ID>` with your actual client ID):

```
http://localhost:3000/oauth/authorize?response_type=code&client_id=<CLIENT_ID>&redirect_uri=http://localhost:3001/callback
```

Expected: You'll be redirected to:
```
http://localhost:3001/callback?code=code_...
```

✅ **OAuth Authorization Working!** Save the `code` parameter.

### Step 4: Exchange Code for Access Token

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

Expected response:
```json
{
  "access_token": "token_...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

✅ **Token Exchange Working!** Save the `access_token`.

### Step 5: Test MCP Server with Auth-Protected Tool

In a new terminal, start the MCP server in STDIO mode:

```bash
cd server
USE_STDIO=true npm start
```

Expected:
```
🎯 MCP Authorization Server POC
================================

Running in STDIO mode for MCP protocol...
🚀 MCP Server started on stdio
```

The server is now waiting for MCP protocol messages on stdin/stdout.

To test the tools, you can use the MCP client or manually send MCP protocol JSON-RPC messages.

### Step 6: Call Auth-Protected Tool via MCP Client

```bash
cd client
npm start
```

The client will:
1. ✅ Register with the server (DCR)
2. ✅ Complete OAuth authorization flow (opens browser)
3. ✅ Exchange code for access token
4. ✅ Connect to MCP server via stdio
5. ✅ Call the auth-protected `echo` tool with the access token

Expected final output:
```
✅ Authorization flow complete!

Summary:
--------
✓ Client self-registered with server
✓ Completed OAuth authorization flow
✓ Obtained access token
✓ Successfully called auth-protected MCP tool
```

## Architecture Validation

This demo proves:

✅ **Dynamic Client Registration (DCR)** - Client can self-register without pre-configuration
✅ **OAuth 2.0 Flow** - Complete authorization code flow with token exchange
✅ **Token Persistence** - Tokens are stored and can be validated across processes
✅ **Auth-Protected MCP Tools** - Tools require and validate access tokens
✅ **MCP Protocol** - Full stdio transport implementation

## Key Observations

### 1. Dynamic Nature
The client has NO pre-configured credentials - it obtains them at runtime via DCR.

### 2. Standards-Based
Uses RFC 7591 (DCR) and RFC 6749 (OAuth 2.0) - proven, interoperable standards.

### 3. Clear Authorization Moment
The OAuth flow provides a clear point where the user authorizes access.

### 4. Tool Discovery + Authorization
MCP provides dynamic tool discovery, OAuth provides authorization - powerful combination.

### 5. Scalability
This pattern could work across many enterprise services without custom integrations.

## When to Use This Approach

**Best for:**
- Integrating with many different enterprise SaaS tools
- Multi-tenant scenarios where clients need to register dynamically
- User-specific data access requirements
- Environments where tool capabilities change frequently

**Not ideal for:**
- Simple, single-service integrations (direct OAuth is simpler)
- Deeply integrated workflows requiring custom business logic
- Real-time, latency-sensitive operations

## Production Considerations

Before deploying to production:
- Add real user authentication
- Implement PKCE for public clients
- Use HTTPS everywhere
- Add proper consent screens
- Implement token refresh
- Use a real database
- Add comprehensive error handling
- Implement rate limiting
- Add monitoring and logging
