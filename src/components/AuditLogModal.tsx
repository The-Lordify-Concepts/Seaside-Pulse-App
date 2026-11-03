import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePulse } from '../context/PulseContext';
import { Shield, Key, Lock, CheckCircle2, RefreshCw, ShieldAlert, UserCheck } from 'lucide-react';
import { canViewAuditLogs, canViewFullAuditLogs, getPermittedAuditLogs } from '../utils/permissions';

export const AuditLogModal: React.FC = () => {
  const { currentUser } = useAuth();
  const { auditLogs, resetAllData } = usePulse();

  const role = currentUser?.role || 'parent';

  if (!canViewAuditLogs(currentUser)) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The PULSE Audit Trail and Cryptographic Security Ledger is strictly restricted to School Administrative Leadership and authorized staff members.
        </p>
      </div>
    );
  }

  const isFullAdmin = canViewFullAuditLogs(currentUser);
  const permittedLogs = getPermittedAuditLogs(currentUser, auditLogs);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-600">
              <span>Security & Accountability Protocol</span>
              <span aria-hidden="true">·</span>
              <span>{isFullAdmin ? 'School-Wide Ledger' : 'Teacher Personal Action Log'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              {isFullAdmin ? 'Access & Integrity Audit Trail' : 'My Staff Action Audit Log'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {isFullAdmin
                ? 'PULSE Rule: All point awards, announcements, correction resolutions, and system refreshes maintain an immutable cryptographic log.'
                : 'Verified record of point awards, message broadcasts, and correction resolutions recorded under your teacher profile.'}
            </p>
          </div>

          {isFullAdmin && (
            <button
              onClick={resetAllData}
              className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors self-start lg:self-auto whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          )}
        </div>

        {/* Security badges */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Encrypted Ledger</div>
              <div className="text-slate-500">AES-256 at rest & in transit</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Staff Attribution</div>
              <div className="text-slate-500">Immutable audit entries</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <Key className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900">Fine-Grained Permissions</div>
              <div className="text-slate-500">{isFullAdmin ? 'Full School Access' : 'Teacher View (Personal Actions)'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            {isFullAdmin ? `System Event Log (${permittedLogs.length} Entries)` : `My Recorded Actions (${permittedLogs.length} Entries)`}
          </h2>
          <span className="text-[11px] sm:text-xs font-mono text-slate-500">
            Cryptographic Integrity: Verified
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="min-w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider bg-slate-50/30">
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold whitespace-nowrap">Timestamp</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold whitespace-nowrap">Actor & Role</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold whitespace-nowrap">Action Event</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold">Details</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-right whitespace-nowrap">Hash Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {permittedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                      No matching audit records found for your staff profile.
                    </td>
                  </tr>
                ) : (
                  permittedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{log.actorName || log.actor || '—'}</span>
                      <span className="block text-slate-500 text-[11px]">{log.actorRole}</span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-slate-700 min-w-[200px] max-w-md leading-relaxed">
                      {log.details}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {log.ipHash || '—'}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
