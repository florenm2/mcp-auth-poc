// OAuth 2.0 client implementation
import axios from 'axios';
import express from 'express';
import { ClientRegistration, OAuthTokenResponse } from 'mcp-auth-shared';
import open from 'open';

export class OAuthClient {
  private callbackServer?: ReturnType<typeof express>;
  private authorizationCode?: string;

  constructor(
    private authorizeEndpoint: string,
    private tokenEndpoint: string,
    private client: ClientRegistration
  ) {}

  async authorize(scope?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const callbackPort = 3001;
      const redirect_uri = this.client.redirect_uris![0];

      // Start local callback server
      this.callbackServer = express();

      this.callbackServer.get('/callback', (req, res) => {
        const { code, error, error_description } = req.query;

        if (error) {
          res.send(`<h1>Authorization Failed</h1><p>${error}: ${error_description}</p>`);
          reject(new Error(`${error}: ${error_description}`));
          return;
        }

        if (!code || typeof code !== 'string') {
          res.send('<h1>Authorization Failed</h1><p>No authorization code received</p>');
          reject(new Error('No authorization code received'));
          return;
        }

        this.authorizationCode = code;
        res.send('<h1>Authorization Successful!</h1><p>You can close this window and return to the client.</p>');

        console.log('✅ Authorization code received');
        resolve(code);
      });

      const server = this.callbackServer.listen(callbackPort, () => {
        console.log(`🔐 Starting OAuth authorization flow...`);
        console.log(`   Callback server listening on port ${callbackPort}`);

        // Build authorization URL
        const authUrl = new URL(this.authorizeEndpoint);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', this.client.client_id);
        authUrl.searchParams.set('redirect_uri', redirect_uri);
        if (scope) {
          authUrl.searchParams.set('scope', scope);
        }

        console.log(`🌐 Opening browser for authorization...`);
        console.log(`   URL: ${authUrl.toString()}`);

        // Open browser for user authorization
        open(authUrl.toString()).catch(err => {
          console.warn('⚠️  Could not open browser automatically:', err.message);
          console.log(`   Please open this URL manually: ${authUrl.toString()}`);
        });
      });

      // Auto-close server after receiving callback
      setTimeout(() => {
        server.close();
      }, 60000); // Close after 1 minute
    });
  }

  async exchangeCodeForToken(code: string, redirect_uri: string): Promise<OAuthTokenResponse> {
    console.log('🔄 Exchanging authorization code for access token...');

    const response = await axios.post<OAuthTokenResponse>(
      this.tokenEndpoint,
      {
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id: this.client.client_id,
        client_secret: this.client.client_secret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Access token received!');
    console.log(`   Token type: ${response.data.token_type}`);
    console.log(`   Expires in: ${response.data.expires_in} seconds`);

    return response.data;
  }
}
