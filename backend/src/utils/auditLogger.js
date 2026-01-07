import prisma from '../../lib/prisma.js';

const logAction = async (user, action, description, entityType = null, entityId = null, oldData = null, newData = null) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId: user ? user.id : null,
                action,
                entityType,
                entityId,
                description,
                oldData,
                newData,
                ipAddress: null,
                userAgent: null,
            }
        });
    } catch (error) {
        console.error('Failed to log audit action:', error);
    }
};

export { logAction };
