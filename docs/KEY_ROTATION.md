# Key Rotation for DCR-Registered MCP Clients

## Overview

Key rotation is essential for production deployments to limit the impact of credential compromise and meet compliance requirements.

## Types of Keys to Rotate

### 1. Client Credentials (client_secret)
- **What:** The secret issued during DCR
- **When:** Every 90 days (recommended) or on compromise
- **How:** Client Configuration Endpoint (RFC 7592)

### 2. Access Tokens
- **What:** OAuth access tokens for API calls
- **When:** Short-lived (1 hour default) + refresh mechanism
- **How:** Refresh token flow

### 3. Registration Access Tokens
- **What:** Token used to manage client registration
- **When:** Less frequent, but should expire
- **How:** Re-registration or token refresh

## Implementation Strategies

### Strategy 1: Client Configuration Endpoint (Recommended)

**RFC 7592 - OAuth 2.0 Dynamic Client Registration Management Protocol**

#### Server Implementation

```typescript
// server/src/client-management.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage.js';

export function handleClientUpdate(req: Request, res: Response): void {
  const clientId = req.params.client_id;
  const regAccessToken = req.headers.authorization?.replace('Bearer ', '');

  // Validate registration access token
  const client = storage.getClient(clientId);
  if (!client || client.registration_access_token !== regAccessToken) {
    res.status(401).json({ error: 'invalid_token' });
    return;
  }

  // Rotate client secret
  const newClientSecret = `secret_${uuidv4()}`;
  const newRegAccessToken = `reg_token_${uuidv4()}`;

  client.client_secret = newClientSecret;
  client.registration_access_token = newRegAccessToken;
  client.client_secret_expires_at = Date.now() + 90 * 24 * 60 * 60 * 1000; // 90 days

  storage.updateClient(client);

  res.json({
    client_id: client.client_id,
    client_secret: newClientSecret,
    registration_access_token: newRegAccessToken,
    client_secret_expires_at: client.client_secret_expires_at,
  });
}

export function handleClientRead(req: Request, res: Response): void {
  const clientId = req.params.client_id;
  const regAccessToken = req.headers.authorization?.replace('Bearer ', '');

  const client = storage.getClient(clientId);
  if (!client || client.registration_access_token !== regAccessToken) {
    res.status(401).json({ error: 'invalid_token' });
    return;
  }

  // Return client config (without secret)
  res.json({
    client_id: client.client_id,
    client_name: client.client_name,
    redirect_uris: client.redirect_uris,
    grant_types: client.grant_types,
    client_secret_expires_at: client.client_secret_expires_at,
  });
}
```

#### Client Implementation

```typescript
// client/src/credential-rotation.ts
export class CredentialRotationManager {
  constructor(
    private clientId: string,
    private clientSecret: string,
    private registrationAccessToken: string,
    private registrationUri: string
  ) {}

  async rotateClientSecret(): Promise<void> {
    console.log('🔄 Rotating client credentials...');

    const response = await axios.put(
      this.registrationUri,
      {
        client_id: this.clientId,
      },
      {
        headers: {
          Authorization: `Bearer ${this.registrationAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Update stored credentials
    this.clientSecret = response.data.client_secret;
    this.registrationAccessToken = response.data.registration_access_token;

    // Persist to secure storage
    await this.persistCredentials();

    console.log('✅ Client credentials rotated successfully');
  }

  async checkExpirationAndRotate(): Promise<void> {
    const response = await axios.get(this.registrationUri, {
      headers: {
        Authorization: `Bearer ${this.registrationAccessToken}`,
      },
    });

    const expiresAt = response.data.client_secret_expires_at;
    const daysUntilExpiry = (expiresAt - Date.now()) / (1000 * 60 * 60 * 24);

    if (daysUntilExpiry < 7) {
      console.log('⚠️  Client secret expires soon, rotating...');
      await this.rotateClientSecret();
    }
  }

  private async persistCredentials(): Promise<void> {
    // Store in secure location (keychain, secrets manager, etc.)
    // For production: use OS keychain or cloud secrets manager
  }
}
```

### Strategy 2: Refresh Token Flow

**For access tokens (short-lived):**

```typescript
// server/src/oauth.ts - Add refresh token support
export function handleTokenRefresh(req: Request, res: Response): void {
  const { grant_type, refresh_token, client_id, client_secret } = req.body;

  if (grant_type !== 'refresh_token') {
    res.status(400).json({ error: 'unsupported_grant_type' });
    return;
  }

  // Validate client
  if (!storage.validateClientCredentials(client_id, client_secret)) {
    res.status(401).json({ error: 'invalid_client' });
    return;
  }

  // Validate refresh token
  const storedToken = storage.getRefreshToken(refresh_token);
  if (!storedToken || storedToken.client_id !== client_id) {
    res.status(400).json({ error: 'invalid_grant' });
    return;
  }

  // Issue new access token
  const newAccessToken = `token_${uuidv4()}`;
  const newRefreshToken = `refresh_${uuidv4()}`;

  storage.storeAccessToken({
    access_token: newAccessToken,
    client_id,
    user_id: storedToken.user_id,
    scope: storedToken.scope,
    expires_at: Date.now() + 3600 * 1000, // 1 hour
  });

  // Rotate refresh token (optional but recommended)
  storage.deleteRefreshToken(refresh_token);
  storage.storeRefreshToken({
    refresh_token: newRefreshToken,
    client_id,
    user_id: storedToken.user_id,
    scope: storedToken.scope,
    expires_at: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
  });

  res.json({
    access_token: newAccessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: newRefreshToken,
  });
}
```

### Strategy 3: Automated Rotation Schedule

```typescript
// client/src/rotation-scheduler.ts
export class RotationScheduler {
  private rotationTimer?: NodeJS.Timeout;

