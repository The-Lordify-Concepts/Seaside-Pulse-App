// ============================================================
// PULSE – Initial Mock Data (Oakwood / Seaside Academy)
// ============================================================

import {
  UserAccount,
  Family,
  Student,
  Parent,
  Teacher,
  SchoolClass,
  PointEntry,
  CategoryRule,
  Message,
  CorrectionRequest,
  AuditLogEntry,
  CategoryId
} from '../types/pulse';

// ---------- Category Rules (80% student / 20% parent) ----------
export const INITIAL_CATEGORY_RULES: CategoryRule[] = [
  {
    id: 'attendance_punctuality',
    name: 'Punctuality & Attendance',
    type: 'student',
    description: 'On-time arrival and consistent attendance',
    defaultWeight: 20,
    currentWeight: 20,
    maxPointsPerEntry: 15
  },
  {
    id: 'assignments',
    name: 'Assignments & Homework',
    type: 'student',
    description: 'Completed and high-quality assignments',
    defaultWeight: 20,
    currentWeight: 20,
    maxPointsPerEntry: 20
  },
  {
    id: 'projects',
    name: 'Projects & Presentations',
    type: 'student',
    description: 'Project work and presentations',
    defaultWeight: 15,
    currentWeight: 15,
    maxPointsPerEntry: 25
  },
  {
    id: 'behaviour_character',
    name: 'Character & Behaviour',
    type: 'student',
    description: 'Positive behaviour, kindness, leadership',
    defaultWeight: 15,
    currentWeight: 15,
    maxPointsPerEntry: 20
  },
  {
    id: 'participation',
    name: 'Class & Club Participation',
    type: 'student',
    description: 'Active participation in class and clubs',
    defaultWeight: 10,
    currentWeight: 10,
    maxPointsPerEntry: 10
  },
  {
    id: 'pta_meetings',
    name: 'PTA / Consultation Attendance',
    type: 'parent',
    description: 'Attending parent-teacher meetings and PTA',
    defaultWeight: 8,
    currentWeight: 8,
    maxPointsPerEntry: 10
  },
  {
    id: 'event_attendance',
    name: 'School Event Attendance',
    type: 'parent',
    description: 'Attending school events and celebrations',
    defaultWeight: 5,
    currentWeight: 5,
    maxPointsPerEntry: 8
  },
  {
    id: 'communication',
    name: 'Message Confirmation & Engagement',
    type: 'parent',
    description: 'Confirming school messages and responding',
    defaultWeight: 4,
    currentWeight: 4,
    maxPointsPerEntry: 5
  },
  {
    id: 'volunteering',
    name: 'Volunteering & Support',
    type: 'parent',
    description: 'Volunteering time or resources for school',
    defaultWeight: 3,
    currentWeight: 3,
    maxPointsPerEntry: 15
  }
];

const emptyCategoryScores = (): Record<CategoryId, number> => ({
  attendance_punctuality: 0,
  assignments: 0,
  projects: 0,
  behaviour_character: 0,
  participation: 0,
  pta_meetings: 0,
  event_attendance: 0,
  communication: 0,
  volunteering: 0
});

// ---------- Classes ----------
export const INITIAL_CLASSES: SchoolClass[] = [
  {
    id: 'class-5a',
    name: '5A',
    yearGroup: 'Year 5',
    teacherIds: ['teach-reed'],
    studentIds: ['stu-leo', 'stu-kemi', 'stu-dapo', 'stu-lucas']
  },
  {
    id: 'class-5b',
    name: '5B',
    yearGroup: 'Year 5',
    teacherIds: ['teach-reed'],
    studentIds: []
  },
  {
    id: 'class-2b',
    name: '2B',
    yearGroup: 'Year 2',
    teacherIds: ['teach-okafor'],
    studentIds: ['stu-sophie']
  },
  {
    id: 'class-2p',
    name: '2P',
    yearGroup: 'Year 2',
    teacherIds: ['teach-okafor'],
    studentIds: []
  },
  {
    id: 'class-4c',
    name: '4C',
    yearGroup: 'Year 4',
    teacherIds: ['teach-patel'],
    studentIds: ['stu-rory']
  }
];

