import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Star,
  Flame,
  Heart,
  Clock,
  BookOpen,
  Users,
  Sparkles,
  Shield,
  Zap,
  Crown,
  Target,
  CheckCircle2,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

/** School brand palette */
export const BRAND = {
  blue: '#0040A0',
  blueDark: '#003080',
  blueSoft: '#E8F0FC',
  red: '#D02010',
  redSoft: '#FDE8E6',
  gold: '#D4A017',
  goldSoft: '#FFF6D6',
  silver: '#94A3B8',
  bronze: '#B87333'
} as const;

/* ------------------------------------------------------------------ */
/*  Rank medals (1 / 2 / 3)                                            */
/* ------------------------------------------------------------------ */

const MEDAL_STYLES = {
  1: {
    ring: 'from-amber-300 via-yellow-400 to-amber-600',
    face: 'from-yellow-300 to-amber-500',
    glow: 'shadow-amber-400/50',
    ribbon: 'bg-amber-500',
    label: '1st'
  },
  2: {
    ring: 'from-slate-200 via-slate-300 to-slate-500',
    face: 'from-slate-200 to-slate-400',
    glow: 'shadow-slate-400/40',
    ribbon: 'bg-slate-500',
    label: '2nd'
  },
  3: {
    ring: 'from-orange-300 via-amber-600 to-orange-800',
    face: 'from-amber-600 to-orange-800',
    glow: 'shadow-orange-500/40',
    ribbon: 'bg-amber-800',
    label: '3rd'
  }
} as const;

