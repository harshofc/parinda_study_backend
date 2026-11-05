import React from 'react';
import { Student, Payment, AttendanceRecord, PatientRegistration, TabType } from '../types.ts';
import {
  Users,
  CheckCircle,
  IndianRupee,
  Clock,
  UserPlus,
  CalendarCheck,
  CreditCard,
  FileText,
  Database,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface DashboardProps {
  students: Student[];
  attendance: AttendanceRecord;
  payments: Payment[];
  registrations: PatientRegistration[];
  onNavigate: (tab: TabType) => void;
  onOpenQuickAddStudent: () => void;
  supabaseConnected: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  attendance,
  payments,
  registrations,
  onNavigate,
  onOpenQuickAddStudent,
  supabaseConnected,
}) => {
  const todayStr = new Date().toLocaleDateString('en-CA');
  const currentMonthStr = todayStr.slice(0, 7);

  // Today's attendance calculation
  const todayRec = attendance[todayStr] || {};
  const presentToday = Object.values(todayRec).filter((v) => v === 'Present').length;
  const absentToday = Object.values(todayRec).filter((v) => v === 'Absent').length;
  const totalMarkedToday = presentToday + absentToday;
  const attendanceRate = totalMarkedToday
    ? Math.round((presentToday / totalMarkedToday) * 100)
    : 0;

  // Monthly fees calculation
  const totalExpectedThisMonth = students.reduce((sum, s) => sum + (s.fee || 0), 0);
  const collectedThisMonth = payments
    .filter((p) => p.month === currentMonthStr)
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingThisMonth = Math.max(0, totalExpectedThisMonth - collectedThisMonth);

  const pendingSubmissions = registrations.filter((r) => r.status === 'pending');

  const formatMoney = (n: number) =>
    '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* Banner / Supabase Sync Notice if not connected */}
      {!supabaseConnected && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Supabase Cloud Connected: Project nyzayyeessptqersipwe</p>
              <p className="text-xs opacity-90">
                To sync all tables (patients, students, attendance, payments), run the 10-second SQL setup script in your Supabase SQL Editor.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('cloud-setup')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-sm transition-all"
          >
            View SQL Setup
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Students & Patients
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {students.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              active enrolled
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
            + {registrations.length} total intake records
          </p>
        </div>

        {/* Present Today */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Present Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {presentToday}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold">
              {attendanceRate}% rate
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {students.length - presentToday} not present yet today
          </p>
        </div>

        {/* Fees Collected This Month */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fees Collected (This Month)
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatMoney(collectedThisMonth)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Expected: {formatMoney(totalExpectedThisMonth)}
          </p>
        </div>

        {/* Pending Fees */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Fees (This Month)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {formatMoney(pendingThisMonth)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Across enrolled students
          </p>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenQuickAddStudent}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-100 transition-all font-semibold text-sm group"
          >
            <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span>+ Add Student</span>
            <span className="text-[11px] font-normal text-blue-700/70 dark:text-blue-300/70">Manual entry</span>
          </button>

          <button
            onClick={() => onNavigate('public-form')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-900 dark:text-purple-100 transition-all font-semibold text-sm group"
          >
            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <span>Patient Intake Form</span>
            <span className="text-[11px] font-normal text-purple-700/70 dark:text-purple-300/70">Public live link</span>
          </button>

          <button
            onClick={() => onNavigate('attendance')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 transition-all font-semibold text-sm group"
          >
            <CalendarCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <span>Mark Attendance</span>
            <span className="text-[11px] font-normal text-emerald-700/70 dark:text-emerald-300/70">Daily register</span>
          </button>

          <button
            onClick={() => onNavigate('fees')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 transition-all font-semibold text-sm group"
          >
            <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
            <span>Manage Fees</span>
            <span className="text-[11px] font-normal text-indigo-700/70 dark:text-indigo-300/70">Receipts & payments</span>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Dual Storage: Synced to Supabase Cloud & Local Browser Storage</span>
          </div>
          <button
            onClick={() => onNavigate('cloud-setup')}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Supabase Database Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Online Intake Submissions Queue (If any pending) */}
      {pendingSubmissions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-300 dark:border-indigo-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white">
                New Online Form Submissions ({pendingSubmissions.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('submissions')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All Submissions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {pendingSubmissions.slice(0, 3).map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{sub.name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                      {sub.type === 'patient' ? 'Patient' : 'Student'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {sub.department_or_course}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Phone: {sub.phone} • Fee: {formatMoney(sub.fee)}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('submissions')}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Attendance Overview */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Today's Attendance Snapshot ({todayStr})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Present: {presentToday} | Absent: {absentToday} | Unmarked: {Math.max(0, students.length - (presentToday + absentToday))}
            </p>
          </div>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Open Attendance Register</span>
          </button>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
            No students registered yet. Add a student or submit the patient intake form.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {students.slice(0, 6).map((student) => {
              const status = todayRec[student.id] || 'Not marked';
              const statusColor =
                status === 'Present'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : status === 'Absent'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                  : status === 'Leave'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-300';

              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {student.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {student.course || 'General'}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${statusColor}`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
