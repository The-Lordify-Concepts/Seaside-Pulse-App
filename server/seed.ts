/**
 * Seed the JSON database from the same domain data the frontend uses.
 * Run: npm run server:seed
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'pulse-db.json');

// Load compiled-free seed by reading mock source isn't ideal in ESM without tsx.
// We embed a minimal seed mirror here so the server is self-contained.
// Keep in sync with src/data/mockData.ts when you change domain data.

const emptyCategoryScores = () => ({
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

const categoryRules = [
  { id: 'attendance_punctuality', name: 'Punctuality & Attendance', type: 'student', description: 'On-time arrival and consistent attendance', defaultWeight: 20, currentWeight: 20, maxPointsPerEntry: 15 },
  { id: 'assignments', name: 'Assignments & Homework', type: 'student', description: 'Completed and high-quality assignments', defaultWeight: 20, currentWeight: 20, maxPointsPerEntry: 20 },
  { id: 'projects', name: 'Projects & Presentations', type: 'student', description: 'Project work and presentations', defaultWeight: 15, currentWeight: 15, maxPointsPerEntry: 25 },
  { id: 'behaviour_character', name: 'Character & Behaviour', type: 'student', description: 'Positive behaviour, kindness, leadership', defaultWeight: 15, currentWeight: 15, maxPointsPerEntry: 20 },
  { id: 'participation', name: 'Class & Club Participation', type: 'student', description: 'Active participation in class and clubs', defaultWeight: 10, currentWeight: 10, maxPointsPerEntry: 10 },
  { id: 'pta_meetings', name: 'PTA / Consultation Attendance', type: 'parent', description: 'Attending parent-teacher meetings and PTA', defaultWeight: 8, currentWeight: 8, maxPointsPerEntry: 10 },
  { id: 'event_attendance', name: 'School Event Attendance', type: 'parent', description: 'Attending school events and celebrations', defaultWeight: 5, currentWeight: 5, maxPointsPerEntry: 8 },
  { id: 'communication', name: 'Message Confirmation & Engagement', type: 'parent', description: 'Confirming school messages and responding', defaultWeight: 4, currentWeight: 4, maxPointsPerEntry: 5 },
  { id: 'volunteering', name: 'Volunteering & Support', type: 'parent', description: 'Volunteering time or resources for school', defaultWeight: 3, currentWeight: 3, maxPointsPerEntry: 15 }
];

const classes = [
  { id: 'class-5a', name: '5A', yearGroup: 'Year 5', teacherIds: ['teach-reed'], studentIds: ['stu-leo', 'stu-kemi', 'stu-dapo', 'stu-lucas'] },
  { id: 'class-5b', name: '5B', yearGroup: 'Year 5', teacherIds: ['teach-reed'], studentIds: [] },
  { id: 'class-2b', name: '2B', yearGroup: 'Year 2', teacherIds: ['teach-okafor'], studentIds: ['stu-sophie'] },
  { id: 'class-2p', name: '2P', yearGroup: 'Year 2', teacherIds: ['teach-okafor'], studentIds: [] },
  { id: 'class-4c', name: '4C', yearGroup: 'Year 4', teacherIds: [], studentIds: ['stu-rory'] }
];

const students = [
  { id: 'stu-leo', name: 'Leo Bennett', familyId: 'fam-bennett', classId: 'class-5a', className: '5A', yearGroup: 'Year 5', isActive: true },
  { id: 'stu-sophie', name: 'Sophie Bennett', familyId: 'fam-bennett', classId: 'class-2b', className: '2B', yearGroup: 'Year 2', isActive: true },
  { id: 'stu-kemi', name: 'Kemi Adebayo', familyId: 'fam-adebayo', classId: 'class-5a', className: '5A', yearGroup: 'Year 5', isActive: true },
  { id: 'stu-dapo', name: 'Dapo Adebayo', familyId: 'fam-adebayo', classId: 'class-5a', className: '5A', yearGroup: 'Year 5', isActive: true },
  { id: 'stu-lucas', name: 'Lucas Chen', familyId: 'fam-chen', classId: 'class-5a', className: '5A', yearGroup: 'Year 5', isActive: true },
  { id: 'stu-rory', name: 'Rory Gallagher', familyId: 'fam-gallagher', classId: 'class-4c', className: '4C', yearGroup: 'Year 4', isActive: true }
];

const parents = [
  { id: 'par-elena', name: 'Elena Bennett', familyId: 'fam-bennett', email: 'elena.bennett@seasideschools.edu' },
  { id: 'par-marcus-b', name: 'Marcus Bennett', familyId: 'fam-bennett' },
  { id: 'par-folake', name: 'Folake Adebayo', familyId: 'fam-adebayo' },
  { id: 'par-tunde', name: 'Tunde Adebayo', familyId: 'fam-adebayo' },
  { id: 'par-david', name: 'David Chen', familyId: 'fam-chen' },
  { id: 'par-mei', name: 'Mei Chen', familyId: 'fam-chen' },
  { id: 'par-siobhan', name: 'Siobhan Gallagher', familyId: 'fam-gallagher' },
  { id: 'par-eamonn', name: 'Eamonn Gallagher', familyId: 'fam-gallagher' }
];

const teachers = [
  { id: 'teach-reed', name: 'Mr. Marcus Reed', assignedClasses: ['5A', '5B'], email: 'marcus.reed@seasideschools.edu' },
  { id: 'teach-okafor', name: 'Ms. Amina Okafor', assignedClasses: ['2B', '2P'], email: 'amina.okafor@seasideschools.edu' }
];

const families = [
  {
    id: 'fam-bennett',
    displayTitle: 'The Bennett Family',
    parentNames: 'Elena & Marcus Bennett',
    children: [
      { id: 'stu-leo', name: 'Leo Bennett', yearGroup: 'Year 5', className: '5A', classId: 'class-5a' },
      { id: 'stu-sophie', name: 'Sophie Bennett', yearGroup: 'Year 2', className: '2B', classId: 'class-2b' }
    ],
    weeklyScore: 31,
    monthlyScore: 114,
    termlyScore: 378,
    categoryScores: { ...emptyCategoryScores(), attendance_punctuality: 40, behaviour: 20, behaviour_character: 30, communication: 15 },
    privateRank: 5,
    previousTermScore: 320
  },
  {
    id: 'fam-adebayo',
    displayTitle: 'The Adebayo Family',
    parentNames: 'Folake & Tunde Adebayo',
    children: [
      { id: 'stu-kemi', name: 'Kemi Adebayo', yearGroup: 'Year 5', className: '5A', classId: 'class-5a' },
      { id: 'stu-dapo', name: 'Dapo Adebayo', yearGroup: 'Year 5', className: '5A', classId: 'class-5a' }
    ],
    weeklyScore: 42,
    monthlyScore: 150,
    termlyScore: 485,
    categoryScores: { ...emptyCategoryScores(), attendance_punctuality: 50, assignments: 40, behaviour_character: 45 },
    privateRank: 1,
    previousTermScore: 410
  },
  {
    id: 'fam-chen',
    displayTitle: 'The Chen Family',
    parentNames: 'David & Mei Chen',
    children: [
      { id: 'stu-lucas', name: 'Lucas Chen', yearGroup: 'Year 5', className: '5A', classId: 'class-5a' }
    ],
    weeklyScore: 38,
    monthlyScore: 140,
    termlyScore: 468,
    categoryScores: { ...emptyCategoryScores(), assignments: 55, projects: 40 },
    privateRank: 2,
    previousTermScore: 400
  },
  {
    id: 'fam-gallagher',
    displayTitle: 'The Gallagher Family',
    parentNames: 'Siobhan & Eamonn Gallagher',
    children: [
      { id: 'stu-rory', name: 'Rory Gallagher', yearGroup: 'Year 4', className: '4C', classId: 'class-4c' }
    ],
    weeklyScore: 35,
    monthlyScore: 130,
    termlyScore: 452,
    categoryScores: { ...emptyCategoryScores(), participation: 40, behaviour_character: 35 },
    privateRank: 3,
    previousTermScore: 380
  }
];

const users = [
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
    linkedEntities: { teacherId: 'teach-reed', assignedClasses: ['5A', '5B'] },
    avatarInitials: 'MR'
  },
  {
    id: 'user-admin-shaw',
    name: 'Dr. Katherine Shaw',
    email: 'katherine.shaw@seasideschools.edu',
    role: 'admin',
    linkedEntities: {},
    avatarInitials: 'KS',
    // Demo hash for local testing only — production should disable demo accounts
    passwordHash:
      'scrypt:a2108a2ad1aaa1f123ad6d830e36d574:b82094a55083bc7ba68ec54fac36c241a669cd84ea8df4ab97eb7960c9cc7090bd0e62e77f49616b06b328c4776614e3cf27c93c2d75d50d6c1a5310c18af7ed'
  },
  {
    id: 'user-admin-ifeanyi',
    name: 'Mr. Ifeanyi Chukwuedo',
    email: 'ifeanyi.chukwuedo@theseasideschool.com',
    role: 'admin',
    linkedEntities: {},
    avatarInitials: 'IC',
    // Temporary password: SeasideAdmin2026!  — change after first login
    passwordHash:
      'scrypt:a2108a2ad1aaa1f123ad6d830e36d574:b82094a55083bc7ba68ec54fac36c241a669cd84ea8df4ab97eb7960c9cc7090bd0e62e77f49616b06b328c4776614e3cf27c93c2d75d50d6c1a5310c18af7ed'
  },
  {
    id: 'user-teacher-okafor',
    name: 'Ms. Amina Okafor',
    email: 'amina.okafor@seasideschools.edu',
    role: 'teacher',
    linkedEntities: { teacherId: 'teach-okafor', assignedClasses: ['2B', '2P'] },
    avatarInitials: 'AO',
    passwordHash:
      'scrypt:a2108a2ad1aaa1f123ad6d830e36d574:b82094a55083bc7ba68ec54fac36c241a669cd84ea8df4ab97eb7960c9cc7090bd0e62e77f49616b06b328c4776614e3cf27c93c2d75d50d6c1a5310c18af7ed'
  }
];

const activities = [
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
    description: 'Leo arrived on time for 10 consecutive school days.',
    rawPoints: 12,
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
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
    description: 'Sophie helped a classmate who was upset during break.',
    rawPoints: 10,
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: 'approved'
  }
];

const messages = [
  {
    id: 'msg-001',
    sender: 'School Office',
    senderId: 'user-admin-shaw',
    senderRole: 'admin',
    recipientFamilyId: 'fam-bennett',
    targetAudience: 'family',
    title: 'Autumn Mid-Term Parent Consultation Bookings Open',
    body: 'Parent-teacher consultation bookings are now live on PULSE. Slots are available for Wednesday 21st and Thursday 22nd October. Attending records points towards your Parent Participation impact score.',
    priority: 'important',
    channels: ['app', 'email'],
    sentAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    requiresAcknowledgement: true,
    pointsOnAcknowledge: 5
  },
  {
    id: 'msg-002',
    sender: 'Mr. Marcus Reed',
    senderId: 'user-teacher-reed',
    senderRole: 'teacher',
    targetAudience: 'class',
    targetFilter: '5A',
    targetClassId: 'class-5a',
    title: 'Year 5 Science Project Reminder',
    body: 'Please submit science project outlines by Friday. Outstanding work will earn participation points.',
    priority: 'normal',
    channels: ['app'],
    sentAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

const corrections = [
  {
    id: 'cor-001',
    activityId: 'act-001',
    familyId: 'fam-bennett',
    studentId: 'stu-leo',
    parentName: 'Elena & Marcus Bennett',
    studentName: 'Leo Bennett',
    activityTitle: '10-Day Punctuality Streak',
    reason: 'Leo was late on day 7 due to a medical appointment with a school-approved note.',
    status: 'pending',
    submittedAt: new Date(Date.now() - 0.5 * 86400000).toISOString()
  }
];

const auditLogs = [
  {
    id: 'aud-001',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    actorName: 'Mr. Marcus Reed',
    actorId: 'user-teacher-reed',
    actorRole: 'Teacher',
    action: 'AWARD_POINTS',
    details: 'Awarded +12 points to Leo Bennett for 10-Day Punctuality Streak',
    relatedFamilyId: 'fam-bennett',
    relatedStudentId: 'stu-leo',
    ipHash: 'a3f9c2'
  }
];

const db = {
  users,
  families,
  students,
  parents,
  teachers,
  classes,
  activities,
  messages,
  corrections,
  categoryRules,
  auditLogs,
  sessions: [] as { token: string; userId: string; expiresAt: string }[]
};

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
console.log(`Seeded ${DB_FILE}`);
console.log(`  users=${users.length} families=${families.length} activities=${activities.length} messages=${messages.length}`);