  constructor(private credentialManager: CredentialRotationManager) {}

  startAutoRotation(): void {
    // Check daily
    this.rotationTimer = setInterval(async () => {
      await this.credentialManager.checkExpirationAndRotate();
    }, 24 * 60 * 60 * 1000);

    console.log('🔄 Automatic credential rotation enabled');
  }

  stopAutoRotation(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = undefined;
    }
  }
}
```

## Best Practices

### 1. Expiration Policies

```typescript
const ROTATION_POLICIES = {
  client_secret: {
    lifetime: 90 * 24 * 60 * 60 * 1000,      // 90 days
    rotation_window: 7 * 24 * 60 * 60 * 1000, // Start rotating 7 days before
  },
  access_token: {
    lifetime: 60 * 60 * 1000,                 // 1 hour
    use_refresh: true,
  },
  refresh_token: {
    lifetime: 90 * 24 * 60 * 60 * 1000,      // 90 days
    rotate_on_use: true,                      // New refresh token each use
  },
  registration_access_token: {
    lifetime: 365 * 24 * 60 * 60 * 1000,     // 1 year
  },
};
```

### 2. Secure Storage

**Client Side:**
- macOS: Keychain
- Linux: Secret Service API / libsecret
- Windows: Credential Manager
- Cloud: AWS Secrets Manager, Azure Key Vault, GCP Secret Manager

```typescript
// Example: Using node-keytar for local storage
import keytar from 'keytar';

class SecureCredentialStorage {
  private readonly SERVICE_NAME = 'mcp-auth-client';

  async storeCredentials(clientId: string, credentials: any): Promise<void> {
    await keytar.setPassword(
      this.SERVICE_NAME,
      clientId,
      JSON.stringify(credentials)
    );
  }

