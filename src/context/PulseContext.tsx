import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Family, 
  PointEntry, 
  PointActivity,
  CategoryRule, 
  Message, 
  CorrectionRequest, 
  AuditLogEntry, 
  UserRole, 
  CategoryId, 
  Timeframe,
  LeaderboardCategory,
  SchoolClass,
  Teacher,
  Student,
  Parent,
  FamilyChild
} from '../types/pulse';
import { 
  INITIAL_FAMILIES, 
  INITIAL_ACTIVITIES, 
  INITIAL_CATEGORY_RULES, 
  INITIAL_MESSAGES, 
  INITIAL_CORRECTIONS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_CLASSES,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_PARENTS
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { 
  canAwardPoints, 
  canBatchAwardPoints, 
  canResolveCorrection, 
  canRequestCorrection, 
  canEditRulesAndWeights, 
  canSendMessage, 
  canSendSchoolWideMessage, 
  canAcknowledgeMessage 
} from '../utils/permissions';
import { api, isApiConfigured, isApiSessionActive, getStoredToken } from '../lib/api';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  description: string;
}

export interface FamilyImpactBreakdown {
  family: Family;
  studentRawPoints: number;
  parentRawPoints: number;
  totalRawPoints: number;
  studentWeightRatio: number; // e.g. 80%
  parentWeightRatio: number; // e.g. 20%
  weightedImpactScore: number;
  studentContributions: {
    student: Student | FamilyChild;
    points: number;
    activityCount: number;
    recentActivities: PointEntry[];
  }[];
  parentEntries: PointEntry[];
  categoryTotals: Record<CategoryId, number>;
}

interface PulseContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentFamilyId: string;
  setCurrentFamilyId: (id: string) => void;
  currentFamily: Family | undefined;
  
  // Relational Entities
  families: Family[];
  classes: SchoolClass[];
  teachers: Teacher[];
  students: Student[];
  parents: Parent[];
  activities: PointEntry[];
  categoryRules: CategoryRule[];
  messages: Message[];
  corrections: CorrectionRequest[];
  auditLogs: AuditLogEntry[];
  toasts: Toast[];
  removeToast: (id: string) => void;
  
  // Entity Finders & Relational Filters
  getStudentById: (studentId: string) => Student | undefined;
  getFamilyById: (familyId: string) => Family | undefined;
  getClassById: (classId: string) => SchoolClass | undefined;
  getTeacherById: (teacherId: string) => Teacher | undefined;
  getStudentsByClass: (classIdOrName: string) => Student[];
  getStudentsByFamily: (familyId: string) => Student[];
  getActivitiesByStudent: (studentId: string) => PointEntry[];
  getActivitiesByFamily: (familyId: string) => PointEntry[];
  getActivitiesByTeacher: (teacherId: string) => PointEntry[];
  getFamilyImpactBreakdown: (familyId: string) => FamilyImpactBreakdown | undefined;
  
  // Operations with strict attribution
  awardPoints: (params: {
    familyId: string;
    studentId?: string;
    categoryId: CategoryId;
    title: string;
    description: string;
    points: number;
    timeframe?: Timeframe;
  }) => void;
  
  batchAwardPoints: (params: {
    studentIds: string[];
    categoryId: CategoryId;
    title: string;
    description: string;
    points: number;
  }) => void;
  
  submitCorrection: (activityId: string, reason: string) => void;
  resolveCorrection: (correctionId: string, decision: 'resolved' | 'declined', note: string, pointsDelta?: number) => void;
  
  sendMessage: (msg: Omit<Message, 'id' | 'sentAt' | 'senderId' | 'senderRole'>) => void;
  markMessageRead: (messageId: string) => void;
  acknowledgeMessage: (messageId: string) => void;
  
  updateCategoryWeights: (weights: Record<CategoryId, number>) => void;
  resetCategoryWeightsToDefault: () => void;
  
  triggerAutomatedAlert: (type: 'late_arrival' | 'assignment_reminder' | 'event_reminder' | 'milestone_congratulations') => void;
  resetAllData: () => void;
  
  getLeaderboardData: (timeframe: Timeframe, category: LeaderboardCategory) => {
    rankedFamilies: { family: Family; score: number; rank: number; deltaPoints: number }[];
    topThree: { family: Family; score: number; rank: number }[];
    currentUserRank?: { rank: number; score: number; pointsToNextRank: number; nextFamilyName?: string };
    categoryWinner?: { family: Family; score: number; title: string };
  };
}

const PulseContext = createContext<PulseContextType | undefined>(undefined);

const STORAGE_KEY = 'pulse_app_state_v2';

