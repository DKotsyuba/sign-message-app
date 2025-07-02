# Sign Message App

## Features
- **Multi-wallet Support**: Connect to Xverse (Bitcoin) and Phantom (Solana/Bitcoin) wallets
- **Wallet Management**: 
  - Connect/disconnect wallets
  - Switch between connected wallets
  - View wallet addresses and networks
  - Auto-reconnect on page reload
- **Message Signing**:
  - Sign predefined messages with connected wallets
  - Verify message signatures
  - Copy signatures to clipboard
- **User Experience**:
  - Responsive design for all device sizes
  - Dark/light mode support
  - Clear status indicators and error messages
  - Intuitive UI with Chakra UI components

## Tech Stack
- **Frontend**: React 18 with TypeScript
- **State Management**: Custom hooks with React Context
- **UI Library**: Chakra UI for responsive and accessible components
- **Build Tool**: Vite for fast development and optimized production builds
- **Code Quality**: ESLint and Prettier for code formatting and linting
- **Wallet Integration**: 
  - Native wallet driver implementations
  - Support for Bitcoin and Solana networks

## Architecture

### Module Structure
The application follows a modular architecture with clear separation of concerns:

1. **Components**: UI components for the application
   - `WalletConnector.tsx`: Manages wallet connection UI
   - `MessageSigner.tsx`: Handles message signing UI

2. **Hooks**: Custom React hooks for business logic
   - `useConnectWallet.ts`: Core hook for wallet connection management
   - `wallet-drivers/`: Individual wallet driver implementations
     - `usePhantomSolanaWalletDriver.ts`: Phantom Solana wallet integration
     - `usePhantomBitcoinWalletDriver.ts`: Phantom Bitcoin wallet integration
     - `useXverseBitcoinWalletDriver.ts`: Xverse Bitcoin wallet integration

3. **Models**: TypeScript interfaces and types
   - `ConnectWalletDriver.ts`: Interface for wallet drivers

4. **Utils**: Utility functions
   - Signature verification utilities
   - Address formatting utilities

### Data Flow
1. Wallet drivers detect and connect to browser wallet extensions
2. The `useConnectWallet` hook manages wallet state and provides a unified interface
3. UI components consume the hook to display wallet information and enable interactions
4. Local storage persists connection state for auto-reconnect functionality

## Adding New Wallets
To add support for a new wallet:

1. Create a new wallet driver in `src/hooks/wallet-drivers/` following the `ConnectWalletDriver` interface
2. Implement required methods:
   - `connect()`: Connect to the wallet
   - `disconnect()`: Disconnect from the wallet
   - `signMessage()`: Sign messages with the wallet
   - `verifySignature()`: Verify signatures
   - `getAddress()`: Get the wallet address

3. Add the new wallet driver to the `walletDrivers` array in `useConnectWallet.ts`
4. The UI will automatically include the new wallet in the wallet list

## Error Handling
The application implements comprehensive error handling:

1. **Connection Errors**:
   - Wallet not detected/installed
   - User rejected connection
   - Network errors

2. **Signing Errors**:
   - User rejected signing
   - Wallet disconnected during signing
   - Invalid message format

3. **Verification Errors**:
   - Invalid signature format
   - Signature verification failure

All errors are captured and displayed to the user with clear messages and recovery options.

## Getting Started

### Installation
```bash
# Clone the repository
git clone git@github.com:DKotsyuba/sign-message-app.git
cd sign-message-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development
```bash
# Run linting
npm run lint

# Format code
npm run format
```

## License
MIT