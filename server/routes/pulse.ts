import { Router } from 'express';
import { id, readDb, withDb } from '../db.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

function audit(
  db: ReturnType<typeof readDb>,
  actor: { name: string; id: string; role: string },
  action: string,
  details: string,
  related?: { familyId?: string; studentId?: string }
) {
  db.auditLogs.unshift({
    id: id('aud'),
    timestamp: new Date().toISOString(),
    actorName: actor.name,
    actorId: actor.id,
    actorRole: actor.role,
    action,
    details,
    relatedFamilyId: related?.familyId,
    relatedStudentId: related?.studentId,
    ipHash: Math.random().toString(16).slice(2, 8)
  });
}

/** GET /api/pulse/bootstrap – full initial state for authenticated user */
router.get('/bootstrap', requireAuth, (req: AuthedRequest, res) => {
  const db = readDb();
  res.json({
    user: req.user,
    families: db.families,
    students: db.students,
    parents: db.parents,
    teachers: db.teachers,
    classes: db.classes,
    activities: db.activities,
    messages: db.messages,
    corrections: db.corrections,
    categoryRules: db.categoryRules,
    auditLogs: db.auditLogs.slice(0, 200)
  });
});

/** GET /api/pulse/families */
router.get('/families', requireAuth, (_req, res) => {
  res.json({ families: readDb().families });
});

/** GET /api/pulse/leaderboard?timeframe=termly */
router.get('/leaderboard', requireAuth, (req, res) => {
  const timeframe = String(req.query.timeframe || 'termly');
  const db = readDb();
  const scoreKey =
    timeframe === 'weekly' ? 'weeklyScore' : timeframe === 'monthly' ? 'monthlyScore' : 'termlyScore';

  const ranked = [...db.families]
    .map((f) => ({ family: f, score: Number(f[scoreKey] || 0) }))
    .sort((a, b) => b.score - a.score)
    .map((row, i) => ({ ...row, rank: i + 1 }));

  res.json({ timeframe, rankedFamilies: ranked, topThree: ranked.slice(0, 3) });
});

/** POST /api/pulse/points – award points (teacher/admin) */
router.post('/points', requireAuth, (req: AuthedRequest, res) => {
  const user = req.user!;
  if (user.role !== 'teacher' && user.role !== 'admin') {
    res.status(403).json({ error: 'Only teachers and admins can award points' });
    return;
  }

  const { familyId, studentId, categoryId, title, description, points, timeframe } = req.body || {};
  if (!familyId || !categoryId || !title || typeof points !== 'number') {
    res.status(400).json({ error: 'familyId, categoryId, title, and points are required' });
    return;
  }

  const entry = withDb((db) => {
    const rule = db.categoryRules.find((r) => r.id === categoryId);
    const student = studentId ? db.students.find((s) => s.id === studentId) : undefined;

    // Teacher class restriction
    if (user.role === 'teacher' && student) {
      const assigned = (user.linkedEntities as { assignedClasses?: string[] }).assignedClasses || [];
      if (!assigned.includes(student.className)) {
        return { error: 'You may only award points to students in your assigned classes' } as const;
      }
    }

    const activity = {
      id: id('act'),
      familyId,
      studentId: student?.id,
      studentName: student?.name,
      awardedByTeacherId: (user.linkedEntities as { teacherId?: string }).teacherId || user.id,
      recordedByTeacher: user.name,
      awardedByRole: user.role === 'admin' ? 'admin' : 'teacher',
      categoryId,
      categoryName: rule?.name || categoryId,
      categoryType: rule?.type || 'student',
      title,
      description: description || '',
      rawPoints: points,
      timestamp: new Date().toISOString(),
      timeframe: timeframe || 'weekly',
      status: 'approved'
    };

    db.activities.unshift(activity);

    // Update family aggregate scores
    db.families = db.families.map((f) => {
      if (f.id !== familyId) return f;
      return {
        ...f,
        weeklyScore: f.weeklyScore + points,
        monthlyScore: f.monthlyScore + points,
        termlyScore: f.termlyScore + points
      };
    });

    audit(
      db,
      { name: user.name, id: user.id, role: user.role === 'admin' ? 'School Admin' : 'Teacher' },
      'AWARD_POINTS',
      `Awarded +${points} points${student ? ` to ${student.name}` : ''} for "${title}"`,
      { familyId, studentId: student?.id }
    );

    return { activity };
  });

  if ('error' in entry) {
    res.status(403).json({ error: entry.error });
    return;
  }
  res.status(201).json(entry);
});

