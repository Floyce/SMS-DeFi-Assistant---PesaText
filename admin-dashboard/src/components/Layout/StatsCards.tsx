/**
 * PesaText - Admin Dashboard
 * 
 * File: components/Layout/StatsCards.tsx
 * Description: Dashboard statistics cards displaying key system metrics from backend /stats
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React, { useState, useEffect } from 'react';

// 2. Third-party UI components
import { Users, Coins, HandCoins, Landmark, AlertCircle, Loader2 } from 'lucide-react';

// 4. Services and utilities
import { apiService, ApiError } from '../../services/apiService';
import { formatKes } from '../../utils/formatters';

const StatsCards: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepositsXlm: 0,
    activeLoans: 0,
    totalVolumeKes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatsData = async () => {
    try {
      setError(null);
      const data = await apiService.getStats();
      setStats({
        totalUsers: data.total_users,
        totalDepositsXlm: data.total_deposits_xlm,
        activeLoans: data.active_loans_count,
        totalVolumeKes: data.total_volume_kes,
      });
    } catch (err) {
      if (err instanceof ApiError && err.isBackendDown) {
        setError('Backend offline');
      } else {
        setError('Failed to load stats');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatsData();
    const interval = setInterval(loadStatsData, 10000);
    return () => clearInterval(interval);
  }, []);

  const cardData = [
    {
      title: 'Total Registered Users',
      value: stats.totalUsers.toString(),
      subtext: 'Kenyan feature phone owners',
      icon: Users,
      color: 'text-primary bg-primary-light/50',
      borderColor: 'hover:border-primary/20',
    },
    {
      title: 'Total Deposits (XLM)',
      value: `${stats.totalDepositsXlm.toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM`,
      subtext: `Approx. ${formatKes(stats.totalDepositsXlm)}`,
      icon: Coins,
      color: 'text-emerald-600 bg-emerald-50',
      borderColor: 'hover:border-emerald-200',
    },
    {
      title: 'Active DeFi Loans',
      value: stats.activeLoans.toString(),
      subtext: 'Outstanding credit agreements',
      icon: HandCoins,
      color: 'text-amber-600 bg-amber-50',
      borderColor: 'hover:border-amber-200',
    },
    {
      title: 'Total Volume (KES)',
      value: formatKes(stats.totalVolumeKes),
      subtext: 'Aggregate system turnover',
      icon: Landmark,
      color: 'text-secondary bg-secondary-light/30',
      borderColor: 'hover:border-secondary/20',
    },
  ];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-card p-6 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <p className="text-xs text-red-500 mt-0.5">
            Ensure the Rust backend is running on port 8000.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardData.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white p-6 rounded-card border border-slate-200 shadow-sm transition-all-300 hover-glow ${card.borderColor}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-lg ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col">
              {loading ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                <>
                  <span className="text-2xl font-bold text-slate-800 tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">{card.subtext}</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
