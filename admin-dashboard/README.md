# PesaText Admin Dashboard

A premium React + TypeScript admin dashboard for the **PesaText** DeFi Assistant — bridging SMS users to the Stellar blockchain.

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 5.8 | Type safety |
| Vite | 5.4 | Build tool + dev server |
| Tailwind CSS | 3.x | Styling |
| Axios | 1.x | HTTP API client |
| React Router | 6.x | Client-side routing |

## Features

- 📊 **Dashboard** — Real-time stats: total users, deposits, loans, volume
- 👥 **Users** — View all registered PesaText users and their Stellar wallets
- 💸 **Transactions** — Full audit trail of deposits, loans, and repayments
- 🏦 **Deposits** — Confirm pending M-Pesa deposits and release XLM
- 🏷 **Loans** — View active, repaid, and overdue loans
- 📱 **SMS Simulator** — Test SMS command flows (REGISTER, BALANCE, SAVE, BORROW, REPAY)
- ⚙️ **Settings** — View system configuration

## Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:8000/api/admin
```

## Running Locally

```bash
npm install
npm run dev
```

The dashboard runs at `http://localhost:5173`.

## Building for Production

```bash
npm run build
```

Output is in the `dist/` folder.

## Project Structure

```
admin-dashboard/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components (6 pages)
│   ├── services/         # apiService.ts — real backend API calls
│   ├── types/            # TypeScript interfaces (User, Transaction, Loan)
│   ├── utils/            # Helper functions
│   ├── App.tsx           # Root app with router
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles + Tailwind directives
├── public/
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

## API Integration

All API calls go through `src/services/apiService.ts`, which connects to the backend at `VITE_API_URL`.

If the backend is not running, the dashboard shows error states with clear messages.

## Contributing

See the project-root [CONTRIBUTING.md](../CONTRIBUTING.md) for naming conventions, file headers, import order rules, and PR guidelines.
