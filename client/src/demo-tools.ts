// Quick demo script to show MCP tool calls
import { MCPClient } from './mcp-client.js';

const ACCESS_TOKEN = process.argv[2];

if (!ACCESS_TOKEN) {
  console.error('Usage: node demo-tools.js <access_token>');
  process.exit(1);
}

async function main() {
  console.log('🎯 MCP Tools Demo\n');

  const client = new MCPClient();

  // Connect to MCP server in stdio mode
  await client.connect('npm', ['start', '--prefix', '../server'], { USE_STDIO: 'true' });

  console.log('\n1️⃣ Calling tools/list (NO AUTH REQUIRED)');
  console.log('=========================================');
  const tools = await client.listTools();
  console.log('Available tools:', tools.map(t => t.name).join(', '));

  console.log('\n2️⃣ Calling public_info tool (NO AUTH REQUIRED)');
  console.log('================================================');
  const publicResult = await client.callTool('public_info', {});
  console.log('Response:', JSON.parse(publicResult.content[0].text));

  console.log('\n3️⃣ Calling echo WITHOUT token (SHOULD FAIL)');
  console.log('============================================');
  try {
    const failResult = await client.callTool('echo', { message: 'test' });
    console.log('Response:', JSON.parse(failResult.content[0].text));
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n4️⃣ Calling echo WITH token (SHOULD SUCCEED)');
  console.log('============================================');
  const successResult = await client.callTool('echo', {
    message: 'Hello from authenticated client!',
    access_token: ACCESS_TOKEN
  });
  console.log('Response:', JSON.parse(successResult.content[0].text));

  await client.close();
  console.log('\n✅ All demos complete!');
}

main().catch(console.error);
