/**
 * PesaText - Admin Dashboard
 * 
 * File: pages/Transactions.tsx
 * Description: Page displaying transaction ledger with search and filters
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React, { useState, useEffect } from 'react';

// 2. Third-party UI components
import { AlertCircle, Loader2 } from 'lucide-react';

// 3. Local components
import TransactionsTable from '../components/Transactions/TransactionsTable';
import TransactionFilter from '../components/Transactions/TransactionFilter';

// 4. Services and utilities
import { apiService } from '../services/apiService';

// 5. Types and constants
import { Transaction } from '../types/transaction';

const Transactions: React.FC = () => {
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const data = await apiService.getTransactions();
      setTransactionsList(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the PesaText backend API.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(() => fetchTransactions(true), 10000);
    return () => clearInterval(interval);
  }, []);

  // Filtered transactions
  const filteredTxs = transactionsList.filter(tx => {
    const matchesSearch = 
      tx.user_phone.includes(searchQuery) ||
      tx.reference_code.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = 
      typeFilter === 'ALL' || 
      tx.tx_type === typeFilter;
      
    const matchesStatus = 
      statusFilter === 'ALL' || 
      tx.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Filters */}
      <TransactionFilter
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-card p-5 flex items-center gap-3 text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold">API Connection Issue: </span>
            {error}
          </div>
        </div>
      )}

      {loading && !error ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-card border border-slate-200 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-semibold font-mono">Loading transaction ledger...</span>
          </div>
        </div>
      ) : (
        /* Main Table */
        <div className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Transaction Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">Chronological record of SMS DeFi assistant operations and Soroban contract states</p>
            </div>
            <span className="text-xs font-semibold font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
              Showing {filteredTxs.length} of {transactionsList.length} Entries
            </span>
          </div>

          <TransactionsTable transactions={filteredTxs} />
        </div>
      )}

    </div>
  );
};

export default Transactions;
