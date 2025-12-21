-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TUTOR_LEADS', 'SELECTION_TEAM', 'TUTOR', 'ATTENDANCE_TRACKING_TEAM', 'CLASS_INSPECTION_TEAM');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'INPROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- CreateEnum
CREATE TYPE "StudentPhase" AS ENUM ('Selection', 'Scheduling', 'Attendance', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- CreateEnum
CREATE TYPE "Medium" AS ENUM ('Tamil', 'English');

-- CreateEnum
CREATE TYPE "District" AS ENUM ('Chennai', 'Coimbatore', 'Other');

-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('Physics', 'Maths', 'Chemistry', 'Commerce', 'Economics', 'Accounts', 'Tamil', 'English');

-- CreateEnum
CREATE TYPE "SelectionPhase" AS ENUM ('Phase1_Selection', 'Phase2_Televerification', 'Phase3_PanelInterview');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor" (
    "id" SERIAL NOT NULL,
    "kkId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tutoringSubjects" JSONB NOT NULL,
    "tutoringDistrict" "District" NOT NULL,
    "tutoringMedium" "Medium" NOT NULL,
    "tutorAddress" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "collegeOrCompany" TEXT NOT NULL,
    "alumniOrYearStudying" TEXT NOT NULL,
    "tutoringExperienceYears" INTEGER NOT NULL,
    "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student" (
    "id" SERIAL NOT NULL,
    "kkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolName" TEXT,
    "district" "District",
    "email" TEXT,
    "yearOfStudying" TEXT NOT NULL DEFAULT '12th',
    "tutoringSubjects" JSONB NOT NULL,
    "address" TEXT,
    "class11PublicMarks" JSONB NOT NULL,
    "subjectMarks" JSONB NOT NULL,
    "parentName" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduling" (
    "id" SERIAL NOT NULL,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "scheduleAt" TIMESTAMP(3) NOT NULL,
    "subject" "Subject" NOT NULL,
    "medium" "Medium" NOT NULL,
    "district" "District" NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "meetLink" TEXT,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_attendance" (
    "id" SERIAL NOT NULL,
    "schedulingId" INTEGER NOT NULL,
    "classDate" TIMESTAMP(3) NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "attendanceMarked" BOOLEAN NOT NULL DEFAULT false,
    "attendanceStatus" "AttendanceStatus",
    "remarks" TEXT,
    "totalStudents" INTEGER,

    CONSTRAINT "student_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overall_attendance" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "totalClasses" INTEGER NOT NULL,
    "classesAttended" INTEGER NOT NULL,
    "attendancePercentage" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "overall_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_swap_requests" (
    "id" SERIAL NOT NULL,
    "schedulingId" INTEGER NOT NULL,
    "requestedByTutorId" INTEGER NOT NULL,
    "requestedToTutorId" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_swap_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rescheduling_requests" (
    "id" SERIAL NOT NULL,
    "schedulingId" INTEGER NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "requestedTime" TEXT NOT NULL,
    "reason" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rescheduling_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_cancellations" (
    "id" SERIAL NOT NULL,
    "schedulingId" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_invitations" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "medium" "Medium" NOT NULL,
    "district" "District" NOT NULL,
    "subject" "Subject" NOT NULL,
    "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'pending',
    "invitedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedOn" TIMESTAMP(3),

    CONSTRAINT "tutor_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_kkId_key" ON "tutor"("kkId");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_userId_key" ON "tutor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student_kkId_key" ON "student"("kkId");

-- CreateIndex
CREATE UNIQUE INDEX "student_attendance_schedulingId_studentId_key" ON "student_attendance"("schedulingId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "overall_attendance_studentId_subject_key" ON "overall_attendance"("studentId", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_invitations_email_key" ON "tutor_invitations"("email");

-- AddForeignKey
ALTER TABLE "tutor" ADD CONSTRAINT "tutor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling" ADD CONSTRAINT "scheduling_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_schedulingId_fkey" FOREIGN KEY ("schedulingId") REFERENCES "scheduling"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overall_attendance" ADD CONSTRAINT "overall_attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_swap_requests" ADD CONSTRAINT "class_swap_requests_schedulingId_fkey" FOREIGN KEY ("schedulingId") REFERENCES "scheduling"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rescheduling_requests" ADD CONSTRAINT "rescheduling_requests_schedulingId_fkey" FOREIGN KEY ("schedulingId") REFERENCES "scheduling"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_cancellations" ADD CONSTRAINT "class_cancellations_schedulingId_fkey" FOREIGN KEY ("schedulingId") REFERENCES "scheduling"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
