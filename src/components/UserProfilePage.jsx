// src/components/UserProfilePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../Auth/AuthContext';
import { API_BASE, API_ORIGIN } from '../config/api';
import defaultAvatar from '../assets/user.png';

const UserProfilePage = () => {
  const { user, login } = useAuth() || {};
  const userId = user?.id;

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthdate: user?.birthdate ? user.birthdate.substring(0, 10) : '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarPath || '');
  const [transactions, setTransactions] = useState([]);
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [newPayout, setNewPayout] = useState({ provider: 'GCASH', accountNumber: '' });
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthdate: user?.birthdate ? user.birthdate.substring(0, 10) : '',
    });
    setAvatarUrl(user?.avatarPath || '');

    const fetchData = async () => {
      try {
        const [txRes, payoutRes] = await Promise.all([
          fetch(`${API_BASE}/user/transactions/${userId}`),
          fetch(`${API_BASE}/user/payout-methods/${userId}`),
        ]);

        const txData = txRes.ok ? await txRes.json() : [];
        const payoutData = payoutRes.ok ? await payoutRes.json() : [];

        setTransactions(Array.isArray(txData) ? txData : []);
        setPayoutMethods(Array.isArray(payoutData) ? payoutData : []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [userId, user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', String(userId));

    try {
      const res = await fetch(`${API_BASE}/user/avatar`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        alert('Failed to upload avatar.');
        return;
      }

      const data = await res.json();
      setAvatarUrl(data.avatarPath || '');
      if (login && user) {
        login({ ...user, avatarPath: data.avatarPath });
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while uploading avatar.');
    }
  };

  const handleProfileSave = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE}/user/profile/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          birthdate: form.birthdate,
        }),
      });

      if (!res.ok) {
        alert('Failed to update profile.');
        return;
      }

      const data = await res.json();
      if (login) {
        login({ ...user, ...data });
      }
      alert('Profile updated.');
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating profile.');
    }
  };

  const handlePasswordSave = async () => {
    if (!userId || !currentPassword || !newPassword) {
      alert('Please enter your current password and a new password.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/user/password/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.status === 401) {
        alert('Current password is incorrect.');
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.message || 'Failed to update password.');
        return;
      }

      alert('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating password.');
    }
  };

  const handleCreatePayout = async () => {
    if (!userId) return;

    if (!/^[0-9]{11}$/.test(newPayout.accountNumber)) {
      alert('Account number must be 11 digits.');
      return;
    }

    try {
      // Only set as default if this is the first payout method
      const isFirstMethod = payoutMethods.length === 0;

      const res = await fetch(`${API_BASE}/user/payout-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          provider: newPayout.provider,
          accountNumber: newPayout.accountNumber,
          isDefault: isFirstMethod,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.message || 'Failed to create payout method.');
        return;
      }

      const method = await res.json();
      // Refresh payout methods from server to ensure consistency
      const updatedRes = await fetch(`${API_BASE}/user/payout-methods/${userId}`);
      const updatedData = updatedRes.ok ? await updatedRes.json() : [];
      setPayoutMethods(Array.isArray(updatedData) ? updatedData : []);
      setShowPayoutModal(false);
      setNewPayout({ provider: 'GCASH', accountNumber: '' });
    } catch (err) {
      console.error(err);
      alert('An error occurred while creating payout method.');
    }
  };

  const handleSetDefaultPayout = async (methodId) => {
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE}/user/payout-methods/${methodId}/default`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.message || 'Failed to set default payout method.');
        return;
      }

      // Refresh payout methods to reflect the new default
      const updatedRes = await fetch(`${API_BASE}/user/payout-methods/${userId}`);
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setPayoutMethods(Array.isArray(updatedData) ? updatedData : []);
      } else {
        // If refresh fails, still update optimistically
        setPayoutMethods((prev) =>
          prev.map((m) => ({
            ...m,
            isDefault: m.id === methodId,
          }))
        );
      }
    } catch (err) {
      console.error('Error setting default payout:', err);
      alert('An error occurred while updating default payout method.');
    }
  };

  const resolvedAvatarUrl = avatarUrl
    ? avatarUrl.startsWith('http')
      ? avatarUrl
      : `${API_ORIGIN}${avatarUrl}`
    : defaultAvatar;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div
              className="relative h-28 w-28 cursor-pointer rounded-full border-4 border-primary bg-slate-100 shadow-sm overflow-hidden"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
              <img
                src={resolvedAvatarUrl}
                alt="User avatar"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity text-[0.65rem] text-white pb-2">
                Change photo
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                ref={fileInputRef}
                className="hidden"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-slate-900">
                {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Your Profile' : 'Guest'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage your personal info, security, and payout details.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
            {/* LEFT PANEL: User Info & Security */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">Profile information</h2>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-left text-slate-600 text-[0.7rem]">
                      First name
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </label>
                    <label className="text-left text-slate-600 text-[0.7rem]">
                      Last name
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </label>
                  </div>
                  <label className="block text-left text-slate-600 text-[0.7rem]">
                    Email address
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
                    />
                  </label>
                  <label className="block text-left text-slate-600 text-[0.7rem]">
                    Phone
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </label>
                  <label className="block text-left text-slate-600 text-[0.7rem]">
                    Birthdate
                    <input
                      type="date"
                      value={form.birthdate}
                      onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </label>
                </div>
                <button
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                  onClick={handleProfileSave}
                >
                  Save profile
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-slate-800">Security</h2>
                <div className="space-y-3 text-xs">
                  <label className="block text-left text-slate-600 text-[0.7rem]">
                    Current password
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </label>
                  <label className="block text-left text-slate-600 text-[0.7rem]">
                    New password
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter a new password"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </label>
                </div>
                <button
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  onClick={handlePasswordSave}
                >
                  Update password
                </button>
              </div>
            </div>

            {/* RIGHT PANELS: Transaction History & Connected Accounts */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">Transaction history</h2>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between border-b border-dashed border-slate-100 pb-1 last:border-0"
                    >
                      <span className="text-slate-700">
                        {t.category} · {Number(t.weightKg || 0).toFixed(2)} kg ·{' '}
                        {Number(t.pointsTotal || 0).toFixed(2)} pts
                      </span>
                      <span className="text-[0.65rem] text-slate-400">
                        {t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="rounded-md bg-slate-50 px-3 py-2 text-[0.7rem] text-slate-500">
                      No transactions yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">Connected payout accounts</h2>
                  <button
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1 text-[0.7rem] font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                    onClick={() => setShowPayoutModal(true)}
                  >
                    Link account
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {payoutMethods.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{m.provider}</span>
                        <span className="text-[0.7rem] text-slate-500">
                          {m.accountNumber} {m.isDefault ? '(Default)' : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSetDefaultPayout(m.id)}
                        disabled={m.isDefault}
                        className={`ml-3 rounded-md border px-3 py-1 text-[0.7rem] font-medium transition ${
                          m.isDefault
                            ? 'border-primary bg-primary text-white cursor-default'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {m.isDefault ? 'Default' : 'Set default'}
                      </button>
                    </div>
                  ))}
                  {payoutMethods.length === 0 && (
                    <div className="rounded-md bg-slate-50 px-3 py-2 text-[0.7rem] text-slate-500">
                      No payout methods linked.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showPayoutModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPayoutModal(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Link payout account</h2>
                <button
                  className="text-slate-400 hover:text-slate-600 transition-colors text-lg"
                  onClick={() => setShowPayoutModal(false)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3 text-xs text-left">
                <label className="block text-[0.7rem] text-slate-600">
                  Wallet provider
                  <select
                    value={newPayout.provider}
                    onChange={(e) => setNewPayout({ ...newPayout, provider: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="GCASH">GCash</option>
                    <option value="MAYA">Maya</option>
                  </select>
                </label>
                <label className="block text-[0.7rem] text-slate-600">
                  Account number
                  <input
                    type="tel"
                    maxLength={11}
                    value={newPayout.accountNumber}
                    onChange={(e) =>
                      setNewPayout({ ...newPayout, accountNumber: e.target.value.replace(/[^0-9]/g, '') })
                    }
                    placeholder="11-digit number"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </label>
                <button
                  className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                  onClick={handleCreatePayout}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserProfilePage;
