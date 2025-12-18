import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './Navbar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { API_BASE } from '../config/api';

const TradePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/admin/transactions`);
        if (!res.ok) throw new Error('Failed to load transactions');
        const data = await res.json();
        // Backend returns ascending by createdAt; show most recent first in table
        const ordered = Array.isArray(data) ? [...data].reverse() : [];
        setTransactions(ordered);
      } catch (err) {
        console.error(err);
        setError('Unable to load transactions at the moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const barData = useMemo(() => {
    const totals = transactions.reduce((acc, tx) => {
      const key = tx.category;
      const weight = Number(tx.weightKg || 0);
      acc[key] = (acc[key] || 0) + weight;
      return acc;
    }, {});

    return Object.entries(totals).map(([type, totalKg]) => ({ type, totalKg }));
  }, [transactions]);

  const scrollStyles = `
    .transactions-scroll {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
    }
    .transactions-scroll::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
    .transactions-scroll thead th {
      position: sticky;
      top: 0;
      background-color: #ffffff;
      z-index: 1;
    }
  `;

  return (
    <div>
      <Navbar />
      <main style={{ padding: '40px 8%' }}>
        <style>{scrollStyles}</style>
        <h1 className="text-2xl font-semibold text-slate-900">Trade Dashboard</h1>
        <p className="text-xs text-slate-500">Overview of recent recycling transactions across all users.</p>

        {loading && <p>Loading...</p>}
        {!loading && error && <p>{error}</p>}

        {!loading && !error && (
          <>
            <section style={{ marginBottom: '40px' }}>
              <h2 className="text-lg font-semibold text-slate-900">Waste Type Overview</h2>
              <div style={{ overflowX: 'auto' }}>
                <BarChart
                  width={700}
                  height={300}
                  data={barData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalKg" name="Total Weight (kg)" fill="#46d81a" />
                </BarChart>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
              <div
                className="transactions-scroll"
                style={{
                  maxHeight: '260px', // roughly 5 rows tall
                  overflowY: 'auto',
                  marginTop: '12px',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Date &amp; Time</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Category</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Weight (kg)</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Points Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ padding: '8px' }}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''}
                        </td>
                        
                        <td style={{ padding: '8px' }}>{tx.category}</td>
                        <td style={{ padding: '8px' }}>{Number(tx.weightKg || 0).toFixed(2)}</td>
                        <td style={{ padding: '8px' }}>{Number(tx.pointsTotal || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '8px' }}>
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default TradePage;
