import WebSocket from 'ws';

// Get API key from environment variables
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || 'your-api-key-here';
const HELIUS_WSS_URL = `wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Create a WebSocket connection
const ws = new WebSocket(HELIUS_WSS_URL);

// Track active subscriptions
const subscriptions: Record<string, number> = {};

// Function to send a ping to keep connection alive
function startPing(socket: WebSocket) {
  setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.ping();
      console.log('Ping sent to keep connection alive');
    }
  }, 30000); // Ping every 30 seconds
}

// Example 1: Subscribe to account changes
function subscribeToAccount(accountPubkey: string) {
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "accountSubscribe",
    params: [
      accountPubkey,
      {
        encoding: "jsonParsed",
        commitment: "finalized"
      }
    ]
  };
  
  ws.send(JSON.stringify(request));
  console.log(`Subscribed to account: ${accountPubkey}`);
}

// Example 2: Subscribe to program changes
function subscribeToProgram(programId: string) {
  const request = {
    jsonrpc: "2.0",
    id: 2,
    method: "programSubscribe",
    params: [
      programId,
      {
        encoding: "jsonParsed",
        commitment: "finalized"
      }
    ]
  };
  
  ws.send(JSON.stringify(request));
  console.log(`Subscribed to program: ${programId}`);
}

// Example 3: Subscribe to logs
function subscribeToLogs(filter: 'all' | { mentions: string[] }) {
  const request = {
    jsonrpc: "2.0",
    id: 3,
    method: "logsSubscribe",
    params: [
      filter,
      {
        commitment: "finalized"
      }
    ]
  };
  
  ws.send(JSON.stringify(request));
  console.log(`Subscribed to logs with filter: ${JSON.stringify(filter)}`);
}

// Example 4: Subscribe to signature status
function subscribeToSignature(signature: string) {
  const request = {
    jsonrpc: "2.0",
    id: 4,
    method: "signatureSubscribe",
    params: [
      signature,
      {
        commitment: "finalized",
        enableReceivedNotification: false
      }
    ]
  };
  
  ws.send(JSON.stringify(request));
  console.log(`Subscribed to signature: ${signature}`);
}

// Example 5: Subscribe to slot updates
function subscribeToSlot() {
  const request = {
    jsonrpc: "2.0",
    id: 5,
    method: "slotSubscribe"
  };
  
  ws.send(JSON.stringify(request));
  console.log("Subscribed to slot updates");
}

// Example 6: Subscribe to root updates
function subscribeToRoot() {
  const request = {
    jsonrpc: "2.0",
    id: 6,
    method: "rootSubscribe"
  };
  
  ws.send(JSON.stringify(request));
  console.log("Subscribed to root updates");
}

// Unsubscribe functions
function unsubscribe(subscriptionId: number, type: string) {
  const request = {
    jsonrpc: "2.0",
    id: 7,
    method: `${type}Unsubscribe`,
    params: [subscriptionId]
  };
  
  ws.send(JSON.stringify(request));
  console.log(`Unsubscribed from ${type} with ID: ${subscriptionId}`);
}

// WebSocket event handlers
ws.on('open', function open() {
  console.log('WebSocket connection established');
  startPing(ws);
  
  // Example usage - uncomment the ones you want to test
  // subscribeToAccount("83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri");
  // subscribeToProgram("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"); // Token program
  // subscribeToLogs({ mentions: ["11111111111111111111111111111111"] }); // System program
  // subscribeToSignature("2EBVM6cB8vAAD93Ktr6Vd8p67XPbQzCJX47MpReuiCXJAtcjaxpvWpcg9Ege1Nr5Tk3a2GFrByT7WPBjdsTycY9b");
  // subscribeToSlot();
  // subscribeToRoot();
});

ws.on('message', function incoming(data) {
  try {
    const message = JSON.parse(data.toString());
    
    // Store subscription IDs for later unsubscribing
    if (message.result !== undefined && typeof message.result === 'number') {
      const methodName = message.method || `subscription${message.id}`;
      subscriptions[methodName] = message.result;
      console.log(`Subscription ID for ${methodName}: ${message.result}`);
    }
    
    // Handle subscription notifications
    if (message.method === 'accountNotification') {
      console.log('Account update received:', message.params.result);
    } else if (message.method === 'programNotification') {
      console.log('Program update received:', message.params.result);
    } else if (message.method === 'logsNotification') {
      console.log('Log update received:', message.params.result);
    } else if (message.method === 'signatureNotification') {
      console.log('Signature status update:', message.params.result);
    } else if (message.method === 'slotNotification') {
      console.log('Slot update:', message.params.result);
    } else if (message.method === 'rootNotification') {
      console.log('Root update:', message.params.result);
    } else {
      console.log('Received message:', message);
    }
  } catch (e) {
    console.error('Failed to parse WebSocket message:', e);
  }
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('WebSocket connection closed');
});

// Example of how to unsubscribe after some time
// setTimeout(() => {
//   if (subscriptions['account']) {
//     unsubscribe(subscriptions['account'], 'account');
//   }
// }, 60000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Closing WebSocket connection...');
  ws.close();
  process.exit(0);
});
