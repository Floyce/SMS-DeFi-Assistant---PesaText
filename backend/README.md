# PesaText Backend API

This is the Rust backend for **PesaText** — a DeFi assistant bridging SMS-based users to the Stellar blockchain/Soroban smart contracts.

## Architecture

- **Web Server**: Actix-web
- **Database**: SQLite with SQLx (async queries and migrations)
- **SMS Gateway**: Africa's Talking sandbox webhook parsing SMS commands
- **Blockchain Interface**: Stellar client invoking mock/live Soroban smart contracts

## Tech Stack & Dependencies

- Rust (edition 2021)
- `actix-web` - Web server framework
- `sqlx` - Async SQLite access
- `serde` / `serde_json` - JSON serialization/deserialization
- `chrono` - Date and time handling
- `tracing` / `tracing-subscriber` - Structured logging

## Environment Setup

Create a `.env` file in the root of the `backend/` directory:

```env
PORT=8000
DATABASE_URL=sqlite://pesatext.db
AFRICAS_TALKING_API_KEY=your_api_key_here
AFRICAS_TALKING_USERNAME=your_username_here
AFRICAS_TALKING_SHORTCODE=your_shortcode_here
SOROBAN_CONTRACT_ID=your_soroban_contract_id
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
```

## Running the Server Locally

Ensure you have Rust and SQLite installed, then run:

```bash
cargo run
```

The server binds to `0.0.0.0:8000` (configurable via `PORT` env var).

## API Endpoints

### Public / Webhook Endpoints
- `GET /api/health` - Health check
- `POST /api/sms` - Africa's Talking SMS webhook receiver

### Admin APIs (`/api/admin/...`)
- `GET /api/admin/stats` - Retrieve dashboard stats
- `GET /api/admin/users` - List all registered users
- `GET /api/admin/transactions` - List all system transactions
- `GET /api/admin/deposits/pending` - List pending savings deposits (M-Pesa deposits awaiting confirmation)
- `GET /api/admin/loans` - List all user loans
- `POST /api/admin/deposits/confirm` - Confirm M-Pesa deposit and release XLM tokens to user
- `POST /api/admin/repay/manual` - Manually record loan repayment
- `POST /api/admin/users/invite` - Invite and register a new user manually
