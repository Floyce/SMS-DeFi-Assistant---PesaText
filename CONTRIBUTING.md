Here is your **complete, production-grade CONTRIBUTING.md** file. Copy and paste this directly into your repository.

---

```markdown
# Contributing to PesaText

First off, thank you for contributing to PesaText. This document outlines the rules and guidelines for contributing to this project. Following these rules ensures that the codebase remains clean, maintainable, and reviewable.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [Naming Conventions](#naming-conventions)
- [Git Branch Strategy](#git-branch-strategy)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Code Review Checklist](#code-review-checklist)
- [File Headers](#file-headers)
- [Import Order](#import-order)
- [Environment Variables](#environment-variables)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Questions](#questions)

---

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and constructive in all communications
- Accept constructive criticism gracefully
- Focus on what is best for the project
- Show empathy towards other contributors

Violations of the code of conduct will result in removal from the project.

---

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Rust | 1.70+ | Smart contract and backend |
| Cargo | Latest | Rust package manager |
| Node.js | 18+ | Frontend development |
| npm | 9+ | Frontend package manager |
| Git | 2.25+ | Version control |
| Stellar CLI | 21.0.0 | Contract deployment |

### First Time Setup

```bash
# Clone the repository
git clone https://github.com/Floyce/SMS-DeFi-Assistant---PesaText.git
cd SMS-DeFi-Assistant---PesaText

# Install frontend dependencies
cd admin-dashboard
npm install

# Install backend dependencies (when ready)
cd ../backend
cargo build

# Install contract dependencies (when ready)
cd ../contract
cargo build
```

### Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Never commit your .env file. It is already in .gitignore.

---

## Folder Structure

```
SMS-DeFi-Assistant---PesaText/
│
├── admin-dashboard/          # Frontend (Floyce + Jones)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page-level components (6 pages)
│   │   ├── services/         # API calls and mock data
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # Helper functions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
│
├── contract/                 # Smart contract (Amir)
│   ├── src/
│   │   ├── lib.rs            # Main contract logic
│   │   ├── storage.rs        # DataKey and storage functions
│   │   ├── test.rs           # Contract tests
│   │   └── errors.rs         # Custom error types
│   ├── Cargo.toml
│   └── .env.example
│
├── backend/                  # Backend API (Jones)
│   ├── src/
│   │   ├── main.rs           # Entry point
│   │   ├── handlers/         # HTTP request handlers
│   │   ├── services/         # Business logic
│   │   ├── models/           # Data structures
│   │   ├── db/               # Database operations
│   │   ├── config/           # Settings and env vars
│   │   └── utils/            # Helper functions
│   ├── tests/                # Integration tests
│   ├── Cargo.toml
│   └── .env.example
│
├── docs/                     # Documentation
│   ├── architecture/
│   ├── design/
│   └── pitch/
│
├── .github/
│   └── workflows/            # CI/CD pipelines
│
├── .gitignore
├── .env.example
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Naming Conventions

### Directories

| Type | Convention | Example |
|------|------------|---------|
| All directories | lowercase with hyphens | `admin-dashboard/`, `smart-contract/` |
| Source folders | lowercase | `src/`, `components/`, `services/` |

### Files

| File Type | Convention | Example |
|-----------|------------|---------|
| React components | PascalCase | `UsersTable.tsx`, `ConfirmModal.tsx` |
| React pages | PascalCase | `Dashboard.tsx`, `Settings.tsx` |
| Rust modules | snake_case | `stellar_client.rs`, `sms_parser.rs` |
| TypeScript types | camelCase | `user.ts`, `transaction.ts` |
| Utility files | camelCase | `formatters.ts`, `constants.ts` |
| Test files | same as file + `.test` | `sms_handler.test.rs` |
| Config files | lowercase | `vite.config.ts`, `tailwind.config.js` |

### Variables

| Language | Convention | Example |
|----------|------------|---------|
| TypeScript (variables) | camelCase | `userBalance`, `phoneNumber` |
| TypeScript (constants) | UPPER_SNAKE_CASE | `MAX_LOAN_MULTIPLIER`, `INTEREST_RATE` |
| TypeScript (functions) | camelCase | `formatCurrency()`, `getUserByPhone()` |
| TypeScript (interfaces) | PascalCase | `User`, `Transaction`, `Loan` |
| TypeScript (types) | PascalCase | `UserStatus`, `TransactionType` |
| Rust (variables) | snake_case | `user_balance`, `phone_number` |
| Rust (functions) | snake_case | `register_user()`, `get_balance()` |
| Rust (structs) | PascalCase | `User`, `Loan`, `Transaction` |
| Rust (enums) | PascalCase | `DataKey`, `Command` |

