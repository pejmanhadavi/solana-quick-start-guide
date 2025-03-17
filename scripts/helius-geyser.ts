/*************************************
 * Geyser is Helius's high-performance data streaming solution that provides real-time access to Solana blockchain data.
 * The file includes five key examples:
 * Slot Subscription - Get real-time updates about new slots on the blockchain
 * Account Subscription - Monitor specific accounts for any changes
 * Program Subscription - Track all accounts owned by specific programs
 * Transaction Subscription - Stream all transactions, with optional filtering
 * Block Subscription - Receive complete block data in real-time
 * Key features of this implementation:
 * Proper connection management with ping/pong to keep streams alive
 * Error handling and graceful shutdown
 * Data formatting utilities to make binary data human-readable
 * Comprehensive logging of received data
 * Flexible filtering options for each subscription type
 * Important notes about Geyser:
 * Geyser is only available for dedicated Helius nodes
 * It uses gRPC for high-performance streaming
 * It provides much more detailed data than standard WebSockets
 * It's ideal for applications that need real-time access to blockchain data
 * To use this code:
 * Set up a dedicated Helius node
 * Configure your environment variables with your Geyser URL and X-Token
 * Uncomment the example you want to run in the main function
 * Run the script to start streaming data
 * This implementation demonstrates the power of Geyser for building real-time Solana applications with access to comprehensive blockchain data.
 */

/******
 * Helius Geyser Uses a Custom gRPC Implementation:
 * The Yellowstone gRPC client from Triton One is a specialized implementation that doesn't follow the standard gRPC server pattern that NestJS's built-in gRPC support expects.
 * Client-Side vs. Server-Side gRPC:
 * NestJS's @GrpcMethod decorator is designed for implementing gRPC servers, not clients. With Helius Geyser, we're acting as a client consuming their gRPC service, not implementing a gRPC server ourselves.
 * Streaming Nature of Geyser:
 * Geyser uses long-lived streaming connections rather than traditional request-response patterns. The NestJS gRPC decorators are primarily designed for request-response patterns.
 * No Public Proto Definitions:
 * As you noted, Helius doesn't publicly expose their proto definitions. The @GrpcMethod decorator requires these definitions to generate the appropriate TypeScript interfaces.
 * REST/SSE Wrapper Pattern:
 * This implementation wraps the gRPC streaming functionality in a more web-friendly REST API with Server-Sent Events (SSE) for streaming data to browsers, which is a common pattern for exposing gRPC services to web clients.
 * Instead, this implementation:
 * Uses the Yellowstone client library directly
 * Manages the gRPC connection and streaming internally
 * Exposes the data through REST endpoints and SSE streams
 * Provides a clean API that abstracts away the gRPC details
 */
// Here's how you could structure a NestJS application with Geyser:

// // geyser.proto.ts
// export interface GeyserProto {
//     // Proto definitions extracted from yellowstone-grpc
//   }
  
//   // geyser.service.ts
//   import { Injectable } from '@nestjs/common';
//   import Client, { CommitmentLevel, SubscribeRequest } from '@triton-one/yellowstone-grpc';
//   import { Subject } from 'rxjs';
  
//   @Injectable()
//   export class GeyserService {
//     private client: Client;
//     private slotUpdates = new Subject<any>();
//     private accountUpdates = new Subject<any>();
    
//     constructor() {
//       this.client = new Client(
//         process.env.HELIUS_GEYSER_URL,
//         process.env.HELIUS_X_TOKEN,
//         { "grpc.max_receive_message_length": 64 * 1024 * 1024 }
//       );
//       this.initializeStreams();
//     }
    
//     private async initializeStreams() {
//       const stream = await this.client.subscribe();
      
//       stream.on('data', (data) => {
//         if (data.filters && data.filters[0] === 'slot') {
//           this.slotUpdates.next(data.slot);
//         } else if (data.filters && data.filters[0] === 'account') {
//           this.accountUpdates.next(data.account);
//         }
//       });
      
//       // Setup error handling, ping intervals, etc.
//     }
    
//     getSlotUpdates() {
//       return this.slotUpdates.asObservable();
//     }
    
//     getAccountUpdates() {
//       return this.accountUpdates.asObservable();
//     }
    
//     // Additional methods for different subscription types
//   }
  
//   // geyser.controller.ts
//   import { Controller, Get, Param, Sse } from '@nestjs/common';
//   import { Observable } from 'rxjs';
//   import { GeyserService } from './geyser.service';
  
//   @Controller('geyser')
//   export class GeyserController {
//     constructor(private geyserService: GeyserService) {}
    
