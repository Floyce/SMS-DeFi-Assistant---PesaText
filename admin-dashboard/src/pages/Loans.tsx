/**
 * PesaText - Admin Dashboard
 * 
 * File: pages/Loans.tsx
 * Description: Page displaying DeFi micro-credit loans list and status summaries
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React, { useState, useEffect } from 'react';

// 2. Third-party UI components
import { AlertCircle, Loader2 } from 'lucide-react';

// 3. Local components
import LoansTable from '../components/Loans/LoansTable';
import ManualRepayModal from '../components/Loans/ManualRepayModal';

// 4. Services and utilities
import { apiService } from '../services/apiService';

// 5. Types and constants
import { Loan } from '../types/loan';

const Loans: React.FC = () => {
  const [loansList, setLoansList] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const data = await apiService.getLoans();
      setLoansList(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the PesaText backend API.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
    const interval = setInterval(() => fetchLoans(true), 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter out repaid loans for main statistics, count active & overdue
  const activeLoans = loansList.filter(l => l.status === 'Active');
  const overdueLoans = loansList.filter(l => l.status === 'Overdue');
  const repaidLoans = loansList.filter(l => l.status === 'Repaid');

  return (
    <div className="space-y-6">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-card border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Agreements</span>
          <span className="text-xl font-bold text-slate-800 mt-1 block">{activeLoans.length} Loans</span>
        </div>
        <div className="bg-white p-4 rounded-card border border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overdue Accounts</span>
          <span className="text-xl font-bold text-red-600 mt-1 block animate-pulse">{overdueLoans.length} Overdue</span>
        </div>
        <div className="bg-white p-4 rounded-card border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cleared Contracts</span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">{repaidLoans.length} Repaid</span>
        </div>
      </div>

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
            <span className="text-xs font-semibold font-mono">Loading credit directory...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Main Table */}
          <div className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">DeFi Credit Directory</h3>
                <p className="text-xs text-slate-500 mt-0.5">Directory of active, overdue, and repaid peer-to-peer liquidity loan agreements</p>
              </div>
              <span className="text-xs font-semibold font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                Total {loansList.length} Loan Records
              </span>
            </div>

            <LoansTable 
              loans={loansList} 
              onManualRepay={(loan) => setSelectedLoan(loan)}
            />
          </div>
        </>
      )}

      {/* Manual Repayment Modal */}
      {selectedLoan && (
        <ManualRepayModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
          onSuccess={fetchLoans}
        />
      )}

    </div>
  );
};

export default Loans;
