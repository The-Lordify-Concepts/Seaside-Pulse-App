import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePulse } from '../context/PulseContext';
import { CategoryId } from '../types/pulse';
import { ShieldCheck, Scale, Sliders, CheckCircle2, RotateCcw, AlertCircle, ShieldAlert } from 'lucide-react';
import { canEditRulesAndWeights } from '../utils/permissions';

export const RulesAndWeightsModal: React.FC = () => {
  const { currentUser } = useAuth();
  const { categoryRules, updateCategoryWeights, resetCategoryWeightsToDefault } = usePulse();

  const role = currentUser?.role || 'parent';

  const [weights, setWeights] = useState<Record<CategoryId, number>>(() => {
    const initial: Record<string, number> = {};
    categoryRules.forEach((r) => {
      initial[r.id] = r.currentWeight;
    });
    return initial as Record<CategoryId, number>;
  });

  const [isEditing, setIsEditing] = useState(false);

  // Strict Admin Guard
  if (!canEditRulesAndWeights(currentUser)) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          PULSE Point Rules and Weighting governance is strictly restricted to School Administrative Leadership.
        </p>
      </div>
    );
  }

  const studentCategories = categoryRules.filter((r) => r.type === 'student');
  const parentCategories = categoryRules.filter((r) => r.type === 'parent');

  const studentSum = studentCategories.reduce((acc, r) => acc + (weights[r.id] ?? r.currentWeight), 0);
  const parentSum = parentCategories.reduce((acc, r) => acc + (weights[r.id] ?? r.currentWeight), 0);
  const totalSum = studentSum + parentSum;

  const handleWeightChange = (id: CategoryId, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(100, val))
    }));
  };

  const handleSave = () => {
    if (totalSum !== 100) return;
    updateCategoryWeights(weights);
    setIsEditing(false);
  };

  const handleReset = () => {
    resetCategoryWeightsToDefault();
    const defaults: Record<string, number> = {};
    categoryRules.forEach((r) => {
      defaults[r.id] = r.defaultWeight;
    });
    setWeights(defaults as Record<CategoryId, number>);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-600">
              <span>School Programme Governance</span>
              <span aria-hidden="true">·</span>
              <span>Constitutional point weights</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              PULSE Point Rules & Weighting
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Transparent, balanced criteria designed to recognize both student positive development and family engagement.
            </p>
          </div>

          {role === 'admin' && (
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto w-full sm:w-auto">
              {isEditing ? (
                <>
                  <button
                    onClick={handleReset}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    disabled={totalSum !== 100}
                    onClick={handleSave}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors whitespace-nowrap ${
                      totalSum === 100
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Weights</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Adjust Weighting (Admin)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 80% / 20% Status Bar */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span>Current Weight Distribution</span>
            <span className={totalSum === 100 ? 'text-emerald-700 font-mono' : 'text-rose-600 font-bold font-mono'}>
              Total: {totalSum}% (Target: 100%)
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, studentSum)}%` }}
              className="bg-indigo-600 h-full transition-all"
            />
            <div
              style={{ width: `${Math.min(100, parentSum)}%` }}
              className="bg-emerald-500 h-full transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1">
            <span>Student Activity: <strong>{studentSum}%</strong> (Default: 80%)</span>
            <span>Parent Participation: <strong>{parentSum}%</strong> (Default: 20%)</span>
          </div>

          {totalSum !== 100 && (
            <div className="text-xs text-rose-600 font-medium pt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Weights must sum to exactly 100% to save. (Currently: {totalSum}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Student Categories (80%) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Student Habits & Achievements
              </h2>
              <p className="text-xs text-slate-500">
                Accounts for 80% of Family Impact Score
              </p>
            </div>
            <span className="font-mono text-xs sm:text-sm font-bold text-indigo-700 tabular-nums">
              {studentSum}% Total
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {studentCategories.map((cat) => (
              <div key={cat.id} className="p-3 sm:p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900">{cat.name}</h3>
                  {isEditing ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={weights[cat.id]}
                        onChange={(e) => handleWeightChange(cat.id, Number(e.target.value))}
                        className="w-12 sm:w-14 p-1 text-xs font-mono font-bold text-right border border-indigo-300 rounded bg-white"
                      />
                      <span className="text-xs font-bold">%</span>
                    </div>
                  ) : (
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shrink-0">
                      {cat.currentWeight}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{cat.description}</p>
                <div className="text-[11px] sm:text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Approved triggers: </span>
                  {(cat.examples ?? []).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parent Participation (20%) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Parent Participation & Partnership
              </h2>
              <p className="text-xs text-slate-500">
                Accounts for 20% of Family Impact Score
              </p>
            </div>
            <span className="font-mono text-xs sm:text-sm font-bold text-emerald-700 tabular-nums">
              {parentSum}% Total
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {parentCategories.map((cat) => (
              <div key={cat.id} className="p-3 sm:p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900">{cat.name}</h3>
                  {isEditing ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={weights[cat.id]}
                        onChange={(e) => handleWeightChange(cat.id, Number(e.target.value))}
                        className="w-12 sm:w-14 p-1 text-xs font-mono font-bold text-right border border-emerald-300 rounded bg-white"
                      />
                      <span className="text-xs font-bold">%</span>
                    </div>
                  ) : (
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                      {cat.currentWeight}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{cat.description}</p>
                <div className="text-[11px] sm:text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Approved triggers: </span>
                  {(cat.examples ?? []).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The 6 Core Rules of PULSE */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              The 6 Principles of the PULSE Programme
            </h2>
            <p className="text-xs text-slate-500">
              Approved school governance ensuring integrity, fairness, and positive encouragement.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
            <div className="text-xs font-bold text-indigo-700">01. School-Approved Points Only</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Points are awarded solely for approved activities recorded by certified teachers. Parents cannot purchase or buy points under any circumstances.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
            <div className="text-xs font-bold text-indigo-700">02. Verified Audit Trail</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every point is logged with teacher timestamp, activity description, and category. Parents can always see the exact source of every point.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
            <div className="text-xs font-bold text-indigo-700">03. Right of Correction</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an attendance mark or project record contains an error, parents can submit an in-app correction ticket for immediate teacher review.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
            <div className="text-xs font-bold text-indigo-700">04. Zero Shaming & Privacy</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The leaderboard only displays the top 3 parents and category champions publicly. Individual family ranks below top 3 are strictly private.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
            <div className="text-xs font-bold text-indigo-700">05. Multi-Child Fair Balancing</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Families with multiple children are mathematically balanced using normalized student averaging so having more children gives no unfair skew.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
            <div className="text-xs font-bold text-indigo-700">06. Academic Independence</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Academic test grades remain strictly independent from leaderboard points. Points reward dedication, punctuality, and character.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
