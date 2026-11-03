import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePulse } from '../context/PulseContext';
import { CategoryId, Timeframe } from '../types/pulse';
import { PlusCircle, Users, CheckCircle2, Award, Zap, UserCheck, ShieldAlert } from 'lucide-react';
import { canAwardPoints, getPermittedStudentsForAwarding } from '../utils/permissions';

interface TeacherRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudentId?: string;
}

export const TeacherRecordModal: React.FC<TeacherRecordModalProps> = ({ isOpen, onClose, preselectedStudentId }) => {
  const { currentUser } = useAuth();
  const { families, students, categoryRules, awardPoints, batchAwardPoints, classes } = usePulse();

  const [mode, setMode] = useState<'individual' | 'batch'>('individual');
  const [selectedFamilyId, setSelectedFamilyId] = useState(() => {
    if (preselectedStudentId) {
      const stu = students.find((s) => s.id === preselectedStudentId);
      if (stu) return stu.familyId;
      const fam = families.find((f) => f.children.some((c) => c.id === preselectedStudentId));
      if (fam) return fam.id;
    }
    return families[0]?.id || '';
  });
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudentId || '');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('attendance_punctuality');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [points, setPoints] = useState<number>(10);
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly');

  const permittedStudents = getPermittedStudentsForAwarding(currentUser, students);
  const assignedClassNames = currentUser?.role === 'admin'
    ? classes.map((c) => c.name)
    : (currentUser?.linkedEntities.assignedClasses || ['5A']);

  React.useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudentId(preselectedStudentId);
      const stu = students.find((s) => s.id === preselectedStudentId);
      if (stu) {
        setSelectedFamilyId(stu.familyId);
      } else {
        const fam = families.find((f) => f.children.some((c) => c.id === preselectedStudentId));
        if (fam) setSelectedFamilyId(fam.id);
      }
    }
  }, [preselectedStudentId, families, students]);

  // Batch selection
  const allStudents = students.length > 0 ? students : families.flatMap((f) => f.children);
  const [selectedBatchStudentIds, setSelectedBatchStudentIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentSelectedFamily = families.find((f) => f.id === selectedFamilyId) || families[0];
  const currentSelectedStudent = students.find((s) => s.id === selectedStudentId);
  const rule = categoryRules.find((r) => r.id === selectedCategory) || categoryRules[0];

  const handleTemplateSelect = (exampleText: string) => {
    // Extract points if template has (+X pts)
    const match = exampleText.match(/\(\+(\d+)\s*pts\)/);
    const parsedPoints = match ? parseInt(match[1], 10) : 10;
    const cleanTitle = exampleText.replace(/\s*\(\+\d+\s*pts\)/, '');

    setActivityTitle(cleanTitle);
    setActivityDescription(`Approved school activity recognized under ${rule.name}.`);
    setPoints(parsedPoints);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'individual') {
      awardPoints({
        familyId: selectedFamilyId,
        studentId: selectedStudentId ? selectedStudentId : undefined,
        categoryId: selectedCategory,
        title: activityTitle.trim() || `${rule.name} Achievement`,
        description: activityDescription.trim() || 'Verified school-approved activity.',
        points: Number(points),
        timeframe
      });
    } else {
      if (selectedBatchStudentIds.length === 0) return;
      batchAwardPoints({
        studentIds: selectedBatchStudentIds,
        categoryId: selectedCategory,
        title: activityTitle.trim() || `${rule.name} Cohort Recognition`,
        description: activityDescription.trim() || 'Classroom group recognition.',
        points: Number(points)
      });
    }

    onClose();
  };

  const toggleBatchStudent = (id: string) => {
    if (selectedBatchStudentIds.includes(id)) {
      setSelectedBatchStudentIds(selectedBatchStudentIds.filter((s) => s !== id));
    } else {
      setSelectedBatchStudentIds([...selectedBatchStudentIds, id]);
    }
  };

  const selectAllClass = (className: string) => {
    const classStudentIds = allStudents.filter((s) => s.className === className).map((s) => s.id);
    setSelectedBatchStudentIds(Array.from(new Set([...selectedBatchStudentIds, ...classStudentIds])));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-4 sm:p-6 md:p-8 shadow-xl border border-slate-200 my-4 sm:my-8 space-y-4 sm:space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-600">
              <span>Teacher Point Recording Desk</span>
              <span aria-hidden="true">·</span>
              <span>PULSE Verified Entry</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Award Impact Points
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-lg"
            aria-label="Close award modal"
          >
            ✕
          </button>
        </div>

        {/* Individual vs Batch Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('individual')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all text-center ${
              mode === 'individual'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Individual Student / Family
          </button>
          <button
            type="button"
            onClick={() => setMode('batch')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all text-center ${
              mode === 'batch'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batch Class Entry
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {mode === 'individual' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Select Specific Student or Parent */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Select Student Recipient
                    </label>
                    {currentUser?.role === 'teacher' && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        Your Classes: {assignedClassNames.join(', ')}
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      const sid = e.target.value;
                      setSelectedStudentId(sid);
                      if (sid) {
                        const stu = permittedStudents.find((s) => s.id === sid);
                        if (stu) setSelectedFamilyId(stu.familyId);
                      }
                    }}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Parent Direct Activity (PTA / Events / Support) --</option>
                    {permittedStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.className} · {s.yearGroup})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Family */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Family (Receives Score)
                  </label>
                  <select
                    value={selectedFamilyId}
                    onChange={(e) => setSelectedFamilyId(e.target.value)}
                    disabled={!!selectedStudentId}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-600"
                  >
                    {families.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.displayTitle} ({f.parentNames})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Awarding Staff Badge */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
                <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Awarding as: <strong>{currentUser?.name || 'Class Teacher'}</strong> ({currentUser?.role === 'admin' ? 'School Administrator' : `Assigned: ${assignedClassNames.join(', ')}`})
                </span>
              </div>
            </div>
          ) : (
            /* Batch Student Selection */
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between text-xs gap-1">
                <span className="font-semibold text-slate-700">Select Students to Award:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {assignedClassNames.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => selectAllClass(cls)}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      Select All {cls}
                    </button>
                  ))}
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedBatchStudentIds([])}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 divide-y divide-slate-100">
                {permittedStudents.map((stu) => (
                  <label key={stu.id} className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50 cursor-pointer text-xs">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedBatchStudentIds.includes(stu.id)}
                        onChange={() => toggleBatchStudent(stu.id)}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-medium text-slate-900">{stu.name}</span>
                    </span>
                    <span className="text-slate-500">{stu.className}</span>
                  </label>
                ))}
              </div>
              <div className="text-xs text-slate-500">
                {selectedBatchStudentIds.length} of {permittedStudents.length} authorized students selected for batch award.
              </div>
            </div>
          )}

          {/* Category Dropdown & Predefined Templates */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Activity Category & Approved Weight
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryId)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
            >
              {categoryRules.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.currentWeight}% weight · {cat.type === 'student' ? 'Student' : 'Parent'})
                </option>
              ))}
            </select>
          </div>

          {/* Approved Predefined Templates */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              School-Approved Template Catalog (Click to Auto-Fill)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(rule.examples ?? []).map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleTemplateSelect(ex)}
                  className="px-2.5 py-1 text-[11px] sm:text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-md transition-colors text-slate-700 text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Title, Description, Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Activity Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 10-Day Punctuality Streak or Science Presentation"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Points to Award
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Teacher Note / Evidence
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Arrived before 08:35 ready to learn every morning this week..."
              value={activityDescription}
              onChange={(e) => setActivityDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Live Transparency Preview Banner */}
          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Automated Transparency Guarantee</span>
            </div>
            <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed">
              Upon submission, points are immediately calculated using the {rule.currentWeight}% weight rules, added to the parent's Impact Score, and logged into the immutable audit trail.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs text-center"
            >
              Confirm & Award Points
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
