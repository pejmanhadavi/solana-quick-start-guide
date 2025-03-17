/*********************************************************************************************************************************************  
 *************************************************** Key Solana Concepts ****************************************************************
*********************************************************************************************************************************************/
// Account
// A data container on Solana that can store information and SOL.

// Signer
// An account with a private key that can authorize transactions.

// Lamport
// The smallest unit of SOL (0.000000001 SOL).

// Program
// Smart contract code that runs on Solana.

// Mint
// A special account that creates and manages tokens.

// Token Account
// An account that holds tokens of a specific mint.

// Associated Token Account
// A standard token account with an address derived from owner and mint.

// PDA (Program Derived Address)
// An account address derived from seeds and a program ID, controlled by a program.

// Slot
// A specific block in the Solana blockchain.

// Compute Unit
// Measurement of processing resources used by a transaction.

// Lookup Table (LUT)
// Stores addresses to reduce transaction size by using indices instead of full addresses.

// Rent
// SOL payment required to store data on the blockchain.

// Authority
// An account that has permission to perform certain actions.

// Memo
// A short message attached to a transaction.

/*********************************************************************************************************************************************  
 *************************************************** Block ****************************************************************
*********************************************************************************************************************************************/

// Block
// A group of transactions processed together on the Solana blockchain.
// Each block:
// - Contains multiple transactions
// - Has a unique slot number
// - Is produced by a validator
// - Gets added to the blockchain in sequence
// - Contains a reference to the previous block (hash)
// - Is created roughly every 400ms
// - Has a maximum size limit
// - Must be confirmed by a supermajority of validators

// Blocks form the backbone of the Solana ledger.
// They provide a chronological record of all transactions.
// Finalized blocks cannot be changed or removed.

import { generateSigner, publicKey, sol, transactionBuilder } from '@metaplex-foundation/umi'
import { addMemo, AuthorityType, closeLut, createAccount, createAccountWithRent, createAssociatedToken, createEmptyLut, createLut, createLutForTransactionBuilder, createMint, createMintWithAssociatedToken, createToken, createTokenIfMissing, deactivateLut, extendLut, fetchAllMintByOwner, fetchAllMintPublicKeyByOwner, fetchAllTokenByOwner, fetchMint, fetchToken, findAddressLookupTablePda, findAssociatedTokenPda, freezeLut, mintTokensTo, setAuthority, setComputeUnitLimit, setComputeUnitPrice, transferAllSol, transferSol, transferTokens } from '@metaplex-foundation/mpl-toolbox'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'

const umi = createUmi('https://api.devnet.solana.com', 'confirmed'); // We can use Helius endpoint

/*********************************************************************************************************************************************  
 *************************************************** Create New Account *******************************************************************
 *********************************************************************************************************************************************/

/**
 * Creates a new account on Solana blockchain
 * 
 * Options:
 * - newAccount: The account being created
 * - payer: Who pays for the transaction
 * - lamports: SOL amount needed to pay for account storage on the blockchain. This is like rent for keeping your data on Solana. More space = more SOL needed.
 * - space: Size of the account in bytes
 * - programId: The program that will own this account
 * 
 * To find your program name/ID: 
 * 1. Check your UMI setup code where programs are registered
 * 2. Use 'solana program show' CLI command to find deployed program IDs
 * 3. Or replace with a direct public key: new PublicKey('your-program-id')
 */
async function createNewAccount() {
  // generateSigner creates a new keypair (public and private key).
  // This keypair acts as an account identity on Solana.
  // It can sign transactions and own assets.
  const newAccount = generateSigner(umi);
  const space = 42;
  await createAccount(umi, {
    newAccount,
    payer: umi.payer,
    // getRent calculates the minimum SOL needed to store data on Solana.
    // It returns the lamports required to make an account of this size rent-exempt.
    lamports: await umi.rpc.getRent(space),
    space,
    programId: umi.programs.get('myProgramName').publicKey,
  }).sendAndConfirm(umi);
}
 
/**
 * Creates a new account with automatic rent calculation.
 * 
 * This function:
 * - Creates a new account on Solana
 * - Automatically calculates the minimum rent needed
 * - Allocates the specified amount of storage space
 * - Assigns the account to a program
 * 
 * Use createAccountWithRent when you:
 * - Want to avoid manual rent calculations
 * - Need a simple account creation with minimum SOL
 * - Are creating accounts smaller than 10KB
 * - Want to reduce RPC calls in your application
 */
