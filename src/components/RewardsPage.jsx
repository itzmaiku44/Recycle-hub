import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../Auth/AuthContext';
import { API_BASE } from '../config/api';
import './RewardProgram.css';

const RewardsPage = () => {
  const { user, login } = useAuth() || {};
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redeeming, setRedeeming] = useState(false);

  const scrollStyles = `
    .rewards-history-scroll {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
    }
    .rewards-history-scroll::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
    .rewards-history-scroll thead th {
      position: sticky;
      top: 0;
      background-color: #ffffff;
      z-index: 1;
    }
  `;

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [rewardsRes, redemptionsRes, payoutRes] = await Promise.all([
          fetch(`${API_BASE}/rewards`),
          fetch(`${API_BASE}/user/redemptions/${userId}`),
          fetch(`${API_BASE}/user/payout-methods/${userId}`),
        ]);

        if (!rewardsRes.ok) throw new Error('Failed to load rewards');

        const rewardsData = await rewardsRes.json();
        const redemptionsData = redemptionsRes.ok ? await redemptionsRes.json() : [];
        const payoutData = payoutRes.ok ? await payoutRes.json() : [];

        setRewards(Array.isArray(rewardsData) ? rewardsData : []);
        setRedemptions(Array.isArray(redemptionsData) ? redemptionsData : []);
        setPayoutMethods(Array.isArray(payoutData) ? payoutData : []);
      } catch (err) {
        console.error(err);
        setError('Unable to load rewards at the moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleRedeem = async (rewardId) => {
    if (!userId) {
      alert('You must be logged in to redeem rewards.');
      return;
    }

    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return;

    const currentPoints = Number(user.points || 0);
    const cost = Number(reward.pointsCost);

    if (currentPoints < cost) {
      alert('Insufficient points to redeem this reward.');
      return;
    }

    const defaultMethod = payoutMethods.find((m) => m.isDefault) || payoutMethods[0];
    if (!defaultMethod) {
      alert('Please add a payout method in Settings before redeeming.');
      return;
    }

    if (!window.confirm(`Redeem ${reward.title} for ${reward.pointsCost} points?`)) {
      return;
    }

    try {
      setRedeeming(true);
      const res = await fetch(`${API_BASE}/user/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          rewardId,
          payoutMethodId: defaultMethod.id,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        alert(errBody.message || 'Redeem failed.');
        return;
      }

      const redeemed = await res.json();
      setRedemptions((prev) => [redeemed, ...prev]);

      // Refresh current user points so header and circle update immediately
      if (login) {
        try {
          const userRes = await fetch(`${API_BASE}/user/${userId}`);
          if (userRes.ok) {
            const freshUser = await userRes.json();
            login(freshUser);
          }
        } catch (e) {
          console.error('Failed to refresh user after redeem', e);
        }
      }

      alert('Reward redeemed! It will appear as Pending until processed.');
    } catch (err) {
      console.error(err);
      alert('An error occurred while redeeming.');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div>
      <Navbar showUserMenu={true} userName={user?.firstName || 'User'} />
      <style>{scrollStyles}</style>

      <main style={{ padding: '40px 8%', textAlign: 'center' }}>
        <h1 className="text-2xl font-semibold text-slate-900">Redeem Your Rewards</h1>
        <p className="text-xs text-slate-500 mb-5">Use your points to claim available rewards below:</p>

        {user && (
          <div className="points-circle" style={{ margin: '0 auto 32px' }}>
            <span className="points-number">{Number(user.points || 0).toFixed(2)}</span>
            <span className="points-label">POINTS</span>
          </div>
        )}

        {loading && <p>Loading rewards...</p>}
        {!loading && error && <p>{error}</p>}

        {!loading && !error && (
          <section className="reward-program">
            <div className="reward-category">
              <h3 className="text-lg font-semibold text-slate-900">Cash Rewards</h3>
              <div className="reward-cards">
                {rewards.length === 0 && <p>No rewards configured yet.</p>}
                {rewards.map((reward) => (
                  <div key={reward.id} className="reward-card">
                    <div className="reward-info">
                      <div className="reward-title">{reward.title}</div>
                      <div className="reward-value">
                        {Number(reward.pointsCost).toFixed(2)} pts
                      </div>
                    </div>
                    <button
                      className={`claim-button ${
                        !user || Number(user.points || 0) < Number(reward.pointsCost) || redeeming
                          ? 'disabled'
                          : ''
                      }`}
                      onClick={() => handleRedeem(reward.id)}
                      disabled={
                        !user || Number(user.points || 0) < Number(reward.pointsCost) || redeeming
                      }
                    >
                      REDEEM
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="claim-history" style={{ marginTop: '40px', textAlign: 'left' }}>
              <h3>Redeem History</h3>
              {redemptions.length === 0 && <p>No redemptions yet.</p>}
              {redemptions.length > 0 && (
                <div
                  className="rewards-history-scroll"
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
                        <th style={{ textAlign: 'left', padding: '8px' }}>Reward Title</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Point Cost</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redemptions.map((r) => (
                        <tr key={r.id}>
                          <td style={{ padding: '8px' }}>
                            {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                          </td>
                          <td style={{ padding: '8px' }}>{r.reward?.title || '-'}</td>
                          <td style={{ padding: '8px' }}>
                            {r.reward?.pointsCost ? Number(r.reward.pointsCost).toFixed(2) : '-'} pts
                          </td>
                          <td style={{ padding: '8px' }}>{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default RewardsPage;
