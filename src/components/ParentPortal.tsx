import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePulse } from '../context/PulseContext';
import { 
  Award, 
  Clock, 
  BookOpen, 
  Heart, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import { PointActivity } from '../types/pulse';

export const ParentPortal: React.FC<{ onNavigateToCommunications: () => void }> = ({ onNavigateToCommunications }) => {
  const { currentUser } = useAuth();
  const { 
    currentFamily: contextFamily, 
    setCurrentFamilyId, 
    families, 
    activities, 
    categoryRules, 
    submitCorrection, 
    acknowledgeMessage, 
    messages,
    getLeaderboardData 
  } = usePulse();

  const [selectedActivityForCorrection, setSelectedActivityForCorrection] = useState<PointActivity | null>(null);
  const [correctionReason, setCorrectionReason] = useState<string>('');

  const role = currentUser?.role || 'parent';
  const assignedClasses = currentUser?.linkedEntities.assignedClasses || [];

  // Determine which family is displayed:
  // For parents and students, strictly locked to their own family
  // For admin and teachers, can select from allowed families
  const allowedFamilies = role === 'teacher'
    ? families.filter((f) => f.children.some((c) => assignedClasses.includes(c.className)))
    : families;

  const userFamilyId = currentUser?.linkedEntities.familyId;
  const currentFamily = (role === 'parent' || role === 'student')
    ? (families.find((f) => f.id === userFamilyId) || contextFamily)
    : contextFamily;

  if (!currentFamily) return null;

  const { currentUserRank } = getLeaderboardData('termly', 'overall');

  const familyActivities = activities.filter((a) => a.familyId === currentFamily.id);

  const studentRules = categoryRules.filter((r) => r.type === 'student');
  const parentRules = categoryRules.filter((r) => r.type === 'parent');

  const studentScore = studentRules.reduce((acc, r) => acc + (currentFamily.categoryScores[r.id] || 0), 0);
  const parentScore = parentRules.reduce((acc, r) => acc + (currentFamily.categoryScores[r.id] || 0), 0);
  const totalRaw = studentScore + parentScore;

  const pendingActionMessages = messages.filter(
    (m) =>
      (!m.acknowledged && (m.targetAudience === 'all' || m.recipientFamilyId === currentFamily.id))
  ).slice(0, 2);

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityForCorrection || !correctionReason.trim()) return;

    submitCorrection(selectedActivityForCorrection.id, correctionReason.trim());
    setSelectedActivityForCorrection(null);
    setCorrectionReason('');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Family Hero Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 flex-1">
            <div>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <span>Parent Impact Dashboard</span>
                <span aria-hidden="true">·</span>
                <span>{role === 'parent' ? 'Private Account' : role === 'student' ? 'Family Journal' : 'Staff Inspector'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-0.5">
                {currentFamily.displayTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Parents: <span className="font-medium text-slate-800">{currentFamily.parentNames}</span> · Enrolled Children: {currentFamily.children.map((c) => `${c.name} (${c.yearGroup})`).join(', ')}
              </p>
            </div>

            {/* Staff Family Inspector Switcher */}
            {(role === 'admin' || role === 'teacher') && (
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-600">Inspect Family:</span>
                <select
                  value={currentFamily.id}
                  onChange={(e) => setCurrentFamilyId(e.target.value)}
                  className="p-1.5 rounded border border-slate-200 bg-white text-slate-800 font-medium"
                >
                  {allowedFamilies.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.displayTitle} ({f.children.map(c => c.name).join(', ')})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Impact Score Card - Responsive stack on small screens */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 w-full sm:w-auto shrink-0">
            <div className="flex sm:block items-baseline justify-between w-full sm:w-auto">
              <div className="text-xs text-slate-500 font-medium">Total Impact Score</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-indigo-700 tabular-nums">
                {currentFamily.termlyScore} <span className="text-xs font-sans text-slate-500 font-normal">pts</span>
              </div>
            </div>
            <div className="hidden sm:block h-10 w-px bg-slate-200" />
            <div className="w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 text-xs grid grid-cols-3 sm:grid-cols-1 gap-2 sm:gap-1">
              <div>
                <span className="text-slate-500 block sm:inline">Weekly: </span>
                <span className="font-mono font-semibold tabular-nums text-slate-800">+{currentFamily.weeklyScore}</span>
              </div>
              <div>
                <span className="text-slate-500 block sm:inline">Monthly: </span>
                <span className="font-mono font-semibold tabular-nums text-slate-800">+{currentFamily.monthlyScore}</span>
              </div>
              <div>
                <span className="text-slate-500 block sm:inline">Rank: </span>
                <span className="font-mono font-semibold tabular-nums text-indigo-700">
                  {currentUserRank ? `#${currentUserRank.rank}` : '#1'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 80% Student / 20% Parent Score Ratio Bar */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 mb-2">
            <span className="font-semibold text-slate-800">
              Score Composition: 80% Student Positive Habits / 20% Parent Participation
            </span>
            <span className="text-slate-500">
              Student ({studentScore} pts) · Parent ({parentScore} pts)
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${totalRaw > 0 ? (studentScore / totalRaw) * 100 : 80}%` }} 
              className="bg-indigo-600 h-full"
              title="Student Activity Component"
            />
            <div 
              style={{ width: `${totalRaw > 0 ? (parentScore / totalRaw) * 100 : 20}%` }} 
              className="bg-emerald-500 h-full"
              title="Parent Participation Component"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-xs text-slate-500 mt-2 gap-1.5 sm:gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 shrink-0 inline-block" />
              <span>Student Activities (Attendance, Homework, Projects, Character, Clubs)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0 inline-block" />
              <span>Parent Involvement (PTA Conferences, Events, Messages, Volunteering)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Children Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {currentFamily.children.map((child) => {
          const childActivities = familyActivities.filter((a) => a.studentId === child.id);
          const childPoints = childActivities.reduce((acc, a) => acc + a.rawPoints, 0);

          return (
            <div key={child.id} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-100 shrink-0">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">{child.name}</h3>
                      <div className="text-xs text-slate-500">
                        {child.yearGroup} · {child.className}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-lg sm:text-xl font-bold tabular-nums text-slate-900">
                      {childPoints} <span className="text-xs font-normal text-slate-500">pts</span>
                    </span>
                    <span className="block text-xs text-emerald-600 font-medium">Active Participant</span>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-start justify-between text-slate-600 gap-2">
                    <span className="shrink-0">Recent Highlights:</span>
                    <span className="font-medium text-slate-800 text-right truncate">
                      {childActivities[0]?.title || 'Daily positive habits recorded'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Recorded Entries this Term:</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-800">
                      {childActivities.length} verified records
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span className="truncate">Fair weighting: normalized</span>
                <span className="text-indigo-600 font-medium shrink-0">Punctual & Engaged</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIONABLE MESSAGES / COMMUNICATION EARNING BANNER */}
      {pendingActionMessages.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  School Message Awaiting Parent Confirmation
                </h3>
                <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
                  Earn +5 Points
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong className="font-semibold">{pendingActionMessages[0].title}:</strong> {pendingActionMessages[0].body}
              </p>
              <div className="pt-1.5 flex flex-wrap items-center gap-2.5 sm:gap-3">
                <button
                  onClick={() => acknowledgeMessage(pendingActionMessages[0].id)}
                  className="px-3 sm:px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap"
                >
                  Confirm & Acknowledge (+5 pts)
                </button>
                <button
                  onClick={onNavigateToCommunications}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
                >
                  View All Messages
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY BREAKDOWN GRID */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Points Earned by Approved Category</h3>
            <p className="text-xs text-slate-500">
              Transparent distribution of points across all approved school activities.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            9 Approved Categories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-1">
          {categoryRules.map((cat) => {
            const score = currentFamily.categoryScores[cat.id] || 0;
            return (
              <div key={cat.id} className="p-3.5 sm:p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 truncate pr-2">{cat.name}</span>
                  <span className="font-mono font-bold text-indigo-700 tabular-nums shrink-0">
                    {score} <span className="font-normal text-slate-500">pts</span>
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 truncate">
                  Weight: {cat.currentWeight}% · {cat.type === 'student' ? 'Student' : 'Parent'}
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.type === 'student' ? 'bg-indigo-600' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (score / 130) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVITY FEED & CORRECTION REQUESTS LEDGER */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Verified Point Activity Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Every point is verified by an authorized teacher. If any detail is inaccurate, you can submit a correction.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {familyActivities.length} Recorded Entries
          </div>
        </div>

        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {familyActivities.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No point activities recorded yet.
            </div>
          ) : (
            familyActivities.map((act) => (
              <div key={act.id} className="py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500">
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      act.categoryType === 'student' 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {act.categoryType === 'student' ? 'Student Habit (80%)' : 'Parent Involvement (20%)'}
                    </span>
                    <span className="font-semibold text-slate-800">{act.categoryName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                    {act.studentName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-indigo-600 font-medium">{act.studentName}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>By {act.recordedByTeacher}</span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">{act.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>

                  {act.status === 'under_review' && (
                    <div className="text-[11px] sm:text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">
                      Correction request under teacher review
                    </div>
                  )}

                  {act.status === 'corrected' && (
                    <div className="text-[11px] sm:text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                      Record corrected by school ({act.correctionNote})
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-between md:justify-end pt-1 md:pt-0">
                  <span className="font-mono text-xs sm:text-sm font-bold tabular-nums text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    +{act.rawPoints} pts
                  </span>

                  {act.status === 'approved' && role === 'parent' && (
                    <button
                      onClick={() => setSelectedActivityForCorrection(act)}
                      className="text-xs text-slate-500 hover:text-indigo-600 font-medium underline-offset-2 hover:underline whitespace-nowrap"
                    >
                      Request Correction
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CORRECTION REQUEST MODAL */}
      {selectedActivityForCorrection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-4 sm:p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Request Activity Correction
              </h3>
              <button
                onClick={() => setSelectedActivityForCorrection(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg"
                aria-label="Close correction modal"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div className="font-semibold text-slate-900">{selectedActivityForCorrection.title}</div>
              <div className="text-slate-500">
                Child/Recipient: {selectedActivityForCorrection.studentName || 'Parent'} · Category: {selectedActivityForCorrection.categoryName} · Recorded by: {selectedActivityForCorrection.recordedByTeacher}
              </div>
            </div>

            <form onSubmit={handleSubmitCorrection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Explain the correction needed:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Leo submitted his homework on Wednesday instead of Thursday; or attendance was verified by Dr. Shaw..."
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="text-xs text-slate-500 leading-relaxed">
                PULSE Rule: If a record is incorrect, parents can request a correction. Your request will be directly routed to the class teacher and pastoral lead for review.
              </div>

              <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedActivityForCorrection(null)}
                  className="px-3.5 sm:px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
