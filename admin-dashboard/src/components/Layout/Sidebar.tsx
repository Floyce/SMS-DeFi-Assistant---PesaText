/**
 * PesaText - Admin Dashboard
 * 
 * File: components/Layout/Sidebar.tsx
 * Description: Sidebar navigation component displaying system links and connection status
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React from 'react';
import { NavLink } from 'react-router-dom';

// 2. Third-party UI components
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeftRight, 
  Coins, 
  HandCoins, 
  Settings as SettingsIcon,
  Activity
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Deposits', path: '/deposits', icon: Coins },
    { name: 'Loans', path: '/loans', icon: HandCoins },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-[260px] h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-[#fbf9f8]/30">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary flex items-center justify-center rounded-lg text-white shadow-md shadow-primary/20">
            <Coins className="w-5 h-5 text-stellar-gold" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pesa<span className="text-primary">Text</span></h1>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider">SMS DEFI ASSISTANT</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-primary text-white shadow-sm shadow-primary/10' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Connection Indicator Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-slate-100">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Soroban RPC</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-600 rounded font-mono">LIVE</span>
            </div>
            <p className="text-[11px] text-slate-600 truncate font-mono mt-0.5">Testnet Connected</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