---

## Git Branch Strategy

### Branch Naming

| Branch Type | Format | Example |
|-------------|--------|---------|
| Main branch | `main` | Protected, no direct commits |
| Feature branch | `feature/name/task` | `feature/floyce/dashboard-ui` |
| Fix branch | `fix/description` | `fix/sms-parser-bug` |
| Contract branch | `contract/name` | `contract/register-function` |
| Backend branch | `backend/name` | `backend/twilio-webhook` |
| Frontend branch | `frontend/name` | `frontend/users-table` |

### Branch Protection Rules (Main Branch)

- Direct commits to main are forbidden
- All changes require a Pull Request
- Minimum 1 reviewer approval required
- All status checks must pass before merge
- Branches must be up to date with main before merging

### Creating a Branch

```bash
# Always branch from main
git checkout main
git pull origin main
git checkout -b feature/your-name/task-description
```

### Branch Ownership

| Owner | Prefix | Example |
|-------|--------|---------|
| Floyce | `feature/floyce/` | `feature/floyce/dashboard-layout` |
| Amir | `contract/` | `contract/register-function` |
| Jones | `backend/` or `frontend/` | `backend/twilio-webhook` |

---

## Commit Message Format

### Structure

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code change that neither fixes nor adds feature |
| `test` | Adding or fixing tests |
| `chore` | Maintenance tasks, dependencies, config files |

### Scopes

| Scope | When to Use |
|-------|-------------|
| `contract` | Changes to smart contract |
| `backend` | Changes to backend API |
| `frontend` | Changes to admin dashboard |
| `db` | Database schema or queries |
| `sms` | Twilio or SMS handling |
| `auth` | Authentication or permissions |
| `config` | Configuration files |
| `deps` | Dependency updates |
| `docs` | Documentation updates |

### Examples

```
feat(contract): implement register_user function

- Add phone to name mapping in storage
- Store user data with timestamp
- Return bool indicating success/failure

Reviewed-by: Amir
Closes #12
```

```
fix(backend): correct SMS parser for REGISTER command

The parser was trimming spaces incorrectly, causing
registration to fail when users added extra spaces.

Test added to prevent regression.
```

```
docs(readme): add deployment instructions for Railway
```

```
style(frontend): format UsersTable component with prettier
```

### Commit Rules

- Short description: 50 characters or less
- Body: 72 characters per line maximum
- Use imperative mood ("add" not "added" or "adds")
- Do not end short description with a period
- Reference issues with `#123` in footer

---

## Pull Request Process

### Creating a Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin feature/your-name/task-description
   ```

2. Open GitHub and navigate to the repository

3. Click "Pull Requests" → "New Pull Request"

4. Select `main` as base and your branch as compare

5. Fill in the PR template (see below)

6. Request a reviewer:
   - Contract changes → request Amir
   - Backend changes → request Jones
   - Frontend changes → request Floyce

7. Add labels: `feature`, `bug`, `documentation`, etc.

8. Click "Create Pull Request"

### Pull Request Template

Copy this template into the PR description:

```markdown
## Description

[Describe what this PR does]

## Type of Change

- [ ] feat (new feature)
- [ ] fix (bug fix)
- [ ] docs (documentation)
- [ ] style (formatting)
- [ ] refactor (no functional change)
- [ ] test (adding tests)
- [ ] chore (maintenance)

## Testing

- [ ] Tests pass locally
- [ ] Manual testing completed

## Checklist

- [ ] Code follows naming conventions
- [ ] No console.log or println statements
- [ ] No commented-out code
- [ ] File headers present
- [ ] Imports grouped correctly
- [ ] No TypeScript `any` type (frontend)
- [ ] No Rust `unwrap()` without comment (contract/backend)

## Related Issues

Closes #[issue_number]
```

### PR Review Rules

| Rule | Description |
|------|-------------|
| Minimum reviewers | 1 |
| Review time | Within 24 hours |
| Merge requirements | All checks pass, PR is approved |
| Self-merge | Allowed after approval |
| PR size | Keep under 400 lines when possible |

---

## Code Review Checklist

Reviewers must verify these items before approving:

### General

- [ ] Code follows naming conventions
- [ ] No debug prints (`console.log`, `println!`)
- [ ] No commented-out code blocks
- [ ] File header is present and correct
- [ ] No merge conflicts with main

### Frontend (admin-dashboard/)

- [ ] No TypeScript `any` types
- [ ] Components use proper props interfaces
- [ ] Tailwind classes are consistent
- [ ] No inline styles
- [ ] Components are reusable where appropriate

### Contract (contract/)

- [ ] All storage accesses use proper DataKey enums
- [ ] All public functions require authentication where needed
- [ ] Panic messages are descriptive
- [ ] Integer operations are safe from overflow
- [ ] Tests cover edge cases

### Backend (backend/)

- [ ] All API routes have appropriate error handling
- [ ] Database queries use parameter binding (no injection risk)
- [ ] Environment variables are used for secrets
- [ ] Async operations use proper await patterns

---

## File Headers

Every source file must start with a header comment.

### TypeScript/React (admin-dashboard/)

```typescript
/**
 * PesaText - Admin Dashboard
 * 
 * File: components/Users/UsersTable.tsx
 * Description: Displays list of registered users with actions
 * Author: Floyce
 * Created: 2025-06-03
 * Last Modified: 2025-06-03
 */
