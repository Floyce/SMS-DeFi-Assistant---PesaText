/**
 * PesaText - Admin Dashboard
 * 
 * File: components/Transactions/TransactionsTable.tsx
 * Description: Table component displaying the full transaction ledger
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React from 'react';

// 4. Services and utilities
import { formatDate, formatXlm, formatPhone, truncateAddress } from '../../utils/formatters';

// 5. Types and constants
import { Transaction } from '../../types/transaction';

interface TransactionsTableProps {
  transactions: Transaction[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {

  const getTypeBadge = (type: Transaction['tx_type']) => {
    switch (type) {
      case 'Register':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
            Register
          </span>
        );
      case 'Deposit':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wider">
            Deposit
          </span>
        );
      case 'Loan':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
            Loan
          </span>
        );
      case 'Repay':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 uppercase tracking-wider">
            Repay
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            Success
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            Pending
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="px-6 py-4">Timestamp</th>
            <th className="px-6 py-4">User Phone</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4 text-right">Amount</th>
            <th className="px-6 py-4">Reference Code</th>
            <th className="px-6 py-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                No transactions matched your filters.
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr 
                key={tx.id} 
                className="hover:bg-slate-50/50 transition-colors duration-150"
              >
                {/* Timestamp */}
                <td className="px-6 py-4 font-mono text-[13px] text-slate-500">
                  {formatDate(tx.created_at)}
                </td>

                {/* User Phone */}
                <td className="px-6 py-4 font-mono text-sm font-medium text-slate-700">
                  {formatPhone(tx.user_phone)}
                </td>

                {/* Type Badge */}
                <td className="px-6 py-4">
                  {getTypeBadge(tx.tx_type)}
                </td>

                {/* Amount */}
                <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-slate-700">
                  {tx.amount_stroops === '0' ? '-' : `${formatXlm(tx.amount_stroops)} XLM`}
                </td>

                {/* Reference Code */}
                <td className="px-6 py-4 font-mono text-xs text-slate-600">
                  <span className="bg-slate-100 px-2 py-1 rounded select-all hover:bg-slate-200/60 transition-colors cursor-pointer" title="Click to copy" onClick={() => navigator.clipboard.writeText(tx.reference_code)}>
                    {truncateAddress(tx.reference_code, 12)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(tx.status)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