//     @Sse('slots')
//     getSlotUpdates(): Observable<any> {
//       return this.geyserService.getSlotUpdates();
//     }
    
//     @Sse('accounts/:pubkey')
//     getAccountUpdates(@Param('pubkey') pubkey: string): Observable<any> {
//       // Filter for specific account
//       return this.geyserService.getAccountUpdates()
//         .pipe(filter(account => account.pubkey === pubkey));
//     }
//   }


import Client, {
  CommitmentLevel,
  SubscribeRequest,
  SubscribeRequestFilterAccountsFilter
} from "@triton-one/yellowstone-grpc";
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const GRPC_URL = process.env.HELIUS_GEYSER_URL || "your-geyser-url-here";
const X_TOKEN = process.env.HELIUS_X_TOKEN || "your-x-token-here";
const PING_INTERVAL_MS = 30_000; // 30 seconds

/**
 * Utility function to convert Buffer objects to base58 strings for readability
 */
function convertBuffers(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Buffer objects
  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return bs58.encode(new Uint8Array(obj.data));
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => convertBuffers(item));
  }

  // Handle objects
  if (typeof obj === 'object') {
    // Handle Uint8Array directly
    if (obj instanceof Uint8Array) {
      return bs58.encode(obj);
    }

    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip certain keys that shouldn't be converted
      if (key === 'uiAmount' || key === 'decimals' || key === 'uiAmountString') {
        converted[key] = value;
      } else {
        converted[key] = convertBuffers(value);
      }
    }
    return converted;
  }

  return obj;
}

/**
 * Example 1: Subscribe to slot updates
 */
async function subscribeToSlots() {
  console.log("Starting slot subscription example...");
  
  // Create client
  const client = new Client(GRPC_URL, X_TOKEN, {
    "grpc.max_receive_message_length": 64 * 1024 * 1024, // 64MiB
  });

  // Subscribe for events
  const stream = await client.subscribe();

  // Create error/end handler
  setupStreamHandlers(stream);

  // Handle updates
  stream.on("data", (data: any) => {
    const ts = new Date();
    if (data.filters && data.filters[0] === "slot" && data.slot) {
      console.log(`${ts.toUTCString()}: Received slot update: ${data.slot.slot}`);
      console.log(`  Parent: ${data.slot.parent}, Status: ${CommitmentLevel[data.slot.status]}`);
    } else if (data.pong) {
      console.log(`${ts.toUTCString()}: Processed ping response!`);
    }
  });

  // Example subscribe request for slots
  const slotRequest: SubscribeRequest = {
    slots: {
      slot: { filterByCommitment: true },
    },
    commitment: CommitmentLevel.CONFIRMED,

    // Required, but unused arguments
    accounts: {},
    accountsDataSlice: [],
    transactions: {},
    transactionsStatus: {},
    blocks: {},
    blocksMeta: {},
    entry: {},
  };

  // Send subscribe request
  await sendRequest(stream, slotRequest);
  
  // Setup ping interval
  setupPingInterval(stream);
}

/**
 * Example 2: Subscribe to account updates
 */
async function subscribeToAccounts(accounts: string[]) {
  console.log("Starting account subscription example...");
  
  // Create client
  const client = new Client(GRPC_URL, X_TOKEN, {
    "grpc.max_receive_message_length": 64 * 1024 * 1024, // 64MiB
  });

  // Subscribe for events
  const stream = await client.subscribe();

  // Create error/end handler
  setupStreamHandlers(stream);

  // Handle updates
  stream.on("data", (data: any) => {
    const ts = new Date();
    if (data.filters && data.filters[0] === "account" && data.account) {
      console.log(`${ts.toUTCString()}: Received account update:`);
      console.log(`  Account: ${bs58.encode(data.account.pubkey)}`);
      console.log(`  Owner: ${bs58.encode(data.account.owner)}`);
      console.log(`  Lamports: ${data.account.lamports}`);
      console.log(`  Data Length: ${data.account.data?.length || 0} bytes`);
    } else if (data.pong) {
      console.log(`${ts.toUTCString()}: Processed ping response!`);
    }
  });

  // Convert string accounts to Uint8Array for the filter
  const accountsFilter: SubscribeRequestFilterAccountsFilter = {
    account: accounts.map(acc => bs58.decode(acc)),
    owner: [],
    filters: [],
  };

  // Example subscribe request for accounts
  const accountRequest: SubscribeRequest = {
    accounts: {
      account: accountsFilter,
    },
    commitment: CommitmentLevel.CONFIRMED,
    accountsDataSlice: [], // Get all account data

    // Required, but unused arguments
    slots: {},
    transactions: {},
    transactionsStatus: {},
    blocks: {},
    blocksMeta: {},
    entry: {},
  };

  // Send subscribe request
  await sendRequest(stream, accountRequest);
  
  // Setup ping interval
  setupPingInterval(stream);
}

