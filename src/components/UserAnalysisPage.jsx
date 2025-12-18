import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './Navbar';
import './UserAnalysisPage.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '../Auth/AuthContext';

const API_BASE = 'http://localhost:4000/api';

const UserAnalysisPage = () => {
  const { user } = useAuth() || {};
  const userId = user?.id;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/user/transactions/${userId}`);
        if (!res.ok) throw new Error('Failed to load transactions');
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Unable to load your analysis data at the moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  const stats = useMemo(() => {
    if (!transactions.length) {
      return { totalRecycled: 0, maxRecycled: 0, totalPoints: 0 };
    }

    let totalRecycled = 0;
    let maxRecycled = 0;
    let totalPoints = 0;

    transactions.forEach((tx) => {
      const w = Number(tx.weightKg || 0);
      const p = Number(tx.pointsTotal || 0);
      totalRecycled += w;
      maxRecycled = Math.max(maxRecycled, w);
      totalPoints += p;
    });

    return { totalRecycled, maxRecycled, totalPoints };
  }, [transactions]);

  const lineChartData = useMemo(
    () =>
      transactions.map((tx) => ({
        date: tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '',
        weight: Number(tx.weightKg || 0),
      })),
    [transactions]
  );

  const barChartData = useMemo(() => {
    const totals = transactions.reduce((acc, tx) => {
      const key = tx.category;
      const weight = Number(tx.weightKg || 0);
      acc[key] = (acc[key] || 0) + weight;
      return acc;
    }, {});

    return Object.entries(totals).map(([type, amount]) => ({ type, amount }));
  }, [transactions]);

  return (
    <div>
      <Navbar showUserMenu={true} userName={user?.firstName || 'User'} />
      <main className="analysis-main">
        <h1 className="text-2xl font-semibold text-slate-900">Waste Management Analysis</h1>
        <p className="text-xs text-slate-500">Overview of your waste collection and recycling activities.</p>

        {loading && <p>Loading...</p>}
        {!loading && error && <p>{error}</p>}

        {!loading && !error && (
          <>
            <div className="stats-cards">
              <div className="stat-card">
                <h2>{stats.totalRecycled.toFixed(2)} kg</h2>
                <p>Total Recycled</p>
              </div>
              <div className="stat-card">
                <h2>{stats.maxRecycled.toFixed(2)} kg</h2>
                <p>Max Recycled</p>
              </div>
              <div className="stat-card">
                <h2>{stats.totalPoints.toFixed(2)} pts</h2>
                <p>Points Earned</p>
              </div>
            </div>

            <div className="chart-container">
              <h2 className="text-lg font-semibold text-slate-900">Trash Collected Over Time</h2>
              <LineChart
                width={700}
                height={300}
                data={lineChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Trash Collected (kg)"
                  stroke="#46d81a"
                  strokeWidth={3}
                />
              </LineChart>
            </div>

            <div className="chart-container">
              <h2 className="text-lg font-semibold text-slate-900">Recycled Waste by Type</h2>
              <BarChart
                width={700}
                height={300}
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" name="Amount (kg)" fill="#46d81a" />
              </BarChart>
            </div>

            <div className="contributions-section">
              <h2 className="text-lg font-semibold text-slate-900">Recent Contributions</h2>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Amount (kg)</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''}</td>
                      <td>{tx.category}</td>
                      <td>{Number(tx.weightKg || 0).toFixed(2)}</td>
                      <td>{Number(tx.pointsTotal || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4}>No contributions yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default UserAnalysisPage;