/** POST /api/pulse/messages */
router.post('/messages', requireAuth, (req: AuthedRequest, res) => {
  const user = req.user!;
  if (user.role !== 'teacher' && user.role !== 'admin') {
    res.status(403).json({ error: 'Only staff can send messages' });
    return;
  }

  const body = req.body || {};
  if (!body.title || !body.body) {
    res.status(400).json({ error: 'title and body are required' });
    return;
  }

  const message = withDb((db) => {
    const msg = {
      id: id('msg'),
      sender: user.name,
      senderId: user.id,
      senderRole: user.role,
      recipientFamilyId: body.recipientFamilyId,
      recipientStudentId: body.recipientStudentId,
      recipientParentId: body.recipientParentId,
      targetAudience: body.targetAudience || 'all',
      targetFilter: body.targetFilter,
      targetClassId: body.targetClassId,
      title: body.title,
      body: body.body,
      priority: body.priority || 'normal',
      channels: body.channels || ['app'],
      sentAt: new Date().toISOString(),
      requiresAcknowledgement: !!body.requiresAcknowledgement,
      pointsOnAcknowledge: body.pointsOnAcknowledge || 0
    };
    db.messages.unshift(msg);
    audit(
      db,
      { name: user.name, id: user.id, role: user.role === 'admin' ? 'School Admin' : 'Teacher' },
      'SEND_MESSAGE',
      `Sent message "${msg.title}" to audience ${msg.targetAudience}`
    );
    return msg;
  });

  res.status(201).json({ message });
});

