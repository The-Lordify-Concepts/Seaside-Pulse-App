import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePulse } from '../context/PulseContext';
import { 
  Sparkles, 
  Award, 
  Clock, 
  BookOpen, 
  Heart, 
  Star, 
  CheckCircle2, 
  Users, 
  Calendar, 
  GraduationCap, 
  ShieldCheck, 
  ArrowLeft,
  Flame,
  Zap,
  Smile,
  Compass
} from 'lucide-react';

interface StudentProfileViewProps {
  onNavigateToDashboard: () => void;
  onNavigateToPoints: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  onNavigateToDashboard,
  onNavigateToPoints
}) => {
  const { currentUser } = useAuth();
  const { currentFamily, activities } = usePulse();

  const studentId = currentUser?.linkedEntities.studentId || 'stu-leo';
  const studentName = currentUser?.name || 'Leo Bennett';
  const className = currentUser?.linkedEntities.className || '5A';
  const yearGroup = currentUser?.linkedEntities.yearGroup || 'Year 5';

  const studentActivities = activities.filter((a) => a.studentId === studentId);
  const totalPoints = studentActivities.reduce((acc, a) => acc + a.rawPoints, 0);

  const familyTotal = currentFamily?.termlyScore || 378;
  const contributionPct = familyTotal > 0 ? Math.round((totalPoints / familyTotal) * 100) : 0;

  // Badges Earned
  const badges = [
    {
      id: 'b-punctual',
      title: 'Punctuality Ribbon',
      category: 'Attendance & Punctuality',
      description: 'Arrived before 08:35 ready to learn for 10 consecutive school days.',
      icon: Clock,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      earnedDate: 'October 2026'
    },
    {
      id: 'b-math',
      title: 'Maths Discovery Star',
      category: 'Assignments',
      description: 'Submitted Fractions Discovery investigation two days early with exemplary working.',
      icon: Star,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      earnedDate: 'October 2026'
    },
    {
      id: 'b-stem',
      title: 'STEM Coast Innovator',
      category: 'Projects',
      description: 'Constructed an outstanding relief diorama of coastal defenses for Science Fair.',
      icon: Compass,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      earnedDate: 'October 2026'
    },
    {
      id: 'b-empathy',
      title: 'Playground Empathy Award',
      category: 'Behaviour & Character',
      description: 'Welcomed and mentored visiting pupils with kindness, patience, and warmth.',
      icon: Heart,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      earnedDate: 'October 2026'
    },
    {
      id: 'b-sports',
      title: 'Squad Teamwork Medal',
      category: 'Participation',
      description: 'Committed effort and positive sportsmanship in Key Stage 2 football club.',
      icon: Zap,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      earnedDate: 'September 2026'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back button & title bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Dashboard</span>
        </button>
        <span className="text-xs font-mono text-slate-500">
          The Seaside Schools · Learner Passport
        </span>
      </div>

      {/* Student Passport Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-xs border-2 border-white/20 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-md">
                {studentName.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-indigo-100 border border-white/15 mb-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pupil · {className}</span>
                  <span aria-hidden="true">·</span>
                  <span>{yearGroup}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {studentName}
                </h1>
                <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
                  {currentUser?.email || 'leo.bennett@student.seasideschools.edu'}
                </p>
              </div>
            </div>

            {/* Total Points Pill */}
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 text-right self-stretch sm:self-auto">
              <div className="text-xs font-medium text-indigo-200">Personal Habit Total</div>
              <div className="text-3xl font-bold font-mono tabular-nums text-white mt-0.5">
                {totalPoints} <span className="text-xs font-sans text-indigo-200 font-normal">pts</span>
              </div>
              <div className="text-[11px] text-emerald-300 font-semibold mt-1">
                {contributionPct}% of Family Impact Score
              </div>
            </div>
          </div>
        </div>

        {/* Identity Details Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/60 p-4 sm:p-5 text-xs">
          <div className="p-2 sm:px-4">
            <div className="text-slate-400 font-medium">Class Lead Teacher</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">Mr. Marcus Reed</div>
            <div className="text-[11px] text-slate-500">Year 5 Lead & STEM</div>
          </div>

          <div className="p-2 sm:px-4">
            <div className="text-slate-400 font-medium">Linked Family</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">{currentFamily?.displayTitle || 'The Bennett Family'}</div>
            <div className="text-[11px] text-slate-500">Parents: {currentFamily?.parentNames}</div>
          </div>

          <div className="p-2 sm:px-4">
            <div className="text-slate-400 font-medium">Punctuality Record</div>
            <div className="font-bold text-emerald-700 font-mono text-sm mt-0.5">100% On Time</div>
            <div className="text-[11px] text-slate-500">10-day active streak</div>
          </div>

          <div className="p-2 sm:px-4">
            <div className="text-slate-400 font-medium">Current Goal Status</div>
            <div className="font-bold text-indigo-700 text-sm mt-0.5">Silver Milestone</div>
            <div className="text-[11px] text-slate-500">62 / 100 points</div>
          </div>
        </div>
      </div>

      {/* Badges & Ribbons Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 md:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
              <Award className="w-4 h-4" />
              <span>Verified Achievements & Badges</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              My Growth & Character Badges
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ribbons earned through daily dedication, good habits, and kindness in class and playground.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg self-start sm:self-auto">
            {badges.length} Badges Earned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div 
                key={b.id} 
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors shadow-2xs space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`p-2 rounded-lg border ${b.color}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">
                      {b.earnedDate}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">
                    {b.title}
                  </h3>
                  <div className="text-[11px] font-semibold text-indigo-600">
                    {b.category}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {b.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified by Staff
                  </span>
                  <span className="font-mono text-slate-400">PULSE Approved</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learner Pledge & Mission Card */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/50 rounded-2xl border border-indigo-100 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>The Seaside Schools Learner Promise</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              "We arrive on time, support our peers, and grow together every single day."
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every point you earn directly supports your family's standing in the school community programme, proving that learning is a partnership between school, student, and home.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onNavigateToPoints}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              View My Habit Ledger →
            </button>
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
