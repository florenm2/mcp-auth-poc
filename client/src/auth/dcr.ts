/**
 * Dynamic Client Registration for MCP Client
 */

import axios from 'axios';
import type {
  ClientRegistrationRequest,
  ClientRegistrationResponse,
  ClientCredentials,
} from '../types/index.js';

/**
 * Register this client with the MCP server
 */
export async function registerWithServer(
  serverUrl: string,
  clientName: string,
  redirectUri: string
): Promise<ClientCredentials> {
  const registrationEndpoint = `${serverUrl}/oauth/register`;

  const request: ClientRegistrationRequest = {
    client_name: clientName,
    redirect_uris: [redirectUri],
    grant_types: ['authorization_code'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
  };

  console.log(`[DCR] Registering client at: ${registrationEndpoint}`);

  try {
    const response = await axios.post<ClientRegistrationResponse>(
      registrationEndpoint,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { client_id, client_secret, redirect_uris } = response.data;

    if (!client_id || !client_secret) {
      throw new Error('Server did not return client_id or client_secret');
    }

    console.log(`[DCR] Successfully registered! Client ID: ${client_id}`);

    return {
      client_id,
      client_secret,
      redirect_uris: redirect_uris || [redirectUri],
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[DCR] Registration failed:', error.response?.data || error.message);
    } else {
      console.error('[DCR] Registration failed:', error);
    }
    throw new Error('Failed to register client with server');
  }
}
