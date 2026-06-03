/**
 * PesaText - Admin Dashboard
 * 
 * File: services/apiService.ts
 * Description: Real API service layer for PesaText Admin Dashboard via axios
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

import axios, { AxiosError } from 'axios';

import { User } from '../types/user';
import { Transaction } from '../types/transaction';
import { Loan } from '../types/loan';

// ---------------------------------------------------------------------------
// Axios instance configured from environment
// ---------------------------------------------------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/admin';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Error helper
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  status: number;
  isBackendDown: boolean;

  constructor(message: string, status: number, isBackendDown = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isBackendDown = isBackendDown;
  }
}

function handleAxiosError(error: unknown): never {
  if (error instanceof AxiosError) {
    if (!error.response) {
      throw new ApiError(
        'Backend server is not reachable. Please ensure the Rust backend is running.',
        0,
        true
      );
    }
    throw new ApiError(
      error.response.data?.toString() || error.message,
      error.response.status
    );
  }
  throw new ApiError('An unexpected error occurred.', 500);
}

// ---------------------------------------------------------------------------
// Backend response types (matching the Rust structs)
// ---------------------------------------------------------------------------
export interface BackendUser {
  id: number | null;
  phone: string;
  name: string;
  stellar_address: string;
  created_at: string;
}

// Keep the rest unchanged up to line 260


export interface BackendTransaction {
  id: number | null;
  user_phone: string;
  tx_type: string;
  amount_stroops: number;
  status: string;
  reference_code: string;
  created_at: string;
}

export interface BackendLoan {
  id: number | null;
  user_phone: string;
  principal_stroops: number;
  interest_stroops: number;
  status: string;
  issued_at: string;
  due_at: string;
}

export interface BackendPendingDeposit {
  id: number;
  reference_code: string;
  phone: string;
  amount_kes: number;
  est_xlm: number;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_deposits_xlm: number;
  active_loans_count: number;
  total_volume_kes: number;
}

// ---------------------------------------------------------------------------
// Adapters: convert backend shapes → frontend shapes
// ---------------------------------------------------------------------------
function adaptUser(backendUser: BackendUser): User {
  return {
    id: backendUser.id ?? 0,
    phone: backendUser.phone,
    name: backendUser.name,
    stellar_address: backendUser.stellar_address,
    created_at: backendUser.created_at,
    balance_stroops: '0', // Balance comes from Soroban contract, not DB yet
    status: 'Active',     // Status will be computed when loans are available
  };
}

function adaptTransaction(backendTx: BackendTransaction): Transaction {
  return {
    id: backendTx.id ?? 0,
    user_phone: backendTx.user_phone,
    tx_type: backendTx.tx_type as Transaction['tx_type'],
    amount_stroops: backendTx.amount_stroops.toString(),
    status: backendTx.status as Transaction['status'],
    reference_code: backendTx.reference_code,
    created_at: backendTx.created_at,
  };
}

function adaptLoan(backendLoan: BackendLoan): Loan {
  return {
    id: backendLoan.id ?? 0,
    user_phone: backendLoan.user_phone,
    principal_stroops: backendLoan.principal_stroops.toString(),
    interest_stroops: backendLoan.interest_stroops.toString(),
    status: backendLoan.status as Loan['status'],
    issued_at: backendLoan.issued_at,
    due_at: backendLoan.due_at,
  };
}

/**
 * Convert a BackendPendingDeposit into a Transaction shape for the frontend.
 * The frontend Deposits page expects Transaction[] for the pending list.
 */
function adaptPendingDeposit(deposit: BackendPendingDeposit): Transaction {
  const estStroops = Math.round(deposit.est_xlm * 10_000_000);
  return {
    id: deposit.id,
    user_phone: deposit.phone,
    tx_type: 'Deposit',
    amount_stroops: estStroops.toString(),
    status: 'Pending',
    reference_code: deposit.reference_code,
    created_at: deposit.created_at,
  };
}

