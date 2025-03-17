# Practical commands for creating a new token on Solana based on https://solana.com/developers/guides/getstarted/how-to-create-a-token

# ------------------------------------------------------------------------------------------
# Install dependencies
# On Mac and Linux, run this single command to install all dependencies.
➜ curl --proto '=https' --tlsv1.2 -sSfL https://raw.githubusercontent.com/solana-developers/solana-install/main/install.sh | bash
# ------------------------------------------------------------------------------------------
# Create a dedicated folder for our token project
# This keeps files organized and easy to find
➜  solana-quick-start mkdir new-token

➜  solana-quick-start ./new-token 
# ------------------------------------------------------------------------------------------
# Generate a wallet with a vanity address starting with "bos"
# Vanity addresses are more recognizable and help with branding
# The ":1" means find exactly 1 matching address
➜ solana-keygen grind --starts-with bos:1
# SAMPLE OUTPUT:
# Searching with 12 threads for:
#	1 pubkey that starts with 'bos' and ends with ''
# Searched 1000000 keypairs in 2s. 0 matches found.
# Searched 2000000 keypairs in 4s. 0 matches found.
# Wrote keypair to bosHKmF6ipdoaYPiMLdxeJdWwVPxdXmMn8TNvociiSP.json
# ------------------------------------------------------------------------------------------
# Set this wallet as the default for all Solana commands
# This wallet will pay transaction fees and sign transactions
➜ solana config set --keypair bosHKmF6ipdoaYPiMLdxeJdWwVPxdXmMn8TNvociiSP.json 
# SAMPLE OUTPUT:
# Config File: /home/pejman/.config/solana/cli/config.yml
# RPC URL: https://api.mainnet-beta.solana.com 
# WebSocket URL: wss://api.mainnet-beta.solana.com/ (computed)
# Keypair Path: bosHKmF6ipdoaYPiMLdxeJdWwVPxdXmMn8TNvociiSP.json 
# Commitment: confirmed 
# ------------------------------------------------------------------------------------------
# Switch to devnet (test network) instead of mainnet
# Devnet is for testing - tokens have no real value
# Protects from accidentally spending real SOL
➜ solana config set --url devnet
# SAMPLE OUTPUT:
# Config File: /home/pejman/.config/solana/cli/config.yml
# RPC URL: https://api.devnet.solana.com 
# WebSocket URL: wss://api.devnet.solana.com/ (computed)
# Keypair Path: bosHKmF6ipdoaYPiMLdxeJdWwVPxdXmMn8TNvociiSP.json 
# Commitment: confirmed 
# ------------------------------------------------------------------------------------------
# Verify our configuration settings
# Confirms keypair and network settings are correct
➜ solana config get 
# SAMPLE OUTPUT:
# Config File: /home/pejman/.config/solana/cli/config.yml
# RPC URL: https://api.devnet.solana.com 
# WebSocket URL: wss://api.devnet.solana.com/ (computed)
# Keypair Path: bosHKmF6ipdoaYPiMLdxeJdWwVPxdXmMn8TNvociiSP.json 
# Commitment: confirmed 
# ------------------------------------------------------------------------------------------
# Display the public address of our currently selected wallet
# Confirms we're using the expected "bos" wallet
➜ solana address
# SAMPLE OUTPUT:
# bosHKmF6ipdoaYPiMLdxeJdWwVPxdXmMn8TNvociiSP
# ------------------------------------------------------------------------------------------
# Generate a keypair specifically for our token with "mnt" prefix
# This keypair will be used as the mint authority (controls token creation)
# Having a recognizable token address makes it easier to identify
➜ solana-keygen grind --starts-with mnt:1
# SAMPLE OUTPUT:
# Searching with 12 threads for:
#	1 pubkey that starts with 'mnt' and ends with ''
# Searched 1000000 keypairs in 2s. 0 matches found.
# // ... existing code ...
# Searched 16000000 keypairs in 33s. 0 matches found.
# Wrote keypair to mntHQqoh28MXVgmZLRfTTzxuYJo6HQphMg5WSntyFKm.json
# ------------------------------------------------------------------------------------------
# List files to confirm our keypairs were created
➜ ls
# SAMPLE OUTPUT:
# bosHKmF6ipdoaYPiMLdxeJdWwVPxdXmMn8TNvociiSP.json
# mntHQqoh28MXVgmZLRfTTzxuYJo6HQphMg5WSntyFKm.json
# ------------------------------------------------------------------------------------------
# Create the actual token on Solana blockchain
# --program-id specifies using Token Extensions program
# --enable-metadata allows adding name, symbol, and image
# Sets decimals to 9 (standard for most tokens)
➜ spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-metadata mntHQqoh28MXVgmZLRfTTzxuYJo6HQphMg5WSntyFKm.json
# SAMPLE OUTPUT:
# Creating token mntHQqoh28MXVgmZLRfTTzxuYJo6HQphMg5WSntyFKm under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
# To initialize metadata inside the mint, please run `spl-token initialize-metadata mntHQqoh28MXVgmZLRfTTzxuYJo6HQphMg5WSntyFKm <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>`, and sign with the mint authority.
#
# Address:  mntHQqoh28MXVgmZLRfTTzxuYJo6HQphMg5WSntyFKm
# Decimals:  9
#
# Signature: E54FYptiyYvUez9duN2aNnsR5cxBkBep55xgGWBWVHBMEDk7m2wjm2UJY4AapMBxskaGCQV2sGvpJUj8K1mxQsd
# ------------------------------------------------------------------------------------------
# Set human-readable information for the token:
# - Name: "Pejman example token"
# - Symbol: "EXMPL" (shows in wallets)
# - URI: Points to JSON file with token image and other metadata
# Makes the token recognizable in wallets and explorers

