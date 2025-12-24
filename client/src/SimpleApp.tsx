import React from 'react';

function SimpleApp() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#e53e3e', fontSize: '32px', margin: '10px 0' }}>Jiwandan Blood Bank</h1>
        <p style={{ fontSize: '18px', color: '#4a5568' }}>Donate Blood, Save Lives</p>
      </header>
      
      <main>
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
        }}>
          <h2 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '15px' }}>Welcome to Jiwandan</h2>
          <p style={{ lineHeight: 1.6, color: '#4a5568', marginBottom: '20px' }}>
            Blood donation is a critical service that helps save countless lives every day.
            Our mission is to connect blood donors with those in need through an efficient
            coordination system.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '30px'
          }}>
            <div style={{ 
              backgroundColor: '#fed7d7', 
              padding: '15px', 
              borderRadius: '6px'
            }}>
              <h3 style={{ fontSize: '20px', color: '#c53030', marginBottom: '10px' }}>For Donors</h3>
              <p style={{ color: '#4a5568' }}>
                Register as a donor and be notified when your blood type is needed in your area.
                Track your donation history and impact.
              </p>
            </div>
            
            <div style={{ 
              backgroundColor: '#bee3f8', 
              padding: '15px', 
              borderRadius: '6px'
            }}>
              <h3 style={{ fontSize: '20px', color: '#2c5282', marginBottom: '10px' }}>For Patients</h3>
              <p style={{ color: '#4a5568' }}>
                Submit requests for blood donations and get connected with compatible donors
                quickly during emergencies.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer style={{ 
        marginTop: '40px', 
        textAlign: 'center', 
        padding: '15px', 
        color: '#718096',
        borderTop: '1px solid #e2e8f0'
      }}>
        <p>&copy; 2025 Jiwandan Blood Bank. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default SimpleApp;