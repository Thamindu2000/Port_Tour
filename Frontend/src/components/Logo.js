import React from 'react';

const Logo = ({ size = 'large', showText = true }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: '40px', height: '40px', fontSize: '16px' };
      case 'medium':
        return { width: '60px', height: '60px', fontSize: '20px' };
      case 'large':
        return { width: '80px', height: '80px', fontSize: '28px' };
      default:
        return { width: '80px', height: '80px', fontSize: '28px' };
    }
  };

  const styles = getSize();

  return (
    <div className="d-flex align-items-center logo-container">
      {/* Image Logo */}
      <img
        src="/SLPA.jpg"
        alt="SLPA"
        className="me-3"
        style={{
          width: styles.width,
          height: styles.height,
          objectFit: 'cover',
          borderRadius: '50%',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
        }}
      />
      
      {/* Text */}
      {showText && (
        <div>
          <div 
            className="fw-bold logo-text"
            style={{ 
              fontSize: styles.fontSize,
              lineHeight: '1.2',
              marginBottom: '2px',
              color: 'white'
            }}
          >
            SLPA EDUCATION VISIT
          </div>
          <div 
            className="logo-subtitle"
            style={{ 
              fontSize: parseInt(styles.fontSize) * 0.6,
              lineHeight: '1.2',
              color: 'white'
            }}
          >
            Educational Visit Booking System
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
