import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AppLayout from '../layout/AppLayout';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyEmail from '../pages/auth/VerifyEmail';

import Dashboard from '../pages/dashboard/Dashboard';
import ApplicationsList from '../pages/applications/ApplicationsList';
import ApplicationCreate from '../pages/applications/ApplicationCreate';
import ApplicationDetails from '../pages/applications/ApplicationDetails';
import ResumeList from '../pages/resume/ResumeList';
import ResumeGenerate from '../pages/resume/ResumeGenerate';
import CoverLetterList from '../pages/coverLetters/CoverLetterList';
import CoverLetterGenerate from '../pages/coverLetters/CoverLetterGenerate';
import Profile from '../pages/profile/Profile';
import ResetPassword from '../pages/auth/ResetPassword';
import ForgotPassword from '../pages/auth/ForgotPassword';
import { useAuthContext } from '../context/AuthContext';
import JobsPage from '../pages/job/JobsPage';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
       <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected — all share AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>

        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/applications" element={<ApplicationsList />} />
        <Route path="/applications/new" element={<ApplicationCreate />} />
        <Route path="/applications/:id" element={<ApplicationDetails />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/resumes" element={<ResumeList />} />
        <Route path="/resumes/generate" element={<ResumeGenerate />} />
        <Route path="/cover-letters" element={<CoverLetterList />} />
        <Route path="/cover-letters/generate" element={<CoverLetterGenerate />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;