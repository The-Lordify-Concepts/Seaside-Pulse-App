import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePulse } from '../context/PulseContext';
import { CheckCircle2, XCircle, Clock, AlertCircle, ShieldAlert, Lock, UserCheck } from 'lucide-react';
import { CorrectionRequest } from '../types/pulse';
import { canResolveCorrection } from '../utils/permissions';

export const CorrectionsQueue: React.FC = () => {
  const { currentUser } = useAuth();
  const { corrections, resolveCorrection, families, activities } = usePulse();
  const [selectedCorrection, setSelectedCorrection] = useState<CorrectionRequest | null>(null);
  const [decision, setDecision] = useState<'resolved' | 'declined'>('resolved');
  const [resolutionNote, setResolutionNote] = useState('');
  const [pointsDelta, setPointsDelta] = useState<number>(5);

  const role = currentUser?.role || 'parent';
  const assignedClasses = currentUser?.linkedEntities.assignedClasses || [];
  const parentFamilyId = currentUser?.linkedEntities.familyId;

  // Student Access Denied Guard
  if (role === 'student') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Right of Correction Portal</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Point corrections and register reviews are processed between parents and authorized school teachers. If you have questions about a recent class point or homework mark, please speak with your class teacher or family.
        </p>
      </div>
    );
  }

  // Role-filtered corrections
  const accessibleCorrections = corrections.filter((c) => {
    if (role === 'parent') {
      return c.familyId === parentFamilyId;
    }
    if (role === 'teacher') {
      const fam = families.find((f) => f.id === c.familyId);
      if (!fam) return false;
      const student = fam.children.find((child) => child.name === c.studentName);
      return student ? assignedClasses.includes(student.className) : true;
    }
    return true; // Admin sees all
  });

  const pendingList = accessibleCorrections.filter((c) => c.status === 'pending');
  const resolvedList = accessibleCorrections.filter((c) => c.status !== 'pending');

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCorrection || !resolutionNote.trim()) return;

    resolveCorrection(
      selectedCorrection.id,
      decision,
      resolutionNote.trim(),
      decision === 'resolved' ? Number(pointsDelta) : 0
    );

    setSelectedCorrection(null);
    setResolutionNote('');
    setPointsDelta(0);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-600">
              <span>Fairness & Accountability</span>
              <span aria-hidden="true">·</span>
              <span>Right of Correction</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              {role === 'parent' ? 'My Family Correction Inquiries' : 'Parent Correction Requests'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {role === 'parent'
                ? 'Review status and official teacher responses for point activities and attendance records submitted for verification.'
                : 'PULSE Rule: If an attendance record or assignment log is in question, parents can request a review. Teachers and pastoral leads review and adjust records with full transparency.'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              {pendingList.length} Pending Inquiries
            </span>
          </div>
        </div>
      </div>

      {/* Pending Requests Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            {role === 'parent' ? 'Your Pending Requests' : `Pending Inquiries (${pendingList.length})`}
          </h2>
          <span className="text-[11px] sm:text-xs text-slate-500">
            {role === 'parent' ? 'Awaiting school staff review' : role === 'teacher' ? `Assigned to ${assignedClasses.join(', ')}` : 'School-wide action queue'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {pendingList.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              {role === 'parent'
                ? 'You have no pending inquiries. All family records are verified!'
                : 'No pending correction requests. All class records are in order!'}
            </div>
          ) : (
            pendingList.map((req) => {
              const activity = activities.find((a) => a.id === req.activityId);
              const canResolve = canResolveCorrection(currentUser, req, activity);

              return (
                <div key={req.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500">
                      <span className="font-semibold text-slate-900">{req.parentName}</span>
                      <span aria-hidden="true">·</span>
                      <span>Student: <strong className="text-slate-800">{req.studentName}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Submitted {new Date(req.submittedAt).toLocaleDateString()}</span>
                      {activity && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600">Recorded by: <strong>{activity.recordedByTeacher}</strong></span>
                        </>
                      )}
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Regarding Activity: "{req.activityTitle}"
                    </h3>

                    <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
                      <span className="font-semibold block mb-0.5">Parent Explanation:</span>
                      "{req.reason}"
                    </div>
                  </div>

                  <div className="shrink-0 pt-1 md:pt-0">
                    {canResolve ? (
                      <button
                        onClick={() => {
                          setSelectedCorrection(req);
                          setDecision('resolved');
                          setPointsDelta(5);
                          setResolutionNote('Attendance register verified with class teacher.');
                        }}
                        className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs text-center"
                      >
                        Review & Resolve Request
                      </button>
                    ) : role === 'teacher' ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Awarded by {activity?.recordedByTeacher || 'another staff member'}. (Awarding teacher or Admin review required)</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Staff Review</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Resolved History */}
      {resolvedList.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              Resolved Inquiries History ({resolvedList.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {resolvedList.map((res) => (
              <div key={res.id} className="p-4 sm:p-6 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-semibold text-slate-800">{res.parentName}</span>
                    <span aria-hidden="true">·</span>
                    <span>Student: {res.studentName}</span>
                    <span aria-hidden="true">·</span>
                    <span>Resolved {res.resolvedAt ? new Date(res.resolvedAt).toLocaleDateString() : 'Recently'}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] self-start sm:self-auto ${
                      res.status === 'resolved'
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        : 'text-slate-700 bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {res.status === 'resolved' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-slate-500" />
                    )}
                    <span className="capitalize">{res.status}</span>
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-900">
                  Activity: "{res.activityTitle}"
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs">
                  <div className="text-slate-600">
                    <strong className="text-slate-800">Parent Reason:</strong> "{res.reason}"
                  </div>
                  <div className="text-indigo-900 pt-1 border-t border-slate-200">
                    <strong className="text-indigo-950">Staff Resolution ({res.resolvedBy || 'Teacher'}):</strong> {res.resolutionNote}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review & Resolve Modal (Staff Only) */}
      {selectedCorrection && role !== 'parent' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-4 sm:p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Resolve Inquiry: {selectedCorrection.activityTitle}
              </h3>
              <button
                onClick={() => setSelectedCorrection(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div>
                <strong>Parent:</strong> {selectedCorrection.parentName}
              </div>
              <div>
                <strong>Student:</strong> {selectedCorrection.studentName}
              </div>
              <div>
                <strong>Stated Reason:</strong> "{selectedCorrection.reason}"
              </div>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('resolved')}
                    className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                      decision === 'resolved'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Approve & Adjust Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('declined')}
                    className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                      decision === 'declined'
                        ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Decline (Maintain Record)
                  </button>
                </div>
              </div>

              {decision === 'resolved' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Points Delta (+ or -)
                  </label>
                  <input
                    type="number"
                    value={pointsDelta}
                    onChange={(e) => setPointsDelta(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-500">
                    This delta will be applied directly to the family's Impact Score.
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Staff Explanation Note (Visible to Parent)
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Explain why the record was modified or upheld..."
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCorrection(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
