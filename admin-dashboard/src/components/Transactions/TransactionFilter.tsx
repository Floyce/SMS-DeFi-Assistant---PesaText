/**
 * PesaText - Admin Dashboard
 * 
 * File: components/Transactions/TransactionFilter.tsx
 * Description: Filter bar component for transaction ledger search and filtering
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React from 'react';

// 2. Third-party UI components
import { Search } from 'lucide-react';

interface TransactionFilterProps {
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="bg-white p-4 rounded-card border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by phone or M-Pesa reference..."
          className="w-full bg-slate-50 text-slate-700 placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-primary/50 focus:bg-white transition-all duration-200"
        />
        <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-2.5" />
      </div>

      {/* Select Filters */}
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        {/* Type Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-40 bg-slate-50 text-slate-700 py-2 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:bg-white"
          >
            <option value="ALL">All Types</option>
            <option value="Register">Registration</option>
            <option value="Deposit">Deposit</option>
            <option value="Loan">Loan</option>
            <option value="Repay">Repayment</option>
          </select>
        </div>

        {/* Status Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 bg-slate-50 text-slate-700 py-2 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilter;
