import React, { useState } from 'react';
import { PatientRegistration, Student } from '../types.ts';
import { fetchRegistrationsFromSupabase } from '../lib/supabase.ts';
import {
  Inbox,
  Search,
  CheckCircle,
  RefreshCw,
  Eye,
  UserCheck,
  Trash2,
  Stethoscope,
  GraduationCap,
  Download,
  AlertCircle,
  X,
} from 'lucide-react';

interface SubmissionsViewProps {
  registrations: PatientRegistration[];
  onApproveAndEnroll: (registration: PatientRegistration) => void;
  onDeleteSubmission: (id: string) => void;
  onRefreshFromSupabase: () => Promise<void>;
  showToast: (msg: string) => void;
}

export const SubmissionsView: React.FC<SubmissionsViewProps> = ({
  registrations,
  onApproveAndEnroll,
  onDeleteSubmission,
  onRefreshFromSupabase,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'patient' | 'student'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<PatientRegistration | null>(null);

  const filtered = registrations.filter((reg) => {
    const matchesSearch =
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm) ||
      reg.department_or_course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchesType = typeFilter === 'all' || reg.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshFromSupabase();
    setIsRefreshing(false);
  };

  const exportCSV = () => {
    if (registrations.length === 0) {
      showToast('No submissions to export');
      return;
    }
    const headers = [
      'Registration ID',
      'Name',
      'Type',
      'Phone',
      'Email',
      'Age',
      'Department/Course',
      'Fee',
      'Status',
      'Created At',
      'Notes',
    ];
    const rows = registrations.map((r) => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      r.type,
      r.phone,
      r.email || '',
      r.age || '',
      `"${r.department_or_course.replace(/"/g, '""')}"`,
      r.fee,
      r.status,
      r.created_at,
      `"${(r.reason_or_notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parinda-intake-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Submissions exported as CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                <Inbox className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Online Intake Submissions
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live patient & student intake forms stored in Supabase cloud database
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sync from Supabase</span>
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, course, or registration ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved / Enrolled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="patient">Patients Only</option>
              <option value="student">Students Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Ref ID</th>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department / Course</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Fee (₹)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">No intake submissions found</p>
                    <p className="text-[11px] mt-0.5">
                      Submissions received through the Public Intake Form will show up here.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {item.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.gender !== 'Not specified' ? item.gender : ''}
                        {item.age ? ` • ${item.age} yrs` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.type === 'patient'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}
                      >
                        {item.type === 'patient' ? (
                          <Stethoscope className="w-3 h-3" />
                        ) : (
                          <GraduationCap className="w-3 h-3" />
                        )}
                        <span>{item.type === 'patient' ? 'Patient' : 'Student'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {item.department_or_course}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {item.phone}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{item.fee}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {item.status === 'approved' ? 'Enrolled' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSubmission(item)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                          title="View Full Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {item.status !== 'approved' && (
                          <button
                            onClick={() => onApproveAndEnroll(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                            title="Enroll into active directory & enable attendance/fees"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Enroll</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteSubmission(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400"
                          title="Delete submission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold">
                  {selectedSubmission.id}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white">Intake Details</h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Name:</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedSubmission.name}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Category:</span>
                  <p className="font-bold uppercase text-purple-600 dark:text-purple-400">
                    {selectedSubmission.type}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Phone:</span>
                  <p className="font-medium text-slate-900 dark:text-white font-mono">
                    {selectedSubmission.phone}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedSubmission.email || '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Department / Course:</span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedSubmission.department_or_course}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Fee Commitment:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{selectedSubmission.fee}
                  </p>
                </div>
              </div>

              {selectedSubmission.guardian_name && (
                <div>
                  <span className="text-slate-500">Guardian / Contact:</span>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedSubmission.guardian_name}
                  </p>
                </div>
              )}

              {selectedSubmission.reason_or_notes && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-semibold block mb-1">
                    Symptoms / Notes / Requests:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {selectedSubmission.reason_or_notes}
                  </p>
                </div>
              )}

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                Submitted on: {new Date(selectedSubmission.created_at).toLocaleString()}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              {selectedSubmission.status !== 'approved' && (
                <button
                  onClick={() => {
                    onApproveAndEnroll(selectedSubmission);
                    setSelectedSubmission(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Enroll as Active</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