// ---------- Teachers ----------
export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'teach-reed',
    name: 'Mr. Marcus Reed',
    assignedClasses: ['5A', '5B'],
    email: 'marcus.reed@seasideschools.edu'
  },
  {
    id: 'teach-okafor',
    name: 'Ms. Amina Okafor',
    assignedClasses: ['2B', '2P'],
    email: 'amina.okafor@seasideschools.edu'
  },
  {
    id: 'teach-patel',
    name: 'Mr. Raj Patel',
    assignedClasses: ['4C'],
    email: 'raj.patel@seasideschools.edu'
  }
];

// ---------- Students ----------
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-leo',
    name: 'Leo Bennett',
    familyId: 'fam-bennett',
    classId: 'class-5a',
    className: '5A',
    yearGroup: 'Year 5'
  },
  {
    id: 'stu-sophie',
    name: 'Sophie Bennett',
    familyId: 'fam-bennett',
    classId: 'class-2b',
    className: '2B',
    yearGroup: 'Year 2'
  },
  {
    id: 'stu-kemi',
    name: 'Kemi Adebayo',
    familyId: 'fam-adebayo',
    classId: 'class-5a',
    className: '5A',
    yearGroup: 'Year 5'
  },
  {
    id: 'stu-dapo',
    name: 'Dapo Adebayo',
    familyId: 'fam-adebayo',
    classId: 'class-5a',
    className: '5A',
    yearGroup: 'Year 5'
  },
  {
    id: 'stu-lucas',
    name: 'Lucas Chen',
    familyId: 'fam-chen',
    classId: 'class-5a',
    className: '5A',
    yearGroup: 'Year 5'
  },
  {
    id: 'stu-rory',
    name: 'Rory Gallagher',
    familyId: 'fam-gallagher',
    classId: 'class-4c',
    className: '4C',
    yearGroup: 'Year 4'
  }
];

// ---------- Parents ----------
export const INITIAL_PARENTS: Parent[] = [
  { id: 'par-elena', name: 'Elena Bennett', familyId: 'fam-bennett', email: 'elena.bennett@seasideschools.edu' },
  { id: 'par-marcus-b', name: 'Marcus Bennett', familyId: 'fam-bennett' },
  { id: 'par-folake', name: 'Folake Adebayo', familyId: 'fam-adebayo' },
  { id: 'par-tunde', name: 'Tunde Adebayo', familyId: 'fam-adebayo' },
  { id: 'par-david', name: 'David Chen', familyId: 'fam-chen' },
  { id: 'par-mei', name: 'Mei Chen', familyId: 'fam-chen' },
  { id: 'par-siobhan', name: 'Siobhan Gallagher', familyId: 'fam-gallagher' },
  { id: 'par-eamonn', name: 'Eamonn Gallagher', familyId: 'fam-gallagher' }
];

