import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const roles = ['Admin', 'Teacher', 'Student', 'Parent'];

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, identifier, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      
      navigate(`/${data.user.role.toLowerCase()}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-surface border border-border shadow-sm rounded-lg">
        <h1 className="text-2xl font-semibold text-text-main text-center mb-6">Login to Samaytrix</h1>
        
        {error && (
          <div className="mb-4 p-3 text-sm text-attendance-absent bg-red-50 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-border rounded focus:outline-none focus:border-primary bg-surface"
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              {role === 'Teacher' ? 'Employee ID' : role === 'Student' ? 'Roll Number' : role === 'Parent' ? 'Contact Number' : 'Email'}
            </label>
            <input 
              type="text" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-2 border border-border rounded focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-border rounded focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-2 px-4 bg-primary text-white font-medium rounded hover:bg-primary-hover transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
