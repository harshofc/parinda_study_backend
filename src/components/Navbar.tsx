import React from 'react';
import { TabType } from '../types.ts';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  FileText,
  Inbox,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Database,
  Moon,
  Sun,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  submissionsCount: number;
  supabaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  darkMode,
  onToggleTheme,
  submissionsCount,
  supabaseConnected,
}) => {
  return (
    <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-lg print:hidden">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <BookOpen className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Parinda Study</h1>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium tracking-wide">
                  Intake & Portal
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
                Student & Patient Registration • Attendance • Monthly Fees • Supabase Synced
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Supabase Status Pill */}
            <button
              onClick={() => onSelectTab('cloud-setup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md border transition-all ${
                supabaseConnected
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 border-amber-400/40 text-amber-200 hover:bg-amber-500/30'
              }`}
              title="Click to view Supabase database sync and SQL setup"
            >
              {supabaseConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Supabase: Connected</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                  <span>Supabase: Setup Tables</span>
                </>
              )}
            </button>

            {/* Public Form Quick Link */}
            <button
              onClick={() => onSelectTab('public-form')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 border border-white/20 transition-all text-white"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
              <span>Patient Intake Form</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white flex items-center gap-1 text-xs font-medium"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-200" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-white/90 hover:bg-white/15'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('students')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'students'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-white/90 hover:bg-white/15'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students & Patients</span>
          </button>

          <button
            onClick={() => onSelectTab('public-form')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'public-form'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-white/90 hover:bg-white/15'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Intake Form</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-amber-400 text-blue-950 font-bold rounded-full">
              Live
            </span>
          </button>

          <button
            onClick={() => onSelectTab('submissions')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap relative ${
              currentTab === 'submissions'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-white/90 hover:bg-white/15'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Online Intake Submissions</span>
            {submissionsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-500 text-white font-bold rounded-full animate-pulse">
                {submissionsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('attendance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'attendance'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-white/90 hover:bg-white/15'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Attendance</span>
          </button>

          <button
            onClick={() => onSelectTab('fees')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'fees'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-white/90 hover:bg-white/15'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Monthly Fees</span>
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'reports'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-white/90 hover:bg-white/15'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reports</span>
          </button>

          <button
            onClick={() => onSelectTab('cloud-setup')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'cloud-setup'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-white/90 hover:bg-white/15'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Cloud</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
