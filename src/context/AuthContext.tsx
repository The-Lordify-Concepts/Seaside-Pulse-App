import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types/pulse';
import { INITIAL_USERS } from '../data/mockData';
import { canManageUsers } from '../utils/permissions';
import { api, isApiConfigured, setStoredToken, getStoredToken } from '../lib/api';

interface AuthContextType {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  users: UserAccount[];
  login: (email: string, password?: string) => { success: boolean; error?: string };
  loginAsDemoUser: (userId: string) => void;
  logout: () => void;
  requestPasswordReset: (email: string) => { success: boolean; message: string };
  updateUserAccount: (updated: Partial<UserAccount>) => void;
  assignTeacherClasses: (userId: string, classNames: string[]) => { success: boolean; message: string };
  updateUserByAdmin: (userId: string, updates: Partial<UserAccount>) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'pulse_auth_session_v1';
const USERS_STORAGE_KEY = 'pulse_auth_users_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const applyLocalUser = (found: UserAccount) => {
    const updatedUser = {
      ...found,
      lastLoginAt: new Date().toISOString()
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === found.id ? updatedUser : u)));
    return updatedUser;
  };

  const login = (email: string, _password?: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        success: false,
        error: 'No active school account found with this email address. Please check spelling or contact the school office.'
      };
    }

    // Immediate local session so UI navigates without waiting on network
    applyLocalUser(found);

    // Establish server session when API is configured (token enables PulseContext bootstrap + mutations)
    if (isApiConfigured()) {
      api
        .login(cleanEmail, _password)
        .then((res) => {
          setStoredToken(res.token);
          if (res.user) setCurrentUser(res.user as UserAccount);
        })
        .catch(() => {
          /* offline / API down — local mock session remains */
        });
    } else {
      setStoredToken(null);
    }

    return { success: true };
  };

  const loginAsDemoUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (!found) return;

    applyLocalUser(found);

    if (isApiConfigured()) {
      api
        .loginDemo(userId)
        .then((res) => {
          setStoredToken(res.token);
          // Re-set user after token so PulseContext bootstrap sees an active session
          if (res.user) setCurrentUser(res.user as UserAccount);
          else setCurrentUser((prev) => (prev ? { ...prev } : prev));
        })
        .catch(() => {
          /* keep local mock session */
        });
    } else {
      setStoredToken(null);
    }
  };

  const logout = () => {
    if (isApiConfigured() && getStoredToken()) {
      api.logout().catch(() => undefined);
      setStoredToken(null);
    }
    setCurrentUser(null);
  };

  const requestPasswordReset = (email: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        success: false,
        message: 'No registered school account found with that email.'
      };
    }

    return {
      success: true,
      message: `Password reset instructions have been sent to ${found.email}. Please follow the link in your school inbox.`
    };
  };

  const updateUserAccount = (updated: Partial<UserAccount>) => {
    if (!currentUser) return;
    const modified = { ...currentUser, ...updated };
    setCurrentUser(modified);
    setUsers((prev) => prev.map((u) => (u.id === modified.id ? modified : u)));
  };

  /**
   * Admin-only: Assign or update teacher classes
   */
  const assignTeacherClasses = (userId: string, classNames: string[]): { success: boolean; message: string } => {
    if (!canManageUsers(currentUser)) {
      return {
        success: false,
        message: 'Permission Denied: Only School Administrators can assign classes or modify accounts.'
      };
    }

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'User account not found.' };
    }

    const updatedUser: UserAccount = {
      ...targetUser,
      linkedEntities: {
        ...targetUser.linkedEntities,
        assignedClasses: classNames
      }
    };

    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
    }

    return {
      success: true,
      message: `Successfully updated class assignments for ${targetUser.name}: ${classNames.join(', ')}`
    };
  };

  /**
   * Admin-only: Edit user accounts
   */
  const updateUserByAdmin = (userId: string, updates: Partial<UserAccount>): { success: boolean; message: string } => {
    if (!canManageUsers(currentUser)) {
      return {
        success: false,
        message: 'Permission Denied: Only School Administrators can modify accounts.'
      };
    }

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'User account not found.' };
    }

    const updatedUser: UserAccount = {
      ...targetUser,
      ...updates,
      linkedEntities: {
        ...targetUser.linkedEntities,
        ...(updates.linkedEntities || {})
      }
    };

    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
    }

    return {
      success: true,
      message: `Account settings updated for ${targetUser.name}`
    };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        users,
        login,
        loginAsDemoUser,
        logout,
        requestPasswordReset,
        updateUserAccount,
        assignTeacherClasses,
        updateUserByAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
