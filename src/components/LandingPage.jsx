import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import { useAuth } from '../Auth/AuthContext';

const LandingPage = () => {
  const { openLogin, openRegister } = useAuth() || {};

  return (
    <>
      {/* Navbar Login button opens the auth modal in Login mode */}
      <Navbar onSignUpClick={openLogin} />
      <main>
        <Hero onGetStarted={openRegister} />
        <Features />
      </main>
    </>
  );
};

export default LandingPage;