  async getCredentials(clientId: string): Promise<any> {
    const data = await keytar.getPassword(this.SERVICE_NAME, clientId);
    return data ? JSON.parse(data) : null;
  }
}
```

### 3. Monitoring and Alerts

```typescript
// Monitor credential expiration
export class CredentialMonitor {
  async checkAndAlert(): Promise<void> {
    const client = await this.getClientConfig();
    const daysUntilExpiry = this.getDaysUntilExpiry(client.client_secret_expires_at);

    if (daysUntilExpiry < 7) {
      await this.sendAlert({
        level: 'warning',
        message: `Client secret expires in ${daysUntilExpiry} days`,
        action: 'rotate_credentials',
      });
    }

    if (daysUntilExpiry < 1) {
      await this.sendAlert({
        level: 'critical',
        message: 'Client secret expires in less than 24 hours!',
        action: 'immediate_rotation',
      });
    }
  }
}
```

### 4. Graceful Transition

Support both old and new credentials during rotation:

```typescript
// Server validates both old and new secrets during transition period
export class GracefulRotation {
  validateClient(clientId: string, clientSecret: string): boolean {
    const client = storage.getClient(clientId);

    // Check current secret
    if (client.client_secret === clientSecret) {
      return true;
    }

    // Check previous secret (valid for 24h after rotation)
    if (client.previous_client_secret === clientSecret) {
      const rotationAge = Date.now() - client.secret_rotated_at;
      const gracePeriod = 24 * 60 * 60 * 1000; // 24 hours

      if (rotationAge < gracePeriod) {
        return true;
      }
    }

    return false;
  }
}
```

## Emergency Rotation (Compromise)

```typescript
export async function emergencyRotation(clientId: string): Promise<void> {
  console.log('🚨 EMERGENCY: Rotating compromised credentials');

  // 1. Immediately invalidate all tokens for this client
  await storage.revokeAllTokens(clientId);

  // 2. Rotate client secret
  const newSecret = generateSecureSecret();
  await storage.updateClientSecret(clientId, newSecret);

  // 3. Notify client via webhook or email
  await notifyClient(clientId, 'credential_compromised');

  // 4. Log security event
  await auditLog.record({
    event: 'emergency_rotation',
    client_id: clientId,
    timestamp: Date.now(),
    reason: 'suspected_compromise',
  });
}
```

## MCP-Specific Considerations

### 1. Long-Running Agents

MCP clients are often long-running AI agents. Consider:

```typescript
// Client monitors token expiration and rotates preemptively
export class MCPClientWithRotation extends MCPClient {
  private tokenCheckInterval?: NodeJS.Timeout;

  async connect(): Promise<void> {
    await super.connect();

    // Check token expiration every 5 minutes
    this.tokenCheckInterval = setInterval(async () => {
      const expiresIn = this.getTokenExpiresIn();
      if (expiresIn < 300) { // Less than 5 minutes
        await this.refreshAccessToken();
      }
    }, 5 * 60 * 1000);
  }

  async disconnect(): Promise<void> {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
    await super.disconnect();
  }
}
```

### 2. Multi-Instance Coordination

If multiple MCP client instances use the same credentials:

```typescript
// Use distributed lock for rotation
export class DistributedRotationManager {
  async rotateWithLock(clientId: string): Promise<void> {
    const lock = await this.acquireLock(`rotation:${clientId}`, 30000);

    try {
      // Check if another instance already rotated
      const currentVersion = await this.getCredentialVersion(clientId);
      if (currentVersion > this.localVersion) {
        await this.syncCredentials(clientId);
        return;
      }

      // Perform rotation
      await this.rotateClientSecret();
      await this.incrementCredentialVersion(clientId);
    } finally {
      await lock.release();
    }
  }
}
```

## Summary: Rotation Hierarchy

```
┌─────────────────────────────────────────────────┐
│  Registration Access Token (1 year)             │
│  └─> Used to rotate client_secret               │
│                                                  │
│  Client Secret (90 days)                        │
│  └─> Used to get refresh_token                  │
│                                                  │
│  Refresh Token (90 days, rotates on use)        │
│  └─> Used to get access_token                   │
│                                                  │
│  Access Token (1 hour)                          │
│  └─> Used to call MCP tools                     │
└─────────────────────────────────────────────────┘
```

## Implementation Checklist

- [ ] Set expiration times for all credentials
- [ ] Implement client configuration endpoint (RFC 7592)
- [ ] Add refresh token flow
- [ ] Store credentials securely (keychain/secrets manager)
- [ ] Monitor expiration and alert before expiry
- [ ] Implement automatic rotation schedule
- [ ] Support graceful transition period
- [ ] Add emergency rotation procedure
- [ ] Log all rotation events
- [ ] Test rotation under load
- [ ] Document rotation procedures for ops team

## References

- [RFC 7591 - OAuth 2.0 Dynamic Client Registration](https://tools.ietf.org/html/rfc7591)
- [RFC 7592 - OAuth 2.0 Dynamic Client Registration Management](https://tools.ietf.org/html/rfc7592)
- [RFC 6749 - OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
