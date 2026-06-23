import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CapturePage from './pages/CapturePage';
import AttendancePage from './pages/AttendancePage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import StudentsPage from './pages/StudentsPage';
import ClassesPage from './pages/ClassesPage';
import SchedulesPage from './pages/SchedulesPage';
import RegistrationsPage from './pages/RegistrationsPage';
import NotificationsPage from './pages/NotificationsPage';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/capture"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <CapturePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/:sessionId"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentsPage /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><ClassesPage /></ProtectedRoute>} />
          <Route path="/schedules" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><SchedulesPage /></ProtectedRoute>} />
          <Route path="/registrations" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><RegistrationsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
