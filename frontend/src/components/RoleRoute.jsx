import { Navigate, useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';

const RoleRoute = ({ allowedRoles, children }) => {
    const { user } = useOutletContext();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to home if user doesn't have permission
        return <Navigate to="/" replace />;
    }

    return children;
};

RoleRoute.propTypes = {
    allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
    children: PropTypes.node.isRequired,
};

export default RoleRoute;
