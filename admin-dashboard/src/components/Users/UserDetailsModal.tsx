/**
 * PesaText - Admin Dashboard
 * 
 * File: components/Users/UserDetailsModal.tsx
 * Description: Modal displaying comprehensive user details, transactions, loans, and SMS logs
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React, { useState, useEffect, useRef } from 'react';

// 2. Third-party UI components
import { X, Copy, Send, PhoneCall, Smartphone, ShieldCheck, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

// 4. Services and utilities
import { apiService, SmsMessage } from '../../services/apiService';
import { formatXlm, formatKes, formatDate, truncateAddress, formatPhone } from '../../utils/formatters';

// 5. Types and constants
import { User } from '../../types/user';
import { Transaction } from '../../types/transaction';
import { Loan } from '../../types/loan';

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  const [smsText, setSmsText] = useState('');
  const [copied, setCopied] = useState(false);
  const [smsLogs, setSmsLogs] = useState<SmsMessage[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const logs = await apiService.getSMSLogs(user.phone);
      setSmsLogs(logs);

      const allTxs = await apiService.getTransactions();
      const filteredTxs = allTxs.filter(t => t.user_phone === user.phone);
      setUserTransactions(filteredTxs);

      const allLoans = await apiService.getLoans();
      const filteredLoans = allLoans.filter(l => l.user_phone === user.phone);
      setUserLoans(filteredLoans);
    } catch (err) {
      // Quietly ignore to avoid console logging
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh chat logs every 2 seconds
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [user.phone]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [smsLogs]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(user.stellar_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Admin simulates sending SMS
  const handleAdminSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsText.trim()) return;
    
    try {
      await apiService.sendSMS(user.phone, smsText.trim());
      setSmsText('');
      loadData();
    } catch (err) {
      // Quietly ignore
    }
  };

  // Admin simulates user sending an SMS (incoming message)
  const handleSimulateUserSms = async (body: string) => {
    try {
      await apiService.simulateReceiveSMS(user.phone, body);
      loadData();
    } catch (err) {
      // Quietly ignore
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="h-16 border-b border-slate-200 bg-slate-50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{user.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{formatPhone(user.phone)}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (2 Columns) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Profile details & Transaction ledger */}
          <div className="w-7/12 p-6 overflow-y-auto space-y-6 border-r border-slate-100">
            
            {/* Account Details Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Account Balance</span>
                <span className="text-xl font-bold text-slate-800 block mt-1 font-mono">
                  {formatXlm(user.balance_stroops)} XLM
                </span>
                <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                  ≈ {formatKes(Number(user.balance_stroops) / 10000000)} KES
                </span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registration Date</span>
                <span className="text-sm font-semibold text-slate-800 block mt-1">
                  {formatDate(user.created_at)}
                </span>
                <span className="text-xs text-slate-500 block mt-1 font-mono">ID: #{user.id}</span>
              </div>
            </div>

            {/* Stellar Address Info */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Stellar Public Address</span>
                <button
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
              <p className="text-xs font-mono text-slate-600 bg-white p-2.5 rounded border border-slate-200 break-all select-all">
                {user.stellar_address}
              </p>
            </div>

            {/* Credit Info */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">DeFi Loan Accounts</h4>
              {userLoans.length === 0 ? (
                <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100 text-center font-medium">
                  No loans recorded for this user.
                </div>
              ) : (
                <div className="space-y-2">
                  {userLoans.map(loan => (
                    <div key={loan.id} className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-700">Loan #{loan.id}</span>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-mono">
                          <span>Principal: {formatXlm(loan.principal_stroops)} XLM</span>
                          <span>Interest: {formatXlm(loan.interest_stroops)} XLM</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">Due: {formatDate(loan.due_at)}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        loan.status === 'Repaid' ? 'bg-emerald-100 text-emerald-800' :
                        loan.status === 'Overdue' ? 'bg-red-100 text-red-800 animate-pulse' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Transaction History */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">User Transaction Ledger</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-60 overflow-y-auto">
                {userTransactions.length === 0 ? (
                  <div className="text-sm text-slate-500 p-6 text-center font-medium">
                    No transactions found.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500">
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2 text-right">Amount (XLM)</th>
                        <th className="px-4 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {userTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">
                            {formatDate(tx.created_at)}
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-slate-700">
                            {tx.tx_type}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-600">
                            {tx.tx_type === 'Deposit' || tx.tx_type === 'Loan' ? '+' : ''}
                            {tx.tx_type === 'Repay' ? '-' : ''}
                            {tx.amount_stroops === '0' ? '-' : formatXlm(tx.amount_stroops)}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              tx.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              tx.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: SMS Chat History & Simulators */}
          <div className="w-5/12 bg-slate-900 flex flex-col justify-between">
            
            {/* SMS Header */}
            <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-950/70">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-primary" />
                Live SMS Stream
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-slate-400 font-mono">Twilio Loop</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {smsLogs.length === 0 ? (
                <div className="text-slate-500 text-xs text-center p-8 font-mono">
                  No SMS traffic recorded. Use simulator tools below.
                </div>
              ) : (
                smsLogs.map(log => (
                  <div 
                    key={log.id} 
                    className={`flex flex-col ${log.direction === 'inbound' ? 'items-start' : 'items-end'}`}
                  >
                    <div className={`sms-bubble text-sm ${
                      log.direction === 'inbound' 
                        ? 'sms-bubble-inbound text-slate-900' 
                        : 'sms-bubble-outbound text-white'
                    }`}>
                      <p className="leading-snug">{log.body}</p>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono px-2 -mt-2">
                      {log.direction === 'inbound' ? 'User' : 'PesaText'} • {formatDate(log.timestamp)}
                    </span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* SMS Simulation Controls */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-4">
              
              {/* Simulator Shortcuts */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 font-mono">Simulate User Input (SMS shortcuts)</span>
                <div className="flex flex-wrap gap-1.5">
                  {['BALANCE', 'DEPOSIT', 'LOAN 10', 'REPAY 5'].map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => handleSimulateUserSms(cmd)}
                      className="px-2.5 py-1 text-[10px] font-semibold font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                    >
                      {cmd}
                    </button>
                  ))}
                  
                  {/* Custom incoming SMS simulation */}
                  <button
                    onClick={() => {
                      const text = prompt("Enter simulated incoming SMS text from user:");
                      if (text) handleSimulateUserSms(text);
                    }}
                    className="px-2.5 py-1 text-[10px] font-semibold bg-primary/20 hover:bg-primary/30 text-primary-light border border-primary/40 rounded transition-colors"
                  >
                    + Custom SMS
                  </button>
                </div>
              </div>

              {/* Admin SMS outbound sender form */}
              <form onSubmit={handleAdminSendSms} className="flex gap-2">
                <input
                  type="text"
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  placeholder="Send manual admin SMS..."
                  className="flex-1 bg-slate-800 text-slate-200 placeholder-slate-500 px-3 py-2 rounded-lg text-xs border border-slate-700 focus:outline-none focus:border-primary/60"
                />
                <button
                  type="submit"
                  className="p-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center justify-center"
                  title="Send Message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default UserDetailsModal;
