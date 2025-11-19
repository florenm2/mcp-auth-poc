export interface ClientRegistration {
    client_id: string;
    client_secret: string;
    registration_access_token?: string;
    registration_client_uri?: string;
    client_id_issued_at?: number;
    client_secret_expires_at?: number;
}
export interface OAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
}
export interface DCRRequest {
    client_name?: string;
    redirect_uris?: string[];
    grant_types?: string[];
    response_types?: string[];
    scope?: string;
}
//# sourceMappingURL=types.d.ts.map