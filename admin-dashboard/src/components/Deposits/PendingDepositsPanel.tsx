/**
 * PesaText - Admin Dashboard
 * 
 * File: components/Deposits/PendingDepositsPanel.tsx
 * Description: Panel displaying list of unconfirmed deposits for manual admin verification
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React from 'react';

// 2. Third-party UI components
import { CheckCircle2 } from 'lucide-react';

// 4. Services and utilities
import { formatDate, formatXlm, formatPhone, formatKes } from '../../utils/formatters';

// 5. Types and constants
import { Transaction } from '../../types/transaction';

interface PendingDepositsPanelProps {
  pendingDeposits: Transaction[];
  onConfirmDeposit: (tx: Transaction) => void;
}

const PendingDepositsPanel: React.FC<PendingDepositsPanelProps> = ({ 
  pendingDeposits, 
  onConfirmDeposit 
}) => {
  return (
    <div className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Unconfirmed M-Pesa Deposits</h3>
          <p className="text-xs text-slate-500 mt-0.5">These users have submitted M-Pesa transaction reference codes for validation.</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
          {pendingDeposits.length} Action Required
        </span>
      </div>

      {/* Panel Table */}
      <div className="overflow-x-auto">
        {pendingDeposits.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
            <p className="font-semibold">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">There are no pending deposits requiring manual verification.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Submit Date</th>
                <th className="px-6 py-3">Phone Number</th>
                <th className="px-6 py-3">M-Pesa Reference</th>
                <th className="px-6 py-3 text-right">Amount (XLM)</th>
                <th className="px-6 py-3 text-right">Value (KES)</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingDeposits.map((tx) => (
                <tr 
                  key={tx.id} 
                  className="hover:bg-slate-50/50 transition-colors duration-150"
                >
                  {/* Date */}
                  <td className="px-6 py-4 font-mono text-[13px] text-slate-500">
                    {formatDate(tx.created_at)}
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-700">
                    {formatPhone(tx.user_phone)}
                  </td>

                  {/* M-Pesa Code */}
                  <td className="px-6 py-4 font-mono text-sm font-bold text-slate-800">
                    <span className="bg-slate-100 px-2 py-1 rounded select-all hover:bg-slate-200/50 cursor-pointer">
                      {tx.reference_code}
                    </span>
                  </td>

                  {/* Amount (XLM) */}
                  <td className="px-6 py-4 text-right font-mono text-sm font-bold text-slate-700">
                    {formatXlm(tx.amount_stroops)} XLM
                  </td>

                  {/* Value (KES) */}
                  <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-emerald-600">
                    {formatKes(Number(tx.amount_stroops) / 10000000)}
                  </td>

                  {/* Action Confirm Button */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onConfirmDeposit(tx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-50 hover:shadow transition-all duration-150"
                    >
                      Verify & Release
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PendingDepositsPanel;
