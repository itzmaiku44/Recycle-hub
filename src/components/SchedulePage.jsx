// src/components/SchedulePage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { API_BASE } from '../config/api';
import './Schedule.css';

const SchedulePage = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [schedules, setSchedules] = useState([]);
  const [nextSchedule, setNextSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch schedules from backend (CollectionSchedule table)
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);

        const [allRes, nextRes] = await Promise.all([
          fetch(`${API_BASE}/schedules`),
          fetch(`${API_BASE}/schedules/next`),
        ]);

        if (!allRes.ok) {
          throw new Error('Failed to load schedules');
        }

        const allData = await allRes.json();
        const nextData = nextRes.ok ? await nextRes.json() : null;

        setSchedules(Array.isArray(allData) ? allData : []);
        setNextSchedule(nextData);
      } catch (err) {
        console.error(err);
        setError('Unable to load collection schedules right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Update countdown based on nextSchedule start/end and current time
  useEffect(() => {
    if (!nextSchedule) {
      setTimeLeft(0);
      return;
    }

    const startAt = new Date(nextSchedule.startAt).getTime();
    const endAt = nextSchedule.endAt ? new Date(nextSchedule.endAt).getTime() : null;

    const getTargetTime = () => {
      const now = Date.now();
      if (now < startAt) return startAt; // countdown to start
      if (endAt && now < endAt) return endAt; // if already started, countdown to end
      return null; // past event
    };

    let targetTime = getTargetTime();
    if (!targetTime) {
      setTimeLeft(0);
      return;
    }

    // Set initial value
    setTimeLeft(Math.max(targetTime - Date.now(), 0));

    const intervalId = setInterval(() => {
      targetTime = getTargetTime();
      if (!targetTime) {
        setTimeLeft(0);
        clearInterval(intervalId);
        return;
      }
      const diff = targetTime - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
      if (diff <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [nextSchedule]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  // Helper function to pad numbers with a leading zero (e.g., 6 -> 06)
  const pad = (num) => String(num).padStart(2, '0');

  // Derive visible locations from schedules: pick-up + next 3
  const sortedSchedules = [...schedules].sort(
    (a, b) => new Date(a.startAt) - new Date(b.startAt)
  );

  const visibleSchedules = sortedSchedules.slice(0, 4);

  const locationItems = visibleSchedules.map((schedule, index) => ({
    id: schedule.id,
    type: index === 0 ? 'pickup' : 'next',
    label: index === 0 ? 'Pick-up Location' : 'Next Location',
    name: schedule.location,
  }));

  // Placeholder for the illustrations (like the one in the image)
  const IllustrationBox = ({ type }) => (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        position: 'absolute',
        left: type === 'Left' ? '0' : 'auto',
        right: type === 'Right' ? '0' : 'auto',
        bottom: '0',
        opacity: 0.7,
        minHeight: '200px',
        zIndex: 0, // Below the text
        paddingLeft: '0px',
        paddingRight: '0px',
      }}
    >
      {/* In a real app, this would be where you render your SVG illustration */}
    </div>
  );

  const hasCountdown = !!nextSchedule && timeLeft > 0;

  return (
    <>
      <Navbar showUserMenu={true} userName="John" />

      <div className="schedule-v2-container">
        <h1 className="schedule-v2-title">
          NEXT <span>COLLECTION</span> IN
        </h1>

        {/* Countdown Timer */}
        {hasCountdown ? (
          <div className="countdown-timer">
            <div className="countdown-unit">
              <div className="countdown-number">{pad(days)}</div>
              <div className="countdown-label">Days</div>
            </div>
            <div className="countdown-unit">
              <div className="countdown-number">{pad(hours)}</div>
              <div className="countdown-label">Hours</div>
            </div>
            <div className="countdown-unit">
              <div className="countdown-number">{pad(minutes)}</div>
              <div className="countdown-label">Minutes</div>
            </div>
            {/* Seconds - styled smaller on the side */}
            <div className="countdown-seconds">
              {pad(seconds)}
              <div
                style={{
                  fontSize: '0.6em',
                  fontWeight: '400',
                  color: 'var(--primary-green)',
                }}
              >
                Seconds
              </div>
            </div>
          </div>
        ) : (
          <div className="countdown-timer">
            <div className="countdown-unit">
              <div className="countdown-number">--</div>
              <div className="countdown-label">Days</div>
            </div>
            <div className="countdown-unit">
              <div className="countdown-number">--</div>
              <div className="countdown-label">Hours</div>
            </div>
            <div className="countdown-unit">
              <div className="countdown-number">--</div>
              <div className="countdown-label">Minutes</div>
            </div>
            <div className="countdown-seconds">
              --
              <div
                style={{
                  fontSize: '0.6em',
                  fontWeight: '400',
                  color: 'var(--primary-green)',
                }}
              >
                Seconds
              </div>
            </div>
          </div>
        )}

        {/* Location List and Illustrations */}
        <div className="location-and-illustration">
          {/* Illustration Background */}
          <IllustrationBox type="Left" />
          <IllustrationBox type="Right" />

          <div className="location-list">
            {loading && <p>Loading collection locations...</p>}
            {!loading && error && <p>{error}</p>}
            {!loading && !error && locationItems.length === 0 && (
              <p>No active collection schedules found.</p>
            )}
            {!loading && !error &&
              locationItems.map((loc) => (
                <p
                  key={loc.id}
                  className={`location-item ${
                    loc.type === 'pickup' ? 'pickup' : 'next'
                  }`}
                >
                  {loc.label}: <strong>{loc.name}</strong>
                </p>
              ))}
          </div>
        </div>

        <p className="important-note">
          Important Note: Only registered users are eligible for reward system.
        </p>
      </div>
    </>
  );
};

export default SchedulePage;
