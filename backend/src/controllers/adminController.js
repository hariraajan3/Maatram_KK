import prisma from '../../lib/prisma.js';
import { logAction } from '../utils/auditLogger.js';

const getAuditLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, entityType } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (userId) where.userId = userId;
        if (action) where.action = action;
        if (entityType) where.entityType = entityType;

        const logs = await prisma.auditLog.findMany({
            where,
            skip,
            take: parseInt(limit)
        });

        const userIds = [...new Set(logs.map(log => log.userId).filter(id => id))];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, role: true }
        });

        const userMap = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});

        const logsWithUser = logs.map(log => ({
            ...log,
            userName: userMap[log.userId]?.name || 'Unknown',
            userEmail: userMap[log.userId]?.email || '',
            userRole: userMap[log.userId]?.role || ''
        }));

        const total = await prisma.auditLog.count({ where });

        res.json({
            logs: logsWithUser,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};


const getUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                tutor: {
                    select: {
                        id: true,
                        onboardingStatus: true,
                        tutoringMedium: true,
                        tutoringDistrict: true,
                        tutoringSubjects: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ users });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting yourself
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Delete user (cascade will handle related records)
        await prisma.user.updateOne({
            where: { id: userId },
            data: { isActive: false }
        });

        logAction(req.user, 'DELETE_USER', `Deleted user ${user.name} (${user.email}) with role ${user.role}`, 'User', userId);

        res.json({ message: 'User deleted successfully', userId });
    } catch (error) {
        next(error);
    }
};

export {
    getAuditLogs,
    getUsers,
    deleteUser
};
