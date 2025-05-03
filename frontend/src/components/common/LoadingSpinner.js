import React from 'react';

const LoadingSpinner = ({ message = 'Загрузка...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          border: '6px solid rgba(117, 198, 209, 0.2)',
          borderTop: '6px solid #75c6d1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px',
        }}
      />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ fontSize: '18px', color: '#666' }}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;