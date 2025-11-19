# MCP + DCR + OAuth: Point of View and Takeaways

## Executive Summary

After building this proof of concept, I believe **MCP with Dynamic Client Registration and OAuth represents a powerful approach for enabling dynamic, user-authorized access to enterprise tools**, particularly in scenarios where pre-configuration is impractical and user consent is essential.

However, it's **not a silver bullet** - deeply integrated, imperative approaches will still be better for complex, high-value integrations like Google Workspace.

## What We Built

A complete implementation demonstrating:
1. **Dynamic Client Registration (DCR)** - Clients self-register without pre-configured credentials
2. **OAuth 2.0 Authorization Flow** - Standard user authorization with clear consent moments
3. **Auth-Protected MCP Tools** - Tools that validate access tokens before executing
4. **Cross-Process Token Sharing** - File-based persistence enabling HTTP and stdio servers to share state

## Key Insights

### 1. The "Chicken and Egg" Problem is Real

**Challenge:** MCP typically uses stdio transport, but OAuth requires HTTP endpoints.

**Solution:** Hybrid architecture
- HTTP server for DCR and OAuth endpoints
- STDIO MCP server for tool execution
- Shared storage (file-based in POC, database in production) for tokens

This was initially counter-intuitive but makes sense when you consider:
- DCR and OAuth are **one-time flows** (per session)
- MCP tool calls are **ongoing operations**
- They can use different transports with shared state

### 2. Standards Compliance Pays Off

Using RFC 7591 (DCR) and RFC 6749 (OAuth) meant:
- ✅ Clear specs to follow
- ✅ Well-understood security properties
- ✅ Existing libraries and tools
- ✅ Interoperability with other systems

Counter-intuitively, following strict standards made implementation **faster**, not slower, because the decisions were already made.

### 3. File-Based Storage is Sufficient for POC

The file-based token storage approach:
- ✅ Simple to implement
- ✅ Enables cross-process communication
- ✅ Persists across restarts
- ❌ Not production-ready (no concurrent access handling, no encryption)

For production: Redis or PostgreSQL would be better.

### 4. OAuth Provides Clear Authorization Moments

The browser-based OAuth flow creates an explicit moment where the user:
- Sees what they're authorizing
- Can deny access
- Understands the scope

This is **critical for user trust**, especially with AI agents accessing enterprise data.

### 5. MCP Tool Discovery is Powerful

The ability to call `tools/list` and dynamically discover capabilities is a game-changer:
- No need to pre-configure what tools exist
- Tools can be added/removed without client changes
- Enables adaptive AI behavior

## When to Use This Approach

### ✅ Ideal Scenarios

**1. SaaS Integration Platforms**
- Example: Zapier-like tool connecting to hundreds of services
- Why: DCR enables each user to authorize their own connections dynamically
- Benefit: No need to pre-register every possible client

**2. AI Agent Marketplaces**
- Example: Agent store where users can connect agents to their tools
- Why: Each agent-user combination needs unique authorization
- Benefit: Dynamic registration scales to millions of combinations

**3. Multi-Tenant Enterprise Applications**
- Example: Internal tool where each department has different service access
- Why: Departments can self-service their integrations
- Benefit: Reduces IT overhead

**4. Developer Tools and IDEs**
- Example: VS Code extension accessing user's cloud resources
- Why: Each developer has their own credentials
- Benefit: Seamless authorization without shared secrets

### ❌ Not Ideal For

**1. Deeply Integrated Core Systems**
- Example: Gmail integration in Google Workspace
- Why: Requires custom business logic, tight coupling
- Better: Imperative, bespoke integration

**2. Real-Time, Low-Latency Operations**
- Example: High-frequency trading systems
- Why: OAuth + MCP protocol overhead adds latency
- Better: Direct API access with long-lived credentials

**3. Simple Single-Service Integrations**
- Example: Just connecting to Slack
- Why: Direct OAuth is simpler
- Better: Skip MCP, use Slack API directly

**4. Offline or Air-Gapped Systems**
- Example: On-premise systems without internet
- Why: OAuth requires browser redirects
- Better: API keys or client credentials grant

## The DCR Value Proposition

### Traditional Approach
```
Developer → Pre-register client → Get client_id/secret → Distribute to users
```
- Requires coordination
- Shared secrets (security risk)
- Can't scale to unique client per user

