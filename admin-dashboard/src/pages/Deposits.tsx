/**
 * PesaText - Admin Dashboard
 * 
 * File: pages/Deposits.tsx
 * Description: Page displaying pending deposits with verifying & confirmation actions
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React, { useState, useEffect } from 'react';

// 2. Third-party UI components
import { AlertCircle, Loader2 } from 'lucide-react';

// 3. Local components
import PendingDepositsPanel from '../components/Deposits/PendingDepositsPanel';
import ConfirmDepositModal from '../components/Users/ConfirmDepositModal';

// 4. Services and utilities
import { apiService } from '../services/apiService';

// 5. Types and constants
import { Transaction } from '../types/transaction';

const Deposits: React.FC = () => {
  const [pendingDeposits, setPendingDeposits] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingDeposits = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPendingDeposits();
      setPendingDeposits(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the PesaText backend API.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDeposits();
    const interval = setInterval(() => fetchPendingDeposits(true), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      
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
            <span className="text-xs font-semibold font-mono">Loading pending deposits...</span>
          </div>
        </div>
      ) : (
        /* Deposits Panel */
        <PendingDepositsPanel 
          pendingDeposits={pendingDeposits}
          onConfirmDeposit={(tx) => setSelectedTx(tx)}
        />
      )}

      {/* Confirmation Modal */}
      {selectedTx && (
        <ConfirmDepositModal
          pendingTx={selectedTx}
          onClose={() => setSelectedTx(null)}
          onSuccess={fetchPendingDeposits}
        />
      )}

    </div>
  );
};

export default Deposits;
