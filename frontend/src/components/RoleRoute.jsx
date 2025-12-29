import { Navigate, useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Component to protect routes based on user roles
 * Redirects to home page if user doesn't have required role
 *
 * @param {string[]} allowedRoles - Array of role names that can access this route
 * @param {ReactNode} children - Route content
 * @param {string} fallbackPath - Path to redirect to if not authorized (default: /)
 */
const RoleRoute = ({ allowedRoles, children, fallbackPath = '/' }) => {
    const { user } = useOutletContext();

    // User not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }
// frontend_rbac

    // User doesn't have required role

// main
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Log unauthorized access attempt
        console.warn(
            `User with role "${user.role}" attempted to access route restricted to roles: ${allowedRoles.join(', ')}`
        );
        return <Navigate to={fallbackPath} replace />;
    }
    return children;
};

RoleRoute.propTypes = {
    allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
    children: PropTypes.node.isRequired,
    fallbackPath: PropTypes.string,
};

export default RoleRoute;
