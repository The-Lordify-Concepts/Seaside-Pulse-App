import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePulse } from '../context/PulseContext';
import { 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  Sparkles, 
  Bell, 
  PlusCircle, 
  Menu, 
  X, 
  LogOut, 
  User, 
  ChevronDown,
  Layers,
  KeyRound
} from 'lucide-react';
import seasideLogo from '../assets/brand/seaside-logo.png';
import { ChangePasswordModal } from './ChangePasswordModal';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenRecordModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenRecordModal }) => {
  const { currentUser, logout, loginAsDemoUser, users } = useAuth();
  const { messages, currentFamily, corrections } = usePulse();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadMessagesCount = messages.filter((m) => {
    if (m.readAt) return false;
    if (m.targetAudience === 'all') return true;
    if (m.recipientFamilyId === currentFamily?.id) return true;
    return false;
  }).length;

  const pendingCorrectionsCount = corrections.filter((c) => c.status === 'pending').length;

  const role = currentUser?.role || 'parent';
  const assignedClasses = currentUser?.linkedEntities.assignedClasses || [];

  // Filter corrections count based on role
  const relevantCorrectionsCount = corrections.filter((c) => {
    if (c.status !== 'pending') return false;
    if (role === 'parent') return c.familyId === currentUser?.linkedEntities.familyId;
    if (role === 'teacher') return true; // Teacher sees class corrections
    if (role === 'admin') return true;
    return false;
  }).length;

  // Role-specific navigation items
  const navItems = (() => {
    switch (role) {
      case 'student':
        return [
          { id: 'student-portal', label: 'My Dashboard' },
          { id: 'point-records', label: 'My Points / Activity' },
          { 
            id: 'communications', 
            label: 'Messages', 
            badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined 
          },
          { id: 'student-profile', label: 'Profile' }
        ];
      case 'teacher':
        return [
          { id: 'my-classes', label: 'My Classes' },
          { id: 'point-records', label: 'Class Activity' },
          { 
            id: 'corrections', 
            label: 'Corrections', 
            badge: relevantCorrectionsCount > 0 ? relevantCorrectionsCount : undefined 
          },
          { 
            id: 'communications', 
            label: 'Communications', 
            badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined 
          },
          { id: 'leaderboard', label: 'Leaderboard' }
        ];
      case 'admin':
        return [
          { id: 'leaderboard', label: 'Leaderboard' },
          { id: 'parent-portal', label: 'All Families' },
          { id: 'point-records', label: 'Point Activity' },
          { 
            id: 'communications', 
            label: 'Communications', 
            badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined 
          },
          { 
            id: 'corrections', 
            label: 'Corrections', 
            badge: relevantCorrectionsCount > 0 ? relevantCorrectionsCount : undefined 
          },
          { id: 'rules', label: 'Rules & Weights' },
          { id: 'audit-logs', label: 'Audit Logs' }
        ];
      case 'parent':
      default:
        return [
          { id: 'parent-portal', label: 'Parent Portal' },
          { id: 'leaderboard', label: 'Leaderboard' },
          { id: 'point-records', label: 'Point Activity' },
          { 
            id: 'communications', 
            label: 'Communications', 
            badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined 
          },
          { 
            id: 'corrections', 
            label: 'Corrections', 
            badge: relevantCorrectionsCount > 0 ? relevantCorrectionsCount : undefined 
          }
        ];
    }
  })();

  const handleNavSelect = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Sparkles className="w-3 h-3" />
            Student
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <GraduationCap className="w-3 h-3" />
            Teacher
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </span>
        );
      case 'parent':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            <UserCheck className="w-3 h-3" />
            Parent
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-8 h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => handleNavSelect(role === 'student' ? 'student-portal' : 'leaderboard')}
              className="flex items-center gap-2.5 text-left text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
            >
              <img src={seasideLogo} alt="The Seaside Schools" className="h-8 sm:h-9 w-auto object-contain hidden sm:block" />
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0040A0] to-[#003080] text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-md ring-2 ring-blue-100">
                P
              </span>
              <span className="font-bold text-[#0040A0] tracking-tight">PULSE</span>
            </button>
          </div>

          {/* Zone 2: Desktop clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative py-1 text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#0040A0] font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-rose-100 text-rose-700">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0040A0] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Authenticated User Profile & Primary Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Action Button for Teachers / Admins */}
            {(role === 'teacher' || role === 'admin') && (
              <button
                onClick={onOpenRecordModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0040A0] rounded-lg hover:bg-[#003080] transition-colors shadow-xs whitespace-nowrap shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">Award Points</span>
                <span className="inline xs:hidden sm:hidden">Award</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => handleNavSelect('communications')}
              className="relative p-2 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Open Messages"
              aria-label="View messages"
            >
              <Bell className="w-4 h-4" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-rose-500 text-white rounded-full text-[10px] font-bold font-mono ring-2 ring-white">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* User Account Menu with role entity badge */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
                aria-expanded={userDropdownOpen}
                aria-label="User account menu"
              >
                <div className="w-7 h-7 rounded-lg bg-[#0040A0]/10 text-[#0040A0] flex items-center justify-center font-bold text-xs ring-1 ring-[#0040A0]/20">
                  {currentUser?.name.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-xs leading-tight">
                  <div className="font-semibold text-slate-900 truncate max-w-[120px]">
                    {currentUser?.name}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {currentUser?.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Popover */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs divide-y divide-slate-100">
                  <div className="px-4 py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {currentUser?.name}
                      </span>
                      {getRoleBadge(role)}
                    </div>
                    <div className="text-slate-500 text-[11px] truncate">
                      {currentUser?.email}
                    </div>
                    <div className="text-indigo-700 font-medium text-[11px] pt-0.5">
                      {currentUser?.title}
                    </div>
                  </div>

                  {/* Linked Entities Info */}
                  <div className="px-4 py-2.5 bg-slate-50/70 space-y-1 text-[11px] text-slate-600">
                    <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                      Account Linkage
                    </div>
                    {role === 'parent' && currentUser?.linkedEntities.children && (
                      <div>
                        Linked Students: {currentUser.linkedEntities.children.map((c) => c.name).join(', ')}
                      </div>
                    )}
                    {role === 'student' && (
                      <div>
                        Enrolled: {currentUser?.linkedEntities.yearGroup} · {currentUser?.linkedEntities.className}
                      </div>
                    )}
                    {role === 'teacher' && (
                      <div>
                        Classes: {currentUser?.linkedEntities.assignedClasses?.join(', ')}
                      </div>
                    )}
                    {role === 'admin' && (
                      <div>Authority: School-wide administrative access</div>
                    )}
                  </div>

                  {/* Admin Demo Switch Persona */}
                  {role === 'admin' && (
                    <div className="px-3 py-2 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-1">
                        Admin Demo Switch Persona
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        {users.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              loginAsDemoUser(u.id);
                              setUserDropdownOpen(false);
                            }}
                            className={`p-1.5 rounded-md text-left truncate transition-colors ${
                              u.id === currentUser?.id
                                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="capitalize">{u.role}</span>: {u.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Account security */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setChangePasswordOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#0040A0]" />
                      <span>Change password</span>
                    </button>
                  </div>

                  {/* Sign Out Action */}
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50 font-semibold transition-colors text-xs"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Mobile Horizontal Sub-Navigation Scrollbar for quick thumb switching */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-2 text-xs font-medium border-t border-slate-100 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavSelect(item.id)}
                className={`whitespace-nowrap px-2.5 py-1.5 rounded-md transition-colors shrink-0 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-100 text-rose-700 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slide-out / Dropdown Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col">
          <div className="bg-white border-b border-slate-200 shadow-xl px-4 py-5 max-h-[85vh] overflow-y-auto space-y-4">
            
            {/* User Info inside Drawer */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-sm">{currentUser?.name}</div>
                <div className="text-xs text-slate-500">{currentUser?.email}</div>
              </div>
              {getRoleBadge(role)}
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">
              Navigation Menu
            </div>
            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavSelect(item.id)}
                    className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-100 text-rose-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setChangePasswordOpen(true);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-[#0040A0] bg-blue-50 hover:bg-blue-100 font-semibold text-xs transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                <span>Change password</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-xs transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>
          <div 
            className="flex-1" 
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true" 
          />
        </div>
      )}

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </header>
  );
};