async function createNewAccountWithRent() {
  const newAccount = generateSigner(umi)
  const space = 42
  await createAccountWithRent(umi, {
    newAccount,
    payer: umi.payer,
    space,
    programId: umi.programs.get('myProgramName').publicKey,
  }).sendAndConfirm(umi);
}

/**
 * Differences between createAccount and createAccountWithRent:
 * 
 * 1. Manual vs Automatic Rent Calculation:
 *    - createAccount: You must calculate and provide the lamports amount
 *    - createAccountWithRent: Automatically calculates minimum rent exemption
 * 
 * 2. Parameter Requirements:
 *    - createAccount: Requires explicit 'lamports' parameter
 *    - createAccountWithRent: No 'lamports' parameter needed
 * 
 * 3. Convenience:
 *    - createAccountWithRent is simpler when you just need minimum rent
 *    - createAccount gives more control when you need specific lamport amounts
 * 
 * 4. Use Cases:
 *    - createAccount: When you need precise control over SOL allocation
 *    - createAccountWithRent: For standard accounts with minimum required SOL
 * 
 * 5. Advantages: 
 *    - By using this instruction, clients avoid the need for an extra HTTP request to fetch the rent exemption from the RPC node, streamlining the process.
 * 
 * 6. Limitations:
 *    - Since this instruction involves a CPI call, the maximum account size that can be created is limited to 10KB, compared to 10MB when using the SPL System program directly.
 */

/*********************************************************************************************************************************************
 *************************************************** Transfer SOL ************************************************************************
*********************************************************************************************************************************************/
// This is the Solana System Program address (11111111111111111111111)
// It's a special program that handles basic operations like creating accounts and transferring SOL
const destination = publicKey(`11111111111111111111111`)

async function transferSolToDestination() {
  await transferSol(umi, {
    source: umi.identity,
    destination,
    amount: sol(1.3), //(1/1,000,000 of SOL)
  }).sendAndConfirm(umi);
}

// Transfers all SOL from source to destination account.
// Useful for emptying an account while still using it to pay for the transaction.
async function transferAllSolToDestination() {
  await transferAllSol(umi, {
    source: umi.identity,
    destination,
  }).sendAndConfirm(umi);
}


/*********************************************************************************************************************************************
*************************************************** Token Management *********************************************************************
*********************************************************************************************************************************************/
/**
 * Token Management Overview
 * 
 * A mint is a special account that creates tokens.
 * A signer is an account that can authorize transactions.
 * The mintAuthority controls who can create new tokens.
 * The freezeAuthority can freeze token accounts to prevent transfers.
 * 
 * We create a mint to issue our own tokens on Solana.
 * The following functions show how to create and manage tokens.
 */

async function createTokenMint() {
  const mint = generateSigner(umi);
  const mintAuthority = umi.identity.publicKey;
  const freezeAuthority = umi.identity.publicKey;
  
  await createMint(umi, {
    mint,
    decimals: 0,
    mintAuthority,
    freezeAuthority,
  }).sendAndConfirm(umi);
}

/**
 * Creates a token account.
 * A token account holds tokens of a specific mint.
 * A mint is a special account that creates and manages a token type.
 * Each token account belongs to an owner who controls it.
 * 
 * This function:
 * - Generates a new signer for the token account
 * - Links it to a specific mint
 * - Sets the owner
 * - Creates the token account on-chain
 * 
 *  It is used to hold tokens of a specific mint for a particular owner.
 */
async function createTokenAccount() {
  const token = generateSigner(umi)
  const mint = publicKey('...') // Replace with actual mint address
  const owner = umi.identity.publicKey
  
  await createToken(umi, { token, mint, owner }).sendAndConfirm(umi)
}

/**
 * Creates an associated token account.
 * 
 * This function:
 * - Links it to a specific mint
 * - Sets the owner
 * - Creates the associated token account on-chain
 * 
 * Associated token accounts have a deterministic address based on the owner and mint.
 * Use this function when you want a standard way to find a user's token account.
 * This is the preferred method for most token operations as it follows convention.
*/
async function createAssociatedTokenAccount() {
  const mint = publicKey('...') // Replace with actual mint address
  const owner = umi.identity.publicKey
  
  await createAssociatedToken(umi, { mint, owner }).sendAndConfirm(umi)
}

