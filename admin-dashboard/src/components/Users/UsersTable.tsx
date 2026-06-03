/**
 * PesaText - Admin Dashboard
 * 
 * File: components/Users/UsersTable.tsx
 * Description: Table component displaying the directory of registered users
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React from 'react';

// 2. Third-party UI components
import { Eye, Coins } from 'lucide-react';

// 4. Services and utilities
import { formatXlm, formatPhone } from '../../utils/formatters';

// 5. Types and constants
import { User } from '../../types/user';

interface UsersTableProps {
  users: User[];
  onViewDetails: (user: User) => void;
  onConfirmDeposit: (user: User) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onViewDetails, onConfirmDeposit }) => {
  
  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Inactive
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="px-6 py-4">Phone Number</th>
            <th className="px-6 py-4">Full Name</th>
            <th className="px-6 py-4 text-right">Stellar Balance</th>
            <th className="px-6 py-4 text-center">Credit Status</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                No users match the search query.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr 
                key={user.id} 
                className="hover:bg-slate-50/70 transition-colors duration-150 group"
              >
                {/* Phone */}
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-slate-700 font-medium">{formatPhone(user.phone)}</span>
                </td>
                
                {/* Name */}
                <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                  {user.name}
                </td>
                
                {/* Balance */}
                <td className="px-6 py-4 text-right">
                  <span className="font-mono text-sm font-semibold text-slate-700">{formatXlm(user.balance_stroops)}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">XLM</span>
                </td>
                
                {/* Loan Status */}
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(user.status)}
                </td>
                
                {/* Action Buttons */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      onClick={() => onViewDetails(user)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:text-white border border-primary hover:bg-primary rounded-lg transition-all duration-150"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>
                    <button
                      onClick={() => onConfirmDeposit(user)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:text-white border border-emerald-600 hover:bg-emerald-600 rounded-lg transition-all duration-150"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      Confirm Deposit
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
