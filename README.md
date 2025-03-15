# Asset Tokenization Dashboard

A decentralized application (dApp) for tokenizing real-world assets using blockchain technology. This project allows users to create, manage, and trade tokenized assets while ensuring secure ownership verification and transparent transactions.

## Features

- 🔐 Wallet Connection (MetaMask)
- 📝 Asset Registration with IPFS Integration
- ✅ Ownership Verification
- 💰 Escrow & Payments System
- 📊 Asset Management Dashboard
- 🔄 Transaction History

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Ethers.js
- IPFS
- Framer Motion

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/venkatriteesh/asset-tokenization-dashboard.git
cd asset-tokenization-dashboard
```

2. Install dependencies:

```bash
npx pnpm install
```

3. Create a `.env` file in the root directory and add your environment variables:

```env
VITE_INFURA_IPFS_PROJECT_ID=your_ipfs_project_id
VITE_INFURA_IPFS_PROJECT_SECRET=your_ipfs_project_secret
VITE_ASSET_NFT_ADDRESS=your_contract_address
```

4. Start the development server:

```bash
npx pnpm dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/         # React components
├── utils/             # Utility functions
├── contracts/         # Smart contract ABIs and addresses
├── Dashboard.tsx      # Main dashboard component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Venkat Riteesh
Project Link: https://github.com/venkatriteesh/asset-tokenization-dashboard
