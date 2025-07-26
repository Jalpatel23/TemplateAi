import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'var(--text-primary)', 
  text = 'Loading...',
  fullScreen = false 
}) => {
  const sizeMap = {
    small: '1rem',
    medium: '2rem',
    large: '3rem'
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  const spinner = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `2px solid var(--border-color)`,
          borderTop: `2px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && (
        <div style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default LoadingSpinner; 