import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FounderPage from './pages/FounderPage';
import WorksPage from './pages/WorksPage';
import WorksDetailPage from './pages/WorksDetailPage';
import UploadPage from './pages/UploadPage';
import AdminPage from './pages/AdminPage';
import MembershipPage from './pages/MembershipPage';
import AdminMembershipPage from './pages/AdminMembershipPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminWorksPage from './pages/AdminWorksPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* 登录注册页面 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* 主要页面 */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="works" element={<WorksPage />} />
              <Route path="works/:category" element={<WorksPage />} />
              <Route path="work/:slug" element={<WorksDetailPage />} />
              <Route path="membership" element={<MembershipPage />} />
              <Route path="founder" element={<FounderPage />} />
              
              {/* 需要登录的页面 */}
              <Route path="upload" element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              } />
              
              {/* 管理员页面 */}
              <Route path="admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsersPage />
                </ProtectedRoute>
              } />
              <Route path="admin/works" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminWorksPage />
                </ProtectedRoute>
              } />
              <Route path="admin/membership" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminMembershipPage />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;