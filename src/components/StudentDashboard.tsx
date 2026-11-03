import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePulse } from '../context/PulseContext';
import { 
  Sparkles, 
  Trophy, 
  Star, 
  Calendar, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Clock, 
  Heart, 
  Zap, 
  Flame, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Target, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Smile,
  Compass,
  Check
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigateToPoints: () => void;
  onNavigateToMessages: () => void;
  onNavigateToProfile: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateToPoints,
  onNavigateToMessages,
  onNavigateToProfile
}) => {
  const { currentUser } = useAuth();
  const { 
    currentFamily, 
    activities, 
    messages, 
    students,
    classes 
  } = usePulse();

  const studentId = currentUser?.linkedEntities.studentId || 'stu-leo';
  const studentName = currentUser?.name || 'Leo Bennett';
  const className = currentUser?.linkedEntities.className || '5A';
  const yearGroup = currentUser?.linkedEntities.yearGroup || 'Year 5';

  // Personal activities
  const studentActivities = activities.filter((a) => a.studentId === studentId && a.status !== 'under_review');
  const studentTotalPoints = studentActivities.reduce((acc, a) => acc + a.rawPoints, 0);

  // Weekly points
  const recentOneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const weeklyPoints = studentActivities
    .filter((a) => (now - new Date(a.timestamp).getTime()) < recentOneWeekMs)
    .reduce((acc, a) => acc + a.rawPoints, 0);

  // Contribution to family score
  const familyTotalScore = currentFamily?.termlyScore || 378;
  const contributionPercentage = familyTotalScore > 0 
    ? Math.round((studentTotalPoints / familyTotalScore) * 100) 
    : 0;

  // Class ranking calculation (Friendly, limited view)
  const classStudents = students.filter((s) => s.className === className);
  const classRankingList = classStudents.map((s) => {
    const sActs = activities.filter((a) => a.studentId === s.id && a.status !== 'under_review');
    const pts = sActs.reduce((acc, a) => acc + a.rawPoints, 0);
    return {
      studentId: s.id,
      name: s.name,
      points: pts,
      isCurrentUser: s.id === studentId
    };
  }).sort((a, b) => b.points - a.points);

  const studentRankIndex = classRankingList.findIndex((item) => item.studentId === studentId);
  const studentRank = studentRankIndex !== -1 ? studentRankIndex + 1 : 2;

  // Top 3 for friendly view with respectful anonymization (First name + initial, except current user)
  const topThreeInClass = classRankingList.slice(0, 3).map((item, idx) => {
    const parts = item.name.split(' ');
    const displayName = item.isCurrentUser 
      ? `${item.name} (You!)` 
      : `${parts[0]} ${parts[1] ? parts[1][0] + '.' : ''}`;
    return {
      ...item,
      rank: idx + 1,
      displayName
    };
  });

  // Streaks
  const punctualityStreakDays = 10;
  const assignmentStreakWeeks = 4;
  const kindnessBadgesCount = 3;

  // Goals
  const personalGoalTarget = 100; // Century Club Milestone
  const personalGoalPct = Math.min(100, Math.round((studentTotalPoints / personalGoalTarget) * 100));

  const classGoalTarget = 250; // Class 5A Total Positive Habits
  const classTotalHabits = activities.filter((a) => {
    const matched = classStudents.some((s) => s.id === a.studentId);
    return matched;
  }).length;
  const classGoalPct = Math.min(100, Math.round((classTotalHabits / classGoalTarget) * 100));

  // Messages directed to student or their class/year
  const studentMessages = messages.filter((m) => {
    return (
      m.targetAudience === 'all' ||
      m.recipientStudentId === studentId ||
      m.relatedStudentId === studentId ||
      (m.targetAudience === 'class' && (m.targetFilter === className || m.targetClassId === currentUser?.linkedEntities.classId)) ||
      (m.targetAudience === 'year' && m.targetFilter === yearGroup)
    );
  }).slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Student Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-5 sm:p-7 md:p-8 shadow-sm border border-indigo-700/50 relative overflow-hidden">
        {/* Subtle decorative background shimmer */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Student Avatar Initials */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-xs border-2 border-white/20 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 shadow-md">
              {studentName.split(' ').map((n) => n[0]).join('')}
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-indigo-100 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>My Learner Progress · {className} ({yearGroup})</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {studentName}!
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
                Every positive habit you build at school—from early arrival to helping peers—earns points towards your family's Impact Score!
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons for Student */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={onNavigateToProfile}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl transition-colors backdrop-blur-xs flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>My Badges & Passport</span>
            </button>
            <button
              onClick={onNavigateToPoints}
              className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>View All My Points →</span>
            </button>
          </div>
        </div>

        {/* Hero KPI Stat Strip */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 sm:p-3.5 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-indigo-200">Personal Points This Term</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white mt-0.5">
              {studentTotalPoints} <span className="text-xs font-sans font-normal text-indigo-200">pts</span>
            </div>
            <div className="text-[11px] text-emerald-300 font-medium">+{weeklyPoints} pts this week</div>
          </div>

          <div className="p-3 sm:p-3.5 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-indigo-200">Family Impact Contribution</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-300 mt-0.5">
              {contributionPercentage}% <span className="text-xs font-sans font-normal text-indigo-200">of total</span>
            </div>
            <div className="text-[11px] text-indigo-200 truncate">
              {studentTotalPoints} of {familyTotalScore} family pts
            </div>
          </div>

          <div className="p-3 sm:p-3.5 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-indigo-200">Active Punctuality Streak</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-300 mt-0.5 flex items-center gap-1">
              <span>{punctualityStreakDays}</span>
              <span className="text-base font-sans font-normal text-indigo-200">days</span>
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400 inline" />
            </div>
            <div className="text-[11px] text-emerald-200">On time before 08:35</div>
          </div>

          <div className="p-3 sm:p-3.5 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10">
            <div className="text-[11px] font-medium text-indigo-200">Class 5A Standing</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white mt-0.5">
              #{studentRank} <span className="text-xs font-sans font-normal text-indigo-200">in Class 5A</span>
            </div>
            <div className="text-[11px] text-emerald-300 font-medium">Top 3 Podium Achiever!</div>
          </div>
        </div>
      </div>

      {/* 2. Personal Goals & Active Streaks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Milestone Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-400" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Personal Milestone</h3>
                  <div className="text-[11px] text-slate-500">Century Club (100 Points)</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {personalGoalPct}%
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Earn 100 points this term to receive the special <strong>The Seaside Century Certificate</strong> at end-of-term assembly!
            </p>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Progress</span>
                <span className="font-mono font-bold text-slate-900">{studentTotalPoints} / {personalGoalTarget} pts</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${personalGoalPct}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 text-right">
                Only {Math.max(0, personalGoalTarget - studentTotalPoints)} more points to reach 100!
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <Check className="w-3.5 h-3.5" /> 50 Club Achieved
            </span>
            <span className="font-medium text-indigo-600">Next: Gold Star</span>
          </div>
        </div>

        {/* Current Active Streaks Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Flame className="w-4 h-4 fill-emerald-500" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Current Active Streaks</h3>
                  <div className="text-[11px] text-slate-500">Positive Daily Habits</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active Streak
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold text-slate-900">10-Day Punctuality Streak</div>
                    <div className="text-[11px] text-slate-500">On-time arrival every morning</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded text-xs">
                  🔥 10 Days
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-bold text-slate-900">4-Week Assignment Streak</div>
                    <div className="text-[11px] text-slate-500">All homework turned in on time</div>
                  </div>
                </div>
                <span className="font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded text-xs">
                  4 Weeks
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Keep your streak going tomorrow!</span>
            <span className="text-indigo-600 font-semibold">+5 pts / day</span>
          </div>
        </div>

        {/* Class 5A Collective Team Target */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Class 5A Team Target</h3>
                  <div className="text-[11px] text-slate-500">Working Together as a Class</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {classGoalPct}%
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When Class 5A logs <strong>250 verified positive habits</strong> together, Mr. Reed will host a Friday STEM Makerspace afternoon!
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Class Total Recorded</span>
                <span className="font-mono font-bold text-slate-900">{classTotalHabits} / {classGoalTarget} habits</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${classGoalPct}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 text-right">
                {Math.max(0, classGoalTarget - classTotalHabits)} habits to class celebration!
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Classmates working together</span>
            <span className="font-semibold text-emerald-600">Almost there!</span>
          </div>
        </div>
      </div>

      {/* 3. Class 5A Clean, Encouraging Standing (Limited & Friendly View) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Friendly Class Recognition</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Class 5A Top 3 Recognition Podium
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Celebrates teamwork, punctuality, and good habits. Kept friendly with respectful first names.
            </p>
          </div>
          
          <div className="p-2 sm:px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>You are #{studentRank} in Class 5A!</span>
          </div>
        </div>

        {/* Podium / Standing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {topThreeInClass.map((item) => (
            <div
              key={item.studentId}
              className={`p-4 rounded-xl border transition-all ${
                item.isCurrentUser
                  ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-200 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  item.rank === 1
                    ? 'bg-amber-400 text-slate-900 shadow-xs'
                    : item.rank === 2
                    ? 'bg-slate-300 text-slate-800'
                    : 'bg-amber-600/80 text-white'
                }`}>
                  {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
                </span>
                <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                  {item.points} <span className="text-[11px] font-normal text-slate-500">pts</span>
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900 truncate">
                {item.displayName}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {item.isCurrentUser ? 'Your current standing' : 'Classmate'}
              </div>

              {item.isCurrentUser && (
                <div className="mt-2.5 pt-2 border-t border-indigo-200/60 text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
                  <span>Outstanding effort this term!</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Encouraging Privacy Note */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>PULSE Friendly Privacy: Full family rankings are kept private to parents. Students celebrate habits in class together!</span>
          </div>
          <button
            onClick={onNavigateToProfile}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 shrink-0"
          >
            My Badges →
          </button>
        </div>
      </div>

      {/* 4. Recent Highlights & Verified Habit Entries */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Habit Records</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Recent Highlights & Awards
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every point is verified by your teachers and directly added to your family's Impact Score.
            </p>
          </div>

          <button
            onClick={onNavigateToPoints}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start sm:self-auto"
          >
            <span>View Full Ledger ({studentActivities.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {studentActivities.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No habits logged yet this term. Arriving early tomorrow is a great way to earn your first +5 points!
            </div>
          ) : (
            studentActivities.slice(0, 5).map((act) => (
              <div 
                key={act.id} 
                className="py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-500">
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {act.categoryName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                    <span aria-hidden="true">·</span>
                    <span>Recorded by: <strong className="text-slate-700">{act.recordedByTeacher}</strong></span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{act.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{act.description}</p>
                </div>

                <div className="shrink-0 self-start md:self-auto">
                  <span className="font-mono text-xs sm:text-sm font-bold tabular-nums text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 inline-block shadow-2xs">
                    +{act.rawPoints} pts
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Messages & Teacher Recognitions Directed at Leo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>School Communications</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Messages & Teacher Praise
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Updates, praise, and reminders sent to you and Class 5A.
            </p>
          </div>

          <button
            onClick={onNavigateToMessages}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start sm:self-auto"
          >
            <span>All Messages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studentMessages.map((msg) => (
            <div 
              key={msg.id} 
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {msg.sender}
                  </span>
                  <span>{new Date(msg.sentAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5">{msg.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">{msg.body}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="capitalize">{msg.priority} Notice</span>
                <button
                  onClick={onNavigateToMessages}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
