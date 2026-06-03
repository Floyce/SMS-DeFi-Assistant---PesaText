/**
 * PesaText - Admin Dashboard
 * 
 * File: pages/Settings.tsx
 * Description: System configuration settings and live system event logs console
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 1. React and external libraries
import React, { useState, useEffect } from 'react';

// 2. Third-party UI components
import { Save, ShieldAlert, Terminal, CheckCircle2 } from 'lucide-react';

// 4. Services and utilities
import { apiService } from '../services/apiService';

const Settings: React.FC = () => {
  const [interestRate, setInterestRate] = useState('5');
  const [twilioPhone, setTwilioPhone] = useState('');
  const [stellarContractId, setStellarContractId] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const settings = await apiService.getSystemSettings();
      setInterestRate((settings.interestRate * 100).toString());
      setTwilioPhone(settings.twilioPhone);
      setStellarContractId(settings.stellarContractId);
      setLogs(settings.logs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
    // Poll logs every 2 seconds
    const interval = setInterval(async () => {
      try {
        const settings = await apiService.getSystemSettings();
        setLogs(settings.logs);
      } catch (err) {
        // Ignore background polling errors
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    try {
      const rate = Number(interestRate) / 100;
      await apiService.updateSystemSettings({
        interestRate: rate,
        twilioPhone,
        stellarContractId
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchSettings(); // Refresh settings state
    } catch (err) {
      // Quietly ignore or handle
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Columns: Config Form */}
      <form onSubmit={handleSave} className="lg:col-span-5 bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">System Properties</h3>
          <p className="text-xs text-slate-500 mt-0.5">Parameters governing SMS-parsing rules and Soroban contract states</p>
        </div>

        {saveSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Settings saved successfully!
          </div>
        )}

        <div className="space-y-4">
          
          {/* Interest Rate */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Micro-credit Interest Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                required
                className="w-full bg-slate-50 text-slate-800 px-3.5 py-2 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-primary/50 focus:bg-white"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 font-mono">%</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Accrued automatically on the principal amount upon Soroban loan execution</span>
          </div>

          {/* Twilio Number */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Twilio SMS Gateway Number
            </label>
            <input
              type="text"
              value={twilioPhone}
              onChange={(e) => setTwilioPhone(e.target.value)}
              required
              className="w-full bg-slate-50 text-slate-800 px-3.5 py-2 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-primary/50 focus:bg-white font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Simulated webhooks listen for SMS traffic hitting this endpoint</span>
          </div>

          {/* Stellar Contract Address */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Soroban Smart Contract ID
            </label>
            <input
              type="text"
              value={stellarContractId}
              onChange={(e) => setStellarContractId(e.target.value)}
              required
              className="w-full bg-slate-50 text-slate-800 px-3.5 py-2 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-primary/50 focus:bg-white font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Contract deployed on Stellar Testnet for PesaText ledger</span>
          </div>

        </div>

        {/* Security Warning */}
        <div className="flex gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-lg text-[10px] leading-relaxed text-amber-800">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-700" />
          <p>
            Modifying settings changes mock variables instantly, mimicking contract redeployments and server configurations.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary-light"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>

      {/* Right Columns: Terminal Event Logs */}
      <div className="lg:col-span-7 bg-white p-6 rounded-card border border-slate-200 shadow-sm flex flex-col h-[75vh]">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            Backend Console Stream
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time webhook and smart contract ledger event logs</p>
        </div>

        {/* Console Container */}
        <div className="flex-1 bg-slate-950 rounded-lg p-4 font-mono text-[11px] text-emerald-400 border border-slate-800 overflow-y-auto space-y-2 select-text">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-center py-12">Console idle. No events logged.</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed break-all hover:bg-slate-900 px-1 py-0.5 rounded">
                <span className="text-slate-500">[{idx}]</span> {log}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Settings;
