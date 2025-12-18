// src/components/Hero.jsx
import React from 'react';
import illustration from '../assets/recycle_illustration.png';

const Hero = ({ onGetStarted }) => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Waste Management &amp; Recycling Platform
        </h1>
        <p className="hero-subtitle">
          A comprehensive solution for efficient waste disposal 
          and sustainable recycling.
        </p>
        <button type="button" className="primary-button" onClick={onGetStarted}>
          Get Started
        </button>
      </div>
      <div className="hero-image-container">
        <img 
          src={illustration} 
          alt="User standing next to a large recycling bin"
        />
      </div>
    </section>
  );
};

export default Hero;
