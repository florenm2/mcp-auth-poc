// OAuth 2.0 Authorization Server endpoints
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage.js';

// Authorization endpoint (GET /oauth/authorize)
export function handleAuthorize(req: Request, res: Response): void {
  const {
    response_type,
    client_id,
    redirect_uri,
    scope,
    state,
  } = req.query as Record<string, string>;

  // Validate required parameters
  if (!response_type || !client_id || !redirect_uri) {
    res.status(400).json({ error: 'invalid_request', error_description: 'Missing required parameters' });
    return;
  }

  // Validate response_type
  if (response_type !== 'code') {
    res.status(400).json({ error: 'unsupported_response_type' });
    return;
  }

  // Validate client
  const client = storage.getClient(client_id);
  if (!client) {
    res.status(400).json({ error: 'invalid_client' });
    return;
  }

  // Validate redirect_uri
  if (!client.redirect_uris.includes(redirect_uri)) {
    res.status(400).json({ error: 'invalid_redirect_uri' });
    return;
  }

  // In a real implementation, this would show a consent screen
  // For this POC, we auto-approve and generate an authorization code
  console.log(`📋 Authorization request from client: ${client_id}`);
  console.log(`   Redirect URI: ${redirect_uri}`);
  console.log(`   Scope: ${scope || 'default'}`);
  console.log(`   Auto-approving for POC...`);

  const authCode = `code_${uuidv4()}`;
  const user_id = 'demo_user'; // Simulated user

  // Store authorization code (valid for 10 minutes)
  storage.storeAuthCode({
    code: authCode,
    client_id,
    redirect_uri,
    scope,
    expires_at: Date.now() + 10 * 60 * 1000,
    user_id,
  });

  // Redirect back to client with authorization code
  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set('code', authCode);
  if (state) {
    redirectUrl.searchParams.set('state', state);
  }

  console.log(`✅ Authorization code issued: ${authCode.substring(0, 20)}...`);
  res.redirect(redirectUrl.toString());
}

// Token endpoint (POST /oauth/token)
export function handleToken(req: Request, res: Response): void {
  const {
    grant_type,
    code,
    redirect_uri,
    client_id,
    client_secret,
  } = req.body;

  // Validate required parameters
  if (!grant_type || !code || !redirect_uri || !client_id || !client_secret) {
    res.status(400).json({
      error: 'invalid_request',
      error_description: 'Missing required parameters'
    });
    return;
  }

  // Validate grant_type
  if (grant_type !== 'authorization_code') {
    res.status(400).json({ error: 'unsupported_grant_type' });
    return;
  }

  // Validate client credentials
  if (!storage.validateClientCredentials(client_id, client_secret)) {
    res.status(401).json({ error: 'invalid_client' });
    return;
  }

  // Retrieve and validate authorization code
  const authCode = storage.getAuthCode(code);
  if (!authCode) {
    res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid or expired authorization code' });
    return;
  }

  // Validate authorization code properties
  if (authCode.client_id !== client_id) {
    storage.deleteAuthCode(code);
    res.status(400).json({ error: 'invalid_grant', error_description: 'Code was issued to different client' });
    return;
  }

  if (authCode.redirect_uri !== redirect_uri) {
    storage.deleteAuthCode(code);
    res.status(400).json({ error: 'invalid_grant', error_description: 'Redirect URI mismatch' });
    return;
  }

  if (authCode.expires_at < Date.now()) {
    storage.deleteAuthCode(code);
    res.status(400).json({ error: 'invalid_grant', error_description: 'Authorization code expired' });
    return;
  }

  // Delete the authorization code (one-time use)
  storage.deleteAuthCode(code);

  // Generate access token (valid for 1 hour)
  const access_token = `token_${uuidv4()}`;
  const expires_in = 3600;

  storage.storeAccessToken({
    access_token,
    client_id: authCode.client_id,
    user_id: authCode.user_id,
    scope: authCode.scope,
    expires_at: Date.now() + expires_in * 1000,
  });

  console.log(`✅ Access token issued for client: ${client_id}`);

  // Return token response
  res.json({
    access_token,
    token_type: 'Bearer',
    expires_in,
    scope: authCode.scope,
  });
}
