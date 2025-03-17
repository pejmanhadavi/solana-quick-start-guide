# Solana Quick Start

A toolkit for Solana blockchain development using Helius RPC and UMI.

## What Is This?

This project provides ready-to-use tools for interacting with the Solana blockchain through:

- UMI (Unified Modular Interface) for account and token operations
- Helius RPC services for data access and real-time monitoring

## Components

### UMI Toolbox
Core Solana operations including account management, token operations, and transaction building.

### Helius Connections
Three ways to connect to Solana:

1. **HTTP API**: Basic queries and operations
2. **WebSocket**: Real-time updates for accounts, programs, and transactions
3. **Geyser**: High-performance data streaming (requires dedicated node)

## Where To Go

### For Setup
- Get API keys: [Helius Dashboard](https://dev.helius.xyz/dashboard)
- UMI setup: [Metaplex UMI](https://github.com/metaplex-foundation/umi)

### For Learning
- Solana concepts: [Solana Cookbook](https://solanacookbook.com/)
- Token operations: [SPL Token Documentation](https://spl.solana.com/token)
- Account structure: [Solana Account Model](https://docs.solana.com/developing/programming-model/accounts)

### For Development
- HTTP endpoints: [Helius API Reference](https://docs.helius.dev/api-reference/rpc-endpoints)
- WebSocket subscriptions: [Solana WebSocket API](https://docs.solana.com/api/websocket)
- Geyser streaming: [Helius Geyser Documentation](https://docs.helius.dev/solana-rpc-nodes/enhanced-apis/geyser-webhooks)

## Getting Started

1. Set up environment variables with your Helius API keys
2. Choose the appropriate connection method for your needs:
   - One-time queries → HTTP API
   - Real-time updates → WebSocket
   - High-volume data → Geyser
3. Use the UMI toolbox for transaction building and account management

## Resources

- [Solana Documentation](https://docs.solana.com/)
- [Helius Documentation](https://docs.helius.dev/)
- [UMI Documentation](https://github.com/metaplex-foundation/umi)
- [Metaplex Foundation](https://www.metaplex.com/)
