// Comprehensive permission definitions for role-based access control
export const PERMISSIONS = {
  // User Management
  USERS_MANAGE: "users:manage",
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_EDIT: "users:edit",
  USERS_DELETE: "users:delete",

  // Selection Management
  SELECTION_MANAGE: "selection:manage",
  SELECTION_VIEW: "selection:view",
  SELECTION_EDIT: "selection:edit",

  // Scheduling Management
  SCHEDULING_MANAGE: "scheduling:manage",
  SCHEDULING_VIEW: "scheduling:view",
  SCHEDULING_EDIT: "scheduling:edit",

  // Attendance Management
  ATTENDANCE_MANAGE: "attendance:manage",
  ATTENDANCE_VIEW: "attendance:view",
  ATTENDANCE_APPROVE: "attendance:approve",
  ATTENDANCE_OVERALL_VIEW: "attendance:overall-view",

  // Tutor Attendance
  TUTOR_ATTENDANCE_MANAGE: "tutor-attendance:manage",
  TUTOR_ATTENDANCE_VIEW: "tutor-attendance:view",

  // Onboarding
  ONBOARDING_MANAGE: "onboarding:manage",
  ONBOARDING_VIEW: "onboarding:view",

  // Dashboard
  DASHBOARD_VIEW: "dashboard:view",

  // Admin Panel
  ADMIN_PANEL: "admin:panel",
  ADMIN_LOGS: "admin:logs",

  // Profile
  PROFILE_VIEW: "profile:view",
  PROFILE_EDIT: "profile:edit",
};

export const ROLES = {
  ADMIN: "admin",
  TUTOR_LEAD: "tutorLead",
  TUTOR: "tutor",
  COORDINATOR: "coordinator",
};

// Role descriptions for UI
export const ROLE_DESCRIPTIONS = {
  admin: "Full system access and management",
  tutorLead: "Manage selections, scheduling, and attendance for tutors",
  tutor: "Mark attendance and manage own information",
  coordinator: "Review selections and attendance approvals",
};

// Navigation items configuration
export const getNavItems = (role) => {
  const baseItems = [
    {
      to: "/profile",
      label: "Profile",
      icon: "person",
      permission: PERMISSIONS.PROFILE_VIEW,
      roles: [ROLES.ADMIN, ROLES.TUTOR_LEAD, ROLES.TUTOR, ROLES.COORDINATOR],
    },
  ];

  const roleItems = {
    admin: [
      {
        to: "/",
        label: "Selection",
        icon: "how_to_reg",
        permission: PERMISSIONS.SELECTION_VIEW,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/scheduling",
        label: "Scheduling",
        icon: "calendar_today",
        permission: PERMISSIONS.SCHEDULING_VIEW,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/attendance",
        label: "Attendance",
        icon: "fact_check",
        permission: PERMISSIONS.ATTENDANCE_VIEW,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/overall-attendance",
        label: "Overall Attendance",
        icon: "assessment",
        permission: PERMISSIONS.ATTENDANCE_OVERALL_VIEW,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/onboarding",
        label: "Onboarding",
        icon: "person_add",
        permission: PERMISSIONS.ONBOARDING_VIEW,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: "dashboard",
        permission: PERMISSIONS.DASHBOARD_VIEW,
        roles: [ROLES.ADMIN],
      },
      {
        to: "/admin-logs",
        label: "Admin Logs",
        icon: "admin_panel_settings",
        permission: PERMISSIONS.ADMIN_LOGS,
        roles: [ROLES.ADMIN],
      },
    ],
    tutorLead: [
      {
        to: "/",
        label: "Selection",
        icon: "how_to_reg",
        permission: PERMISSIONS.SELECTION_VIEW,
        roles: [ROLES.TUTOR_LEAD],
      },
      {
        to: "/scheduling",
        label: "Scheduling",
        icon: "calendar_today",
        permission: PERMISSIONS.SCHEDULING_VIEW,
        roles: [ROLES.TUTOR_LEAD],
      },
      {
        to: "/tutor-attendance",
        label: "Mark Attendance",
        icon: "edit_note",
        permission: PERMISSIONS.TUTOR_ATTENDANCE_VIEW,
        roles: [ROLES.TUTOR_LEAD],
      },
      {
        to: "/attendance",
        label: "Attendance",
        icon: "fact_check",
        permission: PERMISSIONS.ATTENDANCE_VIEW,
        roles: [ROLES.TUTOR_LEAD],
      },
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: "dashboard",
        permission: PERMISSIONS.DASHBOARD_VIEW,
        roles: [ROLES.TUTOR_LEAD],
      },
    ],
    tutor: [
      {
        to: "/tutor-attendance",
        label: "Mark Attendance",
        icon: "edit_note",
        permission: PERMISSIONS.TUTOR_ATTENDANCE_MANAGE,
        roles: [ROLES.TUTOR],
      },
      {
        to: "/attendance",
        label: "Attendance",
        icon: "fact_check",
        permission: PERMISSIONS.ATTENDANCE_VIEW,
        roles: [ROLES.TUTOR],
      },
    ],
    coordinator: [
      {
        to: "/",
        label: "Selection",
        icon: "how_to_reg",
        permission: PERMISSIONS.SELECTION_VIEW,
        roles: [ROLES.COORDINATOR],
      },
      {
        to: "/attendance",
        label: "Attendance",
        icon: "fact_check",
        permission: PERMISSIONS.ATTENDANCE_VIEW,
        roles: [ROLES.COORDINATOR],
      },
    ],
  };

  return [...(roleItems[role] || []), ...baseItems];
};