/**
 * Mints tokens to a token account.
 * 
 * This function:
 * - Uses the mint authority to create new tokens
 * - Sends these tokens to a specific token account
 * - Specifies the amount to mint
 * 
 * The mintTokensTo function creates new tokens of a specific mint.
 * Use this when you need to increase the supply of tokens.
 * Only the mint authority can create new tokens.
 */
async function mintTokens() {
  const token = generateSigner(umi);
  const mintAuthority = umi.identity;
  const mint = publicKey('...'); // Replace with actual mint address
  await mintTokensTo(umi, {
    mintAuthority,
    mint,
    token: token.publicKey,
    amount: 42,
  }).sendAndConfirm(umi)
}


/**
 * Creates a mint and an associated token account in one step.
 * 
 * This function:
 * - Creates a new mint account
 * - Creates an associated token account for the owner
 * - Mints tokens directly to that account
 * 
 * Use this when you need to create a new token type and immediately 
 * give some tokens to a user in a single transaction.
 */
async function createMintWithAssociatedTokenAccount() {
  const mint = generateSigner(umi)
  const owner = umi.identity.publicKey

  await createMintWithAssociatedToken(umi, {
    mint,
    owner,
    amount: 1,
  }).sendAndConfirm(umi)
}



/**
 * Transfers tokens from one token account to another.
 * 
 * This function:
 * - Moves tokens from a source token account to a destination token account
 * - Requires authority (owner or delegate) to sign the transaction
 * - Specifies the amount to transfer
 * 
 * The transferTokens function moves existing tokens between accounts.
 * Use this when you need to send tokens to another user or wallet.
 * Only the token owner or a delegated authority can transfer tokens.
 */
async function transferTokensToDestination() {
  // Define the accounts needed for transfer
  const sourceTokenAccount = publicKey('...'); // Replace with actual source token account
  const destinationTokenAccount = publicKey('...'); // Replace with actual destination token account
  const ownerOrDelegate = umi.identity; // Using the current identity as the authority
  
  await transferTokens(umi, {
    source: sourceTokenAccount,
    destination: destinationTokenAccount,
    authority: ownerOrDelegate,
    amount: 30,
  }).sendAndConfirm(umi)
}


/**
 * Changes the authority on a token account.
 * 
 * This function:
 * - Updates who has permission to perform certain actions on a token account
 * - Can change different authority types (mint, freeze, close account, etc.)
 * - Requires the current owner to sign the transaction
 * 
 * Use setAuthority when you need to:
 * - Transfer ownership of a token account to another wallet
 * - Delegate closing permissions to another account
 * - Remove an authority by setting it to null
 * - Update who can mint new tokens or freeze accounts
 */
async function changeCloseAuthority() {
  // Define the token account and authorities
  const tokenAccount = publicKey('...'); // Replace with actual token account
  const owner = umi.identity; // Current identity as owner
  const newCloseAuthority = generateSigner(umi); // Generate a new signer
  
  await setAuthority(umi, {
    owned: tokenAccount,
    owner: owner.publicKey,
    authorityType: AuthorityType.CloseAccount, // Use string literal instead of enum
    newAuthority: newCloseAuthority.publicKey,
  }).sendAndConfirm(umi)
}

/**
 * Creates a token account if it doesn't exist.
 * 
 * This function:
 * - Checks if a token account exists
 * - Creates it if missing
 * - Ensures subsequent instructions can use the token account
 */
async function createTokenAccountIfMissing() {
  const mint = publicKey('...'); // Replace with actual mint
  const owner = umi.identity.publicKey; // Using current identity as owner
  
  await transactionBuilder()
    .add(createTokenIfMissing(umi, { mint, owner }))
    // Subsequent instructions can be sure the Associated Token account exists
    .sendAndConfirm(umi);
}



