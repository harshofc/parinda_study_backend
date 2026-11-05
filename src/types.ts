export type RegistrationType = 'student' | 'patient';

export interface Student {
  id: string;
  name: string;
  phone: string;
  course: string;
  fee: number;
  type?: RegistrationType;
  email?: string;
  age?: number | string;
  guardianName?: string;
  notes?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  synced_to_supabase?: boolean;
}

export interface PatientRegistration {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number | string;
  gender?: string;
  type: RegistrationType;
  department_or_course: string;
  reason_or_notes?: string;
  guardian_name?: string;
  fee: number;
  status: 'pending' | 'approved' | 'archived';
  created_at: string;
  synced_to_supabase?: boolean;
}

export interface AttendanceRecord {
  // key: date (YYYY-MM-DD) -> studentId -> status ('Present' | 'Absent' | 'Leave')
  [date: string]: {
    [studentId: string]: 'Present' | 'Absent' | 'Leave';
  };
}

export interface Payment {
  id: string;
  studentId: string;
  studentName?: string;
  month: string; // YYYY-MM
  amount: number;
  date: string; // YYYY-MM-DD
  receipt: string; // e.g. PS-12345678
  notes?: string;
  synced_to_supabase?: boolean;
}

export interface SupabaseConfig {
  projectId: string;
  url: string;
  apiKey: string;
}

export type TabType =
  | 'dashboard'
  | 'students'
  | 'public-form'
  | 'submissions'
  | 'attendance'
  | 'fees'
  | 'reports'
  | 'cloud-setup';