# Before initializing metadata, I've uploaded two files to IPFS:
# 1. The token image (PNG file)
# 2. metadata.json containing name, symbol, description and image URL
#
# The metadata.json file looks like:
# {
#   "name": "Pejman Example Token",
#   "symbol": "EXMPL",
#   "description": "Pejman example token from Solana Making a Token guide.",
#   "image": "https://flexible-turquoise-hyena.myfilebase.com/ipfs/QmUNJpSWx4KAUEX8chD6GWzuwqaAKDWTc3FwAK9Gxpo1s2"
# }
#
# The URI points to this metadata file on IPFS
# ------------------------------------------------------------------------------------------
➜ spl-token initialize-metadata mntHQqoh28MXVgmZLRfTTzxuYJo6HQphMg5WSntyFKm 'Pejman example token' 'EXMPL' https://flexible-turquoise-hyena.myfilebase.com/ipfs/QmRbasN5x5ssFVAXnrRQgKwA3jaTUq98PN49UM2AN6yq7V 
# SAMPLE OUTPUT:
# Signature: if9j1dmZcGYJcnmazoYinMKwrjXUZLuyZX5RmwcM2qrqnpTMzPk3xmqCT3gbjUpq3WXVt2kz1pJfNhBHSDhkt9P
# ------------------------------------------------------------------------------------------
# Create a special account in our wallet to hold this specific token
# On Solana, each token type needs its own account
# The account is associated with our wallet address
➜ spl-token create-account mntHQqoh28MXVgmZLRfTTzxuYJo6HQphMg5WSntyFKm
# SAMPLE OUTPUT:
# Creating account 3zQ8i4kGNGKCVBxhKFE6FC64d31YkRBYgLsQeUrauvsY
#
# Signature: 33u6juY4QiPuDEUuUdx5MtV8ocbwiXLJbzfGBmP56pDbF69D32c2Mp8XQXWLJUPgejbEujhmcQ38N5SPZ1vvYiXv
# ------------------------------------------------------------------------------------------
# Create 100 tokens and send them to our token account
# Only the mint authority (our wallet) can create new tokens
# With 9 decimals, this creates 100 * 10^9 base units
# These tokens now exist on the blockchain and can be transferred
➜ spl-token mint mntHQqoh28MXVgmZLRfTTzxuYJo6HQphMg5WSntyFKm 100
# SAMPLE OUTPUT:
# Minting 100 tokens
#   Token: mntHQqoh28MXVgmZLRfTTzxuYJo6HQphMg5WSntyFKm
#   Recipient: 3zQ8i4kGNGKCVBxhKFE6FC64d31YkRBYgLsQeUrauvsY
#
# Signature: 3cD81GvzuQAqy2vob3PKdJS1Xy3T5NGXazaRBcqciQxKP4VrD5TyNgKSJat5CsqupKXC5gGuW9Uy8sPjhuAkwa8F




# FINAL RESULT TO CHECK
# https://explorer.solana.com/address/mntHQqoh28MXVgmZLRfTTzxuYJo6HQphMg5WSntyFKm?cluster=devnet