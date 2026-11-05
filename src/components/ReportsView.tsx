import React, { useState } from 'react';
import { Student, AttendanceRecord, Payment } from '../types.ts';
import { BarChart3, Printer, IndianRupee, Users, Calendar, TrendingUp } from 'lucide-react';

interface ReportsViewProps {
  students: Student[];
  attendance: AttendanceRecord;
  payments: Payment[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  attendance,
  payments,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toLocaleDateString('en-CA').slice(0, 7)
  );

  const formatMoney = (n: number) =>
    '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  // Calculate fees
  const expectedFees = students.reduce((acc, s) => acc + (s.fee || 0), 0);
  const collectedFees = payments
    .filter((p) => p.month === selectedMonth)
    .reduce((acc, p) => acc + p.amount, 0);
  const pendingFees = Math.max(0, expectedFees - collectedFees);

  // Calculate attendance for the month
  const monthDays = Object.keys(attendance).filter((date) => date.startsWith(selectedMonth));
  let totalPresentMarks = 0;
  let totalAbsentMarks = 0;
  let totalLeaveMarks = 0;

  monthDays.forEach((date) => {
    const dayRec = attendance[date];
    Object.values(dayRec).forEach((st) => {
      if (st === 'Present') totalPresentMarks++;
      if (st === 'Absent') totalAbsentMarks++;
      if (st === 'Leave') totalLeaveMarks++;
    });
  });

  const totalMarked = totalPresentMarks + totalAbsentMarks;
  const overallRate = totalMarked ? Math.round((totalPresentMarks / totalMarked) * 100) : 0;

  // Student-specific breakdown
  const studentBreakdown = students.map((s) => {
    const studentMonthPayments = payments
      .filter((p) => p.month === selectedMonth && p.studentId === s.id)
      .reduce((sum, p) => sum + p.amount, 0);

    const balance = Math.max(0, (s.fee || 0) - studentMonthPayments);

    let pCount = 0;
    let aCount = 0;
    let lCount = 0;

    monthDays.forEach((d) => {
      const mark = attendance[d]?.[s.id];
      if (mark === 'Present') pCount++;
      if (mark === 'Absent') aCount++;
      if (mark === 'Leave') lCount++;
    });

    const studentTotalMarks = pCount + aCount;
    const studentRate = studentTotalMarks
      ? Math.round((pCount / studentTotalMarks) * 100)
      : 0;

    return {
      student: s,
      expected: s.fee || 0,
      paid: studentMonthPayments,
      balance,
      pCount,
      aCount,
      lCount,
      rate: studentRate,
    };
  });

  return (
    <div className="space-y-6">
      {/* Report Controls Panel */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Monthly Performance & Financial Report
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Consolidated attendance rates, fee realization, and student accounts for {selectedMonth}
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Complete Report</span>
            </button>
          </div>
        </div>

        <div className="max-w-xs mb-5 print:hidden">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Select Report Month
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Report Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 uppercase">Students Enrolled</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {students.length}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
            <span className="text-xs font-semibold text-slate-500 uppercase">Expected Fees</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {formatMoney(expectedFees)}
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-4 rounded-xl">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
              Collected Fees
            </span>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              {formatMoney(collectedFees)}
            </p>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 p-4 rounded-xl">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase">
              Pending Fees
            </span>
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">
              {formatMoney(pendingFees)}
            </p>
          </div>
        </div>

        {/* Attendance Summary Banner */}
        <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 p-4 rounded-xl text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
            <span>Attendance Record Overview:</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {overallRate}% Overall Attendance Rate
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
            <div>Recorded Days: <span className="font-bold">{monthDays.length} days</span></div>
            <div>Present Marks: <span className="font-bold text-emerald-600">{totalPresentMarks}</span></div>
            <div>Absent Marks: <span className="font-bold text-rose-600">{totalAbsentMarks}</span></div>
            <div>Approved Leaves: <span className="font-bold text-amber-600">{totalLeaveMarks}</span></div>
          </div>
        </div>
      </div>

      {/* Individual Breakdown Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Student Summary Breakdown ({selectedMonth})
          </span>
          <span className="text-xs text-slate-500">
            {students.length} accounts analyzed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Fee Due</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Present Days</th>
                <th className="py-3 px-4">Absent Days</th>
                <th className="py-3 px-4">Att. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {studentBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No students enrolled to display in report.
                  </td>
                </tr>
              ) : (
                studentBreakdown.map((item) => (
                  <tr
                    key={item.student.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {item.student.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {item.student.course || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {formatMoney(item.expected)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(item.paid)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatMoney(item.balance)}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {item.pCount}
                    </td>
                    <td className="py-3 px-4 font-mono text-rose-600 dark:text-rose-400 font-bold">
                      {item.aCount}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.rate >= 80
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : item.rate >= 50
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}
                      >
                        {item.rate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
