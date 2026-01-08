import prisma from '../../lib/prisma.js';

export const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                admin: true,
                tutorLead: true,
                tutor: true,
                selectionTeam: true,
                attendanceTrackingTeam: true,
                classInspectionTeam: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Flatten the role-specific data
        let profileDetails = {};
        if (user.role === 'ADMIN' && user.admin) profileDetails = user.admin;
        if (user.role === 'TUTOR_LEAD' && user.tutorLead) profileDetails = user.tutorLead;
        if (user.role === 'TUTOR' && user.tutor) profileDetails = user.tutor;
        if (user.role === 'SELECTION_TEAM' && user.selectionTeam) profileDetails = user.selectionTeam;
        if (user.role === 'ATTENDANCE_TRACKING_TEAM' && user.attendanceTrackingTeam) profileDetails = user.attendanceTrackingTeam;
        if (user.role === 'CLASS_INSPECTION_TEAM' && user.classInspectionTeam) profileDetails = user.classInspectionTeam;

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                ...profileDetails
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {
            phoneNumber,
            collegeOrCompany,
            companyOrOrg,
            tutorAddress,
            yearOfStudyingOrAlumni,
            alumniOrYearStudying,
            tutoringExperienceYears,
            tutoringDistrict,
            meetLink
        } = req.body;

        // Get current user to know the role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                admin: true,
                tutorLead: true,
                tutor: true,
                selectionTeam: true,
                attendanceTrackingTeam: true,
                classInspectionTeam: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update role-specific data
        if (user.role === 'ADMIN' && user.admin) {
            await prisma.admin.update({
                where: { id: user.admin.id },
                data: { phoneNumber, companyOrOrg }
            });
        } else if (user.role === 'TUTOR_LEAD' && user.tutorLead) {
            await prisma.tutorLead.update({
                where: { id: user.tutorLead.id },
                data: { phoneNumber, collegeOrCompany, yearOfStudyingOrAlumni }
            });
        } else if (user.role === 'TUTOR' && user.tutor) {
            await prisma.tutor.update({
                where: { id: user.tutor.id },
                data: {
                    phoneNumber,
                    collegeOrCompany,
                    tutorAddress,
                    alumniOrYearStudying,
                    tutoringDistrict,
                    tutoringExperienceYears: tutoringExperienceYears ? parseInt(tutoringExperienceYears) : undefined,
                    meetLink
                }
            });
        } else if (user.role === 'SELECTION_TEAM' && user.selectionTeam) {
            await prisma.selectionTeam.update({
                where: { id: user.selectionTeam.id },
                data: { phoneNumber, collegeOrCompany, yearOfStudyingOrAlumni }
            });
        } else if (user.role === 'ATTENDANCE_TRACKING_TEAM' && user.attendanceTrackingTeam) {
            await prisma.attendanceTrackingTeam.update({
                where: { id: user.attendanceTrackingTeam.id },
                data: { phoneNumber, collegeOrCompany, yearOfStudyingOrAlumni }
            });
        } else if (user.role === 'CLASS_INSPECTION_TEAM' && user.classInspectionTeam) {
            await prisma.classInspectionTeam.update({
                where: { id: user.classInspectionTeam.id },
                data: { phoneNumber, collegeOrCompany, yearOfStudyingOrAlumni }
            });
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        next(error);
    }
};
