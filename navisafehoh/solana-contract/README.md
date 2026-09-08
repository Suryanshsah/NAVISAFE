# NaviSafe Tourist Registry - Solana Smart Contract

A Solana smart contract built with Anchor framework for securely storing tourist registration data on the blockchain.

## Features

- **Tourist Registration**: Store personal information securely on-chain
- **Trip Details Management**: Update and manage trip itineraries and emergency contacts
- **Privacy Protection**: ID numbers are hashed before storage
- **Time-bound Registration**: Automatic deactivation after trip completion
- **Data Verification**: Immutable blockchain records for verification

## Contract Structure

### Main Functions

1. **register_tourist**: Initial registration with personal details
2. **update_trip_details**: Add trip information and emergency contacts
3. **get_tourist_data**: Retrieve stored tourist information
4. **deactivate_tourist**: Deactivate account after trip completion

### Data Storage

- Personal information (name, age, nationality, etc.)
- Hashed ID numbers for privacy
- Trip details (dates, purpose, accommodation)
- Emergency contacts (up to 5 contacts)
- Timestamps and blockchain metadata

## Setup and Deployment

### Prerequisites

\`\`\`bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"

# Install Anchor
npm install -g @coral-xyz/anchor-cli
\`\`\`

### Configuration

1. **Set Solana to Devnet**:
\`\`\`bash
solana config set --url devnet
\`\`\`

2. **Create/Import Wallet**:
\`\`\`bash
solana-keygen new --outfile ~/.config/solana/id.json
# OR import existing wallet
\`\`\`

3. **Get Devnet SOL**:
\`\`\`bash
solana airdrop 2
\`\`\`

### Build and Deploy

1. **Install Dependencies**:
\`\`\`bash
cd solana-contract
npm install
\`\`\`

2. **Build Contract**:
\`\`\`bash
anchor build
\`\`\`

3. **Deploy to Devnet**:
\`\`\`bash
anchor deploy --provider.cluster devnet
\`\`\`

4. **Run Tests**:
\`\`\`bash
anchor test --provider.cluster devnet
\`\`\`

## Usage Examples

### Register Tourist

\`\`\`typescript
const digitalId = "NVS-" + Date.now();
const tx = await program.methods
  .registerTourist(
    digitalId,
    "John Doe",
    "male",
    30,
    hashedIdNumber, // SHA256 hash of ID
    "+1234567890",
    "United States",
    "john@example.com",
    new anchor.BN(Date.now() / 1000)
  )
  .accounts({
    touristAccount: touristPda,
    user: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
\`\`\`

### Update Trip Details

\`\`\`typescript
const tx = await program.methods
  .updateTripDetails(
    new anchor.BN(startDate),
    new anchor.BN(endDate),
    "Tourism",
    "Hotel ABC",
    "City tour and sightseeing",
    [{ name: "Emergency Contact", relationship: "Family", phone: "+1234567891" }]
  )
  .accounts({
    touristAccount: touristPda,
    user: wallet.publicKey,
  })
  .rpc();
\`\`\`

## Security Features

- **PDA (Program Derived Address)**: Accounts are derived from user wallet + digital ID
- **Authority Validation**: Only account owner can update their data
- **Input Validation**: Comprehensive validation for all input fields
- **Privacy Protection**: Sensitive data like ID numbers are hashed
- **Time Validation**: Trip dates must be valid and in the future

## Data Verification

After deployment, tourist data can be verified on:
- **Solscan Devnet**: https://solscan.io/?cluster=devnet
- **Solana Explorer Devnet**: https://explorer.solana.com/?cluster=devnet

Search using the transaction signature or account address to verify stored data.

## Program ID

\`\`\`
NaviSafe11111111111111111111111111111111111
\`\`\`

## Error Codes

- `NameTooLong`: Name exceeds 100 characters
- `InvalidAge`: Age not between 1-120
- `Unauthorized`: User doesn't own the account
- `InvalidTripDates`: End date before start date
- `TripInPast`: Trip start date is in the past
- `TooManyContacts`: More than 5 emergency contacts

## License

MIT License - See LICENSE file for details