export const RankMedal: React.FC<{
  rank: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ rank, size = 'md', className = '' }) => {
  const s = MEDAL_STYLES[rank];
  const dim =
    size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'sm' ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-lg';
  const iconDim = size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <div
        className={`${dim} rounded-full bg-gradient-to-br ${s.ring} p-[3px] shadow-lg ${s.glow}`}
      >
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${s.face} flex flex-col items-center justify-center text-white font-black tracking-tight`}
        >
          {rank === 1 ? (
            <Crown className={`${iconDim} mb-0.5 drop-shadow-sm`} />
          ) : (
            <Medal className={`${iconDim} mb-0.5 drop-shadow-sm`} />
          )}
          <span className="leading-none drop-shadow-sm">{s.label}</span>
        </div>
      </div>
      {rank === 1 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Achievement badges                                                 */
/* ------------------------------------------------------------------ */

export type BadgeKind =
  | 'punctuality'
  | 'kindness'
  | 'homework'
  | 'participation'
  | 'parent'
  | 'streak'
  | 'century'
  | 'champion'
  | 'improved'
  | 'team';

const BADGE_META: Record<
  BadgeKind,
  { label: string; icon: React.ReactNode; bg: string; ring: string; text: string }
> = {
  punctuality: {
    label: 'On Time Star',
    icon: <Clock className="w-4 h-4" />,
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    text: 'text-emerald-700'
  },
  kindness: {
    label: 'Kind Heart',
    icon: <Heart className="w-4 h-4" />,
    bg: 'bg-rose-50',
    ring: 'ring-rose-200',
    text: 'text-rose-700'
  },
  homework: {
    label: 'Homework Hero',
    icon: <BookOpen className="w-4 h-4" />,
    bg: 'bg-sky-50',
    ring: 'ring-sky-200',
    text: 'text-sky-700'
  },
  participation: {
    label: 'Active Voice',
    icon: <Users className="w-4 h-4" />,
    bg: 'bg-violet-50',
    ring: 'ring-violet-200',
    text: 'text-violet-700'
  },
  parent: {
    label: 'Engaged Parent',
    icon: <Users className="w-4 h-4" />,
    bg: 'bg-indigo-50',
    ring: 'ring-indigo-200',
    text: 'text-indigo-700'
  },
  streak: {
    label: 'Streak Keeper',
    icon: <Flame className="w-4 h-4" />,
    bg: 'bg-orange-50',
    ring: 'ring-orange-200',
    text: 'text-orange-700'
  },
  century: {
    label: 'Century Club',
    icon: <Star className="w-4 h-4" />,
    bg: 'bg-amber-50',
    ring: 'ring-amber-200',
    text: 'text-amber-800'
  },
  champion: {
    label: 'Category Champ',
    icon: <Trophy className="w-4 h-4" />,
    bg: 'bg-yellow-50',
    ring: 'ring-yellow-300',
    text: 'text-yellow-800'
  },
  improved: {
    label: 'Most Improved',
    icon: <TrendingUp className="w-4 h-4" />,
    bg: 'bg-teal-50',
    ring: 'ring-teal-200',
    text: 'text-teal-700'
  },
  team: {
    label: 'Team Player',
    icon: <Shield className="w-4 h-4" />,
    bg: 'bg-blue-50',
    ring: 'ring-blue-200',
    text: 'text-blue-800'
  }
};

export const AchievementBadge: React.FC<{
  kind: BadgeKind;
  earned?: boolean;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}> = ({ kind, earned = true, size = 'md', showLabel = true }) => {
  const m = BADGE_META[kind];
  const pad = size === 'sm' ? 'p-2' : 'p-3';
  const iconWrap = size === 'sm' ? 'w-8 h-8' : 'w-11 h-11';

  return (
    <div
      className={`flex flex-col items-center gap-1.5 ${!earned ? 'opacity-40 grayscale' : ''}`}
      title={m.label}
    >
      <div
        className={`${iconWrap} ${pad} rounded-2xl ${m.bg} ring-2 ${m.ring} ${m.text} flex items-center justify-center shadow-sm ${
          earned ? 'hover:scale-105 transition-transform' : ''
        }`}
      >
        {m.icon}
      </div>
      {showLabel && (
        <span className={`text-[10px] sm:text-[11px] font-semibold text-center leading-tight ${m.text} max-w-[72px]`}>
          {m.label}
        </span>
      )}
    </div>
  );
};

export const BadgeWall: React.FC<{
  badges: { kind: BadgeKind; earned?: boolean }[];
  title?: string;
}> = ({ badges, title = 'Achievement Badges' }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
    <div className="flex items-center gap-2 mb-4">
      <Award className="w-4 h-4 text-amber-500" />
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
    </div>
    <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-5">
      {badges.map((b) => (
        <AchievementBadge key={b.kind} kind={b.kind} earned={b.earned !== false} />
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Podium card                                                        */
/* ------------------------------------------------------------------ */

export const PodiumCard: React.FC<{
  rank: 1 | 2 | 3;
  title: string;
  subtitle: string;
  score: number;
  children?: React.ReactNode;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  elevate?: boolean;
}> = ({ rank, title, subtitle, score, children, footerLeft, footerRight, elevate }) => {
  const frames = {
    1: {
      border: 'border-amber-300',
      bg: 'bg-gradient-to-b from-amber-50 via-white to-amber-50/40',
      bar: 'from-amber-400 to-yellow-500',
      score: 'text-amber-700'
    },
    2: {
      border: 'border-slate-300',
      bg: 'bg-gradient-to-b from-slate-50 via-white to-slate-100/50',
      bar: 'from-slate-400 to-slate-500',
      score: 'text-slate-700'
    },
    3: {
      border: 'border-orange-300/70',
      bg: 'bg-gradient-to-b from-orange-50/80 via-white to-amber-50/30',
      bar: 'from-amber-700 to-orange-700',
      score: 'text-amber-900'
    }
  }[rank];

  return (
    <div
      className={`relative rounded-2xl border-2 ${frames.border} ${frames.bg} p-4 sm:p-6 shadow-md ${
        elevate || rank === 1 ? 'md:-mt-4 md:mb-2 ring-2 ring-amber-200/60 shadow-amber-200/30' : ''
      } transition-transform hover:-translate-y-1 duration-200 flex flex-col`}
    >
      <div className={`absolute top-0 left-4 right-4 h-1.5 rounded-b-full bg-gradient-to-r ${frames.bar}`} />

      <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
        <RankMedal rank={rank} size="md" />
        <div className="text-right">
          <div className={`font-mono text-2xl sm:text-3xl font-black tabular-nums ${frames.score}`}>
            {score}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">points</div>
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{title}</h3>
      <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>

      {children && <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-200/70 space-y-1.5 text-xs text-slate-600">{children}</div>}

      {(footerLeft || footerRight) && (
        <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">{footerLeft}</span>
          <span>{footerRight}</span>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Decorative ribbons / confetti                                      */
/* ------------------------------------------------------------------ */

export const SchoolRibbon: React.FC<{ position?: 'top' | 'bottom' }> = ({ position = 'top' }) => (
  <div
    className={`absolute ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r from-[#0040A0] via-[#0040A0] to-[#D02010]`}
    aria-hidden
  />
);

export const ConfettiDots: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
    <span className="absolute top-4 left-[12%] w-2 h-2 rounded-full bg-amber-400/70" />
    <span className="absolute top-10 right-[18%] w-1.5 h-1.5 rounded-full bg-rose-400/60" />
    <span className="absolute bottom-8 left-[22%] w-2 h-2 rounded-full bg-sky-400/50" />
    <span className="absolute top-1/3 right-[8%] w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
    <span className="absolute bottom-12 right-[28%] w-2 h-2 rounded-full bg-[#0040A0]/40" />
    <span className="absolute top-6 left-[40%] w-1 h-1 rounded-full bg-[#D02010]/50" />
  </div>
);

