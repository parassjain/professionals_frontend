import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ProfessionalRoute from './components/ProfessionalRoute';
import AdminRoute from './components/AdminRoute';
import LoadingSpinner from './components/LoadingSpinner';
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const Categories = lazy(() => import('./pages/Categories'));
const Professionals = lazy(() => import('./pages/Professionals'));
const ProfessionalDetail = lazy(() => import('./pages/ProfessionalDetail'));
const BecomeProfessional = lazy(() => import('./pages/BecomeProfessional'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetail = lazy(() => import('./pages/JobDetail'));
const JobForm = lazy(() => import('./pages/JobForm'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const FAQ = lazy(() => import('./pages/FAQ'));
const UserPublicDetail = lazy(() => import('./pages/UserPublicDetail'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Legal = lazy(() => import('./pages/Legal'));

function PageLoader() {
  return (
    <div className="section">
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <LoadingSpinner />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <BrowserRouter>
        <AuthProvider>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/auth/google/callback" element={<GoogleCallback />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/professionals" element={<Professionals />} />
                      <Route path="/professionals/:id" element={<ProfessionalDetail />} />
                      <Route path="/jobs" element={<ProfessionalRoute><Jobs /></ProfessionalRoute>} />
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
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/users/:public_id" element={<UserPublicDetail />} />
                      <Route path="/verify-email" element={<VerifyEmail />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/legal" element={<Legal />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </main>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
