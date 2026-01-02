# Forgetless Wallet UI

A modern, passkey-based crypto wallet interface built on Base Sepolia. Forgetless Wallet uses WebAuthn passkeys for secure, passwordless authentication and transaction signing.

## Features

- **Passkey Authentication** - Secure wallet creation and transaction signing using WebAuthn biometrics
- **Multi-Asset Support** - ETH, USDC, USDT, DAI, and WETH
- **Deposit & Withdraw** - Send and receive funds with credential-based routing
- **Transaction History** - View all deposits and withdrawals with status tracking
- **Dark Mode** - Glacier-themed UI with full dark mode support
- **Responsive Design** - Mobile-first design that works on all devices

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query

## Development

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Setup

```bash
# Clone the repository
git clone https://github.com/forgetless/wallet-ui.git
cd wallet-ui

# Install dependencies
bun install

# Start development server
bun run dev
```

The app will be available at `http://localhost:8080`.

### Scripts

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `bun run dev`          | Start development server     |
| `bun run build`        | Build for production         |
| `bun run preview`      | Preview production build     |
| `bun run typecheck`    | Run TypeScript type checking |
| `bun run lint`         | Run ESLint                   |
| `bun run lint:fix`     | Run ESLint with auto-fix     |
| `bun run format`       | Format code with Prettier    |
| `bun run format:check` | Check code formatting        |

### Code Quality

This project enforces strict code quality standards:

- **TypeScript**: Maximum strict mode enabled
- **ESLint**: Strict type-checked rules with Prettier integration
- **Prettier**: Automatic code formatting with Tailwind class sorting
- **Husky**: Pre-commit hooks run typecheck and lint-staged
- **semantic-release**: Automated versioning based on conventional commits

## Project Structure

```
src/
├── components/
│   ├── layout/         # Header, Footer, PageContainer
│   ├── ui/             # shadcn/ui components
│   └── wallet/         # Wallet-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utilities, constants, types
└── pages/              # Route pages
    ├── Landing.tsx     # Home page
    ├── Register.tsx    # Wallet creation
    ├── Dashboard.tsx   # Wallet overview
    ├── Deposit.tsx     # Receive funds
    ├── Withdraw.tsx    # Send funds
    └── History.tsx     # Transaction history
```

## Network

Currently configured for **Base Sepolia** testnet.

## License

MIT
