import { HashRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleCallback from './pages/GoogleCallback';
import Categories from './pages/Categories';
import Professionals from './pages/Professionals';
import ProfessionalDetail from './pages/ProfessionalDetail';
import BecomeProfessional from './pages/BecomeProfessional';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import JobForm from './pages/JobForm';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <HashRouter>
        <AuthProvider>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/professionals" element={<Professionals />} />
                <Route path="/professionals/:id" element={<ProfessionalDetail />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route
                  path="/jobs/create"
                  element={<ProtectedRoute><JobForm /></ProtectedRoute>}
                />
                <Route
                  path="/jobs/:id/edit"
                  element={<ProtectedRoute><JobForm /></ProtectedRoute>}
                />
                <Route
                  path="/profile"
                  element={<ProtectedRoute><Profile /></ProtectedRoute>}
                />
                <Route
                  path="/become-professional"
                  element={<ProtectedRoute><BecomeProfessional /></ProtectedRoute>}
                />
                <Route
                  path="/admin"
                  element={<AdminRoute><AdminDashboard /></AdminRoute>}
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </HashRouter>
    </GoogleOAuthProvider>
  );
}
