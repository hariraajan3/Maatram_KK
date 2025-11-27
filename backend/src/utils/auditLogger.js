const { v4: uuid } = require('uuid');
const dataStore = require('../models/dataStore');

const logAction = (user, action, details) => {
    const log = {
        id: uuid(),
        userId: user ? user.id : 'system',
        userName: user ? user.name : 'System',
        userRole: user ? user.role : 'system',
        action,
        details,
        timestamp: new Date().toISOString(),
    };
    dataStore.auditLogs.unshift(log); // Add to beginning

    // Keep logs size manageable (e.g., last 1000 logs)
    if (dataStore.auditLogs.length > 1000) {
        dataStore.auditLogs.pop();
    }
};

module.exports = { logAction };