// ---------- Families (scores approximate the live demo) ----------
export const INITIAL_FAMILIES: Family[] = [
  {
    id: 'fam-bennett',
    displayTitle: 'The Bennett Family',
    parentNames: 'Elena & Marcus Bennett',
    children: [
      { id: 'stu-leo', name: 'Leo Bennett', yearGroup: 'Year 5', className: '5A' },
      { id: 'stu-sophie', name: 'Sophie Bennett', yearGroup: 'Year 2', className: '2B' }
    ],
    weeklyScore: 31,
    monthlyScore: 114,
    termlyScore: 378,
    privateRank: 6,
    categoryScores: {
      ...emptyCategoryScores(),
      attendance_punctuality: 95,
      assignments: 80,
      projects: 45,
      behaviour_character: 62,
      participation: 20,
      pta_meetings: 30,
      event_attendance: 18,
      communication: 20,
      volunteering: 8
    }
  },
  {
    id: 'fam-adebayo',
    displayTitle: 'The Adebayo Family',
    parentNames: 'Folake & Tunde Adebayo',
    children: [
      { id: 'stu-kemi', name: 'Kemi Adebayo', yearGroup: 'Year 5', className: '5A' },
      { id: 'stu-dapo', name: 'Dapo Adebayo', yearGroup: 'Year 5', className: '5A' }
    ],
    weeklyScore: 42,
    monthlyScore: 150,
    termlyScore: 485,
    privateRank: 1,
    categoryScores: {
      ...emptyCategoryScores(),
      attendance_punctuality: 110,
      assignments: 95,
      projects: 70,
      behaviour_character: 85,
      participation: 35,
      pta_meetings: 40,
      event_attendance: 25,
      communication: 15,
      volunteering: 10
    }
  },
  {
    id: 'fam-chen',
    displayTitle: 'The Chen Family',
    parentNames: 'David & Mei Chen',
    children: [
      { id: 'stu-lucas', name: 'Lucas Chen', yearGroup: 'Year 5', className: '5A' }
    ],
    weeklyScore: 38,
    monthlyScore: 140,
    termlyScore: 468,
    privateRank: 2,
    categoryScores: {
      ...emptyCategoryScores(),
      attendance_punctuality: 100,
      assignments: 105,
      projects: 80,
      behaviour_character: 70,
      participation: 30,
      pta_meetings: 35,
      event_attendance: 22,
      communication: 18,
      volunteering: 8
    }
  },
  {
    id: 'fam-gallagher',
    displayTitle: 'The Gallagher Family',
    parentNames: 'Siobhan & Eamonn Gallagher',
    children: [
      { id: 'stu-rory', name: 'Rory Gallagher', yearGroup: 'Year 4', className: '4C' }
    ],
    weeklyScore: 35,
    monthlyScore: 130,
    termlyScore: 452,
    privateRank: 3,
    categoryScores: {
      ...emptyCategoryScores(),
      attendance_punctuality: 90,
      assignments: 88,
      projects: 65,
      behaviour_character: 95,
      participation: 28,
      pta_meetings: 32,
      event_attendance: 28,
      communication: 16,
      volunteering: 10
    }
  },
  {
    id: 'fam-patel',
    displayTitle: 'The Patel Family',
    parentNames: 'Priya & Amit Patel',
    children: [
      { id: 'stu-placeholder-patel', name: 'Aisha Patel', yearGroup: 'Year 5', className: '5A' }
    ],
    weeklyScore: 33,
    monthlyScore: 125,
    termlyScore: 395,
    privateRank: 5,
    categoryScores: {
      ...emptyCategoryScores(),
      attendance_punctuality: 85,
      assignments: 78,
      projects: 55,
      behaviour_character: 60,
      participation: 22,
      pta_meetings: 28,
      event_attendance: 20,
      communication: 14,
      volunteering: 6
    }
  }
];

