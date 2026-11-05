import React, { useState } from 'react';
import { Student, Payment } from '../types.ts';
import {
  CreditCard,
  Search,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  PlusCircle,
  FileText,
  Trash2,
  X,
} from 'lucide-react';

interface FeesViewProps {
  students: Student[];
  payments: Payment[];
  onAddPayment: (payment: Payment) => void;
  onDeletePayment: (paymentId: string) => void;
  onUpdateStudentFee: (studentId: string, newFee: number) => void;
  onPrintReceipt: (payment: Payment, student?: Student) => void;
  showToast: (msg: string) => void;
}

export const FeesView: React.FC<FeesViewProps> = ({
  students,
  payments,
  onAddPayment,
  onDeletePayment,
  onUpdateStudentFee,
  onPrintReceipt,
  showToast,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toLocaleDateString('en-CA').slice(0, 7)
  );
  const [search, setSearch] = useState('');

  // Payment modal state
  const [payingStudent, setPayingStudent] = useState<Student | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [payNotes, setPayNotes] = useState('');

  // Set fee modal state
  const [editingFeeStudent, setEditingFeeStudent] = useState<Student | null>(null);
  const [newFeeValue, setNewFeeValue] = useState('');

  // Calculations for selected month
  const studentPayments = (studentId: string) => {
    return payments
      .filter((p) => p.month === selectedMonth && p.studentId === studentId)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  let totalExpected = 0;
  let totalCollected = 0;
  let fullyPaidCount = 0;

  const studentFeeRows = students.map((s) => {
    const paid = studentPayments(s.id);
    const balance = Math.max(0, (s.fee || 0) - paid);
    totalExpected += s.fee || 0;
    totalCollected += paid;
    if (balance === 0 && s.fee > 0) {
      fullyPaidCount++;
    }

    let status: 'Paid' | 'Partial' | 'Unpaid' | 'No Fee' = 'Unpaid';
    if (!s.fee || s.fee === 0) status = 'No Fee';
    else if (paid >= s.fee) status = 'Paid';
    else if (paid > 0) status = 'Partial';

    return {
      student: s,
      fee: s.fee || 0,
      paid,
      balance,
      status,
    };
  });

  const totalPending = Math.max(0, totalExpected - totalCollected);

  const filteredFeeRows = studentFeeRows.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.student.name.toLowerCase().includes(q) ||
      (r.student.course && r.student.course.toLowerCase().includes(q))
    );
  });

  const monthPayments = payments.filter((p) => p.month === selectedMonth).slice().reverse();

  const formatMoney = (n: number) =>
    '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const handleOpenPayment = (s: Student, balance: number) => {
    if (balance <= 0 && s.fee > 0) {
      showToast('This month is already fully paid!');
      return;
    }
    setPayingStudent(s);
    setPayAmount(String(balance > 0 ? balance : s.fee));
    setPayDate(new Date().toLocaleDateString('en-CA'));
    setPayNotes('');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingStudent) return;

    const amount = Number(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast('Please enter a valid positive payment amount');
      return;
    }

    const currentPaid = studentPayments(payingStudent.id);
    const remainingBalance = Math.max(0, (payingStudent.fee || 0) - currentPaid);

    if (amount > remainingBalance && payingStudent.fee > 0) {
      if (!confirm(`Amount (₹${amount}) is greater than remaining balance (₹${remainingBalance}). Proceed anyway?`)) {
        return;
      }
    }

    const receiptNo = 'PS-' + Date.now().toString().slice(-8);
    const payment: Payment = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      studentId: payingStudent.id,
      studentName: payingStudent.name,
      month: selectedMonth,
      amount,
      date: payDate,
      receipt: receiptNo,
      notes: payNotes.trim() || undefined,
    };

    onAddPayment(payment);
    showToast(`Payment of ₹${amount} recorded (Receipt: ${receiptNo})`);
    setPayingStudent(null);
  };

  const handleConfirmSetFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeeStudent) return;
    const feeVal = Number(newFeeValue);
    if (!Number.isFinite(feeVal) || feeVal < 0) {
      showToast('Please enter a valid fee amount');
      return;
    }
    onUpdateStudentFee(editingFeeStudent.id, feeVal);
    showToast(`Monthly fee updated to ₹${feeVal}`);
    setEditingFeeStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* Monthly Fee Header Panel */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Monthly Fee Register
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Track student fee payments, pending balances, and generate instant printable receipts
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Register</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Month picker & search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 print:hidden">
          <div className="flex-1 sm:max-w-xs">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Billing Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Filter Students
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search student by name or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Expected</span>
              <IndianRupee className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {formatMoney(totalExpected)}
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider">Collected</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              {formatMoney(totalCollected)}
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Balance</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
              {formatMoney(totalPending)}
            </p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400">
              <span className="text-xs font-bold uppercase tracking-wider">Fully Paid</span>
              <span className="text-xs font-bold">{fullyPaidCount} students</span>
            </div>
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
              {fullyPaidCount}
            </p>
          </div>
        </div>
      </div>

      {/* Student Fee Register Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Fee Accounts for Month: <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedMonth}</span>
          </span>
          <span className="text-xs text-slate-500">
            {students.length} accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Monthly Fee</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredFeeRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students found matching "{search}"
                  </td>
                </tr>
              ) : (
                filteredFeeRows.map(({ student, fee, paid, balance, status }) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {student.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {student.course || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {formatMoney(fee)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(paid)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatMoney(balance)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : status === 'Partial'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : status === 'Unpaid'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700/60'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right print:hidden">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPayment(student, balance)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-all flex items-center gap-1 shadow-sm"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>+ Payment</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingFeeStudent(student);
                            setNewFeeValue(String(student.fee));
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition-all"
                        >
                          Set Fee
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span>Payment History for {selectedMonth}</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4">Receipt</th>
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Month</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {monthPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No payment transactions recorded for {selectedMonth}
                  </td>
                </tr>
              ) : (
                monthPayments.map((p) => {
                  const s = students.find((x) => x.id === p.studentId);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {p.receipt}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                        {s?.name || p.studentName || 'Deleted student'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">
                        {p.month}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(p.amount)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {p.date}
                      </td>
                      <td className="py-2.5 px-4 text-right print:hidden">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPrintReceipt(p, s)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] transition-all flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete payment transaction ${p.receipt} of ${formatMoney(p.amount)}?`)) {
                                onDeletePayment(p.id);
                              }
                            }}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add Payment Modal */}
      {payingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Record Fee Payment</span>
              </h3>
              <button
                onClick={() => setPayingStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {payingStudent.name}
                </p>
                <p className="text-slate-500">
                  Course: {payingStudent.course || 'General'} • Month: {selectedMonth}
                </p>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Remaining Balance:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {formatMoney(
                      Math.max(
                        0,
                        (payingStudent.fee || 0) - studentPayments(payingStudent.id)
                      )
                    )}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Payment Mode / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI, Cash, Bank Transfer, Ref#..."
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setPayingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Fee Modal */}
      {editingFeeStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Update Monthly Fee: {editingFeeStudent.name}
            </h3>
            <form onSubmit={handleConfirmSetFee} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Monthly Fee Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={newFeeValue}
                  onChange={(e) => setNewFeeValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFeeStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Update Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
