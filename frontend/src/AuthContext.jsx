import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

const AuthContext = createContext(null);


// Role-based permission mapping
const ROLE_PERMISSIONS = {
  admin: [
    // User management
    "users:manage",
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    // Selection
    "selection:manage",
    "selection:view",
    "selection:edit",
    // Scheduling
    "scheduling:manage",
    "scheduling:view",
    "scheduling:edit",
    // Attendance
    "attendance:manage",
    "attendance:view",
    "attendance:approve",
    "attendance:overall-view",
    // Onboarding
    "onboarding:manage",
    "onboarding:view",
    // Dashboard
    "dashboard:view",
    // Logs
    "admin:panel",
    "admin:logs",
    // Profile
    "profile:view",
    "profile:edit",
  ],
  tutorLead: [
    // Selection
    "selection:manage",
    "selection:view",
    "selection:edit",
    // Scheduling
    "scheduling:manage",
    "scheduling:view",
    "scheduling:edit",
    // Attendance
    "attendance:manage",
    "attendance:view",
    "attendance:approve",
    "tutor-attendance:manage",
    "tutor-attendance:view",
    // Dashboard
    "dashboard:view",
    // Profile
    "profile:view",
    "profile:edit",
  ],
  tutor: [
    // Attendance
    "attendance:view",
    "tutor-attendance:manage",
    "tutor-attendance:view",
    // Scheduling
    "scheduling:view",
    // Profile
    "profile:view",
    "profile:edit",
  ],
  selectionTeam: [
    // Selection
    "selection:manage",
    "selection:view",
    "selection:edit",
    // Profile
    "profile:view",
    "profile:edit",
  ],
  attendanceTrackingTeam: [
    // Attendance
    "attendance:view",
    "attendance:overall-view",
    "attendance:approve",
    // Profile
    "profile:view",
    "profile:edit",
  ],
  studentsTrackingTeam: [
    // Attendance
    "attendance:overall-view",
    // Dashboard
    "dashboard:view",
    // Profile
    "profile:view",
    "profile:edit",
  ],
};

const ROLE_MAP = {
  'ADMIN': 'admin',
  'TUTOR_LEADS': 'tutorLead',
  'TUTOR': 'tutor',
  'SELECTION_TEAM': 'selectionTeam',
  'ATTENDANCE_TRACKING_TEAM': 'attendanceTrackingTeam',
  'CLASS_INSPECTION_TEAM': 'studentsTrackingTeam',
};

export function AuthProvider({ children, userData }) {
  // Helper to augment user with permissions
  const augmentUser = (u) => {
    if (!u) return null;

    // Normalize role from backend (e.g., "ADMIN" -> "admin")
    const normalizedRole = ROLE_MAP[u.role] || u.role;
    

    const derivedPermissions = Array.isArray(u.permissions)
      ? u.permissions
      : ROLE_PERMISSIONS[normalizedRole] || [];

    return { ...u, role: normalizedRole, permissions: derivedPermissions };
  };

  // Initialize state from prop
  const [user, _setUser] = useState(() => augmentUser(userData));
  
  useEffect(() => {
    _setUser(augmentUser(userData));
  }, [userData]);

  // Ensure permissions are present on the user object. If backend returns
  // explicit permissions, use them; otherwise derive from role mapping.
  const setUser = useCallback((u) => {
    if (!u) {
      _setUser(null);
      try {
        localStorage.removeItem('kk_session');
      } catch { /* ignore */ }
      return;
    }

    const augmented = augmentUser(u);
    _setUser(augmented);
    // Persist augmented user back into kk_session if session exists or token provided
    try {
      const existing = localStorage.getItem('kk_session');
      if (u.token) {
        localStorage.setItem('kk_session', JSON.stringify({ token: u.token, user: augmented }));
      } else if (existing) {
        try {
          const parsed = JSON.parse(existing);
          parsed.user = augmented;
          localStorage.setItem('kk_session', JSON.stringify(parsed));
        } catch {
          // fallback: replace with minimal session
          localStorage.setItem('kk_session', JSON.stringify({ user: augmented }));
        }
      } else {
        // no existing session and no token: persist minimal session
        localStorage.setItem('kk_session', JSON.stringify({ user: augmented }));
      }
    } catch {
      console.warn('Unable to persist session user');
    }
  }, [augmentUser]);

  // Memoized permission checker
  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );
  

  // Memoized role checker
  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      if (typeof role === "string") {
        return user.role === role;
      }
      return Array.isArray(role) && role.includes(user.role);
    },
    [user]
  );

  // Memoized multi-permission checker
  const hasAllPermissions = useCallback(
    (permissions) => {
      if (!user || !Array.isArray(permissions)) return false;
      return permissions.every((permission) => hasPermission(permission));
    },
    [user, hasPermission]
  );

  // Memoized any permission checker
  const hasAnyPermission = useCallback(
    (permissions) => {
      if (!user || !Array.isArray(permissions)) return false;
      return permissions.some((permission) => hasPermission(permission));
    },
    [user, hasPermission]
  );

  const value = useMemo(
    () => ({
      user,
      setUser,
      hasPermission,
      hasRole,
      hasAllPermissions,
      hasAnyPermission,
    }),
    [user, setUser, hasPermission, hasRole, hasAllPermissions, hasAnyPermission]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
