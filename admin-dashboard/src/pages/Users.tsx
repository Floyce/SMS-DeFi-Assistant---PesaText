/**
 * PesaText - Admin Dashboard
 * 
 * File: pages/Users.tsx
 * Description: Page displaying user directory and details, including balances and status filters
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React, { useState, useEffect } from 'react';

// 2. Third-party UI components
import { Search, Loader2, AlertCircle } from 'lucide-react';

// 3. Local components
import UsersTable from '../components/Users/UsersTable';
import UserDetailsModal from '../components/Users/UserDetailsModal';
import ConfirmDepositModal from '../components/Users/ConfirmDepositModal';

// 4. Services and utilities
import { apiService } from '../services/apiService';

// 5. Types and constants
import { User } from '../types/user';

const Users: React.FC = () => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
  const [selectedUserForDeposit, setSelectedUserForDeposit] = useState<User | null>(null);

  const fetchUsers = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const data = await apiService.getUsers();
      setUsersList(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the PesaText backend API.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => fetchUsers(true), 10000);
    return () => clearInterval(interval);
  }, []);

  // Filtered users
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    
    const matchesStatus = 
      statusFilter === 'ALL' || 
      user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-card border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full bg-slate-50 text-slate-700 placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-primary/50 focus:bg-white transition-all duration-200"
          />
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filter Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credit Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 bg-slate-50 text-slate-700 py-2 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-card p-5 flex items-center gap-3 text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold">API Connection Issue: </span>
            {error}
          </div>
        </div>
      )}

      {loading && !error ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-card border border-slate-200 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs font-semibold font-mono">Loading user directory...</span>
          </div>
        </div>
      ) : (
        /* Main Table Panel */
        <div className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">User Directory</h3>
              <p className="text-xs text-slate-500 mt-0.5">Directory of registered PesaText mobile phone users and balances</p>
            </div>
            <span className="text-xs font-semibold font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
              Showing {filteredUsers.length} of {usersList.length} Users
            </span>
          </div>
          
          <UsersTable 
            users={filteredUsers}
            onViewDetails={(user) => setSelectedUserForDetails(user)}
            onConfirmDeposit={(user) => setSelectedUserForDeposit(user)}
          />
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserForDetails && (
        <UserDetailsModal 
          user={selectedUserForDetails}
          onClose={() => setSelectedUserForDetails(null)}
        />
      )}

      {/* Deposit Confirmation Modal */}
      {selectedUserForDeposit && (
        <ConfirmDepositModal 
          user={selectedUserForDeposit}
          onClose={() => setSelectedUserForDeposit(null)}
          onSuccess={fetchUsers}
        />
      )}

    </div>
  );
};

export default Users;
