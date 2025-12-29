import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import PropTypes from "prop-types";

/**
 * Component to protect content based on permissions
 * @param {string|string[]} permission - Single permission or array of permissions
 * @param {string} requireAll - If true, all permissions required; if false, any permission
 * @param {ReactNode} children - Content to render if authorized
 * @param {ReactNode} fallback - Fallback UI if not authorized (default: redirect to /403)
 */
export default function RequirePermission({
  permission,
  requireAll = false,
  children,
  fallback = null,
}) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = useAuth();

  let isAuthorized = false;

  if (Array.isArray(permission)) {
    if (requireAll) {
      isAuthorized = hasAllPermissions(permission);
    } else {
      isAuthorized = hasAnyPermission(permission);
    }
  } else {
    isAuthorized = hasPermission(permission);
  }

  if (!isAuthorized) {
    return fallback !== null ? fallback : <Navigate to="/403" replace />;
  }

  return children;
}

RequirePermission.propTypes = {
  permission: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  requireAll: PropTypes.bool,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};
