import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PulseProvider, usePulse } from './context/PulseContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { LeaderboardView } from './components/LeaderboardView';
import { ParentPortal } from './components/ParentPortal';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentProfileView } from './components/StudentProfileView';
import { TeacherClassView } from './components/TeacherClassView';
import { CommunicationCenter } from './components/CommunicationCenter';
import { PointRecordsView } from './components/PointRecordsView';
import { CorrectionsQueue } from './components/CorrectionsQueue';
import { RulesAndWeightsModal } from './components/RulesAndWeightsModal';
import { AuditLogModal } from './components/AuditLogModal';
import { TeacherRecordModal } from './components/TeacherRecordModal';
import { X, CheckCircle2, AlertTriangle, Info, ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';

const AuthenticatedApp: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { toasts, removeToast, currentFamily } = usePulse();

  const role = currentUser?.role || 'parent';

  // Determine initial home tab based on role
  const getDefaultTab = () => {
    if (role === 'student') return 'student-portal';
    if (role === 'parent') return 'parent-portal';
    if (role === 'teacher') return 'my-classes';
    if (role === 'admin') return 'leaderboard';
    return 'leaderboard';
  };

  const [currentTab, setCurrentTab] = useState<string>(getDefaultTab());
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<string | undefined>(undefined);

  // When user changes (e.g. switching demo persona), re-route to their role home page
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'student') {
        setCurrentTab('student-portal');
      } else if (currentUser.role === 'parent') {
        setCurrentTab('parent-portal');
      } else if (currentUser.role === 'teacher') {
        setCurrentTab('my-classes');
      } else if (currentUser.role === 'admin') {
        setCurrentTab('leaderboard');
      }
    }
  }, [currentUser?.id, currentUser?.role]);

  // Protected route enforcement
  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  // Check if currentTab is authorized for this role
  const isTabAllowed = (tab: string, userRole: string): boolean => {
    if (userRole === 'admin') return true;
    if (userRole === 'teacher') {
      return ['my-classes', 'leaderboard', 'point-records', 'communications', 'corrections', 'parent-portal'].includes(tab);
    }
    if (userRole === 'parent') {
      return ['parent-portal', 'leaderboard', 'point-records', 'communications', 'corrections'].includes(tab);
    }
    if (userRole === 'student') {
      return ['student-portal', 'point-records', 'communications', 'student-profile'].includes(tab);
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-50 flex flex-col font-sans">
      {/* Top Bar with user session profile and role navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenRecordModal={() => {
          setSelectedStudentForModal(undefined);
          setIsRecordModalOpen(true);
        }}
      />

      {/* Role Notice & Perspective Helper */}
      <div className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[11px] sm:text-xs py-2 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-white">Active Session:</span>
            {role === 'parent' && (
              <span className="text-slate-200">
                {currentUser.name} · Parent Account ({currentUser.linkedEntities.children?.map(c => c.name).join(', ')})
              </span>
            )}
            {role === 'student' && (
              <span className="text-slate-200">
                {currentUser.name} · {currentUser.linkedEntities.className} ({currentFamily?.displayTitle})
              </span>
            )}
            {role === 'teacher' && (
              <span className="text-slate-200">
                {currentUser.name} · Assigned to {currentUser.linkedEntities.assignedClasses?.join(', ')}
              </span>
            )}
            {role === 'admin' && (
              <span className="text-slate-200">
                {currentUser.name} · Full School Administrative Authority
              </span>
            )}
          </div>
          <div className="text-slate-400 flex flex-wrap items-center gap-2 sm:gap-3">
            <span>The Seaside Schools</span>
            <span aria-hidden="true">·</span>
            <span>Weighted 80% Student / 20% Parent</span>
          </div>
        </div>
      </div>

      {/* Main View Container with role-protected view rendering */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {!isTabAllowed(currentTab, role) ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center max-w-lg mx-auto my-12 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your account ({currentUser.name}, {role}) does not have permission to view this section.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setCurrentTab(getDefaultTab())}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Your Dashboard</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentTab === 'student-portal' && (
              <StudentDashboard 
                onNavigateToPoints={() => setCurrentTab('point-records')}
                onNavigateToMessages={() => setCurrentTab('communications')}
                onNavigateToProfile={() => setCurrentTab('student-profile')}
              />
            )}
            {currentTab === 'student-profile' && (
              <StudentProfileView
                onNavigateToDashboard={() => setCurrentTab('student-portal')}
                onNavigateToPoints={() => setCurrentTab('point-records')}
              />
            )}
            {currentTab === 'my-classes' && (
              <TeacherClassView
                onOpenRecordModal={(stuId) => {
                  setSelectedStudentForModal(stuId);
                  setIsRecordModalOpen(true);
                }}
                onNavigateToCorrections={() => setCurrentTab('corrections')}
                onNavigateToMessages={() => setCurrentTab('communications')}
              />
            )}
            {currentTab === 'leaderboard' && (
              <LeaderboardView onNavigateToParentPortal={() => setCurrentTab('parent-portal')} />
            )}
            {currentTab === 'parent-portal' && (
              <ParentPortal onNavigateToCommunications={() => setCurrentTab('communications')} />
            )}
            {currentTab === 'communications' && <CommunicationCenter />}
            {currentTab === 'point-records' && (
              <PointRecordsView 
                onOpenRecordModal={() => {
                  setSelectedStudentForModal(undefined);
                  setIsRecordModalOpen(true);
                }} 
              />
            )}
            {currentTab === 'corrections' && <CorrectionsQueue />}
            {currentTab === 'rules' && <RulesAndWeightsModal />}
            {currentTab === 'audit-logs' && <AuditLogModal />}
          </>
        )}
      </main>

      {/* Teacher Point Recording Modal */}
      {(role === 'teacher' || role === 'admin') && (
        <TeacherRecordModal
          isOpen={isRecordModalOpen}
          onClose={() => {
            setIsRecordModalOpen(false);
            setSelectedStudentForModal(undefined);
          }}
          preselectedStudentId={selectedStudentForModal}
        />
      )}

      {/* Toast Notification Stack */}
      <div className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-50 space-y-2 sm:space-y-3 sm:max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-xl shadow-lg border text-xs transition-all ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-amber-100 border-amber-800'
                : 'bg-indigo-950 text-indigo-100 border-indigo-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}

            <div className="flex-1 space-y-0.5 min-w-0">
              <div className="font-semibold text-white truncate">{toast.title}</div>
              <div className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">{toast.description}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Clean Educational Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 sm:py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <span className="font-bold text-slate-900 text-sm tracking-tight">PULSE</span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span>The Seaside Schools · Parents Leaderboard Programme & School Communication</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] sm:text-xs">
            <span>80% Student Habits</span>
            <span>20% Parent Participation</span>
            <span>Zero Public Shaming</span>
            <span>Role-Based Access Control</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PulseProvider>
        <AuthenticatedApp />
      </PulseProvider>
    </AuthProvider>
  );
}
