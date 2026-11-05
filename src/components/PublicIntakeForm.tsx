import React, { useState } from 'react';
import { PatientRegistration, RegistrationType } from '../types.ts';
import { submitRegistrationToSupabase } from '../lib/supabase.ts';
import confetti from 'canvas-confetti';
import {
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  IndianRupee,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Stethoscope,
  GraduationCap,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface PublicIntakeFormProps {
  onRegistrationAdded: (registration: PatientRegistration) => void;
  showToast: (msg: string) => void;
}

export const PublicIntakeForm: React.FC<PublicIntakeFormProps> = ({
  onRegistrationAdded,
  showToast,
}) => {
  const [type, setType] = useState<RegistrationType>('patient');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Not specified');
  const [departmentOrCourse, setDepartmentOrCourse] = useState('');
  const [reasonOrNotes, setReasonOrNotes] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [fee, setFee] = useState('500');

  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<PatientRegistration | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter a valid contact phone number.');
      return;
    }
    if (!departmentOrCourse.trim()) {
      setErrorMsg(`Please specify the ${type === 'patient' ? 'Department / Medical Concern' : 'Course / Batch'}.`);
      return;
    }

    setSubmitting(true);

    const generatedId =
      'PAR-' +
      new Date().getFullYear() +
      '-' +
      Math.floor(1000 + Math.random() * 9000);

    const newRegistration: PatientRegistration = {
      id: generatedId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      age: age ? String(age).trim() : undefined,
      gender,
      type,
      department_or_course: departmentOrCourse.trim(),
      reason_or_notes: reasonOrNotes.trim() || undefined,
      guardian_name: guardianName.trim() || undefined,
      fee: Number(fee) || 0,
      status: 'pending',
      created_at: new Date().toISOString(),
      synced_to_supabase: false,
    };

    let synced = false;
    try {
      // Attempt sending directly to Supabase cloud database
      await submitRegistrationToSupabase(newRegistration);
      synced = true;
      newRegistration.synced_to_supabase = true;
    } catch (err: any) {
      console.warn('Supabase online store notice:', err.message);
      // We still proceed gracefully to store locally and queue for sync
    }

    // Add to app state & storage
    onRegistrationAdded(newRegistration);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (_) {}

    setSubmittedRecord(newRegistration);
    setSubmitting(false);

    if (synced) {
      showToast('Form submitted & stored directly in Supabase database!');
    } else {
      showToast('Form saved locally! Will sync to Supabase once tables are set up.');
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setAge('');
    setGender('Not specified');
    setDepartmentOrCourse('');
    setReasonOrNotes('');
    setGuardianName('');
    setFee('500');
    setSubmittedRecord(null);
    setErrorMsg(null);
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Intake form link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const printSlip = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Share / Embed Header Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Public Online Intake Form
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Patients and students fill this form to store submissions directly in Supabase.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Shareable URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Card when submitted */}
      {submittedRecord ? (
        <div className="bg-white dark:bg-slate-800 border-2 border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              Registration Successful
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
              Thank You, {submittedRecord.name}!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Your intake form has been recorded in the system.
            </p>
          </div>

          {/* Registration Slip for Print */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b pb-2 border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Registration ID:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {submittedRecord.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Applicant Type:</span>
              <span className="font-bold uppercase text-purple-600 dark:text-purple-400">
                {submittedRecord.type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {submittedRecord.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {submittedRecord.phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department / Course:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {submittedRecord.department_or_course}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Registered Fee / Est.:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ₹{submittedRecord.fee}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Database Status:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {submittedRecord.synced_to_supabase
                  ? 'Cloud Synced (Supabase: nyzayyeessptqersipwe)'
                  : 'Saved Locally & Pending Cloud Push'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
            <button
              onClick={printSlip}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Intake Slip</span>
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Submit Another Form</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Registration & Intake Portal</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Parinda Study & Patient Intake
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Please fill out your details below to submit your admission or medical consultation intake.
            </p>
          </div>

          {/* Intake Type Selector */}
          <div className="bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl flex gap-1 mb-6 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setType('patient');
                if (!departmentOrCourse || departmentOrCourse === 'Science Batch') {
                  setDepartmentOrCourse('General Consultation');
                }
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                type === 'patient'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Patient Intake</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('student');
                if (!departmentOrCourse || departmentOrCourse === 'General Consultation') {
                  setDepartmentOrCourse('Science Batch');
                }
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                type === 'student'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Admission</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={type === 'patient' ? 'e.g. Ramesh Kumar' : 'e.g. Priya Sharma'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-500" />
                  <span>Phone / WhatsApp *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email & Age/Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Age (Years)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="e.g. 19"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Gender</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                >
                  <option value="Not specified">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>Email (Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Department / Course & Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    {type === 'patient'
                      ? 'Medical Department / Concern *'
                      : 'Course / Batch Enrolled *'}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    type === 'patient'
                      ? 'e.g. General OPD, Dental, Cardiology'
                      : 'e.g. Class 12 Physics, IIT-JEE, NEET'
                  }
                  value={departmentOrCourse}
                  onChange={(e) => setDepartmentOrCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    {type === 'patient'
                      ? 'Consultation / Registration Fee (₹)'
                      : 'Monthly Tuition Fee (₹)'}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="500"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Guardian Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Emergency Contact / Guardian Name (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Guardian or emergency contact full name and phone"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* Notes / Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>
                  {type === 'patient'
                    ? 'Medical Symptoms / Reason for Visit / Medical History'
                    : 'Study Goals / Previous Schooling / Timings Preference'}
                </span>
              </label>
              <textarea
                rows={3}
                placeholder={
                  type === 'patient'
                    ? 'Briefly describe your symptoms or what you want to consult regarding...'
                    : 'Mention any previous grades, batch timing requests, or focus subjects...'
                }
                value={reasonOrNotes}
                onChange={(e) => setReasonOrNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* Supabase Storage Notice */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Encrypted & stored in Supabase: Project nyzayyeessptqersipwe</span>
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Direct Cloud Sync
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving to Supabase Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Intake Registration</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
