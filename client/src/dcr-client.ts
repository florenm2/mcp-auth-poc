// Dynamic Client Registration client
import axios from 'axios';
import { ClientRegistration, DCRRequest } from 'mcp-auth-shared';

export class DCRClient {
  constructor(private registrationEndpoint: string) {}

  async register(request: DCRRequest): Promise<ClientRegistration> {
    console.log('📝 Registering client with server...');

    const response = await axios.post<ClientRegistration>(
      this.registrationEndpoint,
      request
    );

    console.log('✅ Client registration successful!');
    console.log(`   Client ID: ${response.data.client_id}`);

    return response.data;
  }
}
