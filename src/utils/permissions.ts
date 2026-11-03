// ============================================================
// PULSE – Role-based Permission Helpers
// ============================================================

import {
  UserAccount,
  UserRole,
  Student,
  CorrectionRequest,
  PointEntry,
  Message,
  MessageAudienceType,
  AuditLogEntry
} from '../types/pulse';

/** Safe role getter */
const roleOf = (user: UserAccount | null | undefined): UserRole | null =>
  user?.role ?? null;

/** Admin always has full power */
export const isAdmin = (user: UserAccount | null | undefined): boolean =>
  roleOf(user) === 'admin';

export const isTeacher = (user: UserAccount | null | undefined): boolean =>
  roleOf(user) === 'teacher';

export const isParent = (user: UserAccount | null | undefined): boolean =>
  roleOf(user) === 'parent';

export const isStudent = (user: UserAccount | null | undefined): boolean =>
  roleOf(user) === 'student';

// ------------------------------------------------------------
// User / account management
// ------------------------------------------------------------
export const canManageUsers = (user: UserAccount | null | undefined): boolean =>
  isAdmin(user);

// ------------------------------------------------------------
// Awarding points
// ------------------------------------------------------------
/**
 * Teachers may only award points to students in their assigned classes.
 * Admins may award to anyone.
 */
export const canAwardPoints = (
  user: UserAccount | null | undefined,
  student?: Student | null
): boolean => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (!isTeacher(user)) return false;
  if (!student) return true; // parent-participation style awards allowed for teachers in general UI

  const assigned = user.linkedEntities.assignedClasses || [];
  return assigned.includes(student.className);
};

export const canBatchAwardPoints = (user: UserAccount | null | undefined): boolean =>
  isAdmin(user) || isTeacher(user);

/**
 * Returns only the students the current user is allowed to award points to.
 */
export const getPermittedStudentsForAwarding = (
  user: UserAccount | null | undefined,
  allStudents: Student[]
): Student[] => {
  if (!user) return [];
  if (isAdmin(user)) return allStudents;
  if (!isTeacher(user)) return [];

  const assigned = user.linkedEntities.assignedClasses || [];
  return allStudents.filter((s) => assigned.includes(s.className));
};

// ------------------------------------------------------------
// Corrections
// ------------------------------------------------------------
export const canRequestCorrection = (
  user: UserAccount | null | undefined,
  activityFamilyId: string
): boolean => {
  if (!user || !isParent(user)) return false;
  const familyId = user.linkedEntities.familyId;
  return familyId === activityFamilyId;
};

/**
 * Teachers can resolve corrections only for awards they themselves made.
 * Admins can resolve any.
 */
export const canResolveCorrection = (
  user: UserAccount | null | undefined,
  _correction: CorrectionRequest,
  activity?: PointEntry | null
): boolean => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (!isTeacher(user)) return false;
  if (!activity) return false;

  const teacherId = user.linkedEntities.teacherId || user.id;
  return activity.awardedByTeacherId === teacherId;
};

// ------------------------------------------------------------
// Rules & Weights
// ------------------------------------------------------------
export const canEditRulesAndWeights = (user: UserAccount | null | undefined): boolean =>
  isAdmin(user);

// ------------------------------------------------------------
// Messaging
// ------------------------------------------------------------
export const canSendMessage = (
  user: UserAccount | null | undefined,
  audience: MessageAudienceType,
  _targetFilter?: string
): boolean => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (isTeacher(user)) {
    // Teachers can message class, family, student
    return audience === 'class' || audience === 'family' || audience === 'student' || audience === 'staff';
  }
  return false;
};

export const canSendSchoolWideMessage = (user: UserAccount | null | undefined): boolean =>
  isAdmin(user);

export const canAcknowledgeMessage = (
  user: UserAccount | null | undefined,
  message: Message
): boolean => {
  if (!user || !isParent(user)) return false;
  if (!message.requiresAcknowledgement) return false;
  if (message.acknowledgedAt) return false;

  const familyId = user.linkedEntities.familyId;
  return message.recipientFamilyId === familyId || message.targetAudience === 'all';
};

// ------------------------------------------------------------
// Audit Logs
// ------------------------------------------------------------
export const canViewAuditLogs = (user: UserAccount | null | undefined): boolean =>
  isAdmin(user) || isTeacher(user);

export const canViewFullAuditLogs = (user: UserAccount | null | undefined): boolean =>
  isAdmin(user);

/**
 * Teachers only see logs related to their own actions or their classes.
 * Admins see everything.
 */
export const getPermittedAuditLogs = (
  user: UserAccount | null | undefined,
  logs: AuditLogEntry[]
): AuditLogEntry[] => {
  if (!user) return [];
  if (isAdmin(user)) return logs;
  if (!isTeacher(user)) return [];

  const teacherId = user.linkedEntities.teacherId || user.id;
  return logs.filter(
    (l) =>
      l.actorId === teacherId ||
      l.actorId === user.id ||
      (l.details && l.details.includes(user.name))
  );
};
