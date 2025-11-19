/**
 * HTTP Server with OAuth endpoints
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { registerClient, getClient } from './auth/dcr.js';
import {
  generateAuthorizationCode,
  exchangeCodeForToken,
  validateAccessToken,
} from './auth/oauth.js';
import type {
  ClientRegistrationRequest,
  AuthorizationRequest,
  TokenRequest,
} from './types/index.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * POST /oauth/register
 * Dynamic Client Registration endpoint (RFC 7591)
 */
app.post('/oauth/register', (req: Request, res: Response) => {
  try {
    const request = req.body as ClientRegistrationRequest;

    // Validate request
    if (!request.client_name) {
      return res.status(400).json({
        error: 'invalid_client_metadata',
        error_description: 'client_name is required',
      });
    }

    const response = registerClient(request);
    res.status(201).json(response);
  } catch (error) {
    console.error('[DCR] Registration error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Failed to register client',
    });
  }
});

/**
 * GET /oauth/authorize
 * OAuth 2.0 Authorization endpoint
 */
app.get('/oauth/authorize', (req: Request, res: Response) => {
  try {
    const {
      response_type,
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      code_challenge_method,
    } = req.query as Partial<AuthorizationRequest>;

    // Validate required parameters
    if (!response_type || !client_id || !redirect_uri) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing required parameters',
      });
    }

    if (response_type !== 'code') {
      return res.status(400).json({
        error: 'unsupported_response_type',
        error_description: 'Only "code" response type is supported',
      });
    }

    // Validate client
    const client = getClient(client_id);
    if (!client) {
      return res.status(400).json({
        error: 'invalid_client',
        error_description: 'Unknown client_id',
      });
    }

    // Validate redirect_uri
    if (!client.redirect_uris.includes(redirect_uri)) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Invalid redirect_uri',
      });
    }

    // For this POC, we'll auto-approve the authorization
    // In production, you'd show a consent screen here
    console.log(`[OAuth] Auto-approving authorization for client: ${client_id}`);

    // Generate authorization code
    const code = generateAuthorizationCode(
      client_id,
      redirect_uri,
      scope,
      code_challenge,
      code_challenge_method
    );

    // Redirect back to client with code
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.append('code', code);
    if (state) {
      redirectUrl.searchParams.append('state', state);
    }

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('[OAuth] Authorization error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Authorization failed',
    });
  }
});

/**
 * POST /oauth/token
 * OAuth 2.0 Token endpoint
 */
app.post('/oauth/token', (req: Request, res: Response) => {
  try {
    const request = req.body as TokenRequest;

    // Validate grant type
    if (request.grant_type !== 'authorization_code') {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Only authorization_code grant type is supported',
      });
    }

    // Validate required parameters
    if (!request.code || !request.client_id || !request.redirect_uri) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing required parameters',
      });
    }

    // Exchange code for token
    const tokenResponse = exchangeCodeForToken(request);

    if (!tokenResponse) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid or expired authorization code',
      });
    }

    res.json(tokenResponse);
  } catch (error) {
    console.error('[OAuth] Token error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Token exchange failed',
    });
  }
});

/**
 * Middleware to validate OAuth token
 */
export function requireAuth(req: Request, res: Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'invalid_token',
      error_description: 'Missing or invalid Authorization header',
    });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const tokenData = validateAccessToken(token);

  if (!tokenData) {
    return res.status(401).json({
      error: 'invalid_token',
      error_description: 'Invalid or expired token',
    });
  }

  // Attach token data to request for use in handlers
  (req as any).tokenData = tokenData;
  next();
}

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * OAuth discovery endpoint (optional, helpful for debugging)
 */
app.get('/.well-known/oauth-authorization-server', (req: Request, res: Response) => {
  const issuer = process.env.OAUTH_ISSUER || `http://localhost:${process.env.PORT || 3000}`;

  res.json({
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    registration_endpoint: `${issuer}/oauth/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
  });
});

export default app;
