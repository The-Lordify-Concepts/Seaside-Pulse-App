import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePulse } from '../context/PulseContext';
import { Search, Filter, ShieldCheck, Clock, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import { PointActivity } from '../types/pulse';

export const PointRecordsView: React.FC<{ onOpenRecordModal: () => void }> = ({ onOpenRecordModal }) => {
  const { currentUser } = useAuth();
  const { activities, families, categoryRules } = usePulse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');

  const role = currentUser?.role || 'parent';
  const isStaff = role === 'admin' || role === 'teacher';
  const assignedClasses = currentUser?.linkedEntities.assignedClasses || [];

  // Strict RBAC filtering of base activity records
  const roleScopedActivities = activities.filter((act) => {
    if (role === 'student') {
      const studentId = currentUser?.linkedEntities.studentId;
      return act.studentId === studentId;
    }
    if (role === 'parent') {
      const familyId = currentUser?.linkedEntities.familyId;
      return act.familyId === familyId;
    }
    if (role === 'teacher') {
      // Find the family or student associated with this activity
      const fam = families.find((f) => f.id === act.familyId);
      if (!fam) return false;
      // If student activity, student must be in teacher's assigned classes
      if (act.studentId) {
        const student = fam.children.find((c) => c.id === act.studentId);
        return student ? assignedClasses.includes(student.className) : false;
      }
      // If family activity, family must have at least one child in teacher's assigned classes
      return fam.children.some((c) => assignedClasses.includes(c.className));
    }
    // Admin has full access
    return true;
  });

  const filteredActivities = roleScopedActivities.filter((act) => {
    if (selectedCategory !== 'all' && act.categoryId !== selectedCategory) {
      return false;
    }
    if (selectedTimeframe !== 'all' && act.timeframe !== selectedTimeframe) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchDesc = act.description.toLowerCase().includes(q);
      const matchStudent = act.studentName?.toLowerCase().includes(q);
      const matchTeacher = act.recordedByTeacher.toLowerCase().includes(q);
      const fam = families.find((f) => f.id === act.familyId);
      const matchFamily = fam?.displayTitle.toLowerCase().includes(q);

      return matchTitle || matchDesc || matchStudent || matchTeacher || matchFamily;
    }
    return true;
  });

  const getLedgerHeader = () => {
    if (role === 'student') {
      return {
        tag: 'My Personal Habit Ledger',
        title: 'My Verified Habit & Point Records',
        desc: 'Every point you earned for on-time attendance, homework, projects, and positive character recognized by your teachers.'
      };
    }
    if (role === 'parent') {
      return {
        tag: 'Family Impact Ledger',
        title: 'Your Family Verified Point Records',
        desc: 'Review all points earned by your children and family participation, verified against The Seaside Schools point rules.'
      };
    }
    if (role === 'teacher') {
      return {
        tag: `Class Ledger · ${assignedClasses.join(' & ')}`,
        title: 'Assigned Class Activity Records',
        desc: `Auditing verified points and habits for students in ${assignedClasses.join(', ')}.`
      };
    }
    return {
      tag: 'School-Wide Ledger',
      title: 'School-Wide Verified Point Activity Records',
      desc: 'Transparent master ledger of all verified points across all year groups, classes, and families.'
    };
  };

  const header = getLedgerHeader();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-600">
              <span>{header.tag}</span>
              <span aria-hidden="true">·</span>
              <span>Point Audit Records</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              {header.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {header.desc}
            </p>
          </div>

          {isStaff && (
            <button
              onClick={onOpenRecordModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap self-start lg:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Record Activity</span>
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          {/* Search box */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={role === 'student' ? 'Search your habit or teacher...' : 'Search student, family, habit, teacher...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-700 w-full sm:w-auto"
            >
              <option value="all">All Categories</option>
              {categoryRules.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Timeframe Filter */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-700 w-full sm:w-auto"
            >
              <option value="all">All Timeframes</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="termly">Termly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-700">
            Showing {filteredActivities.length} of {roleScopedActivities.length} Accessible Records
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500 font-mono">
            {role === 'student' ? 'Individual Student Scoped' : role === 'parent' ? 'Family Private Scoped' : 'Staff Verified'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredActivities.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              No point records found matching the search criteria.
            </div>
          ) : (
            filteredActivities.map((act) => {
              const fam = families.find((f) => f.id === act.familyId);

              return (
                <div key={act.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500">
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        act.categoryType === 'student' 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {act.categoryType === 'student' ? 'Student Habit' : 'Parent Participation'}
                      </span>
                      <span className="font-semibold text-slate-800">{act.categoryName}</span>
                      {role !== 'student' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-indigo-700">
                            {fam?.displayTitle || 'Family'}
                          </span>
                        </>
                      )}
                      {act.studentName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-700 font-medium">{act.studentName}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                      <span aria-hidden="true">·</span>
                      <span>By {act.recordedByTeacher}</span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{act.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>

                    {act.status === 'under_review' && (
                      <div className="text-[11px] sm:text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                        Correction Requested (Pending Review)
                      </div>
                    )}

                    {act.status === 'corrected' && (
                      <div className="text-[11px] sm:text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                        Corrected Record: {act.correctionNote}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end pt-1 md:pt-0">
                    <div className="text-right">
                      <span className="font-mono text-sm sm:text-base font-bold tabular-nums text-emerald-700 bg-emerald-50 px-2.5 sm:px-3 py-1 rounded-md border border-emerald-200 inline-block">
                        +{act.rawPoints} pts
                      </span>
                      <span className="block text-[11px] text-slate-400 capitalize mt-0.5 font-mono">
                        {act.timeframe} cohort
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
