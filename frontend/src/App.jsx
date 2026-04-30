import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Tasks from './pages/Tasks';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';

const AuthRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status" aria-label="Loading"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
};

const MainLayout = ({ children }) => {
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px' }}>{children}</main>
    </div>
  );
};

const ProtectedPage = ({ children }) => (
  <ProtectedRoute>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
);

const App = () => {
  return (
    <>
      <style>{`
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; }
        .sidebar-active { background: rgba(255,255,255,0.18); border-left: 3px solid #fff; }
        aside nav a:hover { background: rgba(255,255,255,0.1); }
        .table thead th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d; background: #f8f9fa; }
      `}</style>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<AuthRedirect />} />
        <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
        <Route path="/employees" element={<ProtectedPage><Employees /></ProtectedPage>} />
        <Route path="/tasks" element={<ProtectedPage><Tasks /></ProtectedPage>} />
        <Route path="/attendance" element={<ProtectedPage><Attendance /></ProtectedPage>} />
        <Route path="/reports" element={<ProtectedPage><Reports /></ProtectedPage>} />
      </Routes>
    </>
  );
};

export default App;
