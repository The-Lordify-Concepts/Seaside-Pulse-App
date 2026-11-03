import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Sparkles, 
  Lock, 
  Mail, 
  ArrowRight, 
  School,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  KeyRound
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemoUser, requestPasswordReset, users } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotFeedback, setForgotFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
      setIsSubmitting(false);
    }, 250);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestPasswordReset(forgotEmail);
    setForgotFeedback(res);
  };

  const demoAccounts = [
    {
      id: 'user-parent-bennett',
      label: 'Parent',
      name: 'Elena & Marcus Bennett',
      email: 'elena.bennett@seasideschools.edu',
      desc: 'Linked to 2 students: Leo (Yr 5) & Sophie (Yr 2)',
      icon: <UserCheck className="w-4 h-4 text-indigo-600" />,
      color: 'hover:border-indigo-300 hover:bg-indigo-50/40'
    },
    {
      id: 'user-student-leo',
      label: 'Student',
      name: 'Leo Bennett',
      email: 'leo.bennett@student.seasideschools.edu',
      desc: 'Year 5 · Class 5A (The Bennett Family)',
      icon: <Sparkles className="w-4 h-4 text-amber-600" />,
      color: 'hover:border-amber-300 hover:bg-amber-50/40'
    },
    {
      id: 'user-teacher-reed',
      label: 'Teacher',
      name: 'Mr. Marcus Reed',
      email: 'marcus.reed@seasideschools.edu',
      desc: 'Assigned to Class 5A & 5B · Point awards & reviews',
      icon: <GraduationCap className="w-4 h-4 text-emerald-600" />,
      color: 'hover:border-emerald-300 hover:bg-emerald-50/40'
    },
    {
      id: 'user-admin-shaw',
      label: 'School Admin',
      name: 'Dr. Katherine Shaw',
      email: 'katherine.shaw@seasideschools.edu',
      desc: 'Headteacher · School-wide governance & weight rules',
      icon: <ShieldCheck className="w-4 h-4 text-slate-700" />,
      color: 'hover:border-slate-400 hover:bg-slate-100/60'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand emblem */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-md mb-3">
          P
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Sign in to PULSE
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          The Seaside Schools Parents Leaderboard & School Communications
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-xl space-y-6">
        {/* Primary Login Card */}
        <div className="bg-white py-6 sm:py-8 px-5 sm:px-10 shadow-sm border border-slate-200 rounded-2xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                School or Parent Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@seasideschools.edu or parent@email.com"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotFeedback(null);
                    setForgotEmail(email || '');
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* School SSO Placeholder */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400">or sign in with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => loginAsDemoUser('user-parent-bennett')}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <School className="w-4 h-4 text-indigo-600" />
              <span>The Seaside Schools SSO</span>
            </button>
            <button
              type="button"
              onClick={() => loginAsDemoUser('user-teacher-reed')}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Staff Identity Portal</span>
            </button>
          </div>
        </div>

        {/* DEMO ACCOUNTS PANEL (Required for testing in AI Studio) */}
        <div className="bg-white p-5 sm:p-6 border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>Instant Demo Access</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Click any role below to sign in immediately with pre-configured account entities.
              </p>
            </div>
            <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
              4 Roles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {demoAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => loginAsDemoUser(account.id)}
                className={`text-left p-3 rounded-xl border border-slate-200 bg-slate-50/50 transition-all ${account.color} group`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    {account.icon}
                    <span>{account.label}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    Sign In →
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800">{account.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{account.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Safe School Assurance Note */}
        <div className="text-center text-[11px] text-slate-400 space-y-1">
          <p>The Seaside Schools PULSE · Secure Student & Family Information System</p>
          <p>Protected by end-to-end encryption · Zero public rank shaming policy</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Reset Account Password
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg"
              >
                ✕
              </button>
            </div>

            {forgotFeedback ? (
              <div className="space-y-4 py-2">
                <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                  forgotFeedback.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {forgotFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{forgotFeedback.message}</span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Return to Login
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered school or parent email address. We'll send an authentication recovery link to verify your identity.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@seasideschools.edu"
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
