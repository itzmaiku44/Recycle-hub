import React from 'react';
import { useAuth } from '../Auth/AuthContext';

const API_BASE = 'http://localhost:4000/api';

const AuthModal = () => {
  const {
    isAuthOpen,
    authMode,
    openLogin,
    openRegister,
    closeAuth,
    login,
  } = useAuth() || {};

  if (!isAuthOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      // Admin account: hubadmin / admin123
      if (email === 'hubadmin@recyclehub.com' && password === 'admin123') {
        login &&
          login({
            firstName: 'Hub',
            lastName: 'Admin',
            email,
            role: 'ADMIN',
            points: 0,
          });
        closeAuth && closeAuth();
        return;
      }

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        alert('Login failed. Please check your credentials.');
        return;
      }

      const data = await res.json();
      login && login(data);
      closeAuth && closeAuth();
    } catch (err) {
      console.error(err);
      alert('An error occurred while logging in.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const firstName = form.firstName.value;
    const lastName = form.lastName.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const birthdate = form.birthdate.value;
    const password = form.password.value;

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, birthdate, password }),
      });

      if (!res.ok) {
        alert('Registration failed. Please try again.');
        return;
      }

      const data = await res.json();
      login && login(data);
      closeAuth && closeAuth();
    } catch (err) {
      console.error(err);
      alert('An error occurred while registering.');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4 text-sm font-semibold">
            <button
              className={`pb-1 border-b-2 transition-colors ${
                authMode === 'login'
                  ? 'border-primary text-slate-900'
                  : 'border-transparent text-slate-400'
              }`}
              onClick={openLogin}
              type="button"
            >
              Login
            </button>
            <button
              className={`pb-1 border-b-2 transition-colors ${
                authMode === 'register'
                  ? 'border-primary text-slate-900'
                  : 'border-transparent text-slate-400'
              }`}
              onClick={openRegister}
              type="button"
            >
              Register
            </button>
          </div>
          <button
            className="text-slate-400 hover:text-slate-600 transition-colors text-xl"
            onClick={closeAuth}
            type="button"
          >
            ×
          </button>
        </div>

        {authMode === 'login' ? (
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-slate-900">Welcome back</h2>
              <p className="text-xs text-slate-500 mb-2">
                Sign in to access your rewards and dashboard.
              </p>
            </div>
            <div className="space-y-3 text-left text-sm">
              <label className="block">
                <span className="text-slate-600">Email address</span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Password</span>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
            </div>
            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              Log in
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">
              New here?{' '}
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={openRegister}
              >
                Create an account
              </button>
            </p>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div>
              <h2 className="text-xl font-semibold mb-1 text-slate-900">Create your account</h2>
              <p className="text-xs text-slate-500 mb-2">
                Join Recycle Hub and start earning rewards.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left text-sm">
              <label className="block">
                <span className="text-slate-600">First name</span>
                <input
                  name="firstName"
                  type="text"
                  required
                  placeholder="First name"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Last name</span>
                <input
                  name="lastName"
                  type="text"
                  required
                  placeholder="Last name"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
            </div>
            <div className="space-y-3 text-left text-sm">
              <label className="block">
                <span className="text-slate-600">Email address</span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Phone number</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="09xx xxx xxxx"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Birthdate</span>
                <input
                  name="birthdate"
                  type="date"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Password</span>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Create a password"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
            </div>
            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              Sign up
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={openLogin}
              >
                Log in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