/** POST /api/pulse/messages/:id/acknowledge */
router.post('/messages/:id/acknowledge', requireAuth, (req: AuthedRequest, res) => {
  const user = req.user!;
  if (user.role !== 'parent') {
    res.status(403).json({ error: 'Only parents can acknowledge messages' });
    return;
  }

  const result = withDb((db) => {
    const msg = db.messages.find((m) => m.id === req.params.id);
    if (!msg) return { error: 'Message not found', status: 404 } as const;
    if (msg.acknowledgedAt) return { error: 'Already acknowledged', status: 400 } as const;

    const familyId = (user.linkedEntities as { familyId?: string }).familyId;
    if (msg.recipientFamilyId && msg.recipientFamilyId !== familyId && msg.targetAudience !== 'all') {
      return { error: 'Not your message', status: 403 } as const;
    }

    msg.acknowledgedAt = new Date().toISOString();
    msg.acknowledgedBy = user.name;
    msg.acknowledged = true;

    const pts = Number(msg.pointsOnAcknowledge || 0);
    if (pts > 0 && familyId) {
      db.families = db.families.map((f) => {
        if (f.id !== familyId) return f;
        return {
          ...f,
          weeklyScore: f.weeklyScore + pts,
          monthlyScore: f.monthlyScore + pts,
          termlyScore: f.termlyScore + pts
        };
      });
      db.activities.unshift({
        id: id('act'),
        familyId,
        awardedByTeacherId: 'system',
        recordedByTeacher: 'Automated',
        awardedByRole: 'automated',
        categoryId: 'communication',
        categoryName: 'Message Confirmation & Engagement',
        categoryType: 'parent',
        title: `Acknowledged: ${msg.title}`,
        description: 'Parent acknowledged school message',
        rawPoints: pts,
        timestamp: new Date().toISOString(),
        status: 'approved'
      });
    }

    audit(
      db,
      { name: user.name, id: user.id, role: 'Parent' },
      'ACKNOWLEDGE_MESSAGE',
      `Acknowledged message "${msg.title}" (+${pts} pts)`,
      { familyId }
    );

    return { message: msg, pointsAwarded: pts };
  });

  if ('error' in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json(result);
});

/** POST /api/pulse/corrections */
router.post('/corrections', requireAuth, (req: AuthedRequest, res) => {
  const user = req.user!;
  if (user.role !== 'parent') {
    res.status(403).json({ error: 'Only parents can request corrections' });
    return;
  }

  const { activityId, reason } = req.body || {};
  if (!activityId || !reason) {
    res.status(400).json({ error: 'activityId and reason are required' });
    return;
  }

  const result = withDb((db) => {
    const activity = db.activities.find((a) => a.id === activityId);
    if (!activity) return { error: 'Activity not found', status: 404 } as const;

    const familyId = (user.linkedEntities as { familyId?: string }).familyId;
    if (activity.familyId !== familyId) {
      return { error: 'Only linked parents can request corrections for this family', status: 403 } as const;
    }

    const family = db.families.find((f) => f.id === activity.familyId);
    const correction = {
      id: id('cor'),
      activityId,
      familyId: activity.familyId,
      studentId: activity.studentId,
      parentName: family?.parentNames || user.name,
      studentName: activity.studentName || 'Parent Entry',
      activityTitle: activity.title,
      reason,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    db.corrections.unshift(correction);
    activity.status = 'under_review';

    audit(
      db,
      { name: user.name, id: user.id, role: 'Parent' },
      'SUBMIT_CORRECTION',
      `Requested review for "${activity.title}": ${reason}`,
      { familyId: activity.familyId, studentId: activity.studentId }
    );

    return { correction };
  });

  if ('error' in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(201).json(result);
});

/** POST /api/pulse/corrections/:id/resolve */
router.post('/corrections/:id/resolve', requireAuth, (req: AuthedRequest, res) => {
  const user = req.user!;
  if (user.role !== 'teacher' && user.role !== 'admin') {
    res.status(403).json({ error: 'Only staff can resolve corrections' });
    return;
  }

  const { decision, note, pointsDelta = 0 } = req.body || {};
  if (decision !== 'resolved' && decision !== 'declined') {
    res.status(400).json({ error: 'decision must be resolved or declined' });
    return;
  }

  const result = withDb((db) => {
    const correction = db.corrections.find((c) => c.id === req.params.id);
    if (!correction) return { error: 'Correction not found', status: 404 } as const;
    if (correction.status !== 'pending') return { error: 'Already resolved', status: 400 } as const;

    const activity = db.activities.find((a) => a.id === correction.activityId);
    if (user.role === 'teacher' && activity) {
      const teacherId = (user.linkedEntities as { teacherId?: string }).teacherId || user.id;
      if (activity.awardedByTeacherId !== teacherId) {
        return { error: 'Teachers can only resolve their own awards', status: 403 } as const;
      }
    }

    correction.status = decision;
    correction.resolutionNote = note || '';
    correction.resolvedAt = new Date().toISOString();
    correction.resolvedBy = user.name;
    correction.resolvedById = user.id;
    correction.pointsDelta = pointsDelta;

    if (activity) {
      activity.status = decision === 'resolved' ? 'corrected' : 'approved';
      activity.rawPoints = activity.rawPoints + Number(pointsDelta || 0);
      activity.correctionNote = note || '';
    }

    if (pointsDelta && correction.familyId) {
      db.families = db.families.map((f) => {
        if (f.id !== correction.familyId) return f;
        return {
          ...f,
          weeklyScore: f.weeklyScore + pointsDelta,
          monthlyScore: f.monthlyScore + pointsDelta,
          termlyScore: f.termlyScore + pointsDelta
        };
      });
    }

    audit(
      db,
      { name: user.name, id: user.id, role: user.role === 'admin' ? 'School Admin' : 'Teacher' },
      'RESOLVE_CORRECTION',
      `Correction ${decision.toUpperCase()} for ${correction.activityTitle}. Delta: ${pointsDelta}`,
      { familyId: correction.familyId, studentId: correction.studentId }
    );

    return { correction };
  });

  if ('error' in result) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json(result);
});

/** PUT /api/pulse/rules – admin only */
router.put('/rules', requireAuth, (req: AuthedRequest, res) => {
  const user = req.user!;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Only school admins can edit category weights' });
    return;
  }

  const weights = req.body?.weights as Record<string, number> | undefined;
  if (!weights || typeof weights !== 'object') {
    res.status(400).json({ error: 'weights object is required' });
    return;
  }

  const rules = withDb((db) => {
    db.categoryRules = db.categoryRules.map((r) => ({
      ...r,
      currentWeight: weights[r.id] ?? r.currentWeight
    }));
    audit(
      db,
      { name: user.name, id: user.id, role: 'School Admin' },
      'UPDATE_WEIGHTS',
      `Updated category weights: ${JSON.stringify(weights)}`
    );
    return db.categoryRules;
  });

  res.json({ categoryRules: rules });
});

export default router;