export const PulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [role, setRole] = useState<UserRole>(currentUser ? currentUser.role : 'parent');
  const [currentFamilyId, setCurrentFamilyId] = useState<string>(
    currentUser?.linkedEntities.familyId || 'fam-bennett'
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync role and active family whenever auth user changes
  useEffect(() => {
    if (currentUser) {
      setRole(currentUser.role);
      if (currentUser.linkedEntities.familyId) {
        setCurrentFamilyId(currentUser.linkedEntities.familyId);
      }
    }
  }, [currentUser]);

  // Relational Collections (mutable so API bootstrap can hydrate them)
  const [classes, setClasses] = useState<SchoolClass[]>(INITIAL_CLASSES);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [parents, setParents] = useState<Parent[]>(INITIAL_PARENTS);

  const [families, setFamilies] = useState<Family[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_families`);
      return saved ? JSON.parse(saved) : INITIAL_FAMILIES;
    } catch {
      return INITIAL_FAMILIES;
    }
  });

  const [activities, setActivities] = useState<PointEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  const [categoryRules, setCategoryRules] = useState<CategoryRule[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_rules`);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORY_RULES;
    } catch {
      return INITIAL_CATEGORY_RULES;
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_messages`);
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [corrections, setCorrections] = useState<CorrectionRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_corrections`);
      return saved ? JSON.parse(saved) : INITIAL_CORRECTIONS;
    } catch {
      return INITIAL_CORRECTIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [apiSyncState, setApiSyncState] = useState<'idle' | 'loading' | 'synced' | 'offline'>('idle');

  // Hydrate from real backend when session token is available
  // Token may arrive shortly after local login — retry briefly.
  useEffect(() => {
    if (!currentUser || !isApiConfigured()) {
      setApiSyncState('offline');
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const runBootstrap = () => {
      if (cancelled) return;
      if (!getStoredToken()) {
        if (attempts++ < 25) {
          timer = setTimeout(runBootstrap, 120);
        } else {
          setApiSyncState('idle');
        }
        return;
      }

      setApiSyncState('loading');
      api
        .bootstrap()
        .then((data) => {
          if (cancelled) return;
          if (Array.isArray(data.families)) setFamilies(data.families as Family[]);
          if (Array.isArray(data.students)) setStudents(data.students as Student[]);
          if (Array.isArray(data.parents)) setParents(data.parents as Parent[]);
          if (Array.isArray(data.teachers)) setTeachers(data.teachers as Teacher[]);
          if (Array.isArray(data.classes)) setClasses(data.classes as SchoolClass[]);
          if (Array.isArray(data.activities)) setActivities(data.activities as PointEntry[]);
          if (Array.isArray(data.messages)) setMessages(data.messages as Message[]);
          if (Array.isArray(data.corrections)) setCorrections(data.corrections as CorrectionRequest[]);
          if (Array.isArray(data.categoryRules)) setCategoryRules(data.categoryRules as CategoryRule[]);
          if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs as AuditLogEntry[]);
          setApiSyncState('synced');
        })
        .catch(() => {
          if (!cancelled) setApiSyncState('offline');
        });
    };

    runBootstrap();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [currentUser?.id]);

  // Local storage persistence (still useful offline / without API)
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_families`, JSON.stringify(families));
  }, [families]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rules`, JSON.stringify(categoryRules));
  }, [categoryRules]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_corrections`, JSON.stringify(corrections));
  }, [corrections]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Entity Finder Helpers
  const getStudentById = (studentId: string) => students.find((s) => s.id === studentId);
  const getFamilyById = (familyId: string) => families.find((f) => f.id === familyId);
  const getClassById = (classId: string) => classes.find((c) => c.id === classId || c.name === classId);
  const getTeacherById = (teacherId: string) => teachers.find((t) => t.id === teacherId);

  const getStudentsByClass = (classIdOrName: string) => {
    const cls = classes.find((c) => c.id === classIdOrName || c.name === classIdOrName);
    if (!cls) return students.filter((s) => s.className === classIdOrName || s.classId === classIdOrName);
    return students.filter((s) => cls.studentIds.includes(s.id) || s.className === cls.name);
  };

  const getStudentsByFamily = (familyId: string) => {
    return students.filter((s) => s.familyId === familyId);
  };

  const getActivitiesByStudent = (studentId: string) => {
    return activities.filter((a) => a.studentId === studentId);
  };

  const getActivitiesByFamily = (familyId: string) => {
    return activities.filter((a) => a.familyId === familyId);
  };

  const getActivitiesByTeacher = (teacherId: string) => {
    return activities.filter((a) => a.awardedByTeacherId === teacherId);
  };

  /**
   * Transparent aggregation calculation of Family scores:
   * Aggregates Student Points (80% weight) + Parent Participation Points (20% weight)
   */
  const getFamilyImpactBreakdown = (familyId: string): FamilyImpactBreakdown | undefined => {
    const family = families.find((f) => f.id === familyId);
    if (!family) return undefined;

    const familyActivities = activities.filter((a) => a.familyId === familyId && a.status !== 'under_review');
    
    // Separate student vs parent entries
    const studentRules = categoryRules.filter((r) => r.type === 'student');
    const parentRules = categoryRules.filter((r) => r.type === 'parent');
    
    const studentCatIds = new Set(studentRules.map((r) => r.id));
    const parentCatIds = new Set(parentRules.map((r) => r.id));

    let studentRawPoints = 0;
    let parentRawPoints = 0;
    const categoryTotals: Record<CategoryId, number> = {
      attendance_punctuality: 0,
      assignments: 0,
      projects: 0,
      behaviour_character: 0,
      participation: 0,
      pta_meetings: 0,
      event_attendance: 0,
      communication: 0,
      volunteering: 0
    };

    // Initialize category totals from family's current categoryScores
    Object.keys(family.categoryScores || {}).forEach((k) => {
      const catKey = k as CategoryId;
      categoryTotals[catKey] = family.categoryScores[catKey] || 0;
      if (studentCatIds.has(catKey)) {
        studentRawPoints += categoryTotals[catKey];
      } else if (parentCatIds.has(catKey)) {
        parentRawPoints += categoryTotals[catKey];
      }
    });

    const totalRawPoints = studentRawPoints + parentRawPoints;
    const studentWeightRatio = studentRules.reduce((acc, r) => acc + r.currentWeight, 0); // 80%
    const parentWeightRatio = parentRules.reduce((acc, r) => acc + r.currentWeight, 0); // 20%

    // Calculate individual student contributions
    const studentContributions = family.children.map((child) => {
      const childActivities = familyActivities.filter((a) => a.studentId === child.id);
      const points = childActivities.reduce((acc, a) => acc + a.rawPoints, 0);
      return {
        student: child,
        points,
        activityCount: childActivities.length,
        recentActivities: childActivities.slice(0, 5)
      };
    });

    const parentEntries = familyActivities.filter((a) => !a.studentId || a.categoryType === 'parent');

    return {
      family,
      studentRawPoints,
      parentRawPoints,
      totalRawPoints,
      studentWeightRatio,
      parentWeightRatio,
      weightedImpactScore: family.termlyScore,
      studentContributions,
      parentEntries,
      categoryTotals
    };
  };

  const addToast = (type: 'success' | 'info' | 'warning', title: string, description: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logAudit = (actor: string, actorId: string, actorRole: AuditLogEntry['actorRole'], action: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actor,
      actorId,
      actorRole,
      action,
      details,
      ipHash: `enc:sha256:${Math.random().toString(16).substr(2, 6)}`
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const currentFamily = families.find((f) => f.id === currentFamilyId) || families[0];

  /**
   * Award Points:
   * Attributes student, family, and the awarding teacher/admin explicitly.
   * Aggregates points into family category scores and term scores.
   */
  const awardPoints = ({
    familyId,
    studentId,
    categoryId,
    title,
    description,
    points,
    timeframe = 'weekly'
  }: {
    familyId: string;
    studentId?: string;
    categoryId: CategoryId;
    title: string;
    description: string;
    points: number;
    timeframe?: Timeframe;
  }) => {
    // If studentId provided, ensure familyId matches student's registered family
    const resolvedStudent = studentId ? getStudentById(studentId) : undefined;
    const targetFamilyId = resolvedStudent ? resolvedStudent.familyId : familyId;
    const targetFamily = families.find((f) => f.id === targetFamilyId);
    if (!targetFamily) return;

    // Strict Permission Check: Only Teachers (for their own students/classes) and Admins
    if (!canAwardPoints(currentUser, resolvedStudent)) {
      logAudit(
        currentUser?.name || 'Unauthenticated User',
        currentUser?.id || 'anon',
        currentUser?.role === 'admin' ? 'School Admin' : (currentUser?.role === 'teacher' ? 'Teacher' : (currentUser?.role === 'parent' ? 'Parent' : 'Student')),
        'SECURITY_PERMISSION_DENIED',
        `Access Denied: ${currentUser?.name || 'User'} (${currentUser?.role || 'none'}) attempted to award points to ${resolvedStudent ? resolvedStudent.name : 'family'}. Teachers can only award points to their assigned classes.`
      );
      addToast(
        'warning',
        'Permission Denied',
        currentUser?.role === 'teacher'
          ? `You can only award points to students in your assigned classes (${currentUser.linkedEntities.assignedClasses?.join(', ')}).`
          : 'Only school teachers and administrators are authorized to award points.'
      );
      return;
    }

    const rule = categoryRules.find((r) => r.id === categoryId);
    const categoryName = rule ? rule.name : categoryId;
    const categoryType = rule ? rule.type : (studentId ? 'student' : 'parent');

    const teacherId = currentUser?.linkedEntities.teacherId || currentUser?.id || 'teach-reed';
    const teacherName = currentUser?.name || 'Mr. Marcus Reed (Year 5)';
    const awardedByRole = currentUser?.role === 'admin' ? 'admin' : 'teacher';

    const applyLocalAward = (newActivity: PointEntry) => {
      setActivities((prev) => [newActivity, ...prev]);
      setFamilies((prev) =>
        prev.map((fam) => {
          if (fam.id !== targetFamilyId) return fam;
          const updatedCatScores = {
            ...fam.categoryScores,
            [categoryId]: (fam.categoryScores[categoryId] || 0) + points
          };
          return {
            ...fam,
            weeklyScore: fam.weeklyScore + points,
            monthlyScore: fam.monthlyScore + points,
            termlyScore: fam.termlyScore + points,
            categoryScores: updatedCatScores
          };
        })
      );

      logAudit(
        teacherName,
        teacherId,
        awardedByRole === 'admin' ? 'School Admin' : 'Teacher',
        'AWARD_POINTS',
        `Awarded +${points} pts to ${targetFamily.displayTitle} (${resolvedStudent ? resolvedStudent.name : 'Parent Participation'}) in ${categoryName}: ${title}`
      );

      const autoNotice: Message = {
        id: `msg-auto-${Date.now()}`,
        sender: `PULSE (${teacherName})`,
        senderId: teacherId,
        senderRole: awardedByRole,
        recipientFamilyId: targetFamilyId,
        recipientStudentId: resolvedStudent?.id,
        recipientName: targetFamily.displayTitle,
        targetAudience: 'family',
        title: `Points Awarded: +${points} pts for ${resolvedStudent ? resolvedStudent.name : 'Parent Participation'}`,
        body: `${title}. ${description}. Credited by ${teacherName} to your family Impact Score.`,
        priority: 'personal',
        channels: ['app'],
        sentAt: new Date().toISOString(),
        relatedStudentId: resolvedStudent?.id,
        relatedChildName: resolvedStudent?.name,
        isAutomated: true
      };
      setMessages((prev) => [autoNotice, ...prev]);

      addToast(
        'success',
        `+${points} Points Awarded`,
        `Recorded for ${resolvedStudent ? resolvedStudent.name : targetFamily.displayTitle}: ${title}`
      );
    };

    // Prefer server persistence when a backend session is active
    if (isApiSessionActive()) {
      api
        .awardPoints({
          familyId: targetFamilyId,
          studentId: resolvedStudent?.id,
          categoryId,
          title,
          description,
          points,
          timeframe
        })
        .then((res) => {
          applyLocalAward(res.activity as PointEntry);
        })
        .catch((err) => {
          addToast('warning', 'Could not save to server', err?.message || 'Award not persisted remotely');
        });
      return;
    }

    const newActivity: PointEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      familyId: targetFamilyId,
      studentId: resolvedStudent?.id,
      studentName: resolvedStudent?.name,
      awardedByTeacherId: teacherId,
      recordedByTeacher: teacherName,
      awardedByRole,
      categoryId,
      categoryName,
      categoryType,
      title,
      description,
      rawPoints: points,
      timestamp: new Date().toISOString(),
      timeframe,
      status: 'approved'
    };
    applyLocalAward(newActivity);
  };

  /**
   * Batch Award Points for whole classes or groups of students
   */
  const batchAwardPoints = ({
    studentIds,
    categoryId,
    title,
    description,
    points
  }: {
    studentIds: string[];
    categoryId: CategoryId;
    title: string;
    description: string;
    points: number;
  }) => {
    // Filter to only students the current user has permission to award
    const permittedStudentIds = studentIds.filter((sid) => {
      const student = getStudentById(sid);
      return student && canAwardPoints(currentUser, student);
    });

    if (permittedStudentIds.length === 0) {
      logAudit(
        currentUser?.name || 'User',
        currentUser?.id || 'anon',
        currentUser?.role === 'admin' ? 'School Admin' : 'Teacher',
        'SECURITY_PERMISSION_DENIED',
        `Unauthorized batch award attempt by ${currentUser?.name} (${currentUser?.role}). Target student IDs: ${studentIds.join(', ')}`
      );
      addToast('warning', 'Permission Denied', 'You do not have permission to award points to the selected class or students.');
      return;
    }

    if (permittedStudentIds.length < studentIds.length) {
      addToast(
        'info', 
        'Partial Authorization', 
        `Awarding points to ${permittedStudentIds.length} students in your assigned classes.`
      );
    }

    permittedStudentIds.forEach((sid) => {
      const student = getStudentById(sid);
      if (student) {
        awardPoints({
          familyId: student.familyId,
          studentId: sid,
          categoryId,
          title,
          description,
          points
        });
      }
    });
  };

  const submitCorrection = (activityId: string, reason: string) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;

    // Strict Permission Check: Only linked Parents of this family can request correction
    if (!canRequestCorrection(currentUser, activity.familyId)) {
      logAudit(
        currentUser?.name || 'User',
        currentUser?.id || 'anon',
        currentUser?.role === 'admin' ? 'School Admin' : (currentUser?.role === 'teacher' ? 'Teacher' : (currentUser?.role === 'student' ? 'Student' : 'Parent')),
        'SECURITY_PERMISSION_DENIED',
        `Denied correction submission by ${currentUser?.name} for activity "${activity.title}" (Family ${activity.familyId}).`
      );
      addToast('warning', 'Permission Denied', 'Only registered parents for this family can request record corrections.');
      return;
    }

    const family = families.find((f) => f.id === activity.familyId) || currentFamily;

    const applyLocalCorrection = (newCorrection: CorrectionRequest) => {
      setCorrections((prev) => [newCorrection, ...prev]);
      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? { ...a, status: 'under_review' } : a))
      );
      logAudit(
        family ? family.parentNames : 'Parent',
        currentUser?.id || 'par-unknown',
        'Parent',
        'SUBMIT_CORRECTION',
        `Requested review for activity: "${activity.title}". Reason: "${reason}"`
      );
      addToast('info', 'Correction Submitted', 'School staff will review your request shortly.');
    };

    if (isApiSessionActive()) {
      api
        .submitCorrection(activityId, reason)
        .then((res) => applyLocalCorrection(res.correction as CorrectionRequest))
        .catch((err) => {
          addToast('warning', 'Could not save to server', err?.message || 'Correction not persisted remotely');
        });
      return;
    }

    applyLocalCorrection({
      id: `cor-${Date.now()}`,
      activityId,
      familyId: activity.familyId,
      studentId: activity.studentId,
      parentName: family ? family.parentNames : 'Parent',
      studentName: activity.studentName || 'Parent Entry',
      activityTitle: activity.title,
      reason,
      status: 'pending',
      submittedAt: new Date().toISOString()
    });
  };

  const resolveCorrection = (
    correctionId: string,
    decision: 'resolved' | 'declined',
    note: string,
    pointsDelta = 0
  ) => {
    const target = corrections.find((c) => c.id === correctionId);
    if (!target) return;

    const activity = activities.find((a) => a.id === target.activityId);

    // Strict Permission Check: Teachers can correct their own awards; Admins can correct any
    if (!canResolveCorrection(currentUser, target, activity)) {
      logAudit(
        currentUser?.name || 'Staff User',
        currentUser?.id || 'anon',
        currentUser?.role === 'admin' ? 'School Admin' : 'Teacher',
        'SECURITY_PERMISSION_DENIED',
        `Unauthorized attempt by ${currentUser?.name} to resolve correction for activity "${target.activityTitle}" (Awarded by: ${activity?.recordedByTeacher || 'Another Teacher'}).`
      );
      addToast(
        'warning',
        'Permission Denied',
        'Teachers can only review and correct their own awards. School administrators can resolve all requests.'
      );
      return;
    }

    const staffId = currentUser?.id || 'teach-reed';
    const staffName = currentUser?.name || 'Mr. Marcus Reed (Year 5 Lead)';

    const applyLocalResolve = () => {
      setCorrections((prev) =>
        prev.map((c) =>
          c.id === correctionId
            ? {
                ...c,
                status: decision,
                resolutionNote: note,
                resolvedAt: new Date().toISOString(),
                resolvedBy: staffName,
                resolvedById: staffId
              }
            : c
        )
      );

      setActivities((prev) =>
        prev.map((a) => {
          if (a.id === target.activityId) {
            return {
              ...a,
              status: decision === 'resolved' ? 'corrected' : 'approved',
              rawPoints: a.rawPoints + pointsDelta,
              correctionNote: note
            };
          }
          return a;
        })
      );

      if (pointsDelta !== 0) {
        setFamilies((prev) =>
          prev.map((f) => {
            if (f.id !== target.familyId) return f;
            return {
              ...f,
              weeklyScore: f.weeklyScore + pointsDelta,
              monthlyScore: f.monthlyScore + pointsDelta,
              termlyScore: f.termlyScore + pointsDelta
            };
          })
        );
      }

      logAudit(
        staffName,
        staffId,
        currentUser?.role === 'admin' ? 'School Admin' : 'Teacher',
        'RESOLVE_CORRECTION',
        `Correction ${decision.toUpperCase()} for ${target.activityTitle}. Adjusted points: ${pointsDelta >= 0 ? '+' : ''}${pointsDelta}. Note: "${note}"`
      );

      const resolutionMsg: Message = {
        id: `msg-res-${Date.now()}`,
        sender: staffName,
        senderId: staffId,
        senderRole: currentUser?.role === 'admin' ? 'admin' : 'teacher',
        recipientFamilyId: target.familyId,
        recipientName: target.parentName,
        targetAudience: 'family',
        title: `Correction Request ${decision === 'resolved' ? 'Approved' : 'Reviewed'}: ${target.activityTitle}`,
        body: `Decision: ${decision === 'resolved' ? 'Record Corrected' : 'Maintained'}. Staff note: ${note}. ${pointsDelta !== 0 ? `Impact Score adjusted by ${pointsDelta} pts.` : ''}`,
        priority: 'personal',
        channels: ['app'],
        sentAt: new Date().toISOString(),
        isAutomated: true
      };
      setMessages((prev) => [resolutionMsg, ...prev]);

      addToast(
        decision === 'resolved' ? 'success' : 'info',
        `Correction ${decision === 'resolved' ? 'Approved' : 'Declined'}`,
        `Updated record for ${target.studentName}`
      );
    };

    if (isApiSessionActive()) {
      api
        .resolveCorrection(correctionId, decision, note, pointsDelta)
        .then(() => applyLocalResolve())
        .catch((err) => {
          addToast('warning', 'Could not save to server', err?.message || 'Resolution not persisted remotely');
        });
      return;
    }

    applyLocalResolve();
  };

  const sendMessage = (msg: Omit<Message, 'id' | 'sentAt' | 'senderId' | 'senderRole'>) => {
    // Strict Permission Check: Teachers and Admins; Teachers restricted from school-wide
    if (!canSendMessage(currentUser, msg.targetAudience, msg.targetFilter)) {
      logAudit(
        currentUser?.name || 'User',
        currentUser?.id || 'anon',
        currentUser?.role === 'admin' ? 'School Admin' : (currentUser?.role === 'teacher' ? 'Teacher' : 'Parent'),
        'SECURITY_PERMISSION_DENIED',
        `Unauthorized message dispatch attempt: "${msg.title}" to ${msg.targetAudience} by ${currentUser?.name} (${currentUser?.role}).`
      );
      addToast(
        'warning', 
        'Permission Denied', 
        'Only authorized staff can send messages. Whole-school broadcasts are reserved for School Administrative Leadership.'
      );
      return;
    }

    const senderId = currentUser?.id || (role === 'admin' ? 'admin-shaw' : 'teach-reed');
    const senderName = currentUser?.name || (role === 'admin' ? 'School Leadership Team' : 'Class Teacher');

    const applyLocalMessage = (newMsg: Message) => {
      setMessages((prev) => [newMsg, ...prev]);
      logAudit(
        senderName,
        senderId,
        role === 'admin' ? 'School Admin' : 'Teacher',
        'DISPATCH_MESSAGE',
        `Sent ${msg.priority.toUpperCase()} message: "${msg.title}" via ${msg.channels.join(', ')} to ${msg.targetAudience === 'all' ? 'All Families' : msg.targetFilter || msg.recipientName || 'Family'}`
      );
      addToast(
        'success',
        'Message Dispatched',
        `Delivered via ${msg.channels.join(' & ')} to target recipients.`
      );
    };

    if (isApiSessionActive()) {
      api
        .sendMessage({
          title: msg.title,
          body: msg.body,
          priority: msg.priority,
          channels: msg.channels,
          targetAudience: msg.targetAudience,
          targetFilter: msg.targetFilter,
          targetClassId: msg.targetClassId,
          recipientFamilyId: msg.recipientFamilyId,
          recipientStudentId: msg.recipientStudentId,
          recipientParentId: msg.recipientParentId,
          requiresAcknowledgement: msg.requiresAcknowledgement,
          pointsOnAcknowledge: msg.pointsOnAcknowledge
        })
        .then((res) => applyLocalMessage(res.message as Message))
        .catch((err) => {
          addToast('warning', 'Could not save to server', err?.message || 'Message not persisted remotely');
        });
      return;
    }

    applyLocalMessage({
      ...msg,
      id: `msg-${Date.now()}`,
      sender: msg.sender || senderName,
      senderId,
      senderRole: role === 'admin' ? 'admin' : role === 'teacher' ? 'teacher' : 'system',
      sentAt: new Date().toISOString()
    });
  };

  const markMessageRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId && !m.readAt ? { ...m, readAt: new Date().toISOString() } : m))
    );
  };

  const acknowledgeMessage = (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg || msg.acknowledged) return;

    // Strict Permission Check: Only the linked Parent(s) of that family
    if (!canAcknowledgeMessage(currentUser, msg)) {
      logAudit(
        currentUser?.name || 'User',
        currentUser?.id || 'anon',
        currentUser?.role === 'admin' ? 'School Admin' : (currentUser?.role === 'teacher' ? 'Teacher' : (currentUser?.role === 'student' ? 'Student' : 'Parent')),
        'SECURITY_PERMISSION_DENIED',
        `Unauthorized message confirmation attempt by ${currentUser?.name} (${currentUser?.role}) for message "${msg.title}".`
      );
      addToast(
        'warning',
        'Permission Denied',
        'Only the registered parent of this family can confirm this communication and claim points.'
      );
      return;
    }

    const applyLocalAck = (pointsAwarded: number) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                acknowledged: true,
                actionCompleted: true,
                acknowledgedAt: new Date().toISOString(),
                readAt: m.readAt || new Date().toISOString()
              }
            : m
        )
      );

      if (currentFamily && pointsAwarded > 0) {
        const targetFamily = currentFamily;
        const categoryId: CategoryId = 'communication';

        const newActivity: PointEntry = {
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          familyId: targetFamily.id,
          awardedByTeacherId: 'sys-pulse',
          recordedByTeacher: 'PULSE Participation System',
          awardedByRole: 'automated',
          categoryId,
          categoryName: 'Parent Communication Response',
          categoryType: 'parent',
          title: 'Parent Communication Response',
          description: `Acknowledged and confirmed school update: "${msg.title}"`,
          rawPoints: pointsAwarded,
          timestamp: new Date().toISOString(),
          timeframe: 'weekly',
          status: 'approved'
        };

        setActivities((prev) => [newActivity, ...prev]);
        setFamilies((prev) =>
          prev.map((fam) => {
            if (fam.id !== targetFamily.id) return fam;
            return {
              ...fam,
              weeklyScore: fam.weeklyScore + pointsAwarded,
              monthlyScore: fam.monthlyScore + pointsAwarded,
              termlyScore: fam.termlyScore + pointsAwarded,
              categoryScores: {
                ...fam.categoryScores,
                [categoryId]: (fam.categoryScores[categoryId] || 0) + pointsAwarded
              }
            };
          })
        );

        logAudit(
          currentUser?.name || 'Parent User',
          currentUser?.id || 'par-user',
          'Parent',
          'ACKNOWLEDGE_MESSAGE',
          `Confirmed communication: "${msg.title}". Credited +${pointsAwarded} participation points to ${targetFamily.displayTitle}.`
        );

        addToast(
          'success',
          `+${pointsAwarded} Communication Points Earned`,
          'Thank you for staying actively connected with the school!'
        );
      } else {
        addToast('success', 'Message confirmed', 'Thank you for acknowledging this update.');
      }
    };

    if (isApiSessionActive()) {
      api
        .acknowledgeMessage(messageId)
        .then((res) => applyLocalAck(Number(res.pointsAwarded || 0)))
        .catch((err) => {
          addToast('warning', 'Could not save to server', err?.message || 'Acknowledgement not persisted remotely');
        });
      return;
    }

    applyLocalAck(5);
  };

  const updateCategoryWeights = (weights: Record<CategoryId, number>) => {
    // Strict Permission Check: Admins only
    if (!canEditRulesAndWeights(currentUser)) {
      logAudit(
        currentUser?.name || 'User',
        currentUser?.id || 'anon',
        currentUser?.role === 'admin' ? 'School Admin' : (currentUser?.role === 'teacher' ? 'Teacher' : 'Parent'),
        'SECURITY_PERMISSION_DENIED',
        `Unauthorized attempt by ${currentUser?.name} (${currentUser?.role}) to adjust point rules and category weights.`
      );
      addToast('warning', 'Permission Denied', 'PULSE Point Rules & Weighting can only be modified by School Administrators.');
      return;
    }

    const applyLocalWeights = (nextRules: CategoryRule[]) => {
      setCategoryRules(nextRules);
      logAudit(
        currentUser?.name || 'School Leadership',
        currentUser?.id || 'admin-shaw',
        'School Admin',
        'UPDATE_WEIGHTING_RULES',
        `Updated point category weighting configuration.`
      );
      addToast('success', 'Rules & Weights Updated', 'New weighting applied across all impact calculations.');
    };

    if (isApiSessionActive()) {
      api
        .updateRules(weights)
        .then((res) => applyLocalWeights(res.categoryRules as CategoryRule[]))
        .catch((err) => {
          addToast('warning', 'Could not save to server', err?.message || 'Weights not persisted remotely');
        });
      return;
    }

    applyLocalWeights(
      categoryRules.map((rule) => ({
        ...rule,
        currentWeight: weights[rule.id] ?? rule.currentWeight
      }))
    );
  };

  const resetCategoryWeightsToDefault = () => {
    // Strict Permission Check: Admins only
    if (!canEditRulesAndWeights(currentUser)) {
      logAudit(
        currentUser?.name || 'User',
        currentUser?.id || 'anon',
        currentUser?.role === 'admin' ? 'School Admin' : (currentUser?.role === 'teacher' ? 'Teacher' : 'Parent'),
        'SECURITY_PERMISSION_DENIED',
        `Unauthorized attempt by ${currentUser?.name} (${currentUser?.role}) to reset constitutional weights.`
      );
      addToast('warning', 'Permission Denied', 'Constitutional point weighting can only be reset by School Administrators.');
      return;
    }

    setCategoryRules(INITIAL_CATEGORY_RULES);
    addToast('info', 'Reset Weights', 'Restored approved default 80% student / 20% parent weights.');
  };

  const triggerAutomatedAlert = (type: 'late_arrival' | 'assignment_reminder' | 'event_reminder' | 'milestone_congratulations') => {
    if (!currentFamily) return;

    const child = currentFamily.children[0] || students.find((s) => s.familyId === currentFamily.id);
    if (!child) return;

    if (type === 'late_arrival') {
      const msg: Message = {
        id: `msg-auto-late-${Date.now()}`,
        sender: 'Automated Attendance System',
        senderId: 'sys-attendance',
        senderRole: 'system',
        recipientFamilyId: currentFamily.id,
        recipientStudentId: child.id,
        recipientName: currentFamily.displayTitle,
        targetAudience: 'family',
        title: `Late Arrival Notice: ${child.name}`,
        body: `${child.name} arrived at 08:52 today (after the 08:35 register close). A note has been recorded. Consistent punctuality contributes 25% towards your family Impact Score.`,
        priority: 'personal',
        channels: ['app', 'sms'],
        sentAt: new Date().toISOString(),
        relatedStudentId: child.id,
        relatedChildName: child.name,
        isAutomated: true,
        automatedType: 'late_arrival'
      };
      setMessages((prev) => [msg, ...prev]);
      logAudit('Automated System', 'sys-attendance', 'Automated System', 'TRIGGER_LATE_ALERT', `Sent automated late arrival alert for ${child.name}.`);
      addToast('warning', 'Late Arrival Alert Dispatched', `Automated notification sent to ${currentFamily.displayTitle}`);
    } else if (type === 'assignment_reminder') {
      const msg: Message = {
        id: `msg-auto-due-${Date.now()}`,
        sender: 'Curriculum Deadlines Bot',
        senderId: 'sys-deadlines',
        senderRole: 'system',
        recipientFamilyId: currentFamily.id,
        recipientStudentId: child.id,
        recipientName: currentFamily.displayTitle,
        targetAudience: 'family',
        title: `Upcoming Assignment Reminder: ${child.name}`,
        body: `Friendly reminder: ${child.name}'s History Heritage Report is due in 48 hours (Wednesday 3:30 PM). On-time completion will earn +15 Impact Points!`,
        priority: 'important',
        channels: ['app', 'email'],
        sentAt: new Date().toISOString(),
        relatedStudentId: child.id,
        relatedChildName: child.name,
        isAutomated: true,
        automatedType: 'assignment_reminder'
      };
      setMessages((prev) => [msg, ...prev]);
      addToast('info', 'Assignment Reminder Dispatched', `Automated 48h deadline reminder sent for ${child.name}.`);
    } else if (type === 'event_reminder') {
      const msg: Message = {
        id: `msg-auto-evt-${Date.now()}`,
        sender: 'The Seaside Schools Community Events',
        senderId: 'sys-events',
        senderRole: 'system',
        targetAudience: 'all',
        title: 'Event Reminder: Annual Science & STEM Fair Tomorrow',
        body: 'The Seaside Schools STEM Fair begins tomorrow at 16:00 in the Main Hall. Parents attending earn +15 points for family Event Attendance.',
        priority: 'general',
        channels: ['app'],
        sentAt: new Date().toISOString(),
        isAutomated: true,
        automatedType: 'event_reminder'
      };
      setMessages((prev) => [msg, ...prev]);
      addToast('info', 'Event Reminder Dispatched', 'Automated broadcast sent to all families.');
    } else if (type === 'milestone_congratulations') {
      const msg: Message = {
        id: `msg-auto-mstone-${Date.now()}`,
        sender: 'PULSE Milestone Recognition',
        senderId: 'sys-milestones',
        senderRole: 'system',
        recipientFamilyId: currentFamily.id,
        recipientName: currentFamily.displayTitle,
        targetAudience: 'family',
        title: `Congratulations! ${currentFamily.displayTitle} reached 375+ Points Milestone!`,
        body: `Splendid achievement! Your family has reached a new milestone band in the Term 1 Impact Programme. Thank you for your continued partnership and support.`,
        priority: 'personal',
        channels: ['app'],
        sentAt: new Date().toISOString(),
        isAutomated: true,
        automatedType: 'milestone_congratulations'
      };
      setMessages((prev) => [msg, ...prev]);
      addToast('success', 'Milestone Award Triggered', `Congratulations sent to ${currentFamily.displayTitle}!`);
    }
  };

  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_families`);
    localStorage.removeItem(`${STORAGE_KEY}_activities`);
    localStorage.removeItem(`${STORAGE_KEY}_rules`);
    localStorage.removeItem(`${STORAGE_KEY}_messages`);
    localStorage.removeItem(`${STORAGE_KEY}_corrections`);
    localStorage.removeItem(`${STORAGE_KEY}_logs`);
    setFamilies(INITIAL_FAMILIES);
    setActivities(INITIAL_ACTIVITIES);
    setCategoryRules(INITIAL_CATEGORY_RULES);
    setMessages(INITIAL_MESSAGES);
    setCorrections(INITIAL_CORRECTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    addToast('info', 'Reset Complete', 'Default school records and rules reloaded.');
  };

  const getLeaderboardData = (timeframe: Timeframe, category: LeaderboardCategory) => {
    const getScore = (fam: Family) => {
      if (category === 'overall') {
        if (timeframe === 'weekly') return fam.weeklyScore;
        if (timeframe === 'monthly') return fam.monthlyScore;
        return fam.termlyScore;
      }
      if (category === 'punctuality') {
        return fam.categoryScores.attendance_punctuality || 0;
      }
      if (category === 'assignments') {
        return (fam.categoryScores.assignments || 0) + (fam.categoryScores.projects || 0);
      }
      if (category === 'character') {
        return (fam.categoryScores.behaviour_character || 0) + (fam.categoryScores.participation || 0);
      }
      if (category === 'parent_participation') {
        return (
          (fam.categoryScores.pta_meetings || 0) +
          (fam.categoryScores.event_attendance || 0) +
          (fam.categoryScores.communication || 0) +
          (fam.categoryScores.volunteering || 0)
        );
      }
      if (category === 'most_improved') {
        return Math.max(0, fam.termlyScore - (fam.previousTermScore ?? fam.termlyScore));
      }
      return fam.termlyScore;
    };

    const sorted = [...families]
      .map((family) => {
        const score = getScore(family);
        return { family, score };
      })
      .sort((a, b) => b.score - a.score);

    const rankedFamilies = sorted.map((item, index) => {
      const prevItem = index > 0 ? sorted[index - 1] : null;
      const deltaPoints = prevItem ? Math.max(0, prevItem.score - item.score) : 0;
      return {
        family: item.family,
        score: item.score,
        rank: index + 1,
        deltaPoints
      };
    });

    const topThree = rankedFamilies.slice(0, 3);

    const currentUserItem = rankedFamilies.find((item) => item.family.id === currentFamilyId);
    let currentUserRank: { rank: number; score: number; pointsToNextRank: number; nextFamilyName?: string } | undefined;

    if (currentUserItem) {
      const rankIndex = rankedFamilies.findIndex((item) => item.family.id === currentFamilyId);
      const nextFamily = rankIndex > 0 ? rankedFamilies[rankIndex - 1] : undefined;
      const pointsToNext = nextFamily ? Math.max(1, nextFamily.score - currentUserItem.score + 1) : 0;

      currentUserRank = {
        rank: currentUserItem.rank,
        score: currentUserItem.score,
        pointsToNextRank: pointsToNext,
        nextFamilyName: nextFamily ? nextFamily.family.displayTitle : undefined
      };
    }

    const categoryWinner = rankedFamilies.length > 0
      ? {
          family: rankedFamilies[0].family,
          score: rankedFamilies[0].score,
          title: category === 'most_improved' ? 'Most Improved Family' : 'Category Champion'
        }
      : undefined;

    return {
      rankedFamilies,
      topThree,
      currentUserRank,
      categoryWinner
    };
  };

  return (
    <PulseContext.Provider
      value={{
        role,
        setRole,
        currentFamilyId,
        setCurrentFamilyId,
        currentFamily,
        families,
        classes,
        teachers,
        students,
        parents,
        activities,
        categoryRules,
        messages,
        corrections,
        auditLogs,
        toasts,
        removeToast,
        getStudentById,
        getFamilyById,
        getClassById,
        getTeacherById,
        getStudentsByClass,
        getStudentsByFamily,
        getActivitiesByStudent,
        getActivitiesByFamily,
        getActivitiesByTeacher,
        getFamilyImpactBreakdown,
        awardPoints,
        batchAwardPoints,
        submitCorrection,
        resolveCorrection,
        sendMessage,
        markMessageRead,
        acknowledgeMessage,
        updateCategoryWeights,
        resetCategoryWeightsToDefault,
        triggerAutomatedAlert,
        resetAllData,
        getLeaderboardData
      }}
    >
      {children}
    </PulseContext.Provider>
  );
};

export const usePulse = () => {
  const context = useContext(PulseContext);
  if (!context) {
    throw new Error('usePulse must be used within a PulseProvider');
  }
  return context;
};
