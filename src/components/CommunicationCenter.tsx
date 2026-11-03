import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePulse } from '../context/PulseContext';
import { 
  MessagePriority, 
  MessageChannel, 
  MessageAudienceType 
} from '../types/pulse';
import { 
  Send, 
  AlertTriangle, 
  Info, 
  User, 
  CheckCircle, 
  Smartphone, 
  Mail, 
  Bell, 
  Zap, 
  Filter,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { canSendMessage, canSendSchoolWideMessage } from '../utils/permissions';

export const CommunicationCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    messages, 
    currentFamily, 
    families, 
    classes,
    students,
    parents,
    sendMessage, 
    markMessageRead, 
    acknowledgeMessage,
    triggerAutomatedAlert 
  } = usePulse();

  const role = currentUser?.role || 'parent';
  const assignedClasses = currentUser?.linkedEntities.assignedClasses || ['5A', '5B'];

  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCompose, setShowCompose] = useState<boolean>(false);

  // New message form state
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newPriority, setNewPriority] = useState<MessagePriority>('general');
  const [newAudience, setNewAudience] = useState<MessageAudienceType>(role === 'teacher' ? 'class' : 'all');
  const [targetFilter, setTargetFilter] = useState(assignedClasses[0] || '5A');
  const [selectedFamilyId, setSelectedFamilyId] = useState(families[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedParentId, setSelectedParentId] = useState(parents[0]?.id || '');
  const [channels, setChannels] = useState<MessageChannel[]>(['app']);

  // Role-filtered messages with strict relational checks
  const displayedMessages = messages.filter((m) => {
    if (role === 'student') {
      const studentId = currentUser?.linkedEntities.studentId;
      const studentClass = currentUser?.linkedEntities.className;
      const studentClassId = currentUser?.linkedEntities.classId;
      const studentYear = currentUser?.linkedEntities.yearGroup;
      const studentFamilyId = currentUser?.linkedEntities.familyId;

      const isForStudent =
        m.targetAudience === 'all' ||
        (m.targetAudience === 'student' && m.recipientStudentId === studentId) ||
        (m.targetAudience === 'class' && (m.targetFilter === studentClass || m.targetClassId === studentClassId)) ||
        (m.targetAudience === 'year' && m.targetFilter === studentYear) ||
        (m.recipientFamilyId === studentFamilyId) ||
        (m.relatedStudentId === studentId);
      if (!isForStudent) return false;
    } else if (role === 'parent') {
      const parentId = currentUser?.linkedEntities.parentId;
      const familyId = currentUser?.linkedEntities.familyId;
      const childClassNames = currentFamily?.children.map((c) => c.className) || [];
      const childClassIds = currentFamily?.children.map((c) => c.classId) || [];
      const childYears = currentFamily?.children.map((c) => c.yearGroup) || [];

      const isForFamily =
        m.targetAudience === 'all' ||
        m.recipientFamilyId === familyId ||
        (m.recipientParentId && m.recipientParentId === parentId) ||
        (m.targetAudience === 'family' && m.recipientFamilyId === familyId) ||
        (m.targetAudience === 'class' && (childClassNames.includes(m.targetFilter || '') || childClassIds.includes(m.targetClassId || ''))) ||
        (m.targetAudience === 'year' && childYears.includes(m.targetFilter || ''));
      if (!isForFamily) return false;
    } else if (role === 'teacher') {
      const teacherId = currentUser?.linkedEntities.teacherId || currentUser?.id;
      const isForTeacher =
        m.targetAudience === 'all' ||
        m.senderId === teacherId ||
        (m.targetAudience === 'class' && (assignedClasses.includes(m.targetFilter || '') || assignedClasses.includes(m.targetClassId || ''))) ||
        (m.targetAudience === 'year' && m.targetFilter === 'Year 5');
      if (!isForTeacher) return false;
    }
    // Admin has access to all messages

    if (filterPriority !== 'all' && m.priority !== filterPriority) {
      return false;
    }

    return true;
  });

  const toggleChannel = (ch: MessageChannel) => {
    if (ch === 'app') return; // App notification is mandatory
    if (channels.includes(ch)) {
      setChannels(channels.filter((c) => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    let targetFamily = families.find((f) => f.id === selectedFamilyId);
    let targetStudent = students.find((s) => s.id === selectedStudentId);
    let targetParent = parents.find((p) => p.id === selectedParentId);

    if (newAudience === 'student' && targetStudent) {
      targetFamily = families.find((f) => f.id === targetStudent?.familyId);
    }
    if (newAudience === 'individual' && targetParent) {
      targetFamily = families.find((f) => f.id === targetParent?.familyId);
    }

    const matchedClass = classes.find((c) => c.name === targetFilter);

    sendMessage({
      sender: role === 'admin' ? 'The Seaside Schools Leadership' : `${currentUser?.name || 'Class Teacher'}`,
      targetAudience: newAudience,
      targetClassId: newAudience === 'class' ? matchedClass?.id : undefined,
      targetFilter: newAudience === 'year' || newAudience === 'class' ? targetFilter : undefined,
      recipientFamilyId: (newAudience === 'family' || newAudience === 'individual' || newAudience === 'student') ? targetFamily?.id : undefined,
      recipientParentId: newAudience === 'individual' ? selectedParentId : undefined,
      recipientStudentId: newAudience === 'student' ? selectedStudentId : undefined,
      recipientName: newAudience === 'student' 
        ? targetStudent?.name 
        : (newAudience === 'individual' ? targetParent?.name : targetFamily?.displayTitle),
      relatedStudentId: targetStudent?.id,
      relatedChildName: targetStudent?.name,
      title: newTitle.trim(),
      body: newBody.trim(),
      priority: newPriority,
      channels,
      actionRequired: newPriority === 'important' || newPriority === 'critical'
    });

    setNewTitle('');
    setNewBody('');
    setShowCompose(false);
  };

  const getPriorityBadge = (priority: MessagePriority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded whitespace-nowrap">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Critical Urgent
          </span>
        );
      case 'important':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded whitespace-nowrap">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Important
          </span>
        );
      case 'personal':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded whitespace-nowrap">
            <User className="w-3.5 h-3.5 shrink-0" />
            Personal
          </span>
        );
      case 'general':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
            General
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-600">
              <span>Parent Communication Hub</span>
              <span aria-hidden="true">·</span>
              <span>Direct Multichannel Messaging</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Announcements & Direct Updates
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Delivering urgent closures, important notices, routine newsletters, and personal child updates with transparent delivery tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {(role === 'teacher' || role === 'admin') && (
              <button
                onClick={() => setShowCompose(!showCompose)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{showCompose ? 'Close Composer' : 'Dispatch Announcement'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Priority & Channel Reference Strip */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-rose-100 bg-rose-50/40">
            <div className="font-semibold text-rose-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>Critical (Urgent)</span>
            </div>
            <p className="text-rose-700 mt-1 text-[11px] sm:text-xs">Closures, security alerts, emergency announcements.</p>
          </div>
          <div className="p-3 rounded-lg border border-amber-100 bg-amber-50/40">
            <div className="font-semibold text-amber-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
              <span>Important</span>
            </div>
            <p className="text-amber-700 mt-1 text-[11px] sm:text-xs">Exams, PTA meetings, deadlines, timetable updates.</p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
              <span>General</span>
            </div>
            <p className="text-slate-600 mt-1 text-[11px] sm:text-xs">Weekly newsletters, school events, achievements.</p>
          </div>
          <div className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/40">
            <div className="font-semibold text-indigo-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
              <span>Personal</span>
            </div>
            <p className="text-indigo-700 mt-1 text-[11px] sm:text-xs">Late arrivals, points earned, individual reminders.</p>
          </div>
        </div>
      </div>

      {/* AUTOMATED TRIGGERS SIMULATOR (Administrative Testing Console) */}
      {role === 'admin' && (
        <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-6 border border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  PULSE Automated Notification Triggers
                </h2>
                <p className="text-xs text-slate-400">
                  Simulate automated notifications dispatched by school rules and student milestones.
                </p>
              </div>
            </div>
            <span className="text-[11px] sm:text-xs text-slate-400 font-mono self-start sm:self-auto">
              Administrator Console
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
            <button
              onClick={() => triggerAutomatedAlert('late_arrival')}
              className="text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors text-xs"
            >
              <div className="font-semibold text-amber-300 flex items-center justify-between">
                <span>Late-Arrival Alert</span>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              </div>
              <p className="text-slate-400 mt-1 text-[11px]">Dispatches personal notification & SMS reminder for morning tardiness.</p>
            </button>

            <button
              onClick={() => triggerAutomatedAlert('assignment_reminder')}
              className="text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors text-xs"
            >
              <div className="font-semibold text-blue-300 flex items-center justify-between">
                <span>Assignment 48h Reminder</span>
                <Info className="w-3.5 h-3.5 shrink-0" />
              </div>
              <p className="text-slate-400 mt-1 text-[11px]">Sends proactive notice before project deadline to encourage points.</p>
            </button>

            <button
              onClick={() => triggerAutomatedAlert('event_reminder')}
              className="text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors text-xs"
            >
              <div className="font-semibold text-purple-300 flex items-center justify-between">
                <span>Event Reminder</span>
                <Bell className="w-3.5 h-3.5 shrink-0" />
              </div>
              <p className="text-slate-400 mt-1 text-[11px]">Broadcasts reminder for upcoming STEM Fair & parent attendance points.</p>
            </button>

            <button
              onClick={() => triggerAutomatedAlert('milestone_congratulations')}
              className="text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors text-xs"
            >
              <div className="font-semibold text-emerald-300 flex items-center justify-between">
                <span>Milestone Celebration</span>
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              </div>
              <p className="text-slate-400 mt-1 text-[11px]">Congratulates family upon surpassing Impact Score milestone.</p>
            </button>
          </div>
        </div>
      )}

      {/* DISPATCH / COMPOSE COMPONENT */}
      {showCompose && (
        <div className="bg-white rounded-xl border border-indigo-200 p-4 sm:p-6 md:p-8 shadow-md">
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-5 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Compose School Announcement</span>
            </h2>
            <button
              onClick={() => setShowCompose(false)}
              className="text-slate-400 hover:text-slate-600 text-sm p-1"
            >
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Audience */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Audience
                </label>
                <select
                  value={newAudience}
                  onChange={(e) => setNewAudience(e.target.value as MessageAudienceType)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Whole School (All Families & Students)</option>
                  <option value="year">Specific Year Group</option>
                  <option value="class">Specific Class</option>
                  <option value="family">Specific Family</option>
                  <option value="individual">Specific Parent</option>
                  <option value="student">Specific Student</option>
                </select>
              </div>

              {/* Conditional Target Filter for Year or Class */}
              {newAudience === 'year' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Year Group
                  </label>
                  <select
                    value={targetFilter}
                    onChange={(e) => setTargetFilter(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Year 5">Year 5</option>
                    <option value="Year 6">Year 6</option>
                  </select>
                </div>
              )}

              {newAudience === 'class' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Class
                  </label>
                  <select
                    value={targetFilter}
                    onChange={(e) => setTargetFilter(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.yearGroup} · {c.studentIds.length} pupils)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {newAudience === 'family' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Target Family
                  </label>
                  <select
                    value={selectedFamilyId}
                    onChange={(e) => setSelectedFamilyId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {families.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.displayTitle} ({f.parentNames})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {newAudience === 'individual' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Target Parent
                  </label>
                  <select
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {parents.map((p) => {
                      const fam = families.find((f) => f.id === p.familyId);
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.relationship ? `${p.relationship} · ` : ''}{fam?.displayTitle})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {newAudience === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Target Student
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.className} · {s.yearGroup})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Priority Level
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as MessagePriority)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="general">General (Routine news & updates)</option>
                  <option value="important">Important (Deadlines, exams, PTA)</option>
                  <option value="critical">Critical (Emergency & security)</option>
                  <option value="personal">Personal (Child-specific)</option>
                </select>
              </div>
            </div>

            {/* Channels Multi-Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Delivery Channels
              </label>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-not-allowed">
                  <input type="checkbox" checked disabled className="rounded text-indigo-600" />
                  <Bell className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="font-medium text-slate-800">App Notification (Saved in History)</span>
                </label>

                <label 
                  onClick={() => toggleChannel('sms')}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    channels.includes('sms')
                      ? 'border-indigo-400 bg-indigo-50/60 text-indigo-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={channels.includes('sms')} 
                    onChange={() => {}} 
                    className="rounded text-indigo-600 pointer-events-none" 
                  />
                  <Smartphone className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  <span>SMS (Urgent mobile text delivery)</span>
                </label>

                <label 
                  onClick={() => toggleChannel('email')}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    channels.includes('email')
                      ? 'border-indigo-400 bg-indigo-50/60 text-indigo-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={channels.includes('email')} 
                    onChange={() => {}} 
                    className="rounded text-indigo-600 pointer-events-none" 
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  <span>Email (School digest)</span>
                </label>
              </div>
            </div>

            {/* Message Title & Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Announcement Headline
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Science Fair Schedule Confirmation or Emergency Weather Protocol"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs p-2.5 sm:p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Message Content
              </label>
              <textarea
                rows={4}
                required
                placeholder="Write message details for parents..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                className="w-full text-xs p-2.5 sm:p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs text-center"
              >
                Dispatch to Parents
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MESSAGES LISTING */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Message History & Inbound Dispatch
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              {displayedMessages.length} Messages in feed
            </p>
          </div>

          {/* Filter by Priority */}
          <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 w-full sm:w-auto"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="important">Important</option>
              <option value="general">General</option>
              <option value="personal">Personal</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {displayedMessages.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No messages found matching this filter.
            </div>
          ) : (
            displayedMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`py-4 sm:py-5 space-y-2.5 sm:space-y-3 transition-colors ${
                  !msg.readAt && (msg.recipientFamilyId === currentFamily?.id || msg.targetAudience === 'all')
                    ? 'bg-indigo-50/20 -mx-4 px-4 sm:mx-0 sm:px-0'
                    : ''
                }`}
                onClick={() => markMessageRead(msg.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getPriorityBadge(msg.priority)}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500">
                      <span>{msg.sender}</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(msg.sentAt).toLocaleDateString()} {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.targetAudience !== 'all' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-indigo-600 font-medium">
                            {msg.recipientName || msg.targetFilter || 'Targeted'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Channel Icons */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 self-start sm:self-auto">
                    {msg.channels.includes('app') && (
                      <span title="In-App Notification" className="p-1 rounded bg-slate-100 text-slate-600">
                        <Bell className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {msg.channels.includes('sms') && (
                      <span title="SMS text delivery" className="p-1 rounded bg-emerald-50 text-emerald-700">
                        <Smartphone className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {msg.channels.includes('email') && (
                      <span title="Email delivery" className="p-1 rounded bg-blue-50 text-blue-700">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{msg.title}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{msg.body}</p>
                </div>

                {/* Parent acknowledgment & point reward button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2 text-slate-500">
                    {msg.readAt && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </span>
                    )}
                    {msg.acknowledged && (
                      <span className="text-indigo-600 font-medium">
                        · Acknowledged (+5 points recorded)
                      </span>
                    )}
                  </div>

                  {(!msg.acknowledged && (msg.targetAudience === 'all' || msg.recipientFamilyId === currentFamily?.id)) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        acknowledgeMessage(msg.id);
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md font-semibold text-xs transition-colors self-start sm:self-auto whitespace-nowrap"
                    >
                      Acknowledge & Confirm (+5 pts)
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
