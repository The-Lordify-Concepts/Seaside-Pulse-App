import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePulse } from '../context/PulseContext';
import { Timeframe, LeaderboardCategory } from '../types/pulse';
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  Users, 
  Clock, 
  BookOpen, 
  Heart, 
  HelpCircle,
  Eye,
  Lock,
  ChevronRight,
  Sparkles,
  Filter
} from 'lucide-react';
import { PodiumCard, CategoryChip, RankMedal, SchoolRibbon, ConfettiDots, AchievementBadge, AnimatedConfetti } from './ui/Visuals';

export const LeaderboardView: React.FC<{ onNavigateToParentPortal: () => void }> = ({ onNavigateToParentPortal }) => {
  const { currentUser } = useAuth();
  const { currentFamily, getLeaderboardData } = usePulse();
  const [timeframe, setTimeframe] = useState<Timeframe>('termly');
  const [category, setCategory] = useState<LeaderboardCategory>('overall');
  const [showFairFormulaModal, setShowFairFormulaModal] = useState<boolean>(false);
  const [staffShowAllRanks, setStaffShowAllRanks] = useState<boolean>(false);
  const [teacherFilterCohort, setTeacherFilterCohort] = useState<boolean>(true);

  const role = currentUser?.role || 'parent';
  const isStaff = role === 'admin' || role === 'teacher';
  const assignedClasses = currentUser?.linkedEntities.assignedClasses || [];

  const { rankedFamilies, topThree, currentUserRank, categoryWinner } = getLeaderboardData(timeframe, category);

  // For teachers, filter cohort to families with children in their assigned classes if teacherFilterCohort is true
  const visibleCohort = (role === 'teacher' && teacherFilterCohort)
    ? rankedFamilies.filter((item) => item.family.children.some((c) => assignedClasses.includes(c.className)))
    : rankedFamilies;

  const categoryLabels: { id: LeaderboardCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
      id: 'overall', 
      label: 'Overall Impact', 
      icon: <Trophy className="w-4 h-4 text-amber-500 shrink-0" />,
      desc: 'Combined 80% student positive habits + 20% parent engagement'
    },
    { 
      id: 'punctuality', 
      label: 'Punctuality & Attendance', 
      icon: <Clock className="w-4 h-4 text-emerald-500 shrink-0" />,
      desc: 'Consistent on-time arrival and uninterrupted attendance records'
    },
    { 
      id: 'assignments', 
      label: 'Assignments & Projects', 
      icon: <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />,
      desc: 'Early and on-schedule homework, reading logs, and STEM projects'
    },
    { 
      id: 'character', 
      label: 'Character & Behaviour', 
      icon: <Heart className="w-4 h-4 text-rose-500 shrink-0" />,
      desc: 'Kindness, peer mentorship, teamwork, and school values'
    },
    { 
      id: 'parent_participation', 
      label: 'Parent Participation', 
      icon: <Users className="w-4 h-4 text-indigo-500 shrink-0" />,
      desc: 'PTA conferences, event attendance, communications, and volunteering'
    },
    { 
      id: 'most_improved', 
      label: 'Most Improved', 
      icon: <TrendingUp className="w-4 h-4 text-teal-500 shrink-0" />,
      desc: 'Greatest positive growth in habits compared to previous baseline'
    }
  ];

  const currentCategoryInfo = categoryLabels.find((c) => c.id === category) || categoryLabels[0];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner & Context */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0040A0] via-[#003080] to-slate-900 text-white rounded-2xl border border-blue-900 p-4 sm:p-6 md:p-8 shadow-lg">
        <SchoolRibbon position="top" />
        <ConfettiDots />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-blue-200 uppercase tracking-wider font-semibold mb-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>School Community Recognition</span>
              <span aria-hidden="true">·</span>
              <span>The Seaside Schools</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Parents Impact Leaderboard
            </h1>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Celebrating families who build positive habits at school — medals, badges, and recognition for every milestone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setShowFairFormulaModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-white/15 border border-white/25 rounded-lg hover:bg-white/25 transition-colors whitespace-nowrap"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>Fair Formula</span>
            </button>
            {isStaff && (
              <button
                onClick={() => setStaffShowAllRanks(!staffShowAllRanks)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  staffShowAllRanks
                    ? 'bg-amber-400 text-slate-900 border-amber-300'
                    : 'bg-white/15 text-white border-white/25 hover:bg-white/25'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{staffShowAllRanks ? 'Hide Roster' : role === 'teacher' ? 'Staff: Class Roster' : 'Staff: All Ranks'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Timeframe & Category Selectors */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/15 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center p-1 bg-white/10 rounded-lg border border-white/20 overflow-x-auto">
            {(['weekly', 'monthly', 'termly'] as Timeframe[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 text-xs font-medium rounded-md capitalize transition-all whitespace-nowrap text-center ${
                  timeframe === t
                    ? 'bg-white text-[#0040A0] font-semibold shadow-sm'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                {t === 'weekly' ? 'This Week' : t === 'monthly' ? 'This Month' : 'Autumn Term 2026'}
              </button>
            ))}
          </div>

          <div className="text-xs text-blue-100 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-white">{currentCategoryInfo.label}:</span>
            <span className="text-blue-100/90">{currentCategoryInfo.desc}</span>
          </div>
        </div>

        {/* Category Tab Strip - smoothly scrollable on mobile */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0">
          {categoryLabels.map((cat) => (
            <CategoryChip
              key={cat.id}
              active={category === cat.id}
              icon={cat.icon}
              label={cat.label}
              onClick={() => setCategory(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* PRIVATE FAMILY STANDING CARD (For Parents and Students) */}
      {(role === 'parent' || role === 'student') && currentFamily && currentUserRank && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 sm:p-6 md:p-7 shadow-sm border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-medium text-indigo-300">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {role === 'student' ? 'Your Family Standing' : 'Private Family Standing (Visible Only to You & School)'}
                </span>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span className="font-semibold">{currentFamily.displayTitle}</span>
                {role === 'student' && (
                  <span className="text-emerald-300 font-normal">
                    (Contributing as {currentUser?.name})
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span>Rank #{currentUserRank.rank}</span>
                <span className="text-xs sm:text-sm font-normal text-slate-300">
                  with <span className="font-mono font-semibold tabular-nums text-indigo-200">{currentUserRank.score}</span> points in {currentCategoryInfo.label}
                </span>
              </h2>
              <div className="text-[11px] sm:text-xs text-slate-300">
                Children: {currentFamily.children.map((c) => `${c.name} (${c.yearGroup})`).join(' · ')}
              </div>
            </div>

            {/* Target next rank */}
            <div className="bg-white/10 rounded-lg p-3 sm:p-4 border border-white/10 w-full md:max-w-sm flex items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs text-indigo-200 font-medium">Progress Target</div>
                {currentUserRank.pointsToNextRank > 0 ? (
                  <p className="text-xs sm:text-sm text-white font-medium mt-0.5 truncate">
                    You are <span className="font-mono font-bold text-amber-300 tabular-nums">{currentUserRank.pointsToNextRank} pts</span> away from #{currentUserRank.rank - 1}
                    {currentUserRank.nextFamilyName && (
                      <span className="block text-[11px] sm:text-xs text-slate-300 truncate">Target: {currentUserRank.nextFamilyName}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-emerald-300 font-medium mt-0.5">
                    Highest rank achieved in this period!
                  </p>
                )}
              </div>
              {role === 'parent' && (
                <button
                  onClick={onNavigateToParentPortal}
                  className="px-3 py-1.5 bg-white text-slate-900 text-xs font-semibold rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOP THREE PARENTS & CATEGORY WINNERS PODIUM */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Top Three Parents & Category Recognition
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Official Public School Display · {timeframe.toUpperCase()}
          </span>
        </div>

        {/* Podium Grid — reorder visual so 2nd | 1st | 3rd on desktop */}
        <div className="relative">
          {topThree.length > 0 && <AnimatedConfetti active key={timeframe + '-' + category} />}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:items-end">
          {(() => {
            const order = topThree.length >= 3 ? [1, 0, 2] : topThree.map((_, i) => i);
            return order.map((idx) => {
              const item = topThree[idx];
              if (!item) return null;
              const rank = (idx + 1) as 1 | 2 | 3;
              return (
                <div key={item.family.id} className={rank === 1 ? 'md:order-2' : rank === 2 ? 'md:order-1' : 'md:order-3'}>
                  <PodiumCard
                    rank={rank}
                    title={item.family.displayTitle}
                    subtitle={item.family.parentNames}
                    score={item.score}
                    elevate={rank === 1}
                    footerLeft={
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>School Exemplar</span>
                      </>
                    }
                    footerRight={timeframe === 'weekly' ? 'Weekly Lead' : 'Term Impact'}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 shrink-0">Children:</span>
                      <span className="font-medium text-slate-800 text-right">
                        {item.family.children.map((c) => c.name).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 shrink-0">Classes:</span>
                      <span className="text-slate-700 text-right">
                        {item.family.children.map((c) => c.className).join(', ')}
                      </span>
                    </div>
                    {rank === 1 && (
                      <div className="pt-2 flex flex-wrap gap-2 justify-end">
                        <AchievementBadge kind="champion" size="sm" showLabel={false} />
                        <AchievementBadge kind="century" size="sm" showLabel={false} />
                      </div>
                    )}
                  </PodiumCard>
                </div>
              );
            });
          })()}
        </div>
        </div>
      </div>

      {/* Category Winner Spotlight */}
      {category !== 'overall' && categoryWinner && (
        <div className="bg-gradient-to-r from-amber-50 via-white to-blue-50 rounded-2xl border-2 border-amber-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-md shadow-amber-300/40">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-700">
                {currentCategoryInfo.label} · Category Champion
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {categoryWinner.family.displayTitle} ({categoryWinner.family.parentNames})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Children: {categoryWinner.family.children.map((c) => c.name).join(', ')} · Total {currentCategoryInfo.label} score: <span className="font-mono font-bold tabular-nums text-indigo-900">{categoryWinner.score} pts</span>
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 whitespace-nowrap self-start sm:self-auto">
            Awarded for consistent dedication
          </div>
        </div>
      )}

      {/* STAFF / TEACHER COHORT ROSTER VIEW */}
      {isStaff && staffShowAllRanks && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {role === 'teacher' ? 'Assigned Class Cohort Roster' : 'Authorized Administrative Roster'}
              </h3>
              <p className="text-xs text-slate-500">
                {role === 'teacher'
                  ? 'Showing impact standings for families of students in your assigned classes.'
                  : 'Confidential school-wide administrative access.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {role === 'teacher' && (
                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setTeacherFilterCohort(true)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      teacherFilterCohort ? 'bg-white text-indigo-700 font-semibold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    My Classes ({assignedClasses.join(', ')})
                  </button>
                  <button
                    onClick={() => setTeacherFilterCohort(false)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      !teacherFilterCohort ? 'bg-white text-indigo-700 font-semibold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    All School
                  </button>
                </div>
              )}
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                {visibleCohort.length} families
              </span>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold whitespace-nowrap">Rank</th>
                    <th className="py-2.5 px-3 font-semibold">Family</th>
                    <th className="py-2.5 px-3 font-semibold hidden md:table-cell">Children</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Weekly</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Monthly</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Term Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleCohort.map((item) => (
                    <tr 
                      key={item.family.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        item.family.id === currentFamily?.id ? 'bg-indigo-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-semibold tabular-nums text-slate-700 whitespace-nowrap">
                        #{item.rank}
                      </td>
                      <td className="py-3 px-3 text-slate-900">
                        <div>{item.family.displayTitle}</div>
                        <div className="text-slate-500 font-normal">{item.family.parentNames}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 hidden md:table-cell">
                        {item.family.children.map((c) => `${c.name} (${c.className})`).join(', ')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {item.family.weeklyScore}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {item.family.monthlyScore}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-indigo-700 whitespace-nowrap">
                        {item.family.termlyScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-CHILD FAIR FORMULA MODAL */}
      {showFairFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-4 sm:p-6 md:p-8 shadow-xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Multi-Child Fair Balancing Policy
                  </h3>
                  <p className="text-xs text-slate-500">
                    PULSE Principle 6: Fair scoring for all family sizes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFairFormulaModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md text-lg"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                <strong>"Families with more than one child must be scored fairly, so having more children does not automatically give a family an advantage."</strong>
              </p>
              
              <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200 space-y-2 text-xs font-mono">
                <div className="font-semibold text-slate-900 text-xs sm:text-sm">How PULSE Calculates the Impact Score:</div>
                <div>1. Student Activity (80% Weight): Normalized per child.</div>
                <div className="text-indigo-700 break-words">
                  Normalized Student Score = (Score Child A + Score Child B + ...) ÷ Number of Children
                </div>
                <div>2. Parent Participation (20% Weight): Family-level activities (PTA, events, volunteering, communication).</div>
                <div className="font-bold text-slate-900 break-words">
                  Total Impact Score = (0.80 × Normalized Student Score) + (0.20 × Parent Participation Score)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-1">Single-Child Family:</span>
                  Child earns 100 student points. Normalized student score = 100.
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-1">Two-Child Family:</span>
                  Child A earns 100, Child B earns 100. Total = 200 ÷ 2 = 100 normalized.
                </div>
              </div>

              <p className="text-xs text-slate-600">
                This guarantees a parent with 3 children doesn't generate 3x more points than a parent with 1 child. Every family is evaluated on quality of habit and dedication.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFairFormulaModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