// These functions allow you to fetch information about Mint and Token accounts.
async function fetchTokenData() {
  const mint = publicKey('...');
  // Fetch Mint account.
  const mintAccount = await fetchMint(umi, mint)
  
  // Fetch Token account.
  const token = publicKey('...'); // Define token address
  const tokenAccount = await fetchToken(umi, token)
  
  // Fetch Associated Token account.
  const owner = umi.identity.publicKey; // Define owner
  const [associatedToken] = findAssociatedTokenPda(umi, { owner, mint })
  const associatedTokenAccount = await fetchToken(umi, associatedToken)
  
  // Fetch by owner.
  const tokensFromOwner = await fetchAllTokenByOwner(umi, owner)
  const mintsFromOwner = await fetchAllMintByOwner(umi, owner)
  const mintKeysFromOwner = await fetchAllMintPublicKeyByOwner(umi, owner)
}
/*********************************************************************************************************************************************
*************************************************** Priority Fees and Compute Management **********************************************
*********************************************************************************************************************************************/

/**
 * Priority Fees and Compute Management
 * 
 * Solana transactions use compute units to measure processing resources.
 * Each transaction needs a compute unit limit and can set a price per unit.
 * 
 * setComputeUnitLimit: Sets how many compute units a transaction can use.
 * - Units: The maximum number of compute units (default max is 1.4 million)
 * - Higher values allow more complex operations but cost more SOL
 * - Lower values can save fees for simple transactions
 * 
 * setComputeUnitPrice: Sets how much to pay per compute unit.
 * - Higher prices give your transaction priority during network congestion
 * - Prices are in micro-lamports (1 millionth of a lamport)
 */

async function setComputeUnitLimitExample() {
  await transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 600_000 })) // Set the Compute Unit limit.
    // 600_000 makes large numbers more readable by visually separating groups of digits. The value is exactly the same as 600000 - the underscores are ignored by the compiler
    // .add(...) // Any instruction(s) here.
    .sendAndConfirm(umi);
}

/**
 * This function shows how to set a compute unit price.
 * It sets a price of 1 micro-lamport per compute unit.
 * Higher prices give your transaction priority during network congestion.
 * This helps your transaction get processed faster when the network is busy.
 */
async function setComputeUnitPriceExample() {
  await transactionBuilder()
    .add(setComputeUnitPrice(umi, { microLamports: 1 })) // Set the price per Compute Unit in micro-lamports.
    // .add(...) // Any instruction(s) here.
    .sendAndConfirm(umi);
}

/*********************************************************************************************************************************************
***************************************************  Address Lookup Table ****************************************************************
*********************************************************************************************************************************************/

/**
 * Creates an empty lookup table.
 * 
 * A lookup table (LUT) stores addresses that can be referenced in transactions.
 * LUTs help reduce transaction size by replacing full addresses with short indices.
 * This saves space and allows more instructions in a single transaction.
 * 
 * This function gets the latest finalized slot (a confirmed block on the blockchain) and creates a new empty LUT.
 * The LUT will be owned by the specified authority.
 */
async function createLookupTableExample() {
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' })
  const authority = umi.identity; // The authority is the signer who will control the lookup table (usually the wallet that creates it)
  await createEmptyLut(umi, {
    recentSlot,
    authority,
  }).sendAndConfirm(umi)
}

/**
 * This function adds addresses to an existing lookup table.
 * 
 * It first finds the lookup table address using the authority and slot.
 * Then it adds new addresses to the table.
 * This helps reduce transaction size by storing addresses that can be referenced later.
 */

  // Find the PDA for the lookup table
  // A PDA is like a special account address that belongs to a program, not a person
  // Example: Think of a PDA as a locker (account) that only a specific program can open
  // The program uses seeds (like "lookup-table", slot number, authority) to find this locker
  // No one has the private key for a PDA - only the program can control it
  // A PDA is a deterministic address derived from seeds and a program ID
  // The tablePDA is the unique address where the lookup table will be stored on-chain
  // Unlike normal accounts, PDAs cannot have private keys and are controlled by programs
  // Lookup tables using PDAs differ from normal tables by being on-chain and allowing address compression
async function extendLookupTableExample() {
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' })
  const authority = umi.identity
  const lutAddress = findAddressLookupTablePda(umi, { authority: authority.publicKey, recentSlot })

  const addressA = umi.identity.publicKey
  const addressB = umi.identity.publicKey
  await extendLut(umi, {
    authority,
    address: lutAddress, // The address of the LUT.
    addresses: [addressA, addressB], // The addresses to add to the LUT.
  }).sendAndConfirm(umi)
}

/**
 * This function creates a lookup table and adds addresses to it in one step.
 * 
 * It gets the latest finalized block.
 * Then it creates a new lookup table with the given authority.
 * It adds the specified addresses to the table right away.
 * This saves time compared to creating and extending separately.
 */
