import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import ProtectedRoute from './components/ProtectedRoute';

import TimetablePage from './pages/TimetablePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Protected Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Teacher']} />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
        </Route>

        {/* Protected Parent Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Parent']} />}>
          <Route path="/parent" element={<ParentDashboard />} />
        </Route>

        {/* Shared Timetable Route */}
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Teacher', 'Student', 'Parent']} />}>
          <Route path="/timetable" element={<TimetablePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
