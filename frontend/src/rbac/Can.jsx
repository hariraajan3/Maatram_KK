import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";

/**
 * Component to conditionally render content based on permissions
 * Does not redirect, just hides content - useful for UI elements
 *
 * @param {string|string[]} permission - Single permission or array of permissions
 * @param {string} role - Single role or array of roles to check against
 * @param {boolean} requireAll - If true, all permissions required; if false, any permission
 * @param {ReactNode} children - Content to render if authorized
 * @param {ReactNode} fallback - Fallback UI if not authorized (default: null)
 */
export default function Can({
  permission,
  role,
  requireAll = false,
  children,
  fallback = null,
}) {
  const { hasPermission, hasRole, hasAllPermissions, hasAnyPermission } = useAuth();

  let isAuthorized = false;

  // Check role first if provided
  if (role) {
    isAuthorized = hasRole(role);
  } else if (permission) {
    // Check permissions
    if (Array.isArray(permission)) {
      if (requireAll) {
        isAuthorized = hasAllPermissions(permission);
      } else {
        isAuthorized = hasAnyPermission(permission);
      }
    } else {
      isAuthorized = hasPermission(permission);
    }
  }

  return isAuthorized ? <>{children}</> : fallback;
}

Can.propTypes = {
  permission: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  role: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  requireAll: PropTypes.bool,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};
