import React from 'react';
import { Payment, Student } from '../types.ts';
import { Printer, X, CheckCircle2, BookOpen } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment | null;
  student?: Student;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  student,
  onClose,
}) => {
  if (!payment) return null;

  const formatMoney = (n: number) =>
    '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 print:shadow-none print:border-none print:p-0">
        {/* Modal Controls (hidden during print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
              {payment.receipt}
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Fee Payment Receipt
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Receipt Body */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 print:bg-white print:border-slate-300 space-y-4 text-xs font-mono">
          {/* Header */}
          <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold font-sans text-slate-900 dark:text-white">
                Parinda Study
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-sans font-semibold">
              Student • Attendance • Monthly Fees Management
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt No:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {payment.receipt}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Student Name:</span>
              <span className="font-bold text-slate-900 dark:text-white font-sans text-sm">
                {student?.name || payment.studentName || 'Student'}
              </span>
            </div>

            {student?.course && (
              <div className="flex justify-between">
                <span className="text-slate-500">Course / Batch:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {student.course}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-slate-500">Billing Month:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {payment.month}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Payment Date:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {payment.date}
              </span>
            </div>

            {payment.notes && (
              <div className="flex justify-between">
                <span className="text-slate-500">Notes / Mode:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {payment.notes}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-3 border-t-2 border-dashed border-slate-300 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Amount Received:
              </span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatMoney(payment.amount)}
              </span>
            </div>
          </div>

          <div className="text-center pt-4 text-[11px] text-slate-400 font-sans border-t border-slate-200 dark:border-slate-700">
            <p>Thank you for your payment — Parinda Study</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Learn • Grow • Succeed</p>
          </div>
        </div>
      </div>
    </div>
  );
};