### DCR Approach
```
User → Client self-registers → Unique credentials → Authorize
```
- No pre-registration needed
- Unique credentials per instance
- Scales infinitely

**The ROI:** For integrations with >1000 potential client instances, DCR pays off.

## Production Recommendations

### Must-Haves
1. **HTTPS Everywhere** - No HTTP in production
2. **PKCE** - Proof Key for Code Exchange for public clients
3. **Real User Authentication** - Before OAuth authorization
4. **Proper Database** - PostgreSQL/MySQL for token storage
5. **Token Refresh Flow** - Don't make users re-auth every hour
6. **Comprehensive Error Handling** - Especially for expired/invalid tokens
7. **Rate Limiting** - Prevent abuse of DCR and OAuth endpoints
8. **Audit Logging** - Track all authorization events

### Nice-to-Haves
1. **Token Revocation** - Allow users to deauthorize
2. **Scope Management** - Fine-grained permissions
3. **Admin Dashboard** - View registered clients and active tokens
4. **Webhook Support** - Notify on authorization events
5. **Multi-factor Authentication** - Extra security for sensitive tools

## Comparison to Alternatives

### vs. Direct OAuth (no MCP)
- **Pro:** MCP adds tool discovery
- **Con:** Additional protocol overhead
- **Use MCP when:** Tool capabilities are dynamic

### vs. API Keys
- **Pro:** OAuth has user consent moment
- **Con:** More complex flow
- **Use OAuth when:** User data access required

### vs. Pre-Registered Clients
- **Pro:** DCR enables dynamic scaling
- **Con:** Additional registration endpoint
- **Use DCR when:** Can't pre-register all clients

## AI/LLM Specific Considerations

For AI agents accessing user tools:

**Why This Matters:**
- AI agents are **autonomous** - they act without immediate user input
- Users need to **trust** that agents only access authorized data
- Agent capabilities should be **discoverable** by the LLM

**How MCP + OAuth Helps:**
1. **Explicit Authorization:** OAuth shows user what the agent can access
2. **Token-Based Access:** Agent can't exceed granted permissions
3. **Dynamic Discovery:** LLM can query available tools via MCP
4. **Audit Trail:** All tool calls can be logged for user review

**Future Evolution:**
- Scopes could map to specific MCP tools
- Token metadata could include usage limits
- Real-time user approval for sensitive operations

## Unanswered Questions

1. **How to handle long-running agents?**
   - Token refresh works, but what about month-long sessions?

2. **Multi-agent coordination?**
   - If multiple agents need access, do they each get tokens?

3. **Permission escalation?**
   - How to request additional scopes mid-session?

4. **Rate limiting across agents?**
   - Should limits be per-token, per-user, or per-client?

## Final POV: The "Sea of Enterprise Tools" Thesis

The assignment mentioned DCR could "unlock some powerful and newly dynamic access to the sea of enterprise tools." After building this, I **strongly agree**, with caveats:

### The Opportunity
- There are **thousands** of SaaS tools in enterprises
- Each has its own API, auth, and discovery mechanism
- **MCP + DCR + OAuth could standardize** this landscape
- AI agents could dynamically discover and access any authorized tool

### The Reality Check
- The top 20 tools (Gmail, Slack, etc.) warrant **custom integrations**
- The **long tail** of tools is where this shines
- Adoption requires **both sides**: MCP servers AND OAuth providers
- Chicken-and-egg problem: who builds MCP servers first?

### The Path Forward
1. **Start with developer tools** - VS Code, IDEs, local services
2. **Demonstrate value** with AI-driven tool discovery
3. **Build MCP server SDKs** to make it easy for SaaS providers
4. **Partner with key platforms** (Salesforce, ServiceNow, etc.)
5. **Standardize in working groups** (IETF, W3C)

## Conclusion

This POC proves the **technical feasibility** of MCP + DCR + OAuth. The architecture works, the standards fit together, and the user experience can be smooth.

The **real challenge** is ecosystem adoption. But if successful, this could be transformative for how AI agents access enterprise tools - making authorization dynamic, secure, and user-controlled at scale.

---

**Built with:** TypeScript, MCP SDK, Express, OAuth 2.0, DCR
**Time invested:** ~4 hours of implementation + architecture design
**Lines of code:** ~800 (server + client + shared types)
**Most surprising learning:** File-based storage making cross-process communication trivial
