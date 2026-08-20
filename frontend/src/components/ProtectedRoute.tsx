import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || !role) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // If logged in but wrong role, send to their actual role dashboard
    return <Navigate to={`/${role.toLowerCase()}`} replace />;
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar role={role} />
      <div className="flex-1 overflow-auto p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedRoute;
