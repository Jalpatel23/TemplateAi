import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isNetworkError: false,
      isAuthError: false,
      isResourceError: false,
      isBrowserError: false,
      isMemoryError: false,
      isScriptError: false
    };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a network error
    const isNetworkError = error.message && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network Error') ||
      error.message.includes('ERR_NETWORK') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      error.message.includes('ERR_NETWORK_CHANGED')
    );

    // Check if it's a Clerk authentication error
    const isAuthError = error.message && (
      error.message.includes('Clerk') ||
      error.message.includes('Failed to load Clerk') ||
      error.message.includes('Authentication') ||
      error.message.includes('Unauthorized')
    );

    // Check if it's a resource loading error
    const isResourceError = error.message && (
      error.message.includes('Resource') ||
      error.message.includes('Loading') ||
      error.message.includes('Image') ||
      error.message.includes('Stylesheet') ||
      error.message.includes('Script') ||
      error.message.includes('Media') ||
      error.message.includes('Timeout')
    );

    // Check if it's a browser security error
    const isBrowserError = error.message && (
      error.message.includes('CORS') ||
      error.message.includes('Cross-origin') ||
      error.message.includes('Blocked') ||
      error.message.includes('Security') ||
      error.message.includes('Permission') ||
      error.message.includes('Quota') ||
      error.message.includes('Storage')
    );

    // Check if it's a memory error
    const isMemoryError = error.message && (
      error.message.includes('Memory') ||
      error.message.includes('Out of memory') ||
      error.message.includes('Quota')
    );

    // Check if it's a script error
    const isScriptError = error.message && (
      error.message.includes('Script') ||
      error.message.includes('Syntax') ||
      error.message.includes('Reference') ||
      error.message.includes('Type') ||
      error.message.includes('Range') ||
      error.message.includes('URI') ||
      error.message.includes('URL')
    );

    return { 
      hasError: true,
      isNetworkError,
      isAuthError,
      isResourceError,
      isBrowserError,
      isMemoryError,
      isScriptError
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with Sentry or other error tracking services here
      console.error('Production error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isNetworkError: false,
      isAuthError: false,
      isResourceError: false,
      isBrowserError: false,
      isMemoryError: false,
      isScriptError: false
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { isNetworkError, isAuthError, isResourceError, isBrowserError, isMemoryError, isScriptError } = this.state;
      
      let title = 'Something went wrong';
      let message = 'We\'re sorry, but something unexpected happened. Please try refreshing the page.';
      let primaryAction = 'Refresh Page';
      let secondaryAction = 'Go Home';
      let icon = '⚠️';
      let color = '#dc3545';

      if (isNetworkError) {
        title = 'Connection Error';
        message = 'It looks like you\'re having trouble connecting to our servers. Please check your internet connection and try again.';
        primaryAction = 'Retry Connection';
        secondaryAction = 'Check Connection';
        icon = '🌐';
        color = '#ffc107';
      } else if (isAuthError) {
        title = 'Authentication Error';
        message = 'There was an issue with your authentication. Please try signing in again.';
        primaryAction = 'Sign In Again';
        secondaryAction = 'Go Home';
        icon = '🔐';
        color = '#17a2b8';
      } else if (isResourceError) {
        title = 'Resource Loading Error';
        message = 'Some resources failed to load properly. This might be due to a slow connection or temporary server issues.';
        primaryAction = 'Retry Loading';
        secondaryAction = 'Refresh Page';
        icon = '📦';
        color = '#fd7e14';
      } else if (isBrowserError) {
        title = 'Browser Security Error';
        message = 'Your browser blocked some content for security reasons. This might be due to browser settings or extensions.';
        primaryAction = 'Check Settings';
        secondaryAction = 'Try Different Browser';
        icon = '🛡️';
        color = '#6f42c1';
      } else if (isMemoryError) {
        title = 'Memory Error';
        message = 'The application ran out of memory. Try closing other tabs or applications to free up memory.';
        primaryAction = 'Close Other Tabs';
        secondaryAction = 'Refresh Page';
        icon = '💾';
        color = '#e83e8c';
      } else if (isScriptError) {
        title = 'Script Error';
        message = 'There was an issue with the application code. This might be a temporary problem.';
        primaryAction = 'Refresh Page';
        secondaryAction = 'Clear Cache';
        icon = '🔧';
        color = '#20c997';
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '1rem',
              color: color
            }}>
              {icon}
            </div>
            
            <h2 style={{ 
              marginBottom: '1rem', 
              color: color,
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              {title}
            </h2>
            
            <p style={{ 
              marginBottom: '2rem', 
              color: 'var(--text-secondary)',
              lineHeight: '1.5'
            }}>
              {message}
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={isNetworkError ? this.handleRetry : this.handleRefresh}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: color,
                  color: isNetworkError ? '#000' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {primaryAction}
              </button>
              
              <button
                onClick={isNetworkError ? () => window.open('https://www.google.com/search?q=check+internet+connection', '_blank') : this.handleGoHome}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {secondaryAction}
              </button>
            </div>

            {isNetworkError && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(255, 193, 7, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 193, 7, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>Troubleshooting Tips:</h4>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '1.5rem', 
                  color: '#856404',
                  textAlign: 'left',
                  fontSize: '0.9rem'
                }}>
                  <li>Check if your internet connection is working</li>
                  <li>Try refreshing the page</li>
                  <li>Check if the website is down</li>
                  <li>Try using a different network</li>
                </ul>
              </div>
            )}

            {isAuthError && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(23, 162, 184, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(23, 162, 184, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0c5460' }}>Authentication Tips:</h4>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '1.5rem', 
                  color: '#0c5460',
                  textAlign: 'left',
                  fontSize: '0.9rem'
                }}>
                  <li>Make sure you're signed in to your account</li>
                  <li>Try signing out and signing back in</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Check if your session has expired</li>
                </ul>
              </div>
            )}

            {isResourceError && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(253, 126, 20, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(253, 126, 20, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#8b4513' }}>Resource Loading Tips:</h4>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '1.5rem', 
                  color: '#8b4513',
                  textAlign: 'left',
                  fontSize: '0.9rem'
                }}>
                  <li>Check your internet connection speed</li>
                  <li>Try refreshing the page</li>
                  <li>Disable browser extensions temporarily</li>
                  <li>Clear browser cache and cookies</li>
                </ul>
              </div>
            )}

            {isBrowserError && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(111, 66, 193, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(111, 66, 193, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#4a148c' }}>Browser Security Tips:</h4>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '1.5rem', 
                  color: '#4a148c',
                  textAlign: 'left',
                  fontSize: '0.9rem'
                }}>
                  <li>Check browser security settings</li>
                  <li>Disable problematic extensions</li>
                  <li>Try using a different browser</li>
                  <li>Update your browser to the latest version</li>
                </ul>
              </div>
            )}

            {isMemoryError && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(232, 62, 140, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(232, 62, 140, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#8b1049' }}>Memory Management Tips:</h4>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '1.5rem', 
                  color: '#8b1049',
                  textAlign: 'left',
                  fontSize: '0.9rem'
                }}>
                  <li>Close unnecessary browser tabs</li>
                  <li>Close other applications</li>
                  <li>Restart your browser</li>
                  <li>Check available system memory</li>
                </ul>
              </div>
            )}

            {isScriptError && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(32, 201, 151, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(32, 201, 151, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0d6b4a' }}>Script Error Tips:</h4>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '1.5rem', 
                  color: '#0d6b4a',
                  textAlign: 'left',
                  fontSize: '0.9rem'
                }}>
                  <li>Clear browser cache and cookies</li>
                  <li>Try refreshing the page</li>
                  <li>Disable browser extensions</li>
                  <li>Update your browser</li>
                </ul>
              </div>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              marginTop: '2rem', 
              textAlign: 'left', 
              maxWidth: '600px',
              background: 'var(--bg-secondary)',
              borderRadius: '6px',
              padding: '1rem'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                color: 'var(--text-secondary)',
                fontWeight: '500'
              }}>
                Error Details (Development)
              </summary>
              <pre style={{
                background: 'var(--bg-primary)',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '0.5rem',
                border: '1px solid var(--border-color)'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 