// ---------- Users (Auth) ----------
export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-parent-bennett',
    name: 'Elena & Marcus Bennett',
    email: 'elena.bennett@seasideschools.edu',
    role: 'parent',
    linkedEntities: {
      familyId: 'fam-bennett',
      children: [
        { id: 'stu-leo', name: 'Leo Bennett', yearGroup: 'Year 5', className: '5A', classId: 'class-5a' },
        { id: 'stu-sophie', name: 'Sophie Bennett', yearGroup: 'Year 2', className: '2B', classId: 'class-2b' }
      ]
    },
    avatarInitials: 'EB'
  },
  {
    id: 'user-student-leo',
    name: 'Leo Bennett',
    email: 'leo.bennett@student.seasideschools.edu',
    role: 'student',
    linkedEntities: {
      studentId: 'stu-leo',
      familyId: 'fam-bennett',
      className: '5A',
      classId: 'class-5a',
      yearGroup: 'Year 5'
    },
    avatarInitials: 'LB'
  },
  {
    id: 'user-teacher-reed',
    name: 'Mr. Marcus Reed',
    email: 'marcus.reed@seasideschools.edu',
    role: 'teacher',
    linkedEntities: {
      teacherId: 'teach-reed',
      assignedClasses: ['5A', '5B']
    },
    avatarInitials: 'MR'
  },
  {
    id: 'user-admin-shaw',
    name: 'Dr. Katherine Shaw',
    email: 'katherine.shaw@seasideschools.edu',
    role: 'admin',
    linkedEntities: {},
    avatarInitials: 'KS'
  },
  {
    id: 'user-teacher-okafor',
    name: 'Ms. Amina Okafor',
    email: 'amina.okafor@seasideschools.edu',
    role: 'teacher',
    linkedEntities: {
      teacherId: 'teach-okafor',
      assignedClasses: ['2B', '2P']
    },
    avatarInitials: 'AO'
  }
];

// ---------- Sample Point Activities ----------
export const INITIAL_ACTIVITIES: PointEntry[] = [
  {
    id: 'act-001',
    familyId: 'fam-bennett',
    studentId: 'stu-leo',
    studentName: 'Leo Bennett',
    awardedByTeacherId: 'teach-reed',
    recordedByTeacher: 'Mr. Marcus Reed',
    awardedByRole: 'teacher',
    categoryId: 'attendance_punctuality',
    categoryName: 'Punctuality & Attendance',
    categoryType: 'student',
    title: '10-Day Punctuality Streak',
    description: 'Arrived on time for 10 consecutive school days.',
    rawPoints: 12,
    timestamp: '2026-10-20T08:15:00.000Z',
    timeframe: 'weekly',
    status: 'approved'
  },
  {
    id: 'act-002',
    familyId: 'fam-bennett',
    studentId: 'stu-sophie',
    studentName: 'Sophie Bennett',
    awardedByTeacherId: 'teach-okafor',
    recordedByTeacher: 'Ms. Amina Okafor',
    awardedByRole: 'teacher',
    categoryId: 'behaviour_character',
    categoryName: 'Character & Behaviour',
    categoryType: 'student',
    title: 'Playground Empathy Award',
    description: 'Helped a classmate who was upset during break.',
    rawPoints: 10,
    timestamp: '2026-10-18T12:40:00.000Z',
    timeframe: 'weekly',
    status: 'approved'
  },
  {
    id: 'act-003',
    familyId: 'fam-bennett',
    awardedByTeacherId: 'sys-pulse',
    recordedByTeacher: 'PULSE Participation System',
    awardedByRole: 'automated',
    categoryId: 'communication',
    categoryName: 'Message Confirmation & Engagement',
    categoryType: 'parent',
    title: 'Confirmed Parent Consultation Booking',
    description: 'Parent acknowledged mid-term consultation message.',
    rawPoints: 5,
    timestamp: '2026-10-15T19:22:00.000Z',
    timeframe: 'monthly',
    status: 'approved'
  },
  {
    id: 'act-004',
    familyId: 'fam-adebayo',
    studentId: 'stu-kemi',
    studentName: 'Kemi Adebayo',
    awardedByTeacherId: 'teach-reed',
    recordedByTeacher: 'Mr. Marcus Reed',
    awardedByRole: 'teacher',
    categoryId: 'assignments',
    categoryName: 'Assignments & Homework',
    categoryType: 'student',
    title: 'Outstanding Science Project',
    description: 'Exceptional depth and presentation on ecosystems.',
    rawPoints: 20,
    timestamp: '2026-10-22T14:00:00.000Z',
    timeframe: 'monthly',
    status: 'approved'
  },
  {
    id: 'act-005',
    familyId: 'fam-chen',
    studentId: 'stu-lucas',
    studentName: 'Lucas Chen',
    awardedByTeacherId: 'teach-reed',
    recordedByTeacher: 'Mr. Marcus Reed',
    awardedByRole: 'teacher',
    categoryId: 'projects',
    categoryName: 'Projects & Presentations',
    categoryType: 'student',
    title: 'Maths Challenge Winner',
    description: 'First place in Year 5 Maths challenge.',
    rawPoints: 18,
    timestamp: '2026-10-21T11:30:00.000Z',
    timeframe: 'monthly',
    status: 'approved'
  }
];

