/**
 * PesaText - Admin Dashboard
 * 
 * File: App.tsx
 * Description: Root application component defining structural layout and route configurations
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 3. Local components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';

// 6. Pages
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Transactions from './pages/Transactions';
import Deposits from './pages/Deposits';
import Loans from './pages/Loans';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fbf9f8] flex">
      {/* Sidebar Navigation (Fixed left, width 260px) */}
      <Sidebar />

      {/* Main Content Area (Offset by sidebar width) */}
      <div className="flex-1 pl-[260px] min-h-screen flex flex-col">
        {/* Fixed Header */}
        <Header />

        {/* Scrollable Page Body */}
        <main className="flex-1 mt-16 p-8 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto animate-in fade-in duration-300">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/deposits" element={<Deposits />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
