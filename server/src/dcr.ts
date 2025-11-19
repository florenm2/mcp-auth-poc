// Dynamic Client Registration (DCR) handler
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { storage, RegisteredClient } from './storage.js';
import { DCRRequest } from 'mcp-auth-shared';

export function handleClientRegistration(req: Request, res: Response): void {
  const registrationRequest: DCRRequest = req.body;

  // Generate client credentials
  const client_id = `client_${uuidv4()}`;
  const client_secret = `secret_${uuidv4()}`;
  const client_id_issued_at = Math.floor(Date.now() / 1000);

  // Default values for DCR
  const client: RegisteredClient = {
    client_id,
    client_secret,
    client_id_issued_at,
    client_secret_expires_at: 0, // Never expires
    client_name: registrationRequest.client_name || 'MCP Client',
    redirect_uris: registrationRequest.redirect_uris || ['http://localhost:3001/callback'],
    grant_types: registrationRequest.grant_types || ['authorization_code'],
  };

  // Store the registered client
  storage.registerClient(client);

  console.log(`✅ Client registered: ${client_id}`);

  // Return registration response per OAuth 2.0 DCR spec (RFC 7591)
  res.json({
    client_id: client.client_id,
    client_secret: client.client_secret,
    client_id_issued_at: client.client_id_issued_at,
    client_secret_expires_at: client.client_secret_expires_at,
    client_name: client.client_name,
    redirect_uris: client.redirect_uris,
    grant_types: client.grant_types,
  });
}