/**
 * Example 3: Subscribe to program accounts
 */
async function subscribeToProgramAccounts(programIds: string[]) {
  console.log("Starting program account subscription example...");
  
  // Create client
  const client = new Client(GRPC_URL, X_TOKEN, {
    "grpc.max_receive_message_length": 64 * 1024 * 1024, // 64MiB
  });

  // Subscribe for events
  const stream = await client.subscribe();

  // Create error/end handler
  setupStreamHandlers(stream);

  // Handle updates
  stream.on("data", (data: any) => {
    const ts = new Date();
    if (data.filters && data.filters[0] === "account" && data.account) {
      console.log(`${ts.toUTCString()}: Received program account update:`);
      console.log(`  Account: ${bs58.encode(data.account.pubkey)}`);
      console.log(`  Owner: ${bs58.encode(data.account.owner)}`);
      console.log(`  Lamports: ${data.account.lamports}`);
      console.log(`  Data Length: ${data.account.data?.length || 0} bytes`);
    } else if (data.pong) {
      console.log(`${ts.toUTCString()}: Processed ping response!`);
    }
  });

  // Convert string program IDs to Uint8Array for the filter
  const accountsFilter: SubscribeRequestFilterAccountsFilter = {
    account: [],
    owner: programIds.map(id => bs58.decode(id)),
    filters: [],
  };

  // Example subscribe request for program accounts
  const programRequest: SubscribeRequest = {
    accounts: {
      account: accountsFilter,
    },
    commitment: CommitmentLevel.CONFIRMED,
    accountsDataSlice: [], // Get all account data

    // Required, but unused arguments
    slots: {},
    transactions: {},
    transactionsStatus: {},
    blocks: {},
    blocksMeta: {},
    entry: {},
  };

  // Send subscribe request
  await sendRequest(stream, programRequest);
  
  // Setup ping interval
  setupPingInterval(stream);
}

/**
 * Example 4: Subscribe to transactions
 */
async function subscribeToTransactions(accountsToInclude: string[] = []) {
  console.log("Starting transaction subscription example...");
  
  // Create client
  const client = new Client(GRPC_URL, X_TOKEN, {
    "grpc.max_receive_message_length": 1024 * 1024 * 1024, // 1GB
  });

  // Subscribe for events
  const stream = await client.subscribe();

  // Create error/end handler
  setupStreamHandlers(stream);

  // Handle updates
  stream.on("data", (data: any) => {
    const ts = new Date();
    if (data.transaction) {
      console.log(`${ts.toUTCString()}: Received transaction update:`);
      
      // Convert the transaction object for readability
      const convertedTx = convertBuffers(data.transaction);
      
      // Log key transaction details
      console.log(`  Signature: ${convertedTx.signature}`);
      console.log(`  Slot: ${convertedTx.slot}`);
      console.log(`  Success: ${!convertedTx.meta?.err}`);
      
      // Log account keys involved
      if (convertedTx.transaction?.message?.accountKeys) {
        console.log("  Account Keys:");
        convertedTx.transaction.message.accountKeys.forEach((key: string, index: number) => {
          console.log(`    [${index}] ${key}`);
        });
      }
      
      // Log instructions (simplified)
      if (convertedTx.meta?.innerInstructions) {
        console.log(`  Inner Instructions Count: ${convertedTx.meta.innerInstructions.length}`);
      }
    } else if (data.pong) {
      console.log(`${ts.toUTCString()}: Processed ping response!`);
    }
  });

  // Example subscribe request for transactions
  const txRequest: SubscribeRequest = {
    commitment: CommitmentLevel.PROCESSED,
    accountsDataSlice: [],
    transactions: {
      client: {
        vote: false, // Exclude vote transactions
        failed: true, // Include failed transactions
        accountInclude: accountsToInclude, // Filter by accounts if provided
        accountExclude: [],
        accountRequired: [],
      },
    },
    
    // Required, but unused arguments
    accounts: {},
    slots: {},
    transactionsStatus: {},
    entry: {},
    blocks: {},
    blocksMeta: {},
  };

  // Send subscribe request
  await sendRequest(stream, txRequest);
  
  // Setup ping interval
  setupPingInterval(stream);
}

/**
 * Example 5: Subscribe to blocks
 */
