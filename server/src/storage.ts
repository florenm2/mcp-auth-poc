// Storage for clients, auth codes, and tokens with file persistence
import { ClientRegistration, OAuthTokenResponse } from 'mcp-auth-shared';
import { FileStorage } from './file-storage.js';

export interface RegisteredClient extends ClientRegistration {
  client_name?: string;
  redirect_uris: string[];
  grant_types: string[];
}

export interface AuthorizationCode {
  code: string;
  client_id: string;
  redirect_uri: string;
  scope?: string;
  expires_at: number;
  user_id: string;
}

export interface AccessToken {
  access_token: string;
  client_id: string;
  user_id: string;
  scope?: string;
  expires_at: number;
}

class Storage {
  private clients: Map<string, RegisteredClient> = new Map();
  private authCodes: Map<string, AuthorizationCode> = new Map();
  private accessTokens: Map<string, AccessToken> = new Map();
  private fileStorage = new FileStorage();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.clients = await this.fileStorage.loadClients();
    this.authCodes = await this.fileStorage.loadCodes();
    this.accessTokens = await this.fileStorage.loadTokens();
    this.initialized = true;
  }

  // Client registration
  registerClient(client: RegisteredClient): void {
    this.clients.set(client.client_id, client);
    this.fileStorage.saveClients(this.clients).catch(console.error);
  }

  getClient(client_id: string): RegisteredClient | undefined {
    return this.clients.get(client_id);
  }

  validateClientCredentials(client_id: string, client_secret: string): boolean {
    const client = this.clients.get(client_id);
    return client?.client_secret === client_secret;
  }

  // Authorization codes
  storeAuthCode(authCode: AuthorizationCode): void {
    this.authCodes.set(authCode.code, authCode);
    this.fileStorage.saveCodes(this.authCodes).catch(console.error);
  }

  getAuthCode(code: string): AuthorizationCode | undefined {
    return this.authCodes.get(code);
  }

  deleteAuthCode(code: string): void {
    this.authCodes.delete(code);
    this.fileStorage.saveCodes(this.authCodes).catch(console.error);
  }

  // Access tokens
  storeAccessToken(token: AccessToken): void {
    this.accessTokens.set(token.access_token, token);
    this.fileStorage.saveTokens(this.accessTokens).catch(console.error);
  }

  getAccessToken(access_token: string): AccessToken | undefined {
    const token = this.accessTokens.get(access_token);
    if (token && token.expires_at < Date.now()) {
      this.accessTokens.delete(access_token);
      return undefined;
    }
    return token;
  }

  validateAccessToken(access_token: string): boolean {
    const token = this.getAccessToken(access_token);
    return token !== undefined;
  }
}

export const storage = new Storage();
