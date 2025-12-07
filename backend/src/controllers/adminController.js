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

const getUsers = (req, res) => {
    // Return users without sensitive data (passwordHash)
    const users = dataStore.users.map(({ passwordHash, ...user }) => user);
    res.json({ users });
};

const deleteUser = (req, res) => {
    const { userId } = req.params;
    const userIndex = dataStore.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    const user = dataStore.users[userIndex];
    
    // Prevent deleting yourself
    if (user.id === req.user.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Remove user from users array
    dataStore.users.splice(userIndex, 1);

    // Also remove from tutors if exists
    const tutorIndex = dataStore.tutors.findIndex(t => t.id === userId);
    if (tutorIndex !== -1) {
        dataStore.tutors.splice(tutorIndex, 1);
    }

    logAction(req.user, 'DELETE_USER', `Deleted user ${user.name} (${user.email}) with role ${user.role}`);

    res.json({ message: 'User deleted successfully', userId });
};

module.exports = {
    getAuditLogs,
    getRoles,
    updateRolePermissions,
    assignRole,
    getUsers,
    deleteUser
};
