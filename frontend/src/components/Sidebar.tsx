import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  role: string;
}

const Sidebar = ({ role }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="w-64 h-screen bg-surface border-r border-border p-4 flex flex-col">
      <div className="text-xl font-bold text-text-main mb-8">Samaytrix</div>
      <nav className="flex-1 space-y-2">
        <div className="px-4 py-2 text-primary font-medium bg-background rounded-md">
          Dashboard
        </div>
        {/* Placeholder for more links */}
      </nav>
      <div className="pt-4 border-t border-border">
        <div className="mb-2 text-sm text-text-muted px-4">Logged in as {role}</div>
        <button 
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-text-main hover:bg-background rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
