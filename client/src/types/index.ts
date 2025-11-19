/**
 * Type definitions for the MCP Auth Client
 */

// DCR types
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
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

// Client credentials storage
export interface ClientCredentials {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
}

// OAuth session
export interface OAuthSession {
  state: string;
  code_verifier?: string;
  redirect_uri: string;
}
