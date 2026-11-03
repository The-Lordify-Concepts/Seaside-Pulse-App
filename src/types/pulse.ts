// ============================================================
// PULSE – Core Type Definitions
// ============================================================

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export type CategoryId =
  | 'attendance_punctuality'
  | 'assignments'
  | 'projects'
  | 'behaviour_character'
  | 'participation'
  | 'pta_meetings'
  | 'event_attendance'
  | 'communication'
  | 'volunteering';

export type Timeframe = 'weekly' | 'monthly' | 'termly';

export type LeaderboardCategory =
  | 'overall'
  | 'punctuality'
  | 'assignments'
  | 'behaviour'
  | 'parent_participation'
  | 'most_improved'
  | 'character';

export type MessagePriority = 'urgent' | 'high' | 'normal' | 'personal' | 'general' | 'important' | 'critical';
export type MessageChannel = 'app' | 'email' | 'sms';
export type MessageAudienceType = 'all' | 'class' | 'year' | 'family' | 'individual' | 'student' | 'staff';

export type PointStatus = 'approved' | 'under_review' | 'corrected' | 'declined';
export type CorrectionStatus = 'pending' | 'resolved' | 'declined';

// ------------------------------------------------------------
// Linked entities on a UserAccount (role-dependent)
// ------------------------------------------------------------
export interface LinkedEntities {
  // Parent
  parentId?: string;
  /** Canonical family id for parents and students */
  familyId?: string;
  children?: { id: string; name: string; yearGroup?: string; className?: string; classId?: string }[];

  // Student
  studentId?: string;
  className?: string;
  classId?: string;
  yearGroup?: string;

  // Teacher
  teacherId?: string;
  assignedClasses?: string[]; // e.g. ['5A', '5B']

  // Admin may have none of the above
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  linkedEntities: LinkedEntities;
  lastLoginAt?: string;
  isActive?: boolean;
  avatarInitials?: string;
  title?: string;
}

// ------------------------------------------------------------
// Domain entities
// ------------------------------------------------------------
export interface Student {
  id: string;
  name: string;
  familyId: string;
  classId: string;
  className: string;
  yearGroup: string;
  isActive?: boolean;
}

export interface Parent {
  id: string;
  name: string;
  familyId: string;
  email?: string;
  relationship?: string;
}

export interface Teacher {
  id: string;
  name: string;
  assignedClasses: string[];
  email?: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "5A"
  yearGroup: string;
  teacherIds: string[];
  studentIds: string[];
}

export interface FamilyChild {
  id: string;
  name: string;
  yearGroup: string;
  className: string;
  classId?: string;
}

export interface Family {
  id: string;
  displayTitle: string; // e.g. "The Bennett Family"
  parentNames: string;
  children: FamilyChild[];
  weeklyScore: number;
  monthlyScore: number;
  termlyScore: number;
  categoryScores: Record<CategoryId, number>;
  privateRank?: number;
  previousTermScore?: number;
}

export interface PointEntry {
  id: string;
  familyId: string;
  studentId?: string;
  studentName?: string;
  awardedByTeacherId: string;
  recordedByTeacher: string;
  awardedByRole: 'teacher' | 'admin' | 'automated';
  categoryId: CategoryId;
  categoryName: string;
  categoryType: 'student' | 'parent';
  title: string;
  description: string;
  rawPoints: number;
  timestamp: string;
  timeframe?: Timeframe;
  status: PointStatus;
  correctionNote?: string;
}

/** Alias used in some components */
export type PointActivity = PointEntry;

export interface CategoryRule {
  id: CategoryId;
  name: string;
  type: 'student' | 'parent';
  description?: string;
  defaultWeight: number;
  currentWeight: number;
  maxPointsPerEntry?: number;
  examples?: string[];
}

export interface Message {
  id: string;
  sender: string;
  senderId: string;
  senderRole: UserRole | 'automated' | 'system';
  recipientFamilyId?: string;
  recipientStudentId?: string;
  recipientName?: string;
  targetAudience: MessageAudienceType;
  targetFilter?: string; // class name or family id etc.
  title: string;
  body: string;
  priority: MessagePriority;
  channels: MessageChannel[];
  sentAt: string;
  readAt?: string;
  requiresAcknowledgement?: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  relatedStudentId?: string;
  relatedChildName?: string;
  isAutomated?: boolean;
  pointsOnAcknowledge?: number;
  targetClassId?: string;
  recipientParentId?: string;
  acknowledged?: boolean;
  actionRequired?: boolean;
  actionCompleted?: boolean;
  automatedType?: string;
}

export interface CorrectionRequest {
  id: string;
  activityId: string;
  familyId: string;
  studentId?: string;
  parentName: string;
  studentName: string;
  activityTitle: string;
  reason: string;
  status: CorrectionStatus;
  submittedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedById?: string;
  resolutionNote?: string;
  pointsDelta?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName?: string;
  actor?: string;
  actorId: string;
  actorRole: string;
  action: string;
  details: string;
  ipHash?: string;
  relatedFamilyId?: string;
  relatedStudentId?: string;
}
