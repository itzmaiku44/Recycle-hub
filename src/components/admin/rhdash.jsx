import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import { useAuth } from '../../Auth/AuthContext';

const API_BASE = 'http://localhost:4000/api';

const AdminDashboard = () => {
  const { user } = useAuth() || {};
  const isAdmin = user?.role === 'ADMIN';

  const [schedules, setSchedules] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    location: '',
    startAt: '',
    endAt: '',
  });
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cartForm, setCartForm] = useState({
    category: 'PLASTIC',
    weightKg: '',
  });

  const [transactions, setTransactions] = useState([]);

  const [userMgmtOpen, setUserMgmtOpen] = useState(false);
  const [userMgmtList, setUserMgmtList] = useState([]);
  const [selectedUserMgmt, setSelectedUserMgmt] = useState(null);
  const [userMgmtQuery, setUserMgmtQuery] = useState('');
  const [userMgmtSuggestions, setUserMgmtSuggestions] = useState([]);

  const [redeemsOpen, setRedeemsOpen] = useState(false);
  const [redeems, setRedeems] = useState([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchSchedules();
      fetchTransactions();
    }
  }, [isAdmin]);

  const fetchSchedules = async () => {
    try {
      const res = await fetch(`${API_BASE}/schedules`);
      const data = await res.json();
      setSchedules(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/transactions`);
      const data = await res.json();
      // Backend returns ascending by createdAt; show most recent first in table
      const ordered = Array.isArray(data) ? [...data].reverse() : [];
      setTransactions(ordered);
    } catch (e) {
      console.error(e);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...scheduleForm };
      const method = editingScheduleId ? 'PUT' : 'POST';
      const url = editingScheduleId
        ? `${API_BASE}/admin/schedules/${editingScheduleId}`
        : `${API_BASE}/admin/schedules`;

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setScheduleForm({
        title: '',
        description: '',
        location: '',
        startAt: '',
        endAt: '',
      });
      setEditingScheduleId(null);
      setScheduleModalOpen(false);
      fetchSchedules();
    } catch (e) {
      console.error(e);
    }
  };

  const startEditSchedule = (s) => {
    setEditingScheduleId(s.id);
    setScheduleForm({
      title: s.title,
      description: s.description || '',
      location: s.location,
      startAt: s.startAt?.slice(0, 16) || '',
      endAt: s.endAt ? s.endAt.slice(0, 16) : '',
    });
  };

  const searchUsers = async (q) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUserSuggestions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUserSearchChange = (e) => {
    const value = e.target.value;
    setUserQuery(value);
    setSelectedUser(null);
    if (value.length >= 2) {
      searchUsers(value);
    } else {
      setUserSuggestions([]);
    }
  };

  const handleCreateCart = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await fetch(`${API_BASE}/admin/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          category: cartForm.category,
          weightKg: parseFloat(cartForm.weightKg),
        }),
      });
      setCartForm({ category: 'PLASTIC', weightKg: '' });
      setSelectedUser(null);
      setUserQuery('');
      setUserSuggestions([]);
      setCartModalOpen(false);
      fetchTransactions();
    } catch (e) {
      console.error(e);
    }
  };

  const searchUserManagement = async (q) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUserMgmtSuggestions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUserMgmtSearchChange = (e) => {
    const value = e.target.value;
    setUserMgmtQuery(value);
    setSelectedUserMgmt(null);
    if (value.length >= 2) {
      searchUserManagement(value);
    } else {
      setUserMgmtSuggestions([]);
    }
  };

  const openUserManagement = () => {
    setUserMgmtOpen(true);
    setUserMgmtQuery('');
    setUserMgmtSuggestions([]);
    setSelectedUserMgmt(null);
  };

  const saveUserManagement = async () => {
    if (!selectedUserMgmt) return;
    try {
      await fetch(`${API_BASE}/admin/users/${selectedUserMgmt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: selectedUserMgmt.points,
          password: selectedUserMgmt.newPassword || undefined,
          isActive: selectedUserMgmt.isActive,
        }),
      });
      setSelectedUserMgmt(null);
      openUserManagement();
    } catch (e) {
      console.error(e);
    }
  };

  const openRedeems = async () => {
    setRedeemsOpen(true);
    try {
      const res = await fetch(`${API_BASE}/admin/redemptions`);
      const data = await res.json();
      setRedeems(data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateRedeemStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/admin/redemptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      openRedeems();
    } catch (e) {
      console.error(e);
    }
  };

  const scrollStyles = `
    .admin-scroll {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
    }
    .admin-scroll::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
  `;

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 75px)', height: 'calc(100vh - 75px)', display: 'flex', flexDirection: 'column' }}>
          <div className="max-w-md text-center bg-white/80 border border-slate-100 rounded-2xl px-6 py-5 shadow-sm">
            <h1 className="text-lg font-semibold text-slate-900 mb-1">Admin access only</h1>
            <p className="text-xs text-slate-500">
              Please log in with an authorized administrator account to view this page.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar showUserMenu={true} userName={user?.firstName || 'hubadmin'} />
      <main className="bg-slate-50 overflow-hidden" style={{ minHeight: 'calc(100vh - 80px)', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
        <style>{scrollStyles}</style>
        <div className="mx-auto max-w-6xl px-4 py-6 flex-1 flex flex-col overflow-hidden w-full">
          <div className="flex flex-col gap-1 mb-4 flex-shrink-0">
            <h1 className="text-2xl font-semibold text-slate-900">Recycle Hub Admin Dashboard</h1>
            <p className="text-xs text-slate-500">
              Manage collection schedules, recycle cart entries, users, and reward redemptions.
            </p>
          </div>

          {/* Top action cards: manage users, redeems, schedule, cart */}
          <section className="grid gap-6 lg:grid-cols-2 flex-shrink-0 mb-6">
            <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 mb-1">User management</h2>
                <p className="text-[0.7rem] text-slate-500">
                  View and edit user status, points, and credentials.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                onClick={openUserManagement}
              >
                Manage users
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 mb-1">Redeems</h2>
                <p className="text-[0.7rem] text-slate-500">
                  Review and process reward redemption requests.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                onClick={openRedeems}
              >
                View redeems
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 mb-1">Create schedule</h2>
                <p className="text-[0.7rem] text-slate-500">
                  Add or update collection schedules for upcoming routes.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                onClick={() => {
                  setEditingScheduleId(null);
                  setScheduleForm({
                    title: '',
                    description: '',
                    location: '',
                    startAt: '',
                    endAt: '',
                  });
                  setScheduleModalOpen(true);
                }}
              >
                Create schedule
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 mb-1">Add cart entry</h2>
                <p className="text-[0.7rem] text-slate-500">
                  Record a new recycling transaction for a user.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                onClick={() => setCartModalOpen(true)}
              >
                Add cart
              </button>
            </div>
          </section>

          {/* Bottom tables: upcoming schedules & cart history */}
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm overflow-hidden">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Upcoming schedules</h2>
              <div className="max-h-64 admin-scroll overflow-y-auto text-xs">
                <table className="min-w-full border-separate border-spacing-y-1">
                  <thead className="text-[0.7rem] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-1 text-left">Title</th>
                      <th className="px-3 py-1 text-left">Location</th>
                      <th className="px-3 py-1 text-left">Start</th>
                      <th className="px-3 py-1 text-left">End</th>
                      <th className="px-3 py-1 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr
                        key={s.id}
                        className="bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
                      >
                        <td className="px-3 py-1.5 text-slate-800">{s.title}</td>
                        <td className="px-3 py-1.5 text-slate-700">{s.location}</td>
                        <td className="px-3 py-1.5 text-[0.7rem] text-slate-500">
                          {new Date(s.startAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-1.5 text-[0.7rem] text-slate-500">
                          {s.endAt ? new Date(s.endAt).toLocaleString() : '-'}
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              startEditSchedule(s);
                              setScheduleModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center rounded-md border border-slate-200 px-2 py-0.5 text-[0.65rem] font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                    {schedules.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-2 text-[0.7rem] text-slate-500"
                        >
                          No active schedules yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm overflow-hidden">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Cart recycle history</h2>
              <div className="max-h-64 admin-scroll overflow-y-auto text-xs">
                <table className="min-w-full border-separate border-spacing-y-1">
                  <thead className="text-[0.7rem] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-1 text-left">Date &amp; time</th>
                      <th className="px-3 py-1 text-left">User</th>
                      <th className="px-3 py-1 text-left">Category</th>
                      <th className="px-3 py-1 text-right">Weight (kg)</th>
                      <th className="px-3 py-1 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr
                        key={t.id}
                        className="bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
                      >
                        <td className="px-3 py-1.5 text-[0.7rem] text-slate-500">
                          {new Date(t.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-1.5 text-slate-700">
                          {t.user ? `${t.user.firstName} ${t.user.lastName}` : '-'}
                        </td>
                        <td className="px-3 py-1.5 text-slate-700">{t.category}</td>
                        <td className="px-3 py-1.5 text-right text-slate-700">
                          {Number(t.weightKg || 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-1.5 text-right text-slate-700">
                          {Number(t.pointsTotal || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-2 text-[0.7rem] text-slate-500"
                        >
                          No cart entries recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Create / edit schedule modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-[15%]" onClick={() => setScheduleModalOpen(false)}>
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">
                {editingScheduleId ? 'Edit collection schedule' : 'Create collection schedule'}
              </h2>
              <button
                className="text-slate-400 hover:text-slate-600 transition-colors text-lg"
                onClick={() => setScheduleModalOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <form
              onSubmit={handleScheduleSubmit}
              className="grid gap-2 text-xs"
            >
              <label className="block text-[0.7rem] text-slate-600 text-left">
                Title
                <input
                  type="text"
                  placeholder="Title"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              <label className="block text-[0.7rem] text-slate-600 text-left">
                Location
                <input
                  type="text"
                  placeholder="Location"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              <label className="block text-[0.7rem] text-slate-600 text-left">
                Description
                <textarea
                  placeholder="Optional description"
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none min-h-[60px]"
                />
              </label>
              <label className="block text-[0.7rem] text-slate-600 text-left">
                Start time
                <input
                  type="datetime-local"
                  value={scheduleForm.startAt}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startAt: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              <label className="block text-[0.7rem] text-slate-600 text-left">
                End time (optional)
                <input
                  type="datetime-local"
                  value={scheduleForm.endAt}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endAt: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              <button
                type="submit"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
              >
                {editingScheduleId ? 'Update schedule' : 'Create schedule'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {cartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-[15%]" onClick={() => setCartModalOpen(false)}>
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-semibold text-slate-800 mb-3">New cart entry</h2>
            <form className="space-y-3 text-xs" onSubmit={handleCreateCart}>
              <label className="block text-[0.7rem] text-slate-600 text-left">
                Search user (email or first name)
                <input
                  type="text"
                  value={userQuery}
                  onChange={handleUserSearchChange}
                  placeholder="Type to search user"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              {userSuggestions.length > 0 && !selectedUser && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white text-xs">
                  {userSuggestions.map((u) => (
                    <div
                      key={u.id}
                      className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-slate-700 text-[0.7rem]"
                      onClick={() => {
                        setSelectedUser(u);
                        setUserQuery(`${u.firstName} ${u.lastName} (${u.email})`);
                        setUserSuggestions([]);
                      }}
                    >
                      {u.firstName} {u.lastName} – {u.email}
                    </div>
                  ))}
                </div>
              )}

              <label className="block text-[0.7rem] text-slate-600 text-left">
                Category type
                <select
                  value={cartForm.category}
                  onChange={(e) => setCartForm({ ...cartForm, category: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="PLASTIC">Plastic</option>
                  <option value="PAPER">Paper</option>
                  <option value="GLASS">Glass</option>
                  <option value="COPPER">Copper</option>
                  <option value="METAL">Metal</option>
                </select>
              </label>

              <label className="block text-[0.7rem] text-slate-600 text-left">
                Weight (kg)
                <input
                  type="number"
                  step="0.01"
                  value={cartForm.weightKg}
                  onChange={(e) => setCartForm({ ...cartForm, weightKg: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>

              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
              >
                Save cart
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {userMgmtOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-[15%]" onClick={() => setUserMgmtOpen(false)}>
          <div className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-semibold text-slate-800 mb-3">User management</h2>
            <div className="space-y-3 text-xs">
              <label className="block text-[0.7rem] text-slate-600 text-left">
                Search user (email or first name)
                <input
                  type="text"
                  value={userMgmtQuery}
                  onChange={handleUserMgmtSearchChange}
                  placeholder="Type to search user"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              {userMgmtSuggestions.length > 0 && !selectedUserMgmt && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white text-xs">
                  {userMgmtSuggestions.map((u) => (
                    <div
                      key={u.id}
                      className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-slate-700 text-[0.7rem]"
                      onClick={() => {
                        setSelectedUserMgmt({ ...u, newPassword: '' });
                        setUserMgmtQuery(`${u.firstName} ${u.lastName} (${u.email})`);
                        setUserMgmtSuggestions([]);
                      }}
                    >
                      {u.firstName} {u.lastName} – {u.email}
                    </div>
                  ))}
                </div>
              )}

              <div>
                {selectedUserMgmt ? (
                  <div className="space-y-3 text-xs">
                    <label className="block text-[0.7rem] text-slate-600 text-left">
                      Current points
                      <input
                        type="number"
                        step="0.01"
                        value={selectedUserMgmt.points}
                        onChange={(e) =>
                          setSelectedUserMgmt({
                            ...selectedUserMgmt,
                            points: parseFloat(e.target.value || '0'),
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </label>
                    <label className="block text-[0.7rem] text-slate-600 text-left">
                      New password
                      <input
                        type="password"
                        value={selectedUserMgmt.newPassword || ''}
                        onChange={(e) =>
                          setSelectedUserMgmt({
                            ...selectedUserMgmt,
                            newPassword: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </label>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <label className="inline-flex items-center gap-2 text-[0.7rem] text-slate-600">
                        <span>Active</span>
                        <input
                          type="checkbox"
                          checked={selectedUserMgmt.isActive}
                          onChange={(e) =>
                            setSelectedUserMgmt({
                              ...selectedUserMgmt,
                              isActive: e.target.checked,
                            })
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                        onClick={saveUserManagement}
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[0.7rem] text-slate-500 mt-2">
                    Search and select a user to edit their details.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redeems Modal */}
      {redeemsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-[15%]" onClick={() => setRedeemsOpen(false)}>
          <div className="w-full max-w-4xl rounded-2xl bg-white p-5 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Redeems</h2>
            <div className="max-h-80 overflow-y-auto text-xs">
              <table className="min-w-full border-separate border-spacing-y-1">
                <thead className="text-[0.7rem] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-1 text-left">Date &amp; time</th>
                    <th className="px-3 py-1 text-left">Name</th>
                    <th className="px-3 py-1 text-left">Reward</th>
                    <th className="px-3 py-1 text-left">Payout</th>
                    <th className="px-3 py-1 text-left">Status</th>
                    <th className="px-3 py-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {redeems.map((r) => (
                    <tr
                      key={r.id}
                      className="bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
                    >
                      <td className="px-3 py-1.5 text-[0.7rem] text-slate-500">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-1.5 text-slate-700">
                        {r.user ? `${r.user.firstName} ${r.user.lastName}` : '-'}
                      </td>
                      <td className="px-3 py-1.5 text-slate-700">
                        {r.reward ? r.reward.title : '-'}
                      </td>
                      <td className="px-3 py-1.5 text-[0.7rem] text-slate-600">
                        {r.payoutMethod
                          ? `${r.payoutMethod.provider} ${r.payoutMethod.accountNumber}`
                          : '-'}
                      </td>
                      <td className="px-3 py-1.5 text-slate-700">{r.status}</td>
                      <td className="px-3 py-1.5 text-right space-x-1">
                        <button
                          type="button"
                          disabled={r.status === 'PENDING'}
                          onClick={() => updateRedeemStatus(r.id, 'PENDING')}
                          className="inline-flex items-center justify-center rounded-md border border-slate-200 px-2 py-0.5 text-[0.65rem] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Pending
                        </button>
                        <button
                          type="button"
                          disabled={r.status === 'PAID'}
                          onClick={() => updateRedeemStatus(r.id, 'PAID')}
                          className="inline-flex items-center justify-center rounded-md border border-emerald-500 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Paid
                        </button>
                      </td>
                    </tr>
                  ))}
                  {redeems.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-2 text-[0.7rem] text-slate-500"
                      >
                        No redemption records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
