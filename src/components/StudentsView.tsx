import React, { useState } from 'react';
import { Student, RegistrationType } from '../types.ts';
import {
  UserPlus,
  Users,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Stethoscope,
  GraduationCap,
  IndianRupee,
  Phone,
  BookOpen,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface StudentsViewProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showToast: (msg: string) => void;
  editingStudent: Student | null;
  setEditingStudent: (student: Student | null) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onExportBackup,
  onImportBackup,
  showToast,
  editingStudent,
  setEditingStudent,
}) => {
  const [name, setName] = useState(editingStudent?.name || '');
  const [phone, setPhone] = useState(editingStudent?.phone || '');
  const [course, setCourse] = useState(editingStudent?.course || '');
  const [fee, setFee] = useState(editingStudent ? String(editingStudent.fee) : '500');
  const [type, setType] = useState<RegistrationType>(editingStudent?.type || 'student');
  const [search, setSearch] = useState('');

  // Synchronize state when editingStudent prop changes
  React.useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name);
      setPhone(editingStudent.phone || '');
      setCourse(editingStudent.course || '');
      setFee(String(editingStudent.fee || 0));
      setType(editingStudent.type || 'student');
    } else {
      resetForm();
    }
  }, [editingStudent]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setCourse('');
    setFee('500');
    setType('student');
    setEditingStudent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a student or patient name');
      return;
    }
    const numFee = Number(fee);
    if (!Number.isFinite(numFee) || numFee < 0) {
      showToast('Please enter a valid monthly fee amount');
      return;
    }

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        name: name.trim(),
        phone: phone.trim(),
        course: course.trim(),
        fee: numFee,
        type,
      };
      onUpdateStudent(updated);
      showToast('Student record updated');
    } else {
      const newStudent: Student = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name: name.trim(),
        phone: phone.trim(),
        course: course.trim(),
        fee: numFee,
        type,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      onAddStudent(newStudent);
      showToast('Student added successfully');
    }

    resetForm();
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.course && s.course.toLowerCase().includes(q))
    );
  });

  const formatMoney = (n: number) =>
    '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* Student Entry Form Panel */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
              {editingStudent ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingStudent ? 'Edit Student / Patient Details' : 'Add New Student or Patient'}
            </h2>
          </div>
          {editingStudent && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full font-semibold">
              Editing: {editingStudent.name}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Category Selector */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="patient">Patient</option>
              </select>
            </div>

            {/* Name */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Student full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                placeholder="Contact number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Course / Batch */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Course / Batch
              </label>
              <input
                type="text"
                placeholder={type === 'patient' ? 'e.g. OPD / Therapy' : 'e.g. 10th Math, Physics'}
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Monthly Fee */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Monthly Fee (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="50"
                required
                placeholder="Monthly fee"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{editingStudent ? 'Save Changes' : '+ Add Student'}</span>
            </button>

            {editingStudent && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Student List Panel */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Enrolled Directory ({students.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active students and patients receiving attendance tracking & monthly fee billing
            </p>
          </div>

          {/* Backup & Import Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onExportBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all"
              title="Download full database JSON backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Backup</span>
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={onImportBackup}
              />
            </label>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, phone number, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Course / Batch</th>
                <th className="py-3 px-4">Monthly Fee</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students or patients found matching "{search}"
                  </td>
                </tr>
              ) : (
                filtered.map((s, index) => (
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
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.type === 'patient'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}
                      >
                        {s.type === 'patient' ? (
                          <Stethoscope className="w-3 h-3" />
                        ) : (
                          <GraduationCap className="w-3 h-3" />
                        )}
                        <span>{s.type === 'patient' ? 'Patient' : 'Student'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {s.phone || '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {s.course || '—'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(s.fee)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingStudent(s);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete ${s.name} and remove linked attendance & fee records?`
                              )
                            ) {
                              onDeleteStudent(s.id);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-all"
                        >
                          Delete
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
    </div>
  );
};
