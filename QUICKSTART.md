# Quick Start

**⏱️ 2-minute setup | Full demo in 5 minutes**

## What This Is

A proof-of-concept demonstrating **MCP (Model Context Protocol) with OAuth 2.0 and Dynamic Client Registration**. Shows how an AI agent can:
1. Self-register with a server (no pre-configuration)
2. Get user authorization via OAuth
3. Access protected tools with the granted token

## One-Command Demo

```bash
./demo.sh
```

That's it! The script will:
- Install dependencies
- Build everything
- Start the server
- Run the client (opens browser for OAuth)
- Show the complete flow

## What You'll See

```
Step 1: Dynamic Client Registration
✅ Client registered: client_abc123...

Step 2: OAuth Authorization Flow
🌐 Opening browser for authorization...
✅ Authorization code received

Step 3: Token Exchange
✅ Access token received!

Step 4: MCP Tool Access
📋 Available tools: echo, public_info
🔓 Testing public tool... ✅
🔐 Testing auth-protected tool... ✅

✅ Authorization flow complete!
```

## Manual Steps (Optional)

If you prefer to run manually:

**Terminal 1:**
```bash
npm install && npm run build
cd server && npm start
```

**Terminal 2:**
```bash
cd client && npm start
```

## Key Files

- **`README.md`** - Complete documentation
- **`DEMO.md`** - Detailed walkthrough with curl commands
- **`TAKEAWAYS.md`** - Analysis and point of view
- **`demo.sh`** - Automated demo script
- **`client/src/demo-tools.ts`** - Tool testing script

## Architecture at a Glance

```
┌─────────┐                    ┌─────────┐
│ Client  │ ─── DCR ────────► │ Server  │
│         │ ◄── credentials ── │         │
│         │                    │         │
│         │ ─── OAuth ──────► │         │
│         │ ◄── token ──────── │         │
│         │                    │         │
│         │ ══ MCP + token ══► │         │
│         │ ◄══ tool result ══ │         │
└─────────┘                    └─────────┘
```

## What Makes This Interesting

✅ **Dynamic** - Client registers itself at runtime
✅ **Standard** - Uses OAuth 2.0 & DCR (RFCs 6749 & 7591)
✅ **Secure** - Clear authorization moment for users
✅ **Scalable** - Works across thousands of services
✅ **MCP-Native** - Tool discovery + authorization

## Key Discussion Points

1. **The Hybrid Architecture** - HTTP for OAuth, stdio for MCP, file storage for persistence
2. **Standards Compliance** - Following RFCs made it easier, not harder
3. **When to Use** - Great for the "long tail" of enterprise tools
4. **AI Agent Context** - OAuth provides trust moment for autonomous agents
5. **Production Path** - Database, HTTPS, PKCE, refresh tokens needed

## Quick Test Individual Tools

```bash
# Get an access token (from client output above)
cd client
npx tsx src/demo-tools.ts <your-access-token>
```

---

**Built with TypeScript, Express, MCP SDK**
**~800 lines of code | 4 hours to implement**
