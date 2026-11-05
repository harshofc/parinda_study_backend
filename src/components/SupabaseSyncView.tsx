import React, { useState, useEffect } from 'react';
import {
  DEFAULT_SUPABASE_CONFIG,
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  TableStatus,
} from '../lib/supabase.ts';
import { SUPABASE_SETUP_SQL } from '../lib/sqlScripts.ts';
import { Student, AttendanceRecord, Payment, PatientRegistration } from '../types.ts';
import {
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  UploadCloud,
  ShieldCheck,
  Key,
  Globe,
  Layers,
  Terminal,
} from 'lucide-react';

interface SupabaseSyncViewProps {
  students: Student[];
  attendance: AttendanceRecord;
  payments: Payment[];
  registrations: PatientRegistration[];
  onForceSyncAll: () => Promise<void>;
  showToast: (msg: string) => void;
}

export const SupabaseSyncView: React.FC<SupabaseSyncViewProps> = ({
  students,
  attendance,
  payments,
  registrations,
  onForceSyncAll,
  showToast,
}) => {
  const [config, setConfig] = useState(getSupabaseConfig());
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<TableStatus | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);

  const runTest = async () => {
    setTesting(true);
    try {
      const res = await testSupabaseConnection();
      setStatus(res);
      if (res.connected && (res.patients || res.students)) {
        showToast('Connected to Supabase! Tables are online.');
      } else if (res.connected) {
        showToast('Supabase endpoint connected! Copy and run SQL to create tables.');
      } else {
        showToast('Connection failed: ' + (res.error || 'Check internet connection'));
      }
    } catch (e: any) {
      showToast('Test failed: ' + e.message);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    showToast('SQL script copied! Paste into Supabase SQL Editor.');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    await onForceSyncAll();
    setSyncingAll(false);
    await runTest();
  };

  const handleSaveCustomConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(config);
    showToast('Supabase settings updated & reinitialized');
    runTest();
  };

  const handleResetDefault = () => {
    setConfig(DEFAULT_SUPABASE_CONFIG);
    saveSupabaseConfig(DEFAULT_SUPABASE_CONFIG);
    showToast('Reset to default project credentials');
    runTest();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Supabase Cloud Database Integration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connected to Project <code className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{config.projectId}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runTest}
              disabled={testing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {/* Patients table */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">patients table</span>
              {status?.patients ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <p className="text-xs font-bold mt-1 text-slate-900 dark:text-white">
              {status?.patients ? 'Ready & Online' : 'Pending SQL Setup'}
            </p>
          </div>

          {/* Students table */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">students table</span>
              {status?.students ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <p className="text-xs font-bold mt-1 text-slate-900 dark:text-white">
              {status?.students ? 'Ready & Online' : 'Pending SQL Setup'}
            </p>
          </div>

          {/* Attendance table */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">attendance table</span>
              {status?.attendance ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <p className="text-xs font-bold mt-1 text-slate-900 dark:text-white">
              {status?.attendance ? 'Ready & Online' : 'Pending SQL Setup'}
            </p>
          </div>

          {/* Payments table */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">payments table</span>
              {status?.payments ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <p className="text-xs font-bold mt-1 text-slate-900 dark:text-white">
              {status?.payments ? 'Ready & Online' : 'Pending SQL Setup'}
            </p>
          </div>
        </div>

        {/* Sync All button */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Local database: <strong className="text-slate-700 dark:text-slate-200">{students.length}</strong> students • <strong className="text-slate-700 dark:text-slate-200">{registrations.length}</strong> intake forms • <strong className="text-slate-700 dark:text-slate-200">{payments.length}</strong> payments
          </div>
          <button
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50"
          >
            <UploadCloud className={`w-4 h-4 ${syncingAll ? 'animate-bounce' : ''}`} />
            <span>{syncingAll ? 'Syncing to Supabase...' : 'Push All Local Records to Cloud'}</span>
          </button>
        </div>
      </div>

      {/* SQL Script Quick Setup Panel */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              1-Step Database Schema & Security Setup (SQL)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://supabase.com/dashboard/project/${config.projectId}/sql/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied SQL!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          To enable patients and students to submit forms directly into your Supabase database, copy the script below and paste it into your{' '}
          <strong className="text-slate-700 dark:text-slate-200">Supabase SQL Editor</strong> and click <em>Run</em>.
        </p>

        {/* Code snippet display */}
        <div className="relative">
          <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-56 scrollbar-thin border border-slate-800">
            {SUPABASE_SETUP_SQL}
          </pre>
        </div>
      </div>

      {/* Connection Credentials Form */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2 flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-500" />
          <span>Active Supabase Credentials</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Configured with the Supabase Project ID and API Key you provided.
        </p>

        <form onSubmit={handleSaveCustomConfig} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Project ID
              </label>
              <input
                type="text"
                value={config.projectId}
                onChange={(e) => {
                  const pid = e.target.value.trim();
                  setConfig({
                    ...config,
                    projectId: pid,
                    url: `https://${pid}.supabase.co`,
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Supabase URL
              </label>
              <input
                type="text"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value.trim() })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Publishable API Key (anon)
            </label>
            <input
              type="text"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value.trim() })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
            >
              Reset to Original Credentials
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm"
            >
              Update Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
