# PesaText — SMS-Based DeFi Assistant

> **Bridging M-Pesa to Stellar DeFi, one SMS at a time.**

PesaText is an SMS-based DeFi assistant designed for Kenyan feature phone users, bridging the gap between M-Pesa mobile money and decentralized finance (DeFi) on the Stellar/Soroban network.

Users interact entirely via SMS — no smartphone required. Admins manage the system through a React web dashboard.

---

## Project Structure

```
SMS-DeFi-Assistant---PesaText/
│
├── admin-dashboard/          # React + TypeScript + Tailwind Admin UI
│   ├── src/
│   │   ├── components/       # Reusable UI components (tables, modals, layout)
│   │   ├── pages/            # 6 core pages: Dashboard, Users, Transactions, Deposits, Loans, SMS, Settings
│   │   ├── services/         # apiService.ts — real axios-based backend API client
│   │   ├── types/            # TypeScript interfaces matching backend models
│   │   └── utils/            # Currency/phone formatters, constants
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                  # Rust/Actix-web API server
│   ├── src/
│   │   ├── main.rs           # Server entry point
│   │   ├── handlers/         # HTTP request handlers (sms_handler, admin_handler, health_handler)
│   │   ├── services/         # Business logic (sms_parser, loan_service, stellar_client)
│   │   ├── models/           # Data structs (User, Loan, Transaction)
│   │   ├── db/               # SQLite operations via sqlx
│   │   ├── config/           # Settings loaded from .env
│   │   └── utils/            # currency_converter, phone_formatter
│   ├── tests/                # Integration tests
│   ├── .env.example
│   ├── railway.json          # Railway deployment config
│   └── Cargo.toml
│
├── contract/                 # Soroban smart contract (Rust)
│
├── docs/                     # Architecture diagrams and documentation
│
├── CONTRIBUTING.md           # Code style, naming conventions, branch strategy
└── README.md                 # This file
```

---

## Tech Stack

### Admin Dashboard (Frontend)
| Tool | Purpose |
|------|---------|
| React 19 + TypeScript | UI framework |
| Vite 5 | Build tool + dev server |
| Tailwind CSS 3 | Utility-first styling |
| React Router 6 | Client-side routing |
| Axios | HTTP API client |
| Recharts | Interactive charts |
| Lucide React | Icon library |

### Backend (API Server)
| Tool | Purpose |
|------|---------|
| Rust + Actix-web 4 | HTTP server framework |
| SQLx + SQLite | Async database queries |
| Africa's Talking | SMS gateway webhook handling |
| Serde | JSON serialization |
| Chrono | Date and time handling |
| Tracing | Structured logging |

---

## Getting Started

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your Africa's Talking sandbox credentials
cargo run
```

The backend starts at `http://localhost:8000`.

### 2. Admin Dashboard

```bash
cd admin-dashboard
cp .env.example .env
# VITE_API_URL=http://localhost:8000/api/admin
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## SMS Commands

Users send these SMS messages to the PesaText Africa's Talking sandbox number:

| Command | Description |
|---------|-------------|
| `REGISTER [Name]` | Register a new PesaText account |
| `BALANCE` | Check savings balance and outstanding loan |
| `SAVE [KES]` | Initiate a savings deposit (M-Pesa paybill) |
| `BORROW [KES]` | Request a microloan (5% interest, 30 days) |
| `REPAY [KES]` | Repay loan from savings balance |
| `HELP` | List all available commands |

---

##Complete User Flow Diagram

web application/stitch/projects/16068510862007188066/screens/6b111fcbc87148aa9446f5d75fd940ed

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/sms` | Africa's Talking SMS webhook |

### Admin Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/transactions` | List all transactions |
| GET | `/api/admin/deposits/pending` | List pending M-Pesa deposits |
| GET | `/api/admin/loans` | List all loans |
| POST | `/api/admin/deposits/confirm` | Confirm a pending deposit |
| POST | `/api/admin/repay/manual` | Manually record a loan repayment |
| POST | `/api/admin/users/invite` | Invite and register a user |

---

## Deployment

The backend is configured for [Railway](https://railway.app) via `backend/railway.json`.

Set these environment variables in Railway:
- `DATABASE_URL`
- `AFRICAS_TALKING_API_KEY`
- `AFRICAS_TALKING_USERNAME`
- `AFRICAS_TALKING_SHORTCODE`
- `SOROBAN_CONTRACT_ID`
- `STELLAR_RPC_URL`

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for full code style and contribution guidelines.

---

*Built for the 80% without smartphones. PesaText — DeFi via SMS.*
>>>>>>> dff00dd (docs: add project scaffold with README, CI workflow, and documentation)
