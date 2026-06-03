/**
 * PesaText - Admin Dashboard
 * 
 * File: components/Users/ConfirmDepositModal.tsx
 * Description: Modal for confirming pending deposits and manually crediting user balances
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React, { useState } from 'react';

// 2. Third-party UI components
import { X, ShieldAlert, Coins } from 'lucide-react';

// 4. Services and utilities
import { apiService } from '../../services/apiService';
import { formatXlm, formatKes, formatPhone } from '../../utils/formatters';

// 5. Types and constants
import { User } from '../../types/user';
import { Transaction } from '../../types/transaction';

interface ConfirmDepositModalProps {
  user?: User;
  pendingTx?: Transaction;
  onClose: () => void;
  onSuccess: () => void;
}

const ConfirmDepositModal: React.FC<ConfirmDepositModalProps> = ({ 
  user, 
  pendingTx, 
  onClose, 
  onSuccess 
}) => {
  const [amountXlm, setAmountXlm] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mode: true = Confirming existing pending transaction, false = initiating new manual deposit
  const isConfirmPending = !!pendingTx;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isConfirmPending) {
        // Approve existing pending deposit by passing reference code
        const success = await apiService.confirmDeposit(pendingTx.reference_code);
        if (success) {
          onSuccess();
          onClose();
        } else {
          setError('Failed to confirm deposit. Transaction may no longer be pending.');
        }
      } else if (user) {
        // Create new manual deposit
        if (!amountXlm || Number(amountXlm) <= 0) {
          setError('Please enter a valid amount greater than 0.');
          setLoading(false);
          return;
        }
        if (!referenceCode.trim()) {
          setError('Please enter an M-Pesa reference code.');
          setLoading(false);
          return;
        }

        const amountKes = Math.round(Number(amountXlm) * 13.5);
        const safeRef = referenceCode.toUpperCase().trim();
        const mSid = safeRef.length >= 8 ? safeRef.substring(0, 8) : safeRef.padEnd(8, 'X');
        const expectedMpesaRef = `MP${mSid}`;

        // 1. Simulate the incoming SAVE SMS
        await apiService.simulateReceiveSMS(user.phone, `SAVE ${amountKes}`, mSid);
        
        // 2. Immediately confirm it in the backend
        const success = await apiService.confirmDeposit(expectedMpesaRef);
        if (success) {
          onSuccess();
          onClose();
        } else {
          setError('Failed to confirm the initiated deposit.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const getTargetPhone = () => {
    if (pendingTx) return pendingTx.user_phone;
    if (user) return user.phone;
    return '';
  };

  const getTargetName = () => {
    if (user) return user.name;
    return 'PesaText User';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card w-full max-w-md shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="h-14 border-b border-slate-200 bg-slate-50 px-5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-600" />
            {isConfirmPending ? 'Confirm Pending Deposit' : 'Manual Deposit Credit'}
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

          {isConfirmPending ? (
            // Confirming pending transaction mode
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100/50 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">User Phone:</span>
                  <span className="font-mono font-semibold text-slate-800">{formatPhone(pendingTx.user_phone)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Amount:</span>
                  <span className="font-mono font-semibold text-slate-800">{formatXlm(pendingTx.amount_stroops)} XLM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Value (KES):</span>
                  <span className="font-mono font-semibold text-emerald-600 font-bold">
                    {formatKes(Number(pendingTx.amount_stroops) / 10000000)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">M-Pesa Reference:</span>
                  <span className="font-mono font-semibold text-slate-800">{pendingTx.reference_code}</span>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg text-[11px] leading-relaxed text-amber-800">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <p>
                  <strong>Security Check:</strong> Ensure that the funds are cleared on your M-Pesa administrator dashboard before approving. Approving credits the user's Soroban contract wallet immediately.
                </p>
              </div>
            </div>
          ) : (
            // Custom new deposit mode
            <div className="space-y-3">
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                Crediting account: <strong>{getTargetName()}</strong> ({formatPhone(getTargetPhone())})
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Deposit Amount (XLM)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={amountXlm}
                    onChange={(e) => setAmountXlm(e.target.value)}
                    placeholder="e.g. 50"
                    required
                    className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-primary/50 focus:bg-white"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 font-mono">XLM</span>
                </div>
                {amountXlm && (
                  <span className="text-[11px] text-emerald-600 block mt-1 font-semibold font-mono">
                    ≈ {formatKes(amountXlm)} KES
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  M-Pesa Code / Reference
                </label>
                <input
                  type="text"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  placeholder="e.g. QX912KL89J"
                  required
                  className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 px-3 py-2 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-primary/50 focus:bg-white font-mono uppercase"
                />
              </div>
            </div>
          )}

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
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all flex items-center gap-1.5 ${
                isConfirmPending 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-100' 
                  : 'bg-primary hover:bg-primary-dark shadow-sm shadow-primary-light'
              }`}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <Coins className="w-3.5 h-3.5" />
                  {isConfirmPending ? 'Approve & Release' : 'Initiate Deposit'}
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ConfirmDepositModal;
