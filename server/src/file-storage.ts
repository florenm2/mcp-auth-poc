// File-based storage for cross-process token sharing
import fs from 'fs/promises';
import path from 'path';
import { AccessToken, AuthorizationCode, RegisteredClient } from './storage.js';

const STORAGE_DIR = path.join(process.cwd(), '.mcp-auth-storage');
const CLIENTS_FILE = path.join(STORAGE_DIR, 'clients.json');
const TOKENS_FILE = path.join(STORAGE_DIR, 'tokens.json');
const CODES_FILE = path.join(STORAGE_DIR, 'codes.json');

async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

export class FileStorage {
  async saveClients(clients: Map<string, RegisteredClient>): Promise<void> {
    await ensureStorageDir();
    const data = JSON.stringify(Array.from(clients.entries()));
    await fs.writeFile(CLIENTS_FILE, data);
  }

  async loadClients(): Promise<Map<string, RegisteredClient>> {
    try {
      const data = await fs.readFile(CLIENTS_FILE, 'utf-8');
      return new Map(JSON.parse(data));
    } catch (error) {
      return new Map();
    }
  }

  async saveTokens(tokens: Map<string, AccessToken>): Promise<void> {
    await ensureStorageDir();
    const data = JSON.stringify(Array.from(tokens.entries()));
    await fs.writeFile(TOKENS_FILE, data);
  }

  async loadTokens(): Promise<Map<string, AccessToken>> {
    try {
      const data = await fs.readFile(TOKENS_FILE, 'utf-8');
      return new Map(JSON.parse(data));
    } catch (error) {
      return new Map();
    }
  }

  async saveCodes(codes: Map<string, AuthorizationCode>): Promise<void> {
    await ensureStorageDir();
    const data = JSON.stringify(Array.from(codes.entries()));
    await fs.writeFile(CODES_FILE, data);
  }

  async loadCodes(): Promise<Map<string, AuthorizationCode>> {
    try {
      const data = await fs.readFile(CODES_FILE, 'utf-8');
      return new Map(JSON.parse(data));
    } catch (error) {
      return new Map();
    }
  }
}