/** Animated celebration confetti for Top 3 podium */
export const AnimatedConfetti: React.FC<{
  active?: boolean;
  durationMs?: number;
  className?: string;
}> = ({ active = true, durationMs = 4500, className = '' }) => {
  const [show, setShow] = useState(active);

  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    setShow(true);
    const t = window.setTimeout(() => setShow(false), durationMs);
    return () => window.clearTimeout(t);
  }, [active, durationMs]);

  if (!show) return null;

  const pieces = Array.from({ length: 36 }, (_, i) => {
    const colors = ['#D4A017', '#0040A0', '#D02010', '#22c55e', '#f59e0b', '#38bdf8', '#e11d48', '#a855f7'];
    const left = (i * 2.7 + (i % 5) * 3) % 100;
    const delay = (i % 12) * 0.12;
    const duration = 2.2 + (i % 5) * 0.35;
    const size = 6 + (i % 4) * 2;
    const rotate = (i * 47) % 360;
    const shape = i % 3 === 0 ? 'rounded-sm' : i % 3 === 1 ? 'rounded-full' : 'rounded-[1px] rotate-45';
    return (
      <span
        key={i}
        className={`pulse-confetti absolute top-0 ${shape}`}
        style={{
          left: `${left}%`,
          width: size,
          height: size * (i % 2 === 0 ? 0.6 : 1.2),
          backgroundColor: colors[i % colors.length],
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          transform: `rotate(${rotate}deg)`
        }}
      />
    );
  });

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden z-20 ${className}`}
      aria-hidden
    >
      {pieces}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Category chips                                                     */
/* ------------------------------------------------------------------ */

export const CategoryChip: React.FC<{
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}> = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all border shrink-0 ${
      active
        ? 'bg-[#0040A0] border-[#0040A0] text-white font-semibold shadow-md shadow-blue-900/20'
        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

/* ------------------------------------------------------------------ */
/*  Empty / illustration states                                        */
/* ------------------------------------------------------------------ */

export type EmptyIllustrationVariant = 'messages' | 'points' | 'corrections' | 'generic' | 'celebrate';

const EmptyIllustration: React.FC<{ variant: EmptyIllustrationVariant }> = ({ variant }) => {
  if (variant === 'messages') {
    return (
      <svg viewBox="0 0 160 120" className="w-28 h-20 mx-auto" aria-hidden>
        <rect x="20" y="28" width="90" height="58" rx="12" fill="#E8F0FC" stroke="#0040A0" strokeWidth="2" />
        <path d="M20 40 L65 68 L110 40" fill="none" stroke="#0040A0" strokeWidth="2" />
        <circle cx="122" cy="36" r="18" fill="#FFF6D6" stroke="#D4A017" strokeWidth="2" />
        <path d="M115 36 h14 M122 29 v14" stroke="#D4A017" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="48" y="78" width="70" height="22" rx="10" fill="#FDE8E6" stroke="#D02010" strokeWidth="1.5" opacity="0.9" />
        <circle cx="62" cy="89" r="3" fill="#D02010" />
        <circle cx="74" cy="89" r="3" fill="#D02010" />
        <circle cx="86" cy="89" r="3" fill="#D02010" />
      </svg>
    );
  }
  if (variant === 'points') {
    return (
      <svg viewBox="0 0 160 120" className="w-28 h-20 mx-auto" aria-hidden>
        <circle cx="80" cy="55" r="36" fill="#FFF6D6" stroke="#D4A017" strokeWidth="2.5" />
        <path d="M80 30 L88 48 L108 50 L93 64 L97 84 L80 74 L63 84 L67 64 L52 50 L72 48 Z" fill="#D4A017" />
        <rect x="30" y="92" width="100" height="10" rx="5" fill="#E8F0FC" />
        <rect x="30" y="92" width="42" height="10" rx="5" fill="#0040A0" />
      </svg>
    );
  }
  if (variant === 'corrections') {
    return (
      <svg viewBox="0 0 160 120" className="w-28 h-20 mx-auto" aria-hidden>
        <rect x="36" y="22" width="88" height="76" rx="10" fill="#E8F0FC" stroke="#0040A0" strokeWidth="2" />
        <path d="M52 48 h56 M52 62 h40 M52 76 h48" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
        <circle cx="118" cy="88" r="20" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2.5" />
        <path d="M108 88 L115 95 L130 78" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (variant === 'celebrate') {
    return (
      <svg viewBox="0 0 160 120" className="w-28 h-20 mx-auto" aria-hidden>
        <path d="M50 78 L80 30 L110 78 Z" fill="#FFF6D6" stroke="#D4A017" strokeWidth="2" />
        <circle cx="80" cy="55" r="12" fill="#D4A017" />
        <path d="M30 40 L40 55 M20 55 L38 58 M130 40 L120 55 M140 55 L122 58" stroke="#D02010" strokeWidth="3" strokeLinecap="round" />
        <path d="M45 95 h70" stroke="#0040A0" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 120" className="w-28 h-20 mx-auto" aria-hidden>
      <circle cx="80" cy="58" r="34" fill="#E8F0FC" stroke="#0040A0" strokeWidth="2" />
      <path d="M62 58 h36 M80 40 v36" stroke="#0040A0" strokeWidth="3" strokeLinecap="round" />
      <circle cx="110" cy="36" r="10" fill="#FDE8E6" stroke="#D02010" strokeWidth="2" />
    </svg>
  );
};

export const EmptyStateCard: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: EmptyIllustrationVariant;
}> = ({ title, description, icon, action, variant = 'generic' }) => (
  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 via-white to-blue-50/30 p-8 sm:p-10 text-center shadow-xs">
    <div className="mb-3">
      {icon ? (
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0040A0]/10 to-[#D02010]/10 flex items-center justify-center text-[#0040A0]">
          {icon}
        </div>
      ) : (
        <EmptyIllustration variant={variant} />
      )}
    </div>
    <h3 className="text-base font-bold text-slate-900">{title}</h3>
    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">{description}</p>
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Stat pill                                                          */
/* ------------------------------------------------------------------ */

export const StatPill: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'default' | 'gold' | 'success' | 'brand';
}> = ({ label, value, hint, tone = 'default' }) => {
  const tones = {
    default: 'bg-white/10 border-white/10 text-white',
    gold: 'bg-amber-400/20 border-amber-300/30 text-amber-100',
    success: 'bg-emerald-400/15 border-emerald-300/25 text-emerald-100',
    brand: 'bg-white/15 border-white/20 text-white'
  };
  return (
    <div className={`p-3 sm:p-3.5 rounded-xl backdrop-blur-xs border ${tones[tone]}`}>
      <div className="text-[11px] font-medium opacity-80">{label}</div>
      <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums mt-0.5">{value}</div>
      {hint && <div className="text-[11px] font-medium opacity-90 mt-0.5">{hint}</div>}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Quick icons used in hero banners                                   */
/* ------------------------------------------------------------------ */

export const HeroIcons = {
  Trophy,
  Award,
  Star,
  Flame,
  Zap,
  Target,
  CheckCircle2,
  MessageSquare,
  Crown,
  Sparkles
};


/* ------------------------------------------------------------------ */
/*  Person avatar with photo or branded placeholder                    */
/* ------------------------------------------------------------------ */

const AVATAR_PALETTE = [
  'from-[#0040A0] to-[#003080]',
  'from-sky-500 to-blue-700',
  'from-emerald-500 to-teal-700',
  'from-violet-500 to-indigo-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-[#D02010]',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-purple-700'
];

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorIndex(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % 997;
  return h % AVATAR_PALETTE.length;
}

export type PersonAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASS: Record<PersonAvatarSize, string> = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl'
};

export const PersonAvatar: React.FC<{
  name: string;
  photoUrl?: string | null;
  size?: PersonAvatarSize;
  role?: 'student' | 'teacher' | 'parent' | 'admin' | 'staff';
  className?: string;
  rounded?: 'full' | 'xl' | '2xl';
}> = ({ name, photoUrl, size = 'md', role, className = '', rounded = 'full' }) => {
  const initials = initialsFromName(name);
  const gradient = AVATAR_PALETTE[colorIndex(name)];
  const round =
    rounded === 'full' ? 'rounded-full' : rounded === '2xl' ? 'rounded-2xl' : 'rounded-xl';
  const dim = SIZE_CLASS[size];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        title={name}
        className={`${dim} ${round} object-cover shrink-0 ring-2 ring-white shadow-sm ${className}`}
      />
    );
  }

  // Placeholder: gradient + initials + subtle role cue
  const roleRing =
    role === 'teacher' || role === 'staff'
      ? 'ring-2 ring-amber-300/80'
      : role === 'student'
        ? 'ring-2 ring-sky-200/90'
        : role === 'admin'
          ? 'ring-2 ring-[#0040A0]/40'
          : 'ring-2 ring-white/80';

  return (
    <div
      title={name}
      className={`${dim} ${round} bg-gradient-to-br ${gradient} text-white font-bold flex items-center justify-center shrink-0 shadow-md ${roleRing} ${className}`}
      aria-label={name}
    >
      <span className="drop-shadow-sm select-none">{initials}</span>
    </div>
  );
};
