/**
 * PesaText - Admin Dashboard
 * 
 * File: pages/Dashboard.tsx
 * Description: Main administrative dashboard page displaying stats, recent users, and transactions
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 2. Third-party UI components
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ArrowRight, Users, ArrowLeftRight, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';

// 3. Local components
import StatsCards from '../components/Layout/StatsCards';

// 4. Services and utilities
import { apiService } from '../services/apiService';
import { formatXlm, formatKes, formatDate, formatPhone } from '../utils/formatters';

// 5. Types and constants
import { User } from '../types/user';
import { Transaction } from '../types/transaction';

const Dashboard: React.FC = () => {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Weekly chart mock data
  const chartData = [
    { day: 'Mon', volume: 420, txs: 8 },
    { day: 'Tue', volume: 580, txs: 12 },
    { day: 'Wed', volume: 350, txs: 6 },
    { day: 'Thu', volume: 920, txs: 15 },
    { day: 'Fri', volume: 1100, txs: 22 },
    { day: 'Sat', volume: 850, txs: 18 },
    { day: 'Sun', volume: 1250, txs: 25 },
  ];

  const loadDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const allUsers = await apiService.getUsers();
      const allTxs = await apiService.getTransactions();

      // Take last 5 registered users
      const sortedUsers = [...(allUsers || [])]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentUsers(sortedUsers);

      // Take last 5 transactions
      setRecentTxs((allTxs || []).slice(0, 5));
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the PesaText backend API.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => loadDashboardData(true), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* High-level stats row */}
      <StatsCards />

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-card p-5 flex items-center gap-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold">API Connection Issue: </span>
            {error}
          </div>
        </div>
      )}

      {loading && !error ? (
        <div className="h-96 flex items-center justify-center bg-white rounded-card border border-slate-200 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-semibold font-mono">Fetching ledger data...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Graphical section */}
          <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Deposit Turnover
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Aggregated M-Pesa verified deposits inside the Soroban DeFi pool</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-100">
            <span>+18.5% weekly growth</span>
          </div>
        </div>
        
        {/* Recharts Graphical Display */}
        <div className="h-72 w-full font-mono text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066CC" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0066CC" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} unit=" XLM" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '8px', 
                  border: 'none', 
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                labelClassName="font-bold text-slate-400 mb-1"
                formatter={(val) => [`${val} XLM`, 'Deposited Volume']}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#0066CC" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorVolume)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Split Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Recent Users */}
        <div className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-primary" />
                Newly Registered Users
              </h3>
              <Link 
                to="/users" 
                className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 hover:underline"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="divide-y divide-slate-100">
              {recentUsers.map(user => (
                <div key={user.id} className="p-4 hover:bg-slate-50/50 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">{user.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{formatPhone(user.phone)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-slate-700">{formatXlm(user.balance_stroops)} XLM</span>
                    <span className="text-[9px] text-slate-400 block font-mono">Wallet Balance</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ArrowLeftRight className="w-4.5 h-4.5 text-primary" />
                Recent System Activity
              </h3>
              <Link 
                to="/transactions" 
                className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 hover:underline"
              >
                View ledger
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentTxs.map(tx => (
                <div key={tx.id} className="p-4 hover:bg-slate-50/50 flex items-center justify-between transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        tx.tx_type === 'Deposit' ? 'bg-emerald-50 text-emerald-700' :
                        tx.tx_type === 'Loan' ? 'bg-blue-50 text-blue-700' :
                        tx.tx_type === 'Repay' ? 'bg-purple-50 text-purple-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.tx_type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatPhone(tx.user_phone)}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">{formatDate(tx.created_at)}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono text-xs font-bold ${
                      tx.status === 'Success' ? 'text-slate-700' :
                      tx.status === 'Pending' ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {tx.amount_stroops === '0' ? '-' : `${formatXlm(tx.amount_stroops)} XLM`}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">Reference: {tx.reference_code.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
