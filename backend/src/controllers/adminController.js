import prisma from '../../lib/prisma.js';
import { logAction } from '../utils/auditLogger.js';

const getAuditLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, userId, action, entityType } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (userId) where.userId = userId;
        if (action) where.action = action;
        if (entityType) where.entityType = entityType;

        const logs = await prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit)
        });

        const total = await prisma.auditLog.count({ where });

        res.json({
            logs,
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

const getRoles = (req, res) => {
    res.json({ roles: dataStore.roles });
};

const updateRolePermissions = (req, res) => {
    const { roleName, permissions } = req.body;
    const role = dataStore.roles.find(r => r.name === roleName);

    if (!role) {
        return res.status(404).json({ message: 'Role not found' });
    }

    const oldPermissions = [...role.permissions];
    role.permissions = permissions;

    logAction(req.user, 'UPDATE_ROLE_PERMISSIONS', `Updated permissions for ${roleName} from [${oldPermissions}] to [${permissions}]`);

    res.json({ role });
};

const assignRole = async (req, res, next) => {
    try {
        const { userId, newRole } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const oldRole = user.role;

        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });

        logAction(req.user, 'ASSIGN_ROLE', `Changed role for ${user.name} from ${oldRole} to ${newRole}`, 'User', userId);

        res.json({ message: 'Role updated successfully' });
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
                lastLoginAt: true,
                createdAt: true,
                tutor: {
                    select: {
                        id: true,
                        status: true,
                        medium: true,
                        district: true,
                        subjects: true
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
        await prisma.user.delete({
            where: { id: userId }
        });

        logAction(req.user, 'DELETE_USER', `Deleted user ${user.name} (${user.email}) with role ${user.role}`, 'User', userId);

        res.json({ message: 'User deleted successfully', userId });
    } catch (error) {
        next(error);
    }
};

export {
    getAuditLogs,
    getRoles,
    updateRolePermissions,
    assignRole,
    getUsers,
    deleteUser
};