```

### Rust (contract/ and backend/)

```rust
//! PesaText - Smart Contract
//! 
//! File: contract/src/lib.rs
//! Description: Core contract logic for user registration, deposits, and loans
//! Author: Amir
//! Created: 2025-06-03
//! Last Modified: 2025-06-03
```

---

## Import Order

### TypeScript (admin-dashboard/)

```typescript
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// 2. Third-party UI components
import { format } from 'date-fns';

// 3. Local components
import { UsersTable } from '../components/Users/UsersTable';
import { StatsCards } from '../components/Layout/StatsCards';

// 4. Services and utilities
import { fetchUsers } from '../services/api';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';

// 5. Types and constants
import { User, Transaction } from '../types';
import { API_BASE_URL, INTEREST_RATE } from '../utils/constants';

// 6. Styles
import './Dashboard.css';
```

### Rust (contract/ and backend/)

```rust
// 1. External crates
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};
use stellar_sdk as sdk;

// 2. Internal crate modules
use crate::storage::{DataKey, User, Loan};
use crate::errors::ContractError;
use crate::events::{emit_deposit, emit_loan};

// 3. Super module (test only)
#[cfg(test)]
use super::test::mock_env;
```

---

## Environment Variables

### Variable Naming

| Project | Prefix | Example |
|---------|--------|---------|
| Frontend | `VITE_` | `VITE_API_URL=http://localhost:8000` |
| Backend | No prefix | `TWILIO_ACCOUNT_SID=ACxxx` |
| Contract | No prefix | `STELLAR_CONTRACT_ID=CAxxx` |

### Required Variables

**Frontend (.env)**
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

**Backend (.env)**
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+254712345678
STELLAR_NETWORK=testnet
STELLAR_CONTRACT_ID=your_contract_id
STELLAR_ADMIN_SECRET=your_secret_key
DATABASE_URL=postgresql://user:pass@localhost/pesatext
RUST_LOG=info
```

**Contract (.env)**
```
STELLAR_NETWORK=testnet
STELLAR_ADMIN_SECRET=your_secret_key
```

### Rules

- Always commit `.env.example` with placeholder values
- Never commit `.env` (it is in .gitignore)
- Document any new environment variable in README.md

---

## Testing Requirements

### Frontend Tests

```bash
cd admin-dashboard
npm test
```

- Unit tests for utility functions
- Component tests for critical UI
- Minimum 50% coverage for utils/

### Contract Tests

```bash
cd contract
cargo test
```

- 5 passing tests minimum
- Coverage for: register, deposit, withdraw, borrow, repay
- Edge cases (insufficient balance, maximum loan limits)

### Backend Tests

```bash
cd backend
cargo test
```

- Unit tests for SMS parser
- Integration tests for database
- Mock Stellar client for contract interaction tests

### Test Naming

| Test Type | Naming Convention | Example |
|-----------|-------------------|---------|
| Unit test | `test_<function>_<scenario>` | `test_register_user_success` |
| Integration | `test_<feature>_flow` | `test_deposit_confirm_flow` |
| Edge case | `test_<function>_<error_case>` | `test_borrow_insufficient_balance` |

---

## Documentation

### When to Update Documentation

- New feature → update README
- API change → update API documentation
- Environment variable added → update .env.example and README
- Architecture change → update architecture diagram

### Documentation Location

| Topic | Location |
|-------|----------|
| Project overview | README.md |
| Contributing rules | CONTRIBUTING.md |
| Architecture | docs/architecture/ |
| API endpoints | backend/README.md |
| Contract methods | contract/README.md |
| Setup instructions | README.md |

---

## Questions?

If anything in this guide is unclear, ask in the group chat

Do not guess. Ask before making big changes.

---

Thank you for contributing to PesaText. Together we are building DeFi for the 80 percent without smartphones.

```

---

This is the complete CONTRIBUTING.md file. Copy it, paste it into your repository, and commit. Every rule is documented. No ambiguity.
