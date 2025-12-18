import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';

const Navbar = ({ showUserMenu = false, userName = "John", onSignUpClick }) => {
  const { user, logout, openLogin } = useAuth() || {};
  const navigate = useNavigate();
  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isUser = isLoggedIn && !isAdmin;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignUpClick = () => {
    if (onSignUpClick) {
      onSignUpClick();
    } else if (openLogin) {
      openLogin();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="logo-icon" style={{ textDecoration: 'none' }}>
          <span className="logo-icon">♻️</span>
          <span>Recycle Hub</span>
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/Collection Schedules" className="nav-link">Schedules</Link>
        {isUser && (
          <Link to="/Redeem Rewards" className="nav-link">Rewards</Link>
        )}
        <Link to="/Hub Location" className="nav-link">Map</Link>
        {isUser && (
          <Link to="/Waste Management Analysis" className="nav-link">Analysis</Link>
        )}
        <Link to="/trade" className="nav-link">Trade</Link>
        {isAdmin && (
          <Link to="/admin" className="nav-link">Admin</Link>
        )}
        <Link to="/about" className="nav-link">About</Link>
        {isLoggedIn ? (
          <div className="nav-user">
            <button
              type="button"
              className="nav-user-button"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {user?.firstName || userName} &#x25BE;
            </button>
            {menuOpen && (
              <div className="nav-user-menu">
                <Link to="/profile" className="nav-user-menu-item" onClick={() => setMenuOpen(false)}>
                  Settings
                </Link>
                <button
                  type="button"
                  className="nav-user-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    if (logout) {
                      logout();
                    }
                    navigate('/');
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="primary-button" onClick={handleSignUpClick}>Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
