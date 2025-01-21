# Wallet Linker

A web application that allows users to connect and manage multiple cryptocurrency wallets across different blockchains. Built with Next.js and integrates with various wallet providers.

## Features

- Connect multiple blockchain wallets (MetaMask, Phantom, Petra, Leap, Rabby)
- View wallet balances and addresses
- Send transactions across different chains
- Smart wallet creation and management
- Real-time transaction status and explorer links

## Integrated Wallets & Actions

### 1. Ethereum Wallets (MetaMask & Rabby)
- **Network Support**: 
  - Ethereum Mainnet
  - Goerli Testnet
  - Sepolia Testnet
- **Actions**:
  ```typescript
  // Native ETH transfers
  const sendMetaMaskTransaction = async (recipientAddress: string, amount: string) => {
  }
  const sendRabbyTransaction = async (recipientAddress: string, amount: string) => {
  ```

### 2. Solana Wallet (Phantom)
- **Network Support**:
  - Solana Mainnet
  - Testnet
  - Devnet
- **Actions**:
  ```typescript
  // Native SOL transfers
  const sendPhantomTransaction = async (recipientAddress: string, amount: string) => {
  }
  ```

### 3. Aptos Wallet (Petra)
- **Network Support**:
  - Aptos Mainnet
  - Testnet
  - Devnet
- **Actions**:
  ```typescript
  // Native APT transfers
  const sendPetraTransaction = async (recipientAddress: string, amount: string) => {
  }
  ```

### 4. Cosmos Wallet (Leap)
- **Network Support**:
  - Cosmos Hub
  - Osmosis
  - Testnet
- **Actions**:
  ```typescript
  // Native OSMO transfers
  const sendLeapTransaction = async (recipientAddress: string, amount: string) => {
  }
  ```

## Tech Stack

### Core Technologies
- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety and better developer experience
- [React 18](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Styling and UI components

### State Management
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Redux Persist](https://github.com/rt2zz/redux-persist) - Persist and rehydrate Redux store

### Blockchain Integration
- [ethers.js](https://docs.ethers.org/) - Ethereum wallet integration
- [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/) - Solana wallet integration
- [@aptos-labs/ts-sdk](https://github.com/aptos-labs/aptos-core) - Aptos wallet integration
- [@cosmjs/stargate](https://github.com/cosmos/cosmjs) - Cosmos wallet integration
- [@account-kit/react](https://accountkit.alchemy.com/) - Smart wallet functionality

### Supported Wallets
- MetaMask (Ethereum)
- Phantom (Solana)
- Petra (Aptos)
- Leap (Cosmos)
- Rabby (Ethereum)

## Prerequisites

Before running this project, make sure you have:

- Node.js 18.x or later
- npm or yarn package manager


## Installation

1. Clone the repository:
```bash
git clone https://github.com/rajputanuj31/wallet-linker
cd wallet-linker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with required environment variables:
```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure


## Usage

1. Visit the homepage
2. Click "Connect Wallet" to connect your preferred blockchain wallet
3. Or click "Create a Smart Wallet" to create a new smart wallet
4. View wallet details and balances
5. Send transactions across different chains

## Contributing


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Alchemy](https://www.alchemy.com/) for Account Kit
- All wallet providers for their SDKs and documentation
