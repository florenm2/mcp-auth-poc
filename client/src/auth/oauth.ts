/**
 * OAuth 2.0 Client implementation
 */

import axios from 'axios';
import { randomUUID } from 'crypto';
import type { ClientCredentials, OAuthSession, TokenResponse } from '../types/index.js';

/**
 * Generate authorization URL
 */
export function generateAuthorizationUrl(
  serverUrl: string,
  clientId: string,
  redirectUri: string,
  scope?: string
): { url: string; session: OAuthSession } {
  const state = randomUUID();
  const authEndpoint = `${serverUrl}/oauth/authorize`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  });

  if (scope) {
    params.append('scope', scope);
  }

  const session: OAuthSession = {
    state,
    redirect_uri: redirectUri,
  };

  return {
    url: `${authEndpoint}?${params.toString()}`,
    session,
  };
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  serverUrl: string,
  credentials: ClientCredentials,
  code: string,
  redirectUri: string
): Promise<TokenResponse> {
  const tokenEndpoint = `${serverUrl}/oauth/token`;

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
  });

  console.log(`[OAuth] Exchanging code for token at: ${tokenEndpoint}`);

  try {
    const response = await axios.post<TokenResponse>(
      tokenEndpoint,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('[OAuth] Successfully obtained access token');

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[OAuth] Token exchange failed:', error.response?.data || error.message);
    } else {
      console.error('[OAuth] Token exchange failed:', error);
    }
    throw new Error('Failed to exchange code for token');
  }
}