async function createAndExtendLutExample() {
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' })
  const authority = umi.identity
  const addressA = umi.identity.publicKey
  const addressB = umi.identity.publicKey

  const [lutBuilder] = await createLut(umi, {
    authority,
    recentSlot,
    addresses: [addressA, addressB],
  })
  await lutBuilder.sendAndConfirm(umi)
}

/**
 * This function creates lookup tables for a given transaction builder.
 * 
 * It gets the latest finalized block.
 * Then it creates lookup tables for the transaction builder.
 * This saves time compared to creating and extending separately.
 */
async function createLutForTransactionExample() {
  // 1. Get the LUT builders and the LUT accounts for a given transaction builder.
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' })
  // Create a transaction builder first
  const baseBuilder = transactionBuilder();
  
  const [createLutBuilders, lutAccounts] = createLutForTransactionBuilder(
    umi,
    baseBuilder,
    recentSlot
  )
  // 2. Create the LUTs.
  for (const createLutBuilder of createLutBuilders) {
    await createLutBuilder.sendAndConfirm(umi)
  }
  // 3. Use the LUTs in the base transaction builder.
  await baseBuilder.setAddressLookupTables(lutAccounts).sendAndConfirm(umi)
}

/**
 * This function freezes a lookup table.
 * 
 * It gets the latest finalized block.
 * Then it freezes the lookup table.
 * This prevents the LUT from being modified.
 */ 
async function freezeLookupTableExample() {
  // The authority and slot used to create the LUT.
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });
  const authority = umi.identity;
  const lutAddress = findAddressLookupTablePda(umi, { authority: authority.publicKey, recentSlot })

  await freezeLut(umi, {
    authority,
    address: lutAddress,
  }).sendAndConfirm(umi);
}

/**
 * This function deactivates a lookup table.
 * 
 * It gets the latest finalized block.
 * Then it deactivates the lookup table.
 * This prevents the LUT from being used in transactions.
 */ 
async function deactivateLookupTableExample() {
  // The authority and slot used to create the LUT.
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' })
  const authority = umi.identity
  const lutAddress = findAddressLookupTablePda(umi, { authority: authority.publicKey, recentSlot })

  await deactivateLut(umi, {
    authority,
    address: lutAddress,
  }).sendAndConfirm(umi)
}

/**
 * This function closes a lookup table.
 * 
 * It gets the latest finalized block.
 * Then it closes the lookup table.
 * This prevents the LUT from being used in transactions.
 */   
async function closeLookupTableExample() {
  // The authority and slot used to create the LUT.
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' })
  const authority = umi.identity
  const lutAddress = findAddressLookupTablePda(umi, { authority: authority.publicKey, recentSlot })

  await closeLut(umi, {
    authority,
    address: lutAddress,
    recipient: authority.publicKey,
  }).sendAndConfirm(umi)
}

/**
 * Differences between Closing, Freezing, and Deactivating Lookup Tables
 * 
 * Freezing a LUT:
 * - Prevents further address additions
 * - LUT remains usable in transactions
 * - Cannot be unfrozen once frozen
 * - Keeps the LUT active on the network
 * 
 * Deactivating a LUT:
 * - Makes the LUT unusable in new transactions
 * - Keeps the LUT data on-chain
 * - Can be reactivated later
 * - Useful for temporary disabling
 * 
 * Closing a LUT:
 * - Permanently removes the LUT from the network
 * - Recovers the rent (SOL) to the recipient
 * - Cannot be recovered once closed
 * - Most final state of the three options
 */


/*********************************************************************************************************************************************
***************************************************  Transaction Memo ****************************************************************
*********************************************************************************************************************************************/
// A memo in Solana is a way to add a short message to a transaction.
// Memos are stored on-chain and can be viewed by anyone.
// They can be used for:
// - Adding notes to payments
// - Storing simple data
// - Creating an audit trail
// - Providing context for transactions
// Memos have no functional impact on the transaction.
async function sendTransaction() {
  await transactionBuilder()
    // .add(...) // Any instruction(s) here.
    .add(addMemo(umi, { memo: 'Hello world!' })) // Add a memo to the transaction.
    .sendAndConfirm(umi)
}
                                             
                                             