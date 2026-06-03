/**
 * PesaText - Admin Dashboard
 * 
 * File: components/Layout/Header.tsx
 * Description: Page header with page title, search, and notification count of pending deposits
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

// 2. Third-party UI components
import { Search, Bell, User as UserIcon, RefreshCw } from 'lucide-react';

// 4. Services and utilities
import { apiService } from '../../services/apiService';

const Header: React.FC = () => {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/users':
        return 'User Management';
      case '/transactions':
        return 'Transaction Ledger';
      case '/deposits':
        return 'Deposit Processing';
      case '/loans':
        return 'DeFi Credit & Loans';
      case '/settings':
        return 'System Configuration';
      default:
        return 'PesaText Admin';
    }
  };

  const fetchPendingCount = async () => {
    try {
      const deposits = await apiService.getPendingDeposits();
      setPendingCount(deposits?.length || 0);
    } catch (err) {
      // Quietly ignore to avoid console logging
    }
  };

  useEffect(() => {
    fetchPendingCount();
    // Poll every 3 seconds to keep sync in UI
    const interval = setInterval(fetchPendingCount, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-[260px] flex items-center justify-between px-8 z-20">
      {/* Dynamic Section Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{getPageTitle(location.pathname)}</h2>
        <p className="text-xs text-slate-500 font-mono">PesaText DeFi Core Service v1.0.0</p>
      </div>

      {/* Right-side Utilities */}
      <div className="flex items-center gap-6">
        {/* Search Input Box */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search phone or tx hash..."
            className="w-full bg-slate-50 text-slate-700 placeholder-slate-400 pl-10 pr-4 py-1.5 rounded-lg text-sm border border-slate-100 focus:outline-none focus:border-primary/40 focus:bg-white transition-all duration-200"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-[9px]" />
        </div>

        {/* Refresh button */}
        <button 
          onClick={fetchPendingCount}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          title="Refresh Pending Count"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>

        {/* Notifications Bell */}
        <Link to="/deposits" className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {pendingCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
              {pendingCount}
            </span>
          )}
        </Link>

        {/* Admin Account Widget */}
        <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
          <div className="w-9 h-9 bg-primary-light text-primary flex items-center justify-center rounded-full font-semibold text-sm">
            AD
          </div>
          <div className="text-left hidden lg:block">
            <h4 className="text-xs font-semibold text-slate-700">System Admin</h4>
            <p className="text-[10px] text-emerald-600 font-medium">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
