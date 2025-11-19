/**
 * OAuth 2.0 Authorization Server implementation
 * Handles authorization code flow and token issuance
 */

import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import type {
  AuthorizationCode,
  AccessToken,
  TokenRequest,
  TokenResponse,
} from '../types/index.js';
import { getClient } from './dcr.js';

// In-memory storage (use a database in production)
const authorizationCodes = new Map<string, AuthorizationCode>();
const accessTokens = new Map<string, AccessToken>();

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';
const CODE_EXPIRY = 600; // 10 minutes
const TOKEN_EXPIRY = 3600; // 1 hour

/**
 * Generate an authorization code
 */
export function generateAuthorizationCode(
  clientId: string,
  redirectUri: string,
  scope?: string,
  codeChallenge?: string,
  codeChallengeMethod?: string
): string {
  const code = randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + CODE_EXPIRY;

  authorizationCodes.set(code, {
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    expires_at: expiresAt,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
  });

  console.log(`[OAuth] Generated authorization code for client: ${clientId}`);

  return code;
}

/**
 * Exchange authorization code for access token
 */
export function exchangeCodeForToken(
  request: TokenRequest
): TokenResponse | null {
  if (!request.code) {
    return null;
  }

  const authCode = authorizationCodes.get(request.code);
  if (!authCode) {
    console.log('[OAuth] Invalid authorization code');
    return null;
  }

  // Check if code is expired
  const now = Math.floor(Date.now() / 1000);
  if (authCode.expires_at < now) {
    authorizationCodes.delete(request.code);
    console.log('[OAuth] Authorization code expired');
    return null;
  }

  // Validate client
  const client = getClient(request.client_id);
  if (!client) {
    console.log('[OAuth] Invalid client_id');
    return null;
  }

  // Validate redirect URI
  if (authCode.redirect_uri !== request.redirect_uri) {
    console.log('[OAuth] Redirect URI mismatch');
    return null;
  }

  // Generate access token
  const accessToken = jwt.sign(
    {
      client_id: request.client_id,
      scope: authCode.scope,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  // Store token
  const tokenData: AccessToken = {
    token: accessToken,
    client_id: request.client_id,
    scope: authCode.scope,
    expires_at: now + TOKEN_EXPIRY,
  };
  accessTokens.set(accessToken, tokenData);

  // Delete used authorization code
  authorizationCodes.delete(request.code);

  console.log(`[OAuth] Issued access token for client: ${request.client_id}`);

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: TOKEN_EXPIRY,
    scope: authCode.scope,
  };
}

/**
 * Validate an access token
 */
export function validateAccessToken(token: string): AccessToken | null {
  try {
    jwt.verify(token, JWT_SECRET);
    const tokenData = accessTokens.get(token);

    if (!tokenData) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (tokenData.expires_at < now) {
      accessTokens.delete(token);
      return null;
    }

    return tokenData;
  } catch (error) {
    console.log('[OAuth] Token validation failed:', error);
    return null;
  }
}