// ---------------------------------------------------------------------------
// SMS Message type (kept for future use when SMS logs endpoint is ready)
// ---------------------------------------------------------------------------
export interface SmsMessage {
  id: number;
  phone: string;
  direction: 'inbound' | 'outbound';
  body: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// API Service — the single interface consumed by all page components
// ---------------------------------------------------------------------------
export const apiService = {
  // ── Users ────────────────────────────────────────────────────────────────
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get<BackendUser[]>('/users');
      return response.data.map(adaptUser);
    } catch (error) {
      handleAxiosError(error);
    }
  },

  getUserByPhone: async (phone: string): Promise<User | undefined> => {
    try {
      const users = await apiService.getUsers();
      return users.find((u) => u.phone === phone);
    } catch (error) {
      handleAxiosError(error);
    }
  },

  // ── Transactions ─────────────────────────────────────────────────────────
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await api.get<BackendTransaction[]>('/transactions');
      return response.data
        .map(adaptTransaction)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      handleAxiosError(error);
    }
  },

  // ── Pending Deposits ─────────────────────────────────────────────────────
  getPendingDeposits: async (): Promise<Transaction[]> => {
    try {
      const response = await api.get<BackendPendingDeposit[]>('/deposits/pending');
      return response.data.map(adaptPendingDeposit);
    } catch (error) {
      handleAxiosError(error);
    }
  },

  // ── Loans ────────────────────────────────────────────────────────────────
  getLoans: async (): Promise<Loan[]> => {
    try {
      const response = await api.get<BackendLoan[]>('/loans');
      return response.data.map(adaptLoan);
    } catch (error) {
      handleAxiosError(error);
    }
  },

  // ── Dashboard Stats ──────────────────────────────────────────────────────
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<DashboardStats>('/stats');
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  // ── Admin Operations ─────────────────────────────────────────────────────
  confirmDeposit: async (referenceCode: string): Promise<boolean> => {
    try {
      await api.post('/deposits/confirm', { reference_code: referenceCode });
      return true;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  manualRepayLoan: async (phone: string, amountKes: number): Promise<boolean> => {
    try {
      await api.post('/repay/manual', { phone, amount_kes: amountKes });
      return true;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  // ── SMS Logs (not yet implemented in backend) ────────────────────────────
  getSMSLogs: async (_phone: string): Promise<SmsMessage[]> => {
    // TODO: Implement when SMS logs endpoint is added to backend
    return [];
  },

  sendSMS: async (_phone: string, _body: string): Promise<any> => {
    throw new ApiError('Backend endpoint not yet implemented. Coming soon.', 501);
  },

  simulateReceiveSMS: async (phone: string, body: string, messageSid?: string): Promise<any> => {
    try {
      const smsApiUrl = API_BASE_URL.replace('/api/admin', '/api/sms');
      const params = new URLSearchParams();
      params.append('From', phone);
      params.append('Body', body);
      params.append('MessageSid', messageSid || 'AC' + Math.random().toString(36).substring(2, 10).toUpperCase());

      const response = await axios.post(smsApiUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  // ── Settings (not yet implemented in backend) ────────────────────────────
  getSystemSettings: async () => {
    return {
      interestRate: 0.05,
      twilioPhone: import.meta.env.VITE_TWILIO_PHONE || '+254712345678',
      stellarContractId: import.meta.env.VITE_CONTRACT_ID || 'Not configured',
      logs: ['Connect to backend to view live system logs.'],
    };
  },

  updateSystemSettings: async (settings: {
    interestRate: number;
    twilioPhone: string;
    stellarContractId: string;
  }) => {
    // TODO: Implement when settings endpoint is added to backend
    return {
      ...settings,
      logs: [`Settings updated locally (backend endpoint coming soon).`],
    };
  },
};

// Re-export as default name matching old import pattern
export const mockApiService = apiService;
