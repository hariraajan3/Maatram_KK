-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'tutorLead', 'tutor', 'coordinator');

-- CreateEnum
CREATE TYPE "TutorStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "StudentPhase" AS ENUM ('Selection', 'Scheduling', 'Attendance', 'Completed');

-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ClassModality" AS ENUM ('virtual', 'in_person', 'hybrid');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- CreateEnum
CREATE TYPE "SwapRequestStatus" AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- CreateEnum
CREATE TYPE "Medium" AS ENUM ('Tamil', 'English');

-- CreateEnum
CREATE TYPE "District" AS ENUM ('Chennai', 'Coimbatore', 'Other');

-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('Physics', 'Maths', 'Chemistry', 'Commerce', 'Economics', 'Accounts', 'Tamil', 'English');

-- CreateEnum
CREATE TYPE "SelectionPhase" AS ENUM ('Phase1_Selection', 'Phase2_Televerification', 'Phase3_PanelInterview');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PHASE_UPDATE', 'ATTENDANCE_MARK', 'TUTOR_ASSIGN');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "avatar" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutors" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone_encrypted" TEXT,
    "status" "TutorStatus" NOT NULL DEFAULT 'active',
    "medium" "Medium",
    "district" "District",
    "subjects" JSONB NOT NULL DEFAULT '[]',
    "avg_attendance" DECIMAL(5,2) DEFAULT 0,
    "max_students" INTEGER NOT NULL DEFAULT 20,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tutors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phase" "StudentPhase" NOT NULL DEFAULT 'Selection',
    "medium" "Medium",
    "district" "District",
    "requested_subjects" JSONB NOT NULL DEFAULT '[]',
    "guardian_contact_encrypted" TEXT,
    "group" VARCHAR(100),
    "progress_score" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_tutor_assignments" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "tutor_id" UUID NOT NULL,
    "subject" "Subject" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "student_tutor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" UUID NOT NULL,
    "phase" "StudentPhase" NOT NULL,
    "tutor_id" UUID,
    "subject" "Subject" NOT NULL,
    "student_group" VARCHAR(100) NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "status" "ClassStatus" NOT NULL DEFAULT 'scheduled',
    "modality" "ClassModality" NOT NULL,
    "meeting_link" TEXT,
    "notes" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_requests" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone_encrypted" TEXT,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "status" "OnboardingStatus" NOT NULL DEFAULT 'pending',
    "requested_by" UUID,
    "review_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "onboarding_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swap_requests" (
    "id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "reason" TEXT,
    "proposed_by_tutor_id" UUID NOT NULL,
    "target_tutor_id" UUID,
    "desired_date" TIMESTAMPTZ(6),
    "status" "SwapRequestStatus" NOT NULL DEFAULT 'pending',
    "review_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "swap_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT false,
    "absent_reason" TEXT,
    "marks" DECIMAL(5,2),
    "notes" TEXT,
    "recorded_by" UUID,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_applications" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone_encrypted" TEXT,
    "guardian_contact_encrypted" TEXT,
    "medium" "Medium",
    "district" "District",
    "requested_subjects" JSONB NOT NULL DEFAULT '[]',
    "phase" "SelectionPhase" NOT NULL DEFAULT 'Phase1_Selection',
    "phase1_notes" TEXT,
    "phase1_reviewed_by" UUID,
    "phase1_reviewed_at" TIMESTAMPTZ(6),
    "is_tele_selected" BOOLEAN NOT NULL DEFAULT false,
    "phase2_televerification_notes" TEXT,
    "phase2_reviewed_by" UUID,
    "phase2_reviewed_at" TIMESTAMPTZ(6),
    "is_panel_done" BOOLEAN NOT NULL DEFAULT false,
    "phase3_panel_interview_notes" TEXT,
    "phase3_reviewed_by" UUID,
    "phase3_reviewed_at" TIMESTAMPTZ(6),
    "student_id" UUID,
    "rejection_reason" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "student_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" "AuditAction" NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID,
    "old_data" JSONB,
    "new_data" JSONB,
    "description" TEXT,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archived_records" (
    "id" UUID NOT NULL,
    "record_type" VARCHAR(100) NOT NULL,
    "record_data" JSONB NOT NULL,
    "archived_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_by" UUID,

    CONSTRAINT "archived_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "tutors_user_id_key" ON "tutors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tutors_email_key" ON "tutors"("email");

-- CreateIndex
CREATE INDEX "tutors_user_id_idx" ON "tutors"("user_id");

-- CreateIndex
CREATE INDEX "tutors_email_idx" ON "tutors"("email");

-- CreateIndex
CREATE INDEX "tutors_medium_idx" ON "tutors"("medium");

-- CreateIndex
CREATE INDEX "tutors_district_idx" ON "tutors"("district");

