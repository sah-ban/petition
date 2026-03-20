<p align="center">
  <img src="public/logo.png" alt="BasePetition Logo" width="80" height="80" />
</p>

<h1 align="center">BasePetition</h1>

<p align="center">
  <strong>Create &amp; Sign Petitions On-Chain</strong>
</p>

<p align="center">
  <a href="https://base.org"><img src="https://img.shields.io/badge/Built_on-Base-0052FF?style=for-the-badge&logo=coinbase&logoColor=white" alt="Built on Base" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  A decentralized petition platform on <strong>Base</strong> where every signature is a blockchain transaction — transparent, immutable, and verifiable by anyone.
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📝 **On-Chain Petitions** | Create petitions with custom titles, descriptions, images, target goals, and deadlines |
| ✍️ **Immutable Signatures** | Every signature is a blockchain transaction — tamper-proof and permanent |
| 📊 **User Dashboard** | Manage your petitions and track progress in real-time |
| 🔍 **Verifiable Proof** | Anyone can verify petition authenticity and signers directly on Base |
| 🖼️ **Farcaster Mini App** | Works as a mini app in Farcaster |
| ❓ **FAQ** | Built-in guidance and answers to common questions |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router) · TypeScript · [Tailwind CSS v4](https://tailwindcss.com/) |
| **Web3** | [Wagmi](https://wagmi.sh/) · [Viem](https://viem.sh/) · [TanStack Query](https://tanstack.com/query/latest) |
| **Blockchain** | [Base](https://base.org/) (Ethereum L2) |
| **Storage** | [Pinata](https://www.pinata.cloud/) (IPFS for metadata & images) |
| **Social** | [Farcaster Mini App SDK](https://docs.farcaster.xyz/) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Web3 wallet (MetaMask, Coinbase Wallet, etc.) connected to the **Base** network

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sah-ban/petition
cd petition

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Then fill in the values (see Environment Variables below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

> [!TIP]
> For testing as a Farcaster Mini App locally, use [Cloudflare Tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) to expose your local server:
> ```bash
> cloudflared tunnel run yourappname
> ```

### Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Public-facing URL of your app (e.g. `http://localhost:3000`) |
| `PINATA_JWT` | Pinata JWT token for IPFS uploads |
| `BASE_RPC_URL` | Base network RPC endpoint |

---

## 📜 Smart Contract

The core logic lives in a Solidity smart contract deployed on **Base**. It handles:

- ✅ Petition creation and lifecycle management
- ✅ Secure, on-chain signature collection
- ✅ Paginated data retrieval for scalability
- ✅ Owner controls and configurable creation fees

> **Contract Address:** [`0x190280297e94e7f9AeBf411d51d85688d93c9Fa8`](https://basescan.org/address/0x190280297e94e7f9AeBf411d51d85688d93c9Fa8)

The full contract source is also available at [`lib/contract.sol`](lib/contract.sol).

---

## 📂 Project Structure

```
petition/
├── app/
│   ├── api/                  # API routes (IPFS upload, etc.)
│   ├── create/               # Petition creation page
│   ├── petition/[id]/        # Individual petition view & signing
│   ├── my-petitions/         # User dashboard
│   ├── faq/                  # FAQ page
│   ├── farcaster-image/      # OG images for Farcaster mini app
│   ├── .well-known/          # Farcaster manifest
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   ├── providers.tsx         # Web3 & query providers
│   ├── globals.css           # Global styles
│   └── opengraph-image.tsx   # OG image
├── components/
│   ├── AdminPanel.tsx        # Admin moderation panel
│   ├── BottomNav.tsx         # Mobile bottom navigation
│   ├── CustomConnectButton.tsx # Wallet connect button
│   ├── Header.tsx            # App header
│   └── PetitionCard.tsx      # Petition card component
├── lib/
│   ├── contract.sol          # Solidity smart contract source
│   ├── contract.ts           # ABI, addresses & contract config
│   └── attribution.ts       # Builder code attribution helper
└── public/                   # Static assets (logo, OG images, etc.)
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ on <a href="https://base.org">Base</a>
</p>
