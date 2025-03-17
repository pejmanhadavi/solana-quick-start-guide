# Solana Quick Start

A comprehensive toolkit for Solana blockchain development.

## Overview

This repository provides practical tools and examples for working with the Solana blockchain. It's organized into two main sections:

1. **Scripts**: Ready-to-use tools for connecting to and interacting with Solana
2. **Create New Token Example**: Step-by-step guide for creating tokens on Solana

## Repository Structure

### Scripts Directory

Contains four key files demonstrating different ways to interact with Solana:

- **umi-toolbox.ts**: Comprehensive toolkit using the UMI framework for:
  - Account and token management
  - SOL transfers
  - Token operations (minting, transferring)
  - Compute unit management
  - Address lookup tables

- **helius-http.ts**: Basic HTTP API calls to Solana via Helius RPC:
  - Account balance queries
  - Transaction lookups
  - Token account information
  - Program account data

- **helius-socket.ts**: Real-time WebSocket connections for:
  - Account updates
  - Program activity monitoring
  - Transaction tracking
  - Slot notifications

- **helius-geyser.ts**: High-performance data streaming for:
  - Detailed blockchain data access
  - Advanced filtering options
  - Enterprise-grade monitoring
  - Only available with dedicated Helius nodes

### Create New Token Example

A complete guide for creating tokens on Solana following the official documentation:

- **commands-guide.bash**: All commands needed to create a token
- **ReadME**: Detailed explanation of token creation concepts
- **Sample files**: Example token metadata and results

## Key Concepts Covered

- Solana accounts and their structure
- Token creation and management
- Real-time blockchain monitoring
- Transaction building and sending
- Wallet and keypair management

## Getting Started

1. Choose the appropriate directory based on your needs:
   - For connecting to Solana: Use the scripts directory
   - For creating tokens: Use the create-new-token-example directory

2. Follow the README in each directory for specific instructions

3. Set up required dependencies:
   - Solana CLI tools for token creation
   - Node.js and TypeScript for scripts

## Resources

- [Solana Documentation](https://docs.solana.com/)
- [Helius Documentation](https://docs.helius.dev/)
- [UMI Documentation](https://github.com/metaplex-foundation/umi)
- [Solana Token Documentation](https://spl.solana.com/token)

## Connection Options

This toolkit demonstrates three ways to connect to Solana:

1. **HTTP API**: Standard JSON-RPC calls for basic operations
2. **WebSocket**: Live updates for accounts, programs, and transactions
3. **Geyser**: Enterprise-grade data streaming (requires dedicated Helius node)

For development, get your API keys from the [Helius Dashboard](https://dev.helius.xyz/dashboard).