async function subscribeToBlocks() {
  console.log("Starting block subscription example...");
  
  // Create client
  const client = new Client(GRPC_URL, X_TOKEN, {
    "grpc.max_receive_message_length": 1024 * 1024 * 1024, // 1GB
  });

  // Subscribe for events
  const stream = await client.subscribe();

  // Create error/end handler
  setupStreamHandlers(stream);

  // Handle updates
  stream.on("data", (data: any) => {
    const ts = new Date();
    if (data.block) {
      console.log(`${ts.toUTCString()}: Received block update:`);
      console.log(`  Slot: ${data.block.slot}`);
      console.log(`  Parent Slot: ${data.block.parentSlot}`);
      console.log(`  Blockhash: ${bs58.encode(data.block.blockhash)}`);
      console.log(`  Transaction Count: ${data.block.transactions?.length || 0}`);
    } else if (data.pong) {
      console.log(`${ts.toUTCString()}: Processed ping response!`);
    }
  });

  // Example subscribe request for blocks
  const blockRequest: SubscribeRequest = {
    commitment: CommitmentLevel.CONFIRMED,
    accountsDataSlice: [],
    blocks: {
      client: {
        includeTransactions: true, // Include transaction details
        includeAccounts: false,    // Don't include account details
        includeEntries: false,     // Don't include entries
      },
    },
    
    // Required, but unused arguments
    accounts: {},
    slots: {},
    transactions: {},
    transactionsStatus: {},
    entry: {},
    blocksMeta: {},
  };

  // Send subscribe request
  await sendRequest(stream, blockRequest);
  
  // Setup ping interval
  setupPingInterval(stream);
}

// Helper functions

function setupStreamHandlers(stream: any) {
  const streamClosed = new Promise<void>((resolve, reject) => {
    stream.on("error", (error: any) => {
      console.error("Stream error:", error);
      reject(error);
      stream.end();
    });
    stream.on("end", () => {
      console.log("Stream ended");
      resolve();
    });
    stream.on("close", () => {
      console.log("Stream closed");
      resolve();
    });
  });
  
  return streamClosed;
}

async function sendRequest(stream: any, request: SubscribeRequest) {
  return new Promise<void>((resolve, reject) => {
    stream.write(request, (err: any) => {
      if (err === null || err === undefined) {
        console.log("Subscribe request sent successfully");
        resolve();
      } else {
        console.error("Failed to send subscribe request:", err);
        reject(err);
      }
    });
  }).catch((reason) => {
    console.error(reason);
    throw reason;
  });
}

function setupPingInterval(stream: any) {
  // Send pings to keep the connection open
  const pingRequest: SubscribeRequest = {
    ping: { id: 1 },
    // Required, but unused arguments
    accounts: {},
    accountsDataSlice: [],
    transactions: {},
    transactionsStatus: {},
    blocks: {},
    blocksMeta: {},
    entry: {},
    slots: {},
  };
  
  const interval = setInterval(async () => {
    if (stream.destroyed) {
      clearInterval(interval);
      return;
    }
    
    try {
      await new Promise<void>((resolve, reject) => {
        stream.write(pingRequest, (err: any) => {
          if (err === null || err === undefined) {
            resolve();
          } else {
            reject(err);
          }
        });
      });
    } catch (error) {
      console.error("Failed to send ping:", error);
      clearInterval(interval);
    }
  }, PING_INTERVAL_MS);
  
  return interval;
}

// Main function to demonstrate usage
async function main() {
  console.log("Helius Geyser (Yellowstone) Examples");
  console.log("-----------------------------------");
  console.log("Note: Geyser is only available for dedicated nodes.");
  console.log("You need to provision a dedicated node from the Helius Dashboard.");
  
  try {
    // Uncomment the example you want to run
    
    // Example 1: Subscribe to slot updates
    // await subscribeToSlots();
    
    // Example 2: Subscribe to account updates
    // const accounts = ["83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri"];
    // await subscribeToAccounts(accounts);
    
    // Example 3: Subscribe to program accounts
    // const programs = ["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"]; // Token program
    // await subscribeToProgramAccounts(programs);
    
    // Example 4: Subscribe to transactions
    // const accountsToWatch = ["83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri"];
    // await subscribeToTransactions(accountsToWatch);
    
    // Example 5: Subscribe to blocks
    // await subscribeToBlocks();
    
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export the functions for use in other files
export {
  subscribeToSlots,
  subscribeToAccounts,
  subscribeToProgramAccounts,
  subscribeToTransactions,
  subscribeToBlocks
};
