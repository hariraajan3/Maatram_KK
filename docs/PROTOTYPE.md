# Maatram — Unified Tutor/Class/Student Platform (Prototype)

Summary
- A unified platform replaces Excel and centralizes tutor, class and student operations with role-based access (Admins, Leads, Tutors). It provides full traceability for scheduling, monitoring, attendance, onboarding, and academic records with automated workflows and approval gates.

Primary Goals
- Centralized, real-time operations for tutors, classes, and students.
- Role-based access and audit trails for secure, controlled data handling.
- End-to-end academic flow covering selection, scheduling, attendance and marks with edit-trace logs.
- Automated onboarding/release flows and approval-based class changes with instant notifications.

Key Roles & Permissions
- Admin
  - Full access to user management, system settings, view/edit all data, run reports, and review logs.
- Lead
  - Manage assigned tutors and classes, approve swaps/reschedules/cancellations, review attendance and marks, run performance reports for their teams.
- Tutor
  - View their classes and students, record attendance and marks, request swaps/reschedules/cancellations, access onboarding materials.

Main UI & Where to Find It (code mapping)
- Entry and routing: `frontend/src/App.jsx` — authenticated root renders `Layout` and the default page is `Dashboard`.
- Main navigation / buttons (Scheduling, Attendance, Onboarding, Profile, etc.): `frontend/src/components/Layout.jsx`. This component should contain the nav/sidebar or header buttons that link to:
  - `/scheduling` => `frontend/src/pages/Scheduling.jsx`
  - `/attendance`  => `frontend/src/pages/Attendance.jsx`
  - `/onboarding`  => `frontend/src/pages/Onboarding.jsx`
  - `/profile`     => `frontend/src/pages/Profile.jsx`
- Dashboard: `frontend/src/pages/Dashboard.jsx` — can also hold quick-action cards and summary widgets.

User Flows
- Onboarding (automated):
  - Admin/Lead triggers onboarding for a tutor.
  - System records documents, creates accounts, sends welcome email, assigns initial classes and roles.
  - Logs capture each step for traceability.
- Scheduling & Class Management:
  - Leads or Admins create class schedules (class metadata, tutor, student list, time window, recurrence).
  - Tutors can request swaps, cancellations or reschedules — these create approval requests handled by Leads/Admins.
  - Approved changes trigger notifications and update class records; everything is logged.
- Attendance & Marks:
  - Tutors mark attendance per class; students' marks entered after assessment.
  - All attendance and marks writes are stored with editor metadata (who, when, previous value) to provide an edit-trace log.

Automations & Notifications
- Email notifications for: onboarding, relieving/deactivation, swap/reschedule/cancellation requests and their outcomes, missed classes, important alerts.
- Approval flows: swap/cancel/reschedule create requests with required approvers; automated emails sent on status change.

Data Model (high level)
- User: { id, name, email, role (admin|lead|tutor|student), status, metadata }
- TutorProfile: { userId, documents[], assignedClasses[], onboardingStatus, reminders }
- Class: { id, title, tutorId, leadId, students[], schedule: { date, start, end, recurrence }, status }
- Attendance: { id, classId, studentId, tutorId, date, status (present|absent|late), recordedBy, recordedAt }
- Marks: { id, studentId, classId, assessmentType, score, maxScore, recordedBy, recordedAt }
- AuditLog: { id, entityType, entityId, action, before, after, userId, timestamp }

API & Back-end Suggestions
- Auth: endpoints for login/signup, role-based middleware.
- Classes: GET/POST/PUT/DELETE class endpoints plus approval endpoints for swap/reschedule/cancel.
- Attendance: POST to record attendance, GET to fetch class attendance, PATCH for corrections — every modification writes an entry to `AuditLog`.
- Marks: POST/PUT with audit trail.
- Onboarding: endpoints to upload documents, trigger welcome emails, set account status.

Security & Traceability
- Role-based authorization enforced server-side (routes + controller checks).
- Use JSON Web Tokens stored in secure, httpOnly cookies or localStorage with CSRF protections (current app already saves session to `localStorage` — consider httpOnly cookie for production).
- All edits to attendance/marks/class data produce `AuditLog` records storing who changed what and when.

UX / Visuals
- Main page (where your buttons are): `Layout.jsx` should render a persistent nav with buttons/links to Scheduling, Attendance, Onboarding, Dashboard, Profile. The `Dashboard.jsx` can include quick action cards (e.g., "Mark Attendance", "Create Schedule") for fast workflows.
- Performance charts: use a charting library (e.g., `recharts` or `chart.js`). Provide a component `PerformanceChart.jsx` taking data to render bar graphs comparing previous vs current marks or student cohorts.

Example Component Responsibilities
- `Layout.jsx` — header + sidebar buttons (link to routes). Place role-aware rendering so Tutors only see tutor actions.
- `Dashboard.jsx` — summary widgets: upcoming classes, pending approvals, quick actions and performance snapshot.
- `Scheduling.jsx` — calendar view + list of classes with filters, create/edit forms, request workflow buttons.
- `Attendance.jsx` — class selector + roster grid, quick mark buttons, bulk actions, correction modal that logs edits.

Monitoring & Logs
- Store logs and provide a `Logs` admin view to filter by user/entity/date. Keep logs immutable and exportable for audits.

Implementation Notes & Quick Wins
- Where buttons live now: check `frontend/src/components/Layout.jsx` (nav) and `frontend/src/pages/Dashboard.jsx` (cards). If the nav is missing buttons, add `NavLink` elements that point to the routes defined in `frontend/src/App.jsx`.
- Add `AuditLog` writes on all mutating server endpoints.
- Use a charting library and add `frontend/src/components/PerformanceChart.jsx` to centralize visualization.

Next Steps (suggested)
1. Add/verify nav buttons in `frontend/src/components/Layout.jsx` that link to `/scheduling`, `/attendance`, `/onboarding`, and `/profile`.
2. Implement or confirm audit logging in backend endpoints that mutate attendance and marks.
3. Create `PerformanceChart.jsx` and wire it into `Dashboard.jsx`.
4. Add email templates and background job to send onboarding/approval emails.

If you want, I can:
- Open and edit `frontend/src/components/Layout.jsx` to add the nav buttons now.
- Create `docs/PROTOTYPE.md` (this file) in the repo (already added).
- Implement a `PerformanceChart.jsx` stub and wire it into the Dashboard.

Contact
- If you'd like me to push any of the next steps (nav buttons, chart component, backend audit-stubs), tell me which and I'll implement them.
