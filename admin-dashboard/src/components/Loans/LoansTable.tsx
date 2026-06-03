/**
 * PesaText - Admin Dashboard
 * 
 * File: components/Loans/LoansTable.tsx
 * Description: Table component displaying user loan records and overdue/repayment states
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React from 'react';

// 2. Third-party UI components
import { HandCoins } from 'lucide-react';

// 4. Services and utilities
import { formatDate, formatXlm, formatPhone, formatKes } from '../../utils/formatters';

// 5. Types and constants
import { Loan } from '../../types/loan';

interface LoansTableProps {
  loans: Loan[];
  onManualRepay: (loan: Loan) => void;
}

const LoansTable: React.FC<LoansTableProps> = ({ loans, onManualRepay }) => {

  const getStatusBadge = (status: Loan['status']) => {
    switch (status) {
      case 'Repaid':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Repaid
          </span>
        );
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Active
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
            Overdue
          </span>
        );
      default:
        return null;
    }
  };

  const isLoanOverdue = (loan: Loan) => {
    if (loan.status === 'Repaid') return false;
    const dueDate = new Date(loan.due_at);
    return dueDate.getTime() < Date.now();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="px-6 py-4">Borrower Phone</th>
            <th className="px-6 py-4 text-right">Principal</th>
            <th className="px-6 py-4 text-right">Interest (5%)</th>
            <th className="px-6 py-4 text-right">Total Due</th>
            <th className="px-6 py-4">Due Date</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {loans.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                No loans match the search query.
              </td>
            </tr>
          ) : (
            loans.map((loan) => {
              const totalDueStroops = (BigInt(loan.principal_stroops) + BigInt(loan.interest_stroops)).toString();
              const overdue = isLoanOverdue(loan) || loan.status === 'Overdue';
              
              return (
                <tr 
                  key={loan.id} 
                  className="hover:bg-slate-50/50 transition-colors duration-150"
                >
                  {/* Phone */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold text-slate-700">{formatPhone(loan.user_phone)}</span>
                  </td>

                  {/* Principal */}
                  <td className="px-6 py-4 text-right font-mono text-sm text-slate-700">
                    {formatXlm(loan.principal_stroops)} XLM
                  </td>

                  {/* Interest */}
                  <td className="px-6 py-4 text-right font-mono text-sm text-slate-500">
                    {formatXlm(loan.interest_stroops)} XLM
                  </td>

                  {/* Total Due */}
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm font-bold text-slate-700">{formatXlm(totalDueStroops)} XLM</span>
                    <span className="text-[10px] text-slate-400 block font-mono">≈ {formatKes(Number(totalDueStroops)/10000000)}</span>
                  </td>

                  {/* Due Date */}
                  <td className="px-6 py-4">
                    <span className={`text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                      {formatDate(loan.due_at)}
                    </span>
                    {overdue && (
                      <span className="text-[10px] text-red-500 block font-bold">LATE PAYMENT</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(loan.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    {loan.status !== 'Repaid' ? (
                      <button
                        onClick={() => onManualRepay(loan)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-all duration-150"
                      >
                        <HandCoins className="w-3.5 h-3.5" />
                        Manual Repay
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold font-mono">CLEARED</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LoansTable;
