/**
 * Type definitions for the MCP Auth Server
 */

// Dynamic Client Registration types (RFC 7591)
export interface ClientRegistrationRequest {
  client_name?: string;
  client_uri?: string;
  logo_uri?: string;
  redirect_uris?: string[];
  token_endpoint_auth_method?: 'client_secret_basic' | 'client_secret_post' | 'none';
  grant_types?: string[];
  response_types?: string[];
  scope?: string;
}

export interface ClientRegistrationResponse {
  client_id: string;
  client_secret?: string;
  client_id_issued_at?: number;
  client_secret_expires_at?: number;
  client_name?: string;
  client_uri?: string;
  redirect_uris?: string[];
  token_endpoint_auth_method?: string;
  grant_types?: string[];
  response_types?: string[];
}

// OAuth types
export interface AuthorizationRequest {
  response_type: string;
  client_id: string;
  redirect_uri: string;
  scope?: string;
  state?: string;
  code_challenge?: string;
  code_challenge_method?: string;
}

export interface TokenRequest {
  grant_type: string;
  code?: string;
  redirect_uri?: string;
  client_id: string;
  client_secret?: string;
  code_verifier?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

// Internal types
export interface RegisteredClient {
  client_id: string;
  client_secret: string;
  client_name: string;
  redirect_uris: string[];
  grant_types: string[];
  created_at: number;
}

export interface AuthorizationCode {
  code: string;
  client_id: string;
  redirect_uri: string;
  scope?: string;
  expires_at: number;
  code_challenge?: string;
  code_challenge_method?: string;
  user_id?: string;
}

export interface AccessToken {
  token: string;
  client_id: string;
  scope?: string;
  expires_at: number;
  user_id?: string;
}
