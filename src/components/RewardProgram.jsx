import React, { useState } from 'react';
import './RewardProgram.css';

const rewards = [
  { id: 1, title: 'PHP 100', value: 10, category: 'Cash' },
  { id: 2, title: 'PHP 250', value: 25, category: 'Cash' },
  { id: 3, title: 'PHP 500', value: 50, category: 'Cash' },
  { id: 4, title: '20 KG For', value: 2.5, category: 'Coupon' },
  { id: 5, title: '50 KG For', value: 5, category: 'Coupon' },
  { id: 6, title: 'PHP 1000', value: 100, category: 'Cash' },
];

const RewardProgram = ({ initialPoints = 464 }) => {
  const [points, setPoints] = useState(initialPoints);
  const [history, setHistory] = useState([]);

  const handleClaim = (reward) => {
    if (points >= reward.value) {
      setPoints(points - reward.value);
      setHistory([...history, { ...reward, date: new Date().toLocaleString() }]);
      alert(`You claimed a reward worth ${reward.value} points!`);
    } else {
      alert('Not enough points to claim this reward!');
    }
  };

  const categories = [...new Set(rewards.map(r => r.category))];

  return (
    <section className="reward-program">
      <div className="points-circle">
        <span className="points-number">{points}</span>
        <span className="points-label">POINTS</span>
      </div>
      {categories.map((cat) => (
        <div key={cat} className="reward-category">
          <h3>{cat} Rewards</h3>
          <div className="reward-cards">
            {rewards
              .filter(r => r.category === cat)
              .map((reward) => (
                <div key={reward.id} className="reward-card">
                  <div className="reward-info">
                    <div className="reward-title">{reward.title}</div>
                    <div className="reward-value">{reward.value} points</div>
                  </div>
                  <button
                    className={`claim-button ${points < reward.value ? 'disabled' : ''}`}
                    onClick={() => handleClaim(reward)}
                    disabled={points < reward.value}
                  >
                    CLAIM
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
      {history.length > 0 && (
        <div className="claim-history">
          <h3>Recent Claims</h3>
          <ul>
            {history.slice(-5).reverse().map((item, index) => (
              <li key={index}>
                {item.title} - {item.value} pts - {item.date}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default RewardProgram;
