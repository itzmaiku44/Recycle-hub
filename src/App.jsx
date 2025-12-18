// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './Auth/AuthContext';
import AuthModal from './hooks/AuthModal';

// Import the two pages we want to switch between
import LandingPage from './components/LandingPage'; 
import UserProfilePage from './components/UserProfilePage';
import SchedulePage from './components/SchedulePage';
import RewardsPage from './components/RewardsPage';
import MapPage from './components/MapPage';
import UserAnalysisPage from './components/UserAnalysisPage';
import AboutPage from './components/AboutPage';
import AdminDashboard from './components/admin/rhdash';
import TradePage from './components/TradePage';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const isSchedulePage = location.pathname === '/Collection Schedules';

  const appClassName = isSchedulePage ? 'App app-schedule-bg' : 'App';

  return (
    <div className={appClassName}>
      <Routes>
        {/* path for Landing Page (Home) */}
        <Route path="/" element={<LandingPage />} />

        {/* Public pages */}
        <Route path="/Collection Schedules" element={<SchedulePage />} />
        <Route path="/Hub Location" element={<MapPage />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Protected routes - require login */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Redeem Rewards"
          element={
            <ProtectedRoute>
              <RewardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Waste Management Analysis"
          element={
            <ProtectedRoute>
              <UserAnalysisPage />
            </ProtectedRoute>
          }
        />

        {/* Protected route - require admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <AuthModal />
      </AuthProvider>
    </Router>
  );
}

export default App;
