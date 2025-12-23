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
                ipAddress: null, // Would need to get from request
                userAgent: null, // Would need to get from request
            }
        });
    } catch (error) {
        console.error('Failed to log audit action:', error);
        // Don't throw error to avoid breaking the main flow
    }
};

export { logAction };
