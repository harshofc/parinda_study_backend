import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PatientRegistration, Student, Payment } from '../types.ts';

// Default Supabase configuration provided by the user
export const DEFAULT_SUPABASE_CONFIG = {
  projectId: 'nyzayyeessptqersipwe',
  url: 'https://nyzayyeessptqersipwe.supabase.co',
  apiKey: 'sb_publishable_LH5YVdHYmT1_aq6rA1dNKw_9inALC4X',
};

const CONFIG_STORAGE_KEY = 'parinda_supabase_config';

export function getSupabaseConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.apiKey) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse saved Supabase config:', e);
  }
  return DEFAULT_SUPABASE_CONFIG;
}

export function saveSupabaseConfig(config: typeof DEFAULT_SUPABASE_CONFIG) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  initClient(config);
}

let supabaseInstance: SupabaseClient | null = null;

export function initClient(config = getSupabaseConfig()): SupabaseClient {
  supabaseInstance = createClient(config.url, config.apiKey, {
    auth: { persistSession: false },
  });
  return supabaseInstance;
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = initClient();
  }
  return supabaseInstance;
}

export interface TableStatus {
  patients: boolean;
  students: boolean;
  attendance: boolean;
  payments: boolean;
  connected: boolean;
  error?: string;
}

/**
 * Tests connection to the user's Supabase instance and checks which tables exist.
 */
export async function testSupabaseConnection(): Promise<TableStatus> {
  const sb = getSupabase();
  const status: TableStatus = {
    patients: false,
    students: false,
    attendance: false,
    payments: false,
    connected: false,
  };

  try {
    // Check patients table
    const { error: patientErr } = await sb.from('patients').select('id').limit(1);
    if (!patientErr) {
      status.patients = true;
      status.connected = true;
    } else if (patientErr.code !== 'PGRST205') {
      // PGRST205 means table does not exist, other errors might still mean connected
      status.connected = true;
    }

    // Check students table
    const { error: studentErr } = await sb.from('students').select('id').limit(1);
    if (!studentErr) {
      status.students = true;
      status.connected = true;
    }

    // Check attendance table
    const { error: attErr } = await sb.from('attendance').select('id').limit(1);
    if (!attErr) {
      status.attendance = true;
      status.connected = true;
    }

    // Check payments table
    const { error: payErr } = await sb.from('payments').select('id').limit(1);
    if (!payErr) {
      status.payments = true;
      status.connected = true;
    }

    if (!status.connected) {
      // If none succeeded, check if the host responds
      try {
        const res = await fetch(`${getSupabaseConfig().url}/rest/v1/`, {
          headers: { apikey: getSupabaseConfig().apiKey },
        });
        if (res.status === 401 || res.status === 200 || res.status === 404) {
          status.connected = true;
        }
      } catch (netErr: any) {
        status.error = netErr.message || 'Cannot reach Supabase host';
      }
    }
  } catch (err: any) {
    status.error = err.message || 'Connection test failed';
  }

  return status;
}

/**
 * Submits a patient / student registration form directly to Supabase.
 */
export async function submitRegistrationToSupabase(registration: PatientRegistration) {
  const sb = getSupabase();
  const payload = {
    id: registration.id,
    name: registration.name,
    phone: registration.phone,
    email: registration.email || null,
    age: registration.age ? String(registration.age) : null,
    gender: registration.gender || null,
    type: registration.type || 'patient',
    department_or_course: registration.department_or_course,
    reason_or_notes: registration.reason_or_notes || null,
    guardian_name: registration.guardian_name || null,
    fee: registration.fee || 0,
    status: registration.status || 'pending',
    created_at: registration.created_at || new Date().toISOString(),
  };

  const { data, error } = await sb.from('patients').upsert(payload).select().single();
  if (error) {
    console.error('Supabase registration error:', error);
    throw error;
  }
  return data;
}

/**
 * Fetch registrations from Supabase.
 */
export async function fetchRegistrationsFromSupabase(): Promise<PatientRegistration[] | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Could not fetch patients from Supabase:', error.message);
    return null;
  }

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    age: row.age || '',
    gender: row.gender || '',
    type: (row.type as any) || 'patient',
    department_or_course: row.department_or_course || '',
    reason_or_notes: row.reason_or_notes || '',
    guardian_name: row.guardian_name || '',
    fee: Number(row.fee) || 0,
    status: row.status || 'pending',
    created_at: row.created_at,
    synced_to_supabase: true,
  }));
}

/**
 * Push student to Supabase
 */
export async function upsertStudentToSupabase(student: Student) {
  const sb = getSupabase();
  const payload = {
    id: student.id,
    name: student.name,
    phone: student.phone || null,
    course: student.course || null,
    fee: student.fee || 0,
    type: student.type || 'student',
    email: student.email || null,
    age: student.age ? String(student.age) : null,
    guardian_name: student.guardianName || null,
    notes: student.notes || null,
    status: student.status || 'active',
  };

  const { data, error } = await sb.from('students').upsert(payload);
  if (error) throw error;
  return data;
}

/**
 * Delete student from Supabase
 */
export async function deleteStudentFromSupabase(studentId: string) {
  const sb = getSupabase();
  const { error } = await sb.from('students').delete().eq('id', studentId);
  if (error) console.warn('Supabase student delete failed:', error.message);
}

/**
 * Save single attendance mark to Supabase
 */
export async function upsertAttendanceToSupabase(date: string, studentId: string, status: string) {
  const sb = getSupabase();
  const id = `${date}_${studentId}`;
  const { error } = await sb.from('attendance').upsert({
    id,
    date,
    student_id: studentId,
    status,
  });
  if (error) console.warn('Supabase attendance sync failed:', error.message);
}

/**
 * Save payment to Supabase
 */
export async function insertPaymentToSupabase(payment: Payment) {
  const sb = getSupabase();
  const payload = {
    id: payment.id,
    student_id: payment.studentId,
    student_name: payment.studentName || null,
    month: payment.month,
    amount: payment.amount,
    date: payment.date,
    receipt: payment.receipt,
    notes: payment.notes || null,
  };
  const { error } = await sb.from('payments').upsert(payload);
  if (error) console.warn('Supabase payment sync failed:', error.message);
}