-- CreateIndex
CREATE INDEX "tutors_status_idx" ON "tutors"("status");

-- CreateIndex
CREATE INDEX "students_group_idx" ON "students"("group");

-- CreateIndex
CREATE INDEX "students_phase_idx" ON "students"("phase");

-- CreateIndex
CREATE INDEX "students_medium_idx" ON "students"("medium");

-- CreateIndex
CREATE INDEX "students_district_idx" ON "students"("district");

-- CreateIndex
CREATE INDEX "students_is_active_idx" ON "students"("is_active");

-- CreateIndex
CREATE INDEX "student_tutor_assignments_student_id_idx" ON "student_tutor_assignments"("student_id");

-- CreateIndex
CREATE INDEX "student_tutor_assignments_tutor_id_idx" ON "student_tutor_assignments"("tutor_id");

-- CreateIndex
CREATE INDEX "student_tutor_assignments_subject_idx" ON "student_tutor_assignments"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "student_tutor_assignments_student_id_tutor_id_subject_key" ON "student_tutor_assignments"("student_id", "tutor_id", "subject");

-- CreateIndex
CREATE INDEX "classes_tutor_id_idx" ON "classes"("tutor_id");

-- CreateIndex
CREATE INDEX "classes_student_group_idx" ON "classes"("student_group");

-- CreateIndex
CREATE INDEX "classes_start_time_idx" ON "classes"("start_time");

-- CreateIndex
CREATE INDEX "classes_subject_idx" ON "classes"("subject");

-- CreateIndex
CREATE INDEX "classes_status_idx" ON "classes"("status");

-- CreateIndex
CREATE INDEX "sessions_class_id_idx" ON "sessions"("class_id");

-- CreateIndex
CREATE INDEX "onboarding_requests_status_idx" ON "onboarding_requests"("status");

-- CreateIndex
CREATE INDEX "onboarding_requests_email_idx" ON "onboarding_requests"("email");

-- CreateIndex
CREATE INDEX "swap_requests_class_id_idx" ON "swap_requests"("class_id");

-- CreateIndex
CREATE INDEX "swap_requests_status_idx" ON "swap_requests"("status");

-- CreateIndex
CREATE INDEX "swap_requests_proposed_by_tutor_id_idx" ON "swap_requests"("proposed_by_tutor_id");

-- CreateIndex
CREATE INDEX "attendance_class_id_idx" ON "attendance"("class_id");

-- CreateIndex
CREATE INDEX "attendance_student_id_idx" ON "attendance"("student_id");

-- CreateIndex
CREATE INDEX "attendance_date_idx" ON "attendance"("date");

-- CreateIndex
CREATE INDEX "attendance_present_idx" ON "attendance"("present");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_class_id_student_id_date_key" ON "attendance"("class_id", "student_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "student_applications_student_id_key" ON "student_applications"("student_id");

-- CreateIndex
CREATE INDEX "student_applications_phase_idx" ON "student_applications"("phase");

-- CreateIndex
CREATE INDEX "student_applications_medium_idx" ON "student_applications"("medium");

-- CreateIndex
CREATE INDEX "student_applications_district_idx" ON "student_applications"("district");

-- CreateIndex
CREATE INDEX "student_applications_email_idx" ON "student_applications"("email");

-- CreateIndex
CREATE INDEX "student_applications_is_tele_selected_idx" ON "student_applications"("is_tele_selected");

-- CreateIndex
CREATE INDEX "student_applications_is_panel_done_idx" ON "student_applications"("is_panel_done");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "archived_records_record_type_idx" ON "archived_records"("record_type");

-- CreateIndex
CREATE INDEX "archived_records_archived_at_idx" ON "archived_records"("archived_at");

-- AddForeignKey
ALTER TABLE "tutors" ADD CONSTRAINT "tutors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_tutor_assignments" ADD CONSTRAINT "student_tutor_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_tutor_assignments" ADD CONSTRAINT "student_tutor_assignments_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_requests" ADD CONSTRAINT "onboarding_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swap_requests" ADD CONSTRAINT "swap_requests_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swap_requests" ADD CONSTRAINT "swap_requests_proposed_by_tutor_id_fkey" FOREIGN KEY ("proposed_by_tutor_id") REFERENCES "tutors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swap_requests" ADD CONSTRAINT "swap_requests_target_tutor_id_fkey" FOREIGN KEY ("target_tutor_id") REFERENCES "tutors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_phase1_reviewed_by_fkey" FOREIGN KEY ("phase1_reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_phase2_reviewed_by_fkey" FOREIGN KEY ("phase2_reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_phase3_reviewed_by_fkey" FOREIGN KEY ("phase3_reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archived_records" ADD CONSTRAINT "archived_records_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
