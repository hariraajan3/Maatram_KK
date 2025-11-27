const dataStore = require('../models/dataStore');
const { logAction } = require('../utils/auditLogger');

const getAuditLogs = (req, res) => {
    res.json({ logs: dataStore.auditLogs });
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

const assignRole = (req, res) => {
    const { userId, newRole } = req.body;
    const user = dataStore.users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = newRole;

    logAction(req.user, 'ASSIGN_ROLE', `Changed role for ${user.name} from ${oldRole} to ${newRole}`);

    res.json({ user });
};

module.exports = {
    getAuditLogs,
    getRoles,
    updateRolePermissions,
    assignRole
};
