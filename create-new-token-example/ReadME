# Creating a Token on Solana

This guide is based on the official Solana documentation:
https://solana.com/developers/guides/getstarted/how-to-create-a-token


## Key Concepts

- **Token**: A digital asset on the Solana blockchain that can represent anything of value. Tokens are the foundation of your project. They can be currencies, voting rights, or access passes. Without tokens, there would be no way to track ownership of digital assets.

- **Wallet**: A keypair (public and private key) that lets you interact with the Solana blockchain. Your wallet is your identity on Solana. The private key signs transactions. The public key is your address. Keep your private key safe - if lost, you lose access to all your assets.

- **Account**: A data structure on Solana that can store tokens or other data. All information on Solana lives in accounts. They cost rent in SOL to maintain. Accounts are the building blocks of all Solana applications.

- **Mint Account**: The "factory" that creates tokens of a specific type. This special account defines your token's properties and tracks the total supply. Every token needs a mint account. Its address becomes your token's identifier.

- **Mint Authority**: The wallet that controls token creation. This wallet can create new tokens or burn existing ones. It has complete control over supply. You can later disable this authority to make supply fixed.

- **Token Account**: A special account that can hold a specific token type. Users need a token account for each type of token they own. These accounts track balances and ownership. They're like digital wallets specific to one token.

- **Decimals**: How divisible your token is (similar to cents in a dollar). With 9 decimals (Solana default), one token can be split into 1 billion pieces. This setting is permanent and affects how users interact with small amounts.

## Prerequisites

- Solana CLI tools installed
- Basic understanding of terminal commands

```bash
curl --proto '=https' --tlsv1.2 -sSfL https://raw.githubusercontent.com/solana-developers/solana-install/main/install.sh | bash
```

## Step-by-Step Guide

### 1. Create a Project Folder

```bash
mkdir new-token
cd new-token
```

**Purpose**: Keeps your token project files organized.

### 2. Create a Mint Authority Wallet

```bash
solana-keygen grind --starts-with bos:1
```

**Purpose**: Creates a wallet that will control your token. The vanity address (starting with "bos") makes it recognizable.

**If skipped**: You'd need another wallet to control your token, but it might be harder to identify.

### 3. Set Up Solana CLI Configuration

```bash
solana config set --keypair YOUR_BOS_KEYPAIR.json
solana config set --url devnet
```

**Purpose**: Configures the Solana CLI to use your mint authority wallet and the test network.

**If skipped**: Commands would use the wrong wallet or network, potentially causing real SOL loss on mainnet.

### 4. Verify Configuration

```bash
solana config get
solana address
```

**Purpose**: Confirms your settings are correct before proceeding.

### 5. Create a Token Mint Address

```bash
solana-keygen grind --starts-with mnt:1
```

**Purpose**: Creates a recognizable address for your token mint.

**If skipped**: Your token would have a random address, making it harder to identify.

### 6. Create the Token on the Blockchain

```bash
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-metadata YOUR_MNT_KEYPAIR.json
```

**Purpose**: Creates the actual token mint on Solana using the Token Extensions program.

**If skipped**: Your token wouldn't exist on the blockchain.

**Note**: The `--enable-metadata` flag allows adding name, symbol, and image to your token.

### 7. Add Metadata to Your Token

```bash
spl-token initialize-metadata YOUR_MNT_ADDRESS 'Your Token Name' 'SYMBOL' https://your-metadata-uri.json
```

**Purpose**: Makes your token recognizable in wallets and explorers with a name, symbol, and image.

**If skipped**: Your token would appear as an unknown token in wallets.

**Note**: The metadata URI should point to a JSON file with this structure:
```json
{
  "name": "Your Token Name",
  "symbol": "SYMBOL",
  "description": "Description of your token",
  "image": "https://link-to-your-token-image.png"
}
```

### 8. Create a Token Account

```bash
spl-token create-account YOUR_MNT_ADDRESS
```

**Purpose**: Creates a special account in your wallet that can hold your token.

**If skipped**: You wouldn't have anywhere to store your tokens.

### 9. Mint Tokens

```bash
spl-token mint YOUR_MNT_ADDRESS 100
```

**Purpose**: Creates 100 tokens and sends them to your token account.

**If skipped**: Your token would exist but with zero supply.

## Viewing Your Token

After completing these steps, you can view your token on Solana Explorer:

The explorer will show:
- Your token name and symbol
- The total supply
- Token image (if you provided one in metadata)
- All token accounts holding your token
```
https://explorer.solana.com/address/YOUR_MNT_ADDRESS?cluster=devnet
```

(Take look at result.png)


## Important Notes

- For a real token, use mainnet instead of devnet and secure your keypairs.
- The mint authority keypair controls token creation - keep it secure!
- Token metadata should be stored on decentralized storage for production tokens.
- Consider adding token extensions for additional functionality if needed.

## Complete Example

Below is a complete example of all commands needed to create a token with metadata:

For the full commands with sample outputs, check the [commands-guide.bash](./commands-guide.bash) file in this directory.