// ---------- Messages ----------
export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-001',
    sender: 'School Office',
    senderId: 'admin-office',
    senderRole: 'admin',
    recipientFamilyId: 'fam-bennett',
    recipientName: 'The Bennett Family',
    targetAudience: 'family',
    title: 'Autumn Mid-Term Parent Consultation Bookings Open',
    body: 'Parent-teacher consultation bookings are now live on PULSE. Slots are available for Wednesday 21st and Thursday 22nd October. Attending records points towards your Parent Participation impact score.',
    priority: 'high',
    channels: ['app', 'email'],
    sentAt: '2026-10-14T09:00:00.000Z',
    requiresAcknowledgement: true,
    pointsOnAcknowledge: 5,
    isAutomated: false
  },
  {
    id: 'msg-002',
    sender: 'Mr. Marcus Reed',
    senderId: 'teach-reed',
    senderRole: 'teacher',
    recipientFamilyId: 'fam-bennett',
    recipientStudentId: 'stu-leo',
    recipientName: 'The Bennett Family',
    targetAudience: 'family',
    title: 'Leo – Positive Behaviour Note',
    body: 'Leo showed excellent leadership during group work this week. Well done!',
    priority: 'personal',
    channels: ['app'],
    sentAt: '2026-10-19T16:45:00.000Z',
    relatedStudentId: 'stu-leo',
    relatedChildName: 'Leo Bennett',
    isAutomated: false
  }
];

// ---------- Corrections ----------
export const INITIAL_CORRECTIONS: CorrectionRequest[] = [
  {
    id: 'cor-001',
    activityId: 'act-001',
    familyId: 'fam-bennett',
    studentId: 'stu-leo',
    parentName: 'Elena Bennett',
    studentName: 'Leo Bennett',
    activityTitle: '10-Day Punctuality Streak',
    reason: 'Leo was late on one of the counted days due to a medical appointment with a note provided.',
    status: 'pending',
    submittedAt: '2026-10-21T20:10:00.000Z'
  }
];

// ---------- Audit Logs ----------
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-22T14:05:00.000Z',
    actorName: 'Mr. Marcus Reed',
    actorId: 'teach-reed',
    actorRole: 'Teacher',
    action: 'AWARD_POINTS',
    details: 'Awarded +20 pts to The Adebayo Family (Kemi Adebayo) in Assignments & Homework: Outstanding Science Project',
    relatedFamilyId: 'fam-adebayo',
    relatedStudentId: 'stu-kemi'
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-21T20:12:00.000Z',
    actorName: 'Elena Bennett',
    actorId: 'user-parent-bennett',
    actorRole: 'Parent',
    action: 'SUBMIT_CORRECTION',
    details: 'Requested review for activity: "10-Day Punctuality Streak". Reason: medical appointment note provided.',
    relatedFamilyId: 'fam-bennett',
    relatedStudentId: 'stu-leo'
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-20T08:20:00.000Z',
    actorName: 'Mr. Marcus Reed',
    actorId: 'teach-reed',
    actorRole: 'Teacher',
    action: 'AWARD_POINTS',
    details: 'Awarded +12 pts to The Bennett Family (Leo Bennett) in Punctuality & Attendance: 10-Day Punctuality Streak',
    relatedFamilyId: 'fam-bennett',
    relatedStudentId: 'stu-leo'
  }
];
