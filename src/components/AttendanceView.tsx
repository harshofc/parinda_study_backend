import React, { useState } from 'react';
import { Student, AttendanceRecord } from '../types.ts';
import {
  CalendarCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Trash2,
  Users,
  CheckCheck,
} from 'lucide-react';

interface AttendanceViewProps {
  students: Student[];
  attendance: AttendanceRecord;
  onSetAttendance: (date: string, studentId: string, status: 'Present' | 'Absent' | 'Leave') => void;
  onMarkAll: (date: string, status: 'Present' | 'Absent' | 'Leave') => void;
  onClearDay: (date: string) => void;
  showToast: (msg: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendance,
  onSetAttendance,
  onMarkAll,
  onClearDay,
  showToast,
}) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [search, setSearch] = useState('');

  const dateRecord = attendance[selectedDate] || {};

  const presentCount = Object.values(dateRecord).filter((v) => v === 'Present').length;
  const absentCount = Object.values(dateRecord).filter((v) => v === 'Absent').length;
  const leaveCount = Object.values(dateRecord).filter((v) => v === 'Leave').length;
  const markedTotal = presentCount + absentCount;
  const rate = markedTotal ? Math.round((presentCount / markedTotal) * 100) : 0;

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.course && s.course.toLowerCase().includes(q));
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Attendance Header & Controls Panel */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Daily Attendance Register
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mark attendance for students and patient appointments. Data persists in browser & Supabase.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap print:hidden">
            <button
              onClick={() => {
                onMarkAll(selectedDate, 'Present');
                showToast(`Marked all students present for ${selectedDate}`);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Present</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`Clear all attendance records for date ${selectedDate}?`)) {
                  onClearDay(selectedDate);
                  showToast('Attendance cleared for selected date');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Day</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Date picker & search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 print:hidden">
          <div className="flex-1 sm:max-w-xs">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Filter Enrolled Students
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student or patient name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Attendance Statistics Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider">Present</span>
              <CheckCircle className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">
              {presentCount}
            </p>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
              <span className="text-xs font-bold uppercase tracking-wider">Absent</span>
              <XCircle className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-rose-900 dark:text-rose-200 mt-1">
              {absentCount}
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider">Leave</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">
              {leaveCount}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-blue-700 dark:text-blue-400">
              <span className="text-xs font-bold uppercase tracking-wider">Rate</span>
              <span className="text-xs font-bold">{rate}%</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">
              {rate}%
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Register for Date: <span className="font-mono text-blue-600 dark:text-blue-400">{selectedDate}</span>
          </span>
          <span className="text-xs text-slate-500">
            {students.length} students enrolled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Student / Patient</th>
                <th className="py-3 px-4">Course / Department</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right print:hidden">Mark Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No students found. Add students first in the Students & Patients tab.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, index) => {
                  const currentStatus = dateRecord[s.id] || 'Not marked';
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {s.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {s.course || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : currentStatus === 'Absent'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                              : currentStatus === 'Leave'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-400'
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right print:hidden">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSetAttendance(selectedDate, s.id, 'Present')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-700 text-white shadow'
                                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => onSetAttendance(selectedDate, s.id, 'Absent')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-700 text-white shadow'
                                : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => onSetAttendance(selectedDate, s.id, 'Leave')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Leave'
                                ? 'bg-amber-700 text-white shadow'
                                : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
