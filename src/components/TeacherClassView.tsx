import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePulse } from '../context/PulseContext';
import { 
  GraduationCap, 
  Users, 
  Sparkles, 
  PlusCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Clock, 
  BookOpen, 
  Heart, 
  AlertCircle,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { PersonAvatar, EmptyStateCard } from './ui/Visuals';
import { CategoryId } from '../types/pulse';

interface TeacherClassViewProps {
  onOpenRecordModal: (preselectedStudentId?: string) => void;
  onNavigateToCorrections: () => void;
  onNavigateToMessages: () => void;
}

export const TeacherClassView: React.FC<TeacherClassViewProps> = ({
  onOpenRecordModal,
  onNavigateToCorrections,
  onNavigateToMessages
}) => {
  const { currentUser } = useAuth();
  const { families, activities, awardPoints, batchAwardPoints, corrections } = usePulse();

  const assignedClasses = currentUser?.linkedEntities.assignedClasses || ['5A', '5B'];
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchCategoryId, setBatchCategoryId] = useState<CategoryId>('attendance_punctuality');
  const [batchTitle, setBatchTitle] = useState('Full Class Morning Punctuality Register');
  const [batchPoints, setBatchPoints] = useState<number>(10);
  const [selectedBatchClass, setSelectedBatchClass] = useState<string>(assignedClasses[0] || '5A');

  // Collect all students from assigned classes
  const assignedStudents = families.flatMap((fam) =>
    fam.children
      .filter((child) => assignedClasses.includes(child.className))
      .map((child) => {
        const studentActivities = activities.filter((a) => a.studentId === child.id);
        const totalPoints = studentActivities.reduce((acc, a) => acc + a.rawPoints, 0);
        const weeklyPoints = studentActivities
          .filter((a) => a.timeframe === 'weekly' || (Date.now() - new Date(a.timestamp).getTime()) < 7 * 86400000)
          .reduce((acc, a) => acc + a.rawPoints, 0);

        return {
          ...child,
          family: fam,
          activities: studentActivities,
          totalPoints,
          weeklyPoints,
          habitCount: studentActivities.length
        };
      })
  );

  // Filter students based on selected tab and search query
  const filteredStudents = assignedStudents.filter((student) => {
    if (selectedClass !== 'all' && student.className !== selectedClass) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.name.toLowerCase().includes(q);
      const matchFamily = student.family.displayTitle.toLowerCase().includes(q);
      const matchClass = student.className.toLowerCase().includes(q);
      return matchName || matchFamily || matchClass;
    }
    return true;
  });

  // Pending corrections for teacher's students
  const pendingClassCorrections = corrections.filter(
    (c) => c.status === 'pending' && assignedStudents.some((s) => s.id === c.activityId || s.name === c.studentName)
  );

  const handleQuickAward = (student: typeof assignedStudents[0], categoryId: CategoryId, title: string, points: number) => {
    awardPoints({
      familyId: student.family.id,
      studentId: student.id,
      categoryId,
      title,
      description: `Awarded during daily class register by ${currentUser?.name || 'Class Teacher'}.`,
      points
    });
  };

  const handleExecuteBatchAward = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudents = assignedStudents.filter((s) => s.className === selectedBatchClass);
    if (targetStudents.length === 0) return;

    batchAwardPoints({
      studentIds: targetStudents.map((s) => s.id),
      categoryId: batchCategoryId,
      title: batchTitle,
      description: `Class-wide award for ${selectedBatchClass} logged by ${currentUser?.name || 'Teacher'}.`,
      points: Number(batchPoints)
    });

    setBatchModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Teacher Workspace Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <GraduationCap className="w-4 h-4" />
              <span>Teacher Operational Roster</span>
              <span aria-hidden="true">·</span>
              <span>The Seaside Schools</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              My Classes & Students
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Managing <strong>{assignedClasses.join(' & ')}</strong>. Record student positive habits, issue class-wide commendations, and verify assignment contributions directly into parent Impact Scores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setBatchModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Batch Award Class
            </button>
            <button
              onClick={() => onOpenRecordModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Record Positive Habit</span>
            </button>
          </div>
        </div>

        {/* Quick Teacher Metrics */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-slate-500 font-medium">Assigned Classes</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{assignedClasses.join(', ')}</div>
            <div className="text-[11px] text-slate-500">{assignedStudents.length} enrolled students</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-slate-500 font-medium">Class Habit Entries</div>
            <div className="text-lg font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
              {assignedStudents.reduce((acc, s) => acc + s.habitCount, 0)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">Verified by staff</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-slate-500 font-medium">Points Logged (Term 1)</div>
            <div className="text-lg font-bold text-indigo-700 font-mono tabular-nums mt-0.5">
              {assignedStudents.reduce((acc, s) => acc + s.totalPoints, 0)} pts
            </div>
            <div className="text-[11px] text-indigo-600 font-medium">Contributing 80% to families</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-slate-500 font-medium">Pending Inquiries</div>
            <div className="text-lg font-bold text-amber-700 font-mono tabular-nums mt-0.5">
              {pendingClassCorrections.length}
            </div>
            <button
              onClick={onNavigateToCorrections}
              className="text-[11px] text-amber-800 font-semibold hover:underline block truncate"
            >
              Review queue →
            </button>
          </div>
        </div>
      </div>

      {/* Class Selector & Roster Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          {/* Class Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setSelectedClass('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedClass === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Assigned Classes ({assignedStudents.length})
            </button>
            {assignedClasses.map((cls) => {
              const count = assignedStudents.filter((s) => s.className === cls).length;
              return (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    selectedClass === cls
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cls} ({count})
                </button>
              );
            })}
          </div>

          {/* Student Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or family..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Student Roster Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full py-6">
              <EmptyStateCard
                variant="generic"
                title="No students in this view"
                description="Try another class tab or clear the search. When students are linked to your classes, they will appear here with photo placeholders."
              />
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 transition-colors flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <PersonAvatar name={student.name} size="md" role="student" rounded="xl" />
                      <div className="min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {student.className} · {student.yearGroup}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">
                        {student.name}
                      </h3>
                      <div className="text-xs text-slate-500 truncate">
                        {student.family.displayTitle}
                      </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-base font-bold text-indigo-700 tabular-nums">
                        {student.totalPoints} <span className="text-[10px] font-normal text-slate-400">pts</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold font-mono">
                        +{student.weeklyPoints} this week
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{student.habitCount} logged habits</span>
                    </span>
                    <button
                      onClick={() => onOpenRecordModal(student.id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Record custom →
                    </button>
                  </div>
                </div>

                {/* Quick Points Award Actions */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Quick Award
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      onClick={() => handleQuickAward(student, 'attendance_punctuality', 'Early Morning Arrival Check-in', 5)}
                      className="p-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium transition-colors text-center border border-emerald-200"
                      title="Award +5 for Early Arrival"
                    >
                      +5 Arrival
                    </button>
                    <button
                      onClick={() => handleQuickAward(student, 'assignments', 'On-Time Homework Submission', 10)}
                      className="p-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium transition-colors text-center border border-blue-200"
                      title="Award +10 for Homework"
                    >
                      +10 Work
                    </button>
                    <button
                      onClick={() => handleQuickAward(student, 'behaviour_character', 'Exemplary Peer Support & Values', 10)}
                      className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium transition-colors text-center border border-rose-200"
                      title="Award +10 for Character"
                    >
                      +10 Character
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Batch Award Modal for Class Teachers */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Award Entire Class
                </h3>
              </div>
              <button
                onClick={() => setBatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteBatchAward} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class</label>
                <select
                  value={selectedBatchClass}
                  onChange={(e) => setSelectedBatchClass(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                >
                  {assignedClasses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={batchCategoryId}
                  onChange={(e) => setBatchCategoryId(e.target.value as CategoryId)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="attendance_punctuality">Attendance & Punctuality</option>
                  <option value="assignments">Assignments & Homework</option>
                  <option value="projects">Projects & Presentations</option>
                  <option value="behaviour_character">Behaviour & Character</option>
                  <option value="participation">Clubs & Participation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Activity Title / Commendation</label>
                <input
                  type="text"
                  value={batchTitle}
                  onChange={(e) => setBatchTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Points per Student</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={batchPoints}
                  onChange={(e) => setBatchPoints(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 text-slate-600">
                This will record +{batchPoints} points for all {assignedStudents.filter((s) => s.className === selectedBatchClass).length} students in {selectedBatchClass} and notify their parents.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  Award Points to Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
