/**
 * Dynamic Client Registration (DCR) implementation
 * RFC 7591: OAuth 2.0 Dynamic Client Registration Protocol
 */

import { randomUUID } from 'crypto';
import type {
  ClientRegistrationRequest,
  ClientRegistrationResponse,
  RegisteredClient,
} from '../types/index.js';

// In-memory storage for registered clients (use a database in production)
const registeredClients = new Map<string, RegisteredClient>();

/**
 * Register a new OAuth client dynamically
 */
export function registerClient(
  request: ClientRegistrationRequest
): ClientRegistrationResponse {
  const clientId = randomUUID();
  const clientSecret = randomUUID();
  const now = Math.floor(Date.now() / 1000);

  const client: RegisteredClient = {
    client_id: clientId,
    client_secret: clientSecret,
    client_name: request.client_name || 'Unnamed Client',
    redirect_uris: request.redirect_uris || [],
    grant_types: request.grant_types || ['authorization_code'],
    created_at: now,
  };

  registeredClients.set(clientId, client);

  console.log(`[DCR] Registered new client: ${clientId} (${client.client_name})`);

  return {
    client_id: clientId,
    client_secret: clientSecret,
    client_id_issued_at: now,
    client_secret_expires_at: 0, // Never expires
    client_name: client.client_name,
    client_uri: request.client_uri,
    redirect_uris: client.redirect_uris,
    token_endpoint_auth_method: request.token_endpoint_auth_method || 'client_secret_post',
    grant_types: client.grant_types,
    response_types: request.response_types || ['code'],
  };
}

/**
 * Get a registered client by ID
 */
export function getClient(clientId: string): RegisteredClient | undefined {
  return registeredClients.get(clientId);
}

/**
 * Validate client credentials
 */
export function validateClient(
  clientId: string,
  clientSecret: string
): boolean {
  const client = registeredClients.get(clientId);
  return client !== undefined && client.client_secret === clientSecret;
}
