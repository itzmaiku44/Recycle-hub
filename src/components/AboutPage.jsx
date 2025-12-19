import React from 'react';
import Navbar from './Navbar';

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <main style={{ padding: '60px 12%', maxWidth: '900px', margin: '0 auto' }}>
        <section style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>About Recycle Hub</h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '20px' }}>
            Recycle Hub is a simple platform that helps communities track
            collection schedules, discover nearby drop-off locations, and earn
            rewards for responsible waste management.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '20px' }}>
            Our goal is to make recycling effortless by providing clear
            information about when and where collections happen, and by
            celebrating the everyday actions that keep our cities clean.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
            This prototype focuses on residents in Cebu and Mandaue City,
            bringing together routes, maps, and user insights in one friendly
            interface.
          </p>
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
            This project is created by student of CIS2102 - WEB DEVELOPMENT 2 - Group6 S.Y. 2025.
            Lead Developer: Michael James Catubig
            Frontend Developer: Adam Werner T. Villa, Johndear M. Halili
          </p>
        </section>
      </main>
    </>
  );
};

export default AboutPage;
