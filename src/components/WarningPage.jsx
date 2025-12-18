import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../Auth/AuthContext';

const WarningPage = () => {
  const navigate = useNavigate();
  const { openLogin } = useAuth() || {};

  const handleLogin = () => {
    if (openLogin) {
      openLogin();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 75px)', height: 'calc(100vh - 75px)', display: 'flex', flexDirection: 'column' }}>
        <div className="max-w-md text-center bg-white border border-slate-200 rounded-2xl px-8 py-10 shadow-lg">
          <div className="mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">Authentication Required</h1>
            <p className="text-sm text-slate-600">
              You need to be logged in to access this page. Please login to continue.
            </p>
          </div>
          
        </div>
      </main>
    </>
  );
};

export default WarningPage;
