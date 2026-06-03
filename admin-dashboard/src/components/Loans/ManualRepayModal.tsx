/**
 * PesaText - Admin Dashboard
 * 
 * File: components/Loans/ManualRepayModal.tsx
 * Description: Modal for manually registering loan repayments on behalf of user
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React, { useState } from 'react';

// 2. Third-party UI components
import { X, HandCoins, ShieldCheck } from 'lucide-react';

// 4. Services and utilities
import { apiService } from '../../services/apiService';
import { formatXlm, formatKes, formatPhone } from '../../utils/formatters';

// 5. Types and constants
import { Loan } from '../../types/loan';

interface ManualRepayModalProps {
  loan: Loan;
  onClose: () => void;
  onSuccess: () => void;
}

const ManualRepayModal: React.FC<ManualRepayModalProps> = ({ loan, onClose, onSuccess }) => {
  const totalDueStroops = (BigInt(loan.principal_stroops) + BigInt(loan.interest_stroops)).toString();
  const totalDueXlm = Number(totalDueStroops) / 10000000;
  
  const [repayAmountXlm, setRepayAmountXlm] = useState(totalDueXlm.toString());
  const [referenceCode, setReferenceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const valXlm = Number(repayAmountXlm);
    if (isNaN(valXlm) || valXlm <= 0) {
      setError('Please enter a valid amount to repay.');
      setLoading(false);
      return;
    }

    try {
      const amountKes = valXlm * 13.5;
      const success = await apiService.manualRepayLoan(loan.user_phone, amountKes);
      
      if (success) {
        onSuccess();
        onClose();
      } else {
        setError('Failed to record repayment. Please verify loan status.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card w-full max-w-md shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="h-14 border-b border-slate-200 bg-slate-50 px-5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <HandCoins className="w-4 h-4 text-primary" />
            Register Manual Repayment
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Borrower Phone:</span>
              <span className="font-mono font-semibold text-slate-800">{formatPhone(loan.user_phone)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Principal Loan:</span>
              <span className="font-mono font-semibold text-slate-700">{formatXlm(loan.principal_stroops)} XLM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Accrued Interest (5%):</span>
              <span className="font-mono font-semibold text-slate-700">{formatXlm(loan.interest_stroops)} XLM</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
              <span className="text-slate-800 font-bold">Total Due:</span>
              <div>
                <span className="font-mono font-bold text-slate-800 block text-right">{formatXlm(totalDueStroops)} XLM</span>
                <span className="text-[10px] text-emerald-600 font-bold block text-right font-mono">≈ {formatKes(totalDueXlm)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Repayment Amount (XLM)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={repayAmountXlm}
                onChange={(e) => setRepayAmountXlm(e.target.value)}
                placeholder="e.g. 10.5"
                required
                className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-primary/50 focus:bg-white"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 font-mono">XLM</span>
            </div>
            {repayAmountXlm && (
              <span className="text-[11px] text-emerald-600 block mt-1 font-semibold font-mono">
                ≈ {formatKes(repayAmountXlm)} KES
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Receipt Reference (Optional)
            </label>
            <input
              type="text"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="M-Pesa Transaction ID (e.g. RZ892KJ39K)"
              className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-primary/50 focus:bg-white font-mono uppercase"
            />
          </div>

          <div className="flex gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-lg text-[10px] leading-relaxed text-blue-800">
            <ShieldCheck className="w-4.5 h-4.5 flex-shrink-0 text-primary" />
            <p>
              By registering this repayment, you confirm that cash has been received on behalf of PesaText DeFi pool, and you are instructing the Soroban contract to clear the outstanding credit balance.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm shadow-primary-light hover:shadow transition-all flex items-center gap-1.5"
            >
              {loading ? 'Registering...' : 'Register Repayment'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ManualRepayModal;
