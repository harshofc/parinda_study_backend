import React, { useState, useEffect } from 'react';
import {
  Student,
  AttendanceRecord,
  Payment,
  PatientRegistration,
  TabType,
} from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { StudentsView } from './components/StudentsView.tsx';
import { PublicIntakeForm } from './components/PublicIntakeForm.tsx';
import { SubmissionsView } from './components/SubmissionsView.tsx';
import { AttendanceView } from './components/AttendanceView.tsx';
import { FeesView } from './components/FeesView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { SupabaseSyncView } from './components/SupabaseSyncView.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import {
  testSupabaseConnection,
  fetchRegistrationsFromSupabase,
  upsertStudentToSupabase,
  deleteStudentFromSupabase,
  upsertAttendanceToSupabase,
  insertPaymentToSupabase,
  submitRegistrationToSupabase,
} from './lib/supabase.ts';

const STORAGE_KEY = 'parindaStudyDB';
const THEME_KEY = 'psTheme';

// Initial starter seed data if user starts with clean storage
const INITIAL_STUDENTS: Student[] = [
  {
    id: 's-101',
    name: 'Aman Verma',
    phone: '9876543210',
    course: '12th Physics & Math',
    fee: 1500,
    type: 'student',
    status: 'active',
  },
  {
    id: 's-102',
    name: 'Neha Sharma',
    phone: '9823456781',
    course: 'NEET Biology Batch',
    fee: 2000,
    type: 'student',
    status: 'active',
  },
  {
    id: 's-103',
    name: 'Rahul Gupta',
    phone: '9711223344',
    course: 'IIT-JEE Foundation',
    fee: 2500,
    type: 'student',
    status: 'active',
  },
  {
    id: 's-104',
    name: 'Dr. Sunita Patel (Patient)',
    phone: '9899001122',
    course: 'Physiotherapy & Rehab',
    fee: 800,
    type: 'patient',
    status: 'active',
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(THEME_KEY) === 'dark';
  });

  // Database states
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.students) && parsed.students.length > 0) {
          return parsed.students;
        }
      }
    } catch (e) {
      console.warn('Failed to load local DB:', e);
    }
    return INITIAL_STUDENTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.attendance && typeof parsed.attendance === 'object') {
          return parsed.attendance;
        }
      }
    } catch (_) {}

    // Seed today's sample attendance
    const todayStr = new Date().toLocaleDateString('en-CA');
    return {
      [todayStr]: {
        's-101': 'Present',
        's-102': 'Present',
        's-103': 'Leave',
        's-104': 'Present',
      },
    };
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.payments)) {
          return parsed.payments;
        }
      }
    } catch (_) {}

    const todayStr = new Date().toLocaleDateString('en-CA');
    const monthStr = todayStr.slice(0, 7);
    return [
      {
        id: 'pay-001',
        studentId: 's-101',
        studentName: 'Aman Verma',
        month: monthStr,
        amount: 1500,
        date: todayStr,
        receipt: 'PS-10829471',
        notes: 'UPI payment received',
      },
      {
        id: 'pay-002',
        studentId: 's-102',
        studentName: 'Neha Sharma',
        month: monthStr,
        amount: 1000,
        date: todayStr,
        receipt: 'PS-10829472',
        notes: 'Partial payment',
      },
    ];
  });

  const [registrations, setRegistrations] = useState<PatientRegistration[]>(() => {
    try {
      const savedRegs = localStorage.getItem('parinda_intake_registrations');
      if (savedRegs) {
        const parsed = JSON.parse(savedRegs);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [
      {
        id: 'PAR-2026-4821',
        name: 'Vikas Mehra',
        phone: '9988776655',
        type: 'patient',
        department_or_course: 'General Consultation',
        reason_or_notes: 'Experiencing seasonal cough and checkup for study health.',
        fee: 500,
        status: 'pending',
        created_at: new Date().toISOString(),
        synced_to_supabase: false,
      },
    ];
  });

  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<any>(null);

  // Modal states
  const [activeReceipt, setActiveReceipt] = useState<{
    payment: Payment;
    student?: Student;
  } | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Show Toast Helper
  const showToast = (msg: string) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
    setToastTimer(timer);
  };

  // Sync to local storage
  useEffect(() => {
    const payload = {
      students,
      attendance,
      payments,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [students, attendance, payments]);

  useEffect(() => {
    localStorage.setItem('parinda_intake_registrations', JSON.stringify(registrations));
  }, [registrations]);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [darkMode]);

  // Check Supabase connection on startup & fetch latest online submissions
  const checkSupabase = async () => {
    try {
      const status = await testSupabaseConnection();
      setSupabaseConnected(status.connected);

      // Try fetching patient submissions from Supabase if table exists
      if (status.patients) {
        const cloudSubmissions = await fetchRegistrationsFromSupabase();
        if (cloudSubmissions && cloudSubmissions.length > 0) {
          setRegistrations((prev) => {
            // merge cloud and local by ID
            const map = new Map<string, PatientRegistration>();
            prev.forEach((r) => map.set(r.id, r));
            cloudSubmissions.forEach((r) => map.set(r.id, r));
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          });
        }
      }
    } catch (e) {
      console.warn('Initial Supabase check error:', e);
    }
  };

  useEffect(() => {
    checkSupabase();
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  // Handlers for Students
  const handleAddStudent = async (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    try {
      await upsertStudentToSupabase(newStudent);
    } catch (_) {}
  };

  const handleUpdateStudent = async (updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    try {
      await upsertStudentToSupabase(updated);
    } catch (_) {}
  };

  const handleDeleteStudent = async (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));

    // Remove from attendance
    setAttendance((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((d) => {
        if (next[d][studentId]) {
          const dayCopy = { ...next[d] };
          delete dayCopy[studentId];
          next[d] = dayCopy;
        }
      });
      return next;
    });

    // Remove payments
    setPayments((prev) => prev.filter((p) => p.studentId !== studentId));

    try {
      await deleteStudentFromSupabase(studentId);
    } catch (_) {}
    showToast('Student deleted and records cleaned');
  };

  // Handlers for Attendance
  const handleSetAttendance = async (
    date: string,
    studentId: string,
    status: 'Present' | 'Absent' | 'Leave'
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [studentId]: status,
      },
    }));

    try {
      await upsertAttendanceToSupabase(date, studentId, status);
    } catch (_) {}
  };

  const handleMarkAllAttendance = async (
    date: string,
    status: 'Present' | 'Absent' | 'Leave'
  ) => {
    const dayObj: { [id: string]: 'Present' | 'Absent' | 'Leave' } = {};
    students.forEach((s) => {
      dayObj[s.id] = status;
    });

    setAttendance((prev) => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        ...dayObj,
      },
    }));

    // Sync in background
    Promise.all(
      students.map((s) => upsertAttendanceToSupabase(date, s.id, status).catch(() => {}))
    );
  };

  const handleClearDayAttendance = (date: string) => {
    setAttendance((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  };

  // Handlers for Fees & Payments
  const handleAddPayment = async (newPayment: Payment) => {
    setPayments((prev) => [...prev, newPayment]);
    try {
      await insertPaymentToSupabase(newPayment);
    } catch (_) {}

    // Show printable receipt modal right away
    const s = students.find((x) => x.id === newPayment.studentId);
    setActiveReceipt({ payment: newPayment, student: s });
  };

  const handleDeletePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    showToast('Payment record removed');
  };

  const handleUpdateStudentFee = async (studentId: string, newFee: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const up = { ...s, fee: newFee };
          upsertStudentToSupabase(up).catch(() => {});
          return up;
        }
        return s;
      })
    );
  };

  // Handlers for Online Registrations / Submissions
  const handleRegistrationAdded = (newReg: PatientRegistration) => {
    setRegistrations((prev) => [newReg, ...prev]);
  };

  const handleApproveAndEnroll = async (reg: PatientRegistration) => {
    // Update status in submissions
    setRegistrations((prev) =>
      prev.map((r) => (r.id === reg.id ? { ...r, status: 'approved' } : r))
    );

    // Create enrolled student
    const enrolledStudent: Student = {
      id: 'enr-' + Date.now().toString(36),
      name: reg.name,
      phone: reg.phone,
      course: reg.department_or_course,
      fee: reg.fee || 500,
      type: reg.type,
      email: reg.email,
      age: reg.age,
      guardianName: reg.guardian_name,
      notes: reg.reason_or_notes,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    setStudents((prev) => [enrolledStudent, ...prev]);

    try {
      await upsertStudentToSupabase(enrolledStudent);
      await submitRegistrationToSupabase({ ...reg, status: 'approved' });
    } catch (_) {}

    showToast(`Enrolled ${reg.name} into active student & fee register!`);
  };

  const handleDeleteSubmission = (id: string) => {
    if (confirm('Delete this online intake submission?')) {
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      showToast('Submission deleted');
    }
  };

  // Push all local data to Supabase
  const handleForceSyncAll = async () => {
    let syncedStudents = 0;
    let syncedPayments = 0;
    let syncedRegs = 0;

    for (const s of students) {
      try {
        await upsertStudentToSupabase(s);
        syncedStudents++;
      } catch (_) {}
    }

    for (const r of registrations) {
      try {
        await submitRegistrationToSupabase(r);
        syncedRegs++;
      } catch (_) {}
    }

    for (const p of payments) {
      try {
        await insertPaymentToSupabase(p);
        syncedPayments++;
      } catch (_) {}
    }

    showToast(
      `Sync Complete! Pushed ${syncedStudents} students, ${syncedRegs} intake forms, ${syncedPayments} payments.`
    );
  };

  // Backup Export & Import
  const handleExportBackup = () => {
    const backup = {
      students,
      attendance,
      payments,
      registrations,
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `parinda-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Database backup downloaded successfully');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!Array.isArray(data.students) || !data.attendance) {
          throw new Error('Invalid backup file structure');
        }

        if (
          confirm(
            'Importing backup will merge/replace existing records in this app. Proceed?'
          )
        ) {
          setStudents(data.students || []);
          setAttendance(data.attendance || {});
          setPayments(data.payments || []);
          if (Array.isArray(data.registrations)) {
            setRegistrations(data.registrations);
          }
          showToast('Backup restored successfully!');
        }
      } catch (err: any) {
        alert('Failed to parse backup file: ' + err.message);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const pendingSubmissionsCount = registrations.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        submissionsCount={pendingSubmissionsCount}
        supabaseConnected={supabaseConnected}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            students={students}
            attendance={attendance}
            payments={payments}
            registrations={registrations}
            onNavigate={setCurrentTab}
            onOpenQuickAddStudent={() => {
              setEditingStudent(null);
              setCurrentTab('students');
            }}
            supabaseConnected={supabaseConnected}
          />
        )}

        {currentTab === 'students' && (
          <StudentsView
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            showToast={showToast}
            editingStudent={editingStudent}
            setEditingStudent={setEditingStudent}
          />
        )}

        {currentTab === 'public-form' && (
          <PublicIntakeForm
            onRegistrationAdded={handleRegistrationAdded}
            showToast={showToast}
          />
        )}

        {currentTab === 'submissions' && (
          <SubmissionsView
            registrations={registrations}
            onApproveAndEnroll={handleApproveAndEnroll}
            onDeleteSubmission={handleDeleteSubmission}
            onRefreshFromSupabase={checkSupabase}
            showToast={showToast}
          />
        )}

        {currentTab === 'attendance' && (
          <AttendanceView
            students={students}
            attendance={attendance}
            onSetAttendance={handleSetAttendance}
            onMarkAll={handleMarkAllAttendance}
            onClearDay={handleClearDayAttendance}
            showToast={showToast}
          />
        )}

        {currentTab === 'fees' && (
          <FeesView
            students={students}
            payments={payments}
            onAddPayment={handleAddPayment}
            onDeletePayment={handleDeletePayment}
            onUpdateStudentFee={handleUpdateStudentFee}
            onPrintReceipt={(p, s) => setActiveReceipt({ payment: p, student: s })}
            showToast={showToast}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            students={students}
            attendance={attendance}
            payments={payments}
          />
        )}

        {currentTab === 'cloud-setup' && (
          <SupabaseSyncView
            students={students}
            attendance={attendance}
            payments={payments}
            registrations={registrations}
            onForceSyncAll={handleForceSyncAll}
            showToast={showToast}
          />
        )}
      </main>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        payment={activeReceipt?.payment || null}
        student={activeReceipt?.student}
        onClose={() => setActiveReceipt(null)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-500 dark:text-slate-500 print:hidden border-t border-slate-200 dark:border-slate-800 mt-12">
        <p className="font-semibold text-slate-700 dark:text-slate-400">
          © 2026 Parinda Study • Management & Patient Intake Portal
        </p>
        <p className="mt-1 text-slate-400">
          Supabase Project: <code className="font-mono text-blue-600 dark:text-blue-400">nyzayyeessptqersipwe</code> • Learn • Grow • Succeed
        </p>
      </footer>
    </div>
  );
}
