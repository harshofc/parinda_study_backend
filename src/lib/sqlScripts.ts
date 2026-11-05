export const SUPABASE_SETUP_SQL = `-- ==============================================================================
-- PARINDA STUDY & PATIENT INTAKE SYSTEM - SUPABASE DATABASE SCHEMA
-- Copy and run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nyzayyeessptqersipwe/sql/new
-- ==============================================================================

-- 1. Create Patient / Public Intake Registrations table
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    age TEXT,
    gender TEXT,
    type TEXT DEFAULT 'patient',
    department_or_course TEXT NOT NULL,
    reason_or_notes TEXT,
    guardian_name TEXT,
    fee NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Students Directory table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    course TEXT,
    fee NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'student',
    email TEXT,
    age TEXT,
    guardian_name TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Daily Attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    student_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Leave')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_date UNIQUE (date, student_id)
);

-- 4. Create Fee Payments History table
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT,
    month TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    receipt TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS and allow public access for read, insert, update and delete
-- so public patients/students can submit forms and the management portal syncs seamlessly.
-- ==============================================================================

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users full access
CREATE POLICY IF NOT EXISTS "Allow all for patients" ON public.patients
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all for students" ON public.students
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all for attendance" ON public.attendance
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all for payments" ON public.payments
    FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime replication for instant sync (optional but recommended)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.patients, public.students, public.attendance, public.payments;
COMMIT;
`;
