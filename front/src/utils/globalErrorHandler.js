// Global error handler to prevent React's error overlay
// and provide better error handling for unhandled errors

class GlobalErrorHandler {
  constructor() {
    this.errorBoundary = null;
    this.isHandlingError = false;
    this.currentOverlay = null;
    this.errorQueue = [];
    this.isProcessingQueue = false;
  }

  setErrorBoundary(errorBoundary) {
    this.errorBoundary = errorBoundary;
  }

  // Remove existing overlay
  removeExistingOverlay() {
    if (this.currentOverlay && this.currentOverlay.parentNode) {
      this.currentOverlay.remove();
      this.currentOverlay = null;
    }
    
    // Also remove any other error overlays that might exist
    const existingOverlays = document.querySelectorAll('#global-error-overlay, [id*="error-overlay"]');
    existingOverlays.forEach(overlay => {
      if (overlay.parentNode) {
        overlay.remove();
      }
    });
  }

  // Process error queue
  async processErrorQueue() {
    if (this.isProcessingQueue || this.errorQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.errorQueue.length > 0) {
      const error = this.errorQueue.shift();
      await this.showUserFriendlyError(error);
      
      // Wait a bit before processing the next error
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessingQueue = false;
  }

  // Handle unhandled promise rejections
  handleUnhandledRejection = (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent the default browser behavior
    event.preventDefault();
    
    // Check if it's a network error
    if (event.reason && typeof event.reason === 'object') {
      const error = event.reason;
      
      if (error.message && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network Error') ||
        error.message.includes('ERR_NETWORK') ||
        error.message.includes('ERR_INTERNET_DISCONNECTED') ||
        error.message.includes('ERR_NETWORK_CHANGED') ||
        error.message.includes('Clerk') ||
        error.message.includes('Failed to load Clerk') ||
        error.message.includes('Authentication') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('Resource') ||
        error.message.includes('Loading') ||
        error.message.includes('Timeout') ||
        error.message.includes('CORS') ||
        error.message.includes('Cross-origin') ||
        error.message.includes('Blocked') ||
        error.message.includes('Security') ||
        error.message.includes('Permission') ||
        error.message.includes('Quota') ||
        error.message.includes('Storage') ||
        error.message.includes('Memory') ||
        error.message.includes('Out of memory') ||
        error.message.includes('Script') ||
        error.message.includes('Syntax') ||
        error.message.includes('Reference') ||
        error.message.includes('Type') ||
        error.message.includes('Range') ||
        error.message.includes('URI') ||
        error.message.includes('URL')
      )) {
        this.queueError(error);
        return;
      }
    }
    
    // For other errors, show a generic error message
    this.queueError(new Error('An unexpected error occurred. Please try refreshing the page.'));
  };

  // Handle unhandled errors
  handleError = (event) => {
    console.error('Unhandled error:', event.error);
    
    // Prevent the default browser behavior
    event.preventDefault();
    
    const error = event.error;
    
    // Check if it's a network or authentication error
    if (error && error.message && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network Error') ||
      error.message.includes('ERR_NETWORK') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      error.message.includes('ERR_NETWORK_CHANGED') ||
      error.message.includes('Clerk') ||
      error.message.includes('Failed to load Clerk') ||
      error.message.includes('Authentication') ||
      error.message.includes('Unauthorized') ||
      error.message.includes('Resource') ||
      error.message.includes('Loading') ||
      error.message.includes('Timeout') ||
      error.message.includes('CORS') ||
      error.message.includes('Cross-origin') ||
      error.message.includes('Blocked') ||
      error.message.includes('Security') ||
      error.message.includes('Permission') ||
      error.message.includes('Quota') ||
      error.message.includes('Storage') ||
      error.message.includes('Memory') ||
      error.message.includes('Out of memory') ||
      error.message.includes('Script') ||
      error.message.includes('Syntax') ||
      error.message.includes('Reference') ||
      error.message.includes('Type') ||
      error.message.includes('Range') ||
      error.message.includes('URI') ||
      error.message.includes('URL')
    )) {
      this.queueError(error);
      return;
    }
    
    // For other errors, show a generic error message
    this.queueError(new Error('An unexpected error occurred. Please try refreshing the page.'));
  };

  // Handle resource loading errors
  handleResourceError = (event) => {
    const target = event.target;
    let errorMessage = 'Resource loading failed';
    
    if (target.tagName === 'IMG') {
      errorMessage = 'Image failed to load';
    } else if (target.tagName === 'LINK' && target.rel === 'stylesheet') {
      errorMessage = 'Stylesheet failed to load';
    } else if (target.tagName === 'SCRIPT') {
      errorMessage = 'Script failed to load';
    } else if (target.tagName === 'AUDIO' || target.tagName === 'VIDEO') {
      errorMessage = 'Media failed to load';
    }
    
    this.queueError(new Error(errorMessage));
  };

  // Queue error for processing
  queueError = (error) => {
    // Add error to queue
    this.errorQueue.push(error);
    
    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      this.processErrorQueue();
    }
  };

  // Show user-friendly error overlay
  showUserFriendlyError = async (error) => {
    // Remove any existing overlay first
    this.removeExistingOverlay();
    
    // Wait a moment to ensure DOM is clean
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Check if we're already handling an error
    if (this.isHandlingError) {
      console.log('Already handling error, skipping');
      return;
    }
    
    this.isHandlingError = true;

    try {
      // Create error overlay
      const overlay = document.createElement('div');
      overlay.id = 'global-error-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

      const isNetworkError = error.message && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network Error') ||
        error.message.includes('ERR_NETWORK') ||
        error.message.includes('ERR_INTERNET_DISCONNECTED') ||
        error.message.includes('ERR_NETWORK_CHANGED')
      );

      const isAuthError = error.message && (
        error.message.includes('Clerk') ||
        error.message.includes('Failed to load Clerk') ||
        error.message.includes('Authentication') ||
        error.message.includes('Unauthorized')
      );

      const isResourceError = error.message && (
        error.message.includes('Resource') ||
        error.message.includes('Loading') ||
        error.message.includes('Image') ||
        error.message.includes('Stylesheet') ||
        error.message.includes('Script') ||
        error.message.includes('Media')
      );

      const isBrowserError = error.message && (
        error.message.includes('CORS') ||
        error.message.includes('Cross-origin') ||
        error.message.includes('Blocked') ||
        error.message.includes('Security') ||
        error.message.includes('Permission') ||
        error.message.includes('Quota') ||
        error.message.includes('Storage')
      );

      const isMemoryError = error.message && (
        error.message.includes('Memory') ||
        error.message.includes('Out of memory') ||
        error.message.includes('Quota')
      );

      const isScriptError = error.message && (
        error.message.includes('Script') ||
        error.message.includes('Syntax') ||
        error.message.includes('Reference') ||
        error.message.includes('Type') ||
        error.message.includes('Range') ||
        error.message.includes('URI') ||
        error.message.includes('URL')
      );

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

      overlay.innerHTML = `
        <div style="
          background: var(--bg-secondary, #ffffff);
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 90%;
          text-align: center;
          color: var(--text-primary, #333);
        ">
          <div style="font-size: 48px; margin-bottom: 1rem; color: ${color};">${icon}</div>
          
          <h2 style="
            margin-bottom: 1rem; 
            color: ${color};
            font-size: 1.5rem;
            font-weight: 600;
          ">${title}</h2>
          
          <p style="
            margin-bottom: 2rem; 
            color: var(--text-secondary, #666);
            line-height: 1.5;
          ">${message}</p>
          
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button id="primary-action" style="
              padding: 0.75rem 1.5rem;
              background: ${color};
              color: ${isNetworkError ? '#000' : 'white'};
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.2s ease;
            ">${primaryAction}</button>
            
            <button id="secondary-action" style="
              padding: 0.75rem 1.5rem;
              background: transparent;
              color: var(--text-primary, #333);
              border: 1px solid var(--border-color, #ddd);
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.2s ease;
            ">${secondaryAction}</button>
          </div>

          ${isNetworkError ? `
            <div style="
              margin-top: 1.5rem;
              padding: 1rem;
              background: rgba(255, 193, 7, 0.1);
              border-radius: 6px;
              border: 1px solid rgba(255, 193, 7, 0.3);
            ">
              <h4 style="margin: 0 0 0.5rem 0; color: #856404;">Troubleshooting Tips:</h4>
              <ul style="
                margin: 0; 
                padding-left: 1.5rem; 
                color: #856404;
                text-align: left;
                font-size: 0.9rem;
              ">
                <li>Check if your internet connection is working</li>
                <li>Try refreshing the page</li>
                <li>Check if the website is down</li>
                <li>Try using a different network</li>
              </ul>
            </div>
          ` : ''}

          ${isAuthError ? `
            <div style="
              margin-top: 1.5rem;
              padding: 1rem;
              background: rgba(23, 162, 184, 0.1);
              border-radius: 6px;
              border: 1px solid rgba(23, 162, 184, 0.3);
            ">
              <h4 style="margin: 0 0 0.5rem 0; color: #0c5460;">Authentication Tips:</h4>
              <ul style="
                margin: 0; 
                padding-left: 1.5rem; 
                color: #0c5460;
                text-align: left;
                font-size: 0.9rem;
              ">
                <li>Make sure you're signed in to your account</li>
                <li>Try signing out and signing back in</li>
                <li>Clear your browser cache and cookies</li>
                <li>Check if your session has expired</li>
              </ul>
            </div>
          ` : ''}

          ${isResourceError ? `
            <div style="
              margin-top: 1.5rem;
              padding: 1rem;
              background: rgba(253, 126, 20, 0.1);
              border-radius: 6px;
              border: 1px solid rgba(253, 126, 20, 0.3);
            ">
              <h4 style="margin: 0 0 0.5rem 0; color: #8b4513;">Resource Loading Tips:</h4>
              <ul style="
                margin: 0; 
                padding-left: 1.5rem; 
                color: #8b4513;
                text-align: left;
                font-size: 0.9rem;
              ">
                <li>Check your internet connection speed</li>
                <li>Try refreshing the page</li>
                <li>Disable browser extensions temporarily</li>
                <li>Clear browser cache and cookies</li>
              </ul>
            </div>
          ` : ''}

          ${isBrowserError ? `
            <div style="
              margin-top: 1.5rem;
              padding: 1rem;
              background: rgba(111, 66, 193, 0.1);
              border-radius: 6px;
              border: 1px solid rgba(111, 66, 193, 0.3);
            ">
              <h4 style="margin: 0 0 0.5rem 0; color: #4a148c;">Browser Security Tips:</h4>
              <ul style="
                margin: 0; 
                padding-left: 1.5rem; 
                color: #4a148c;
                text-align: left;
                font-size: 0.9rem;
              ">
                <li>Check browser security settings</li>
                <li>Disable problematic extensions</li>
                <li>Try using a different browser</li>
                <li>Update your browser to the latest version</li>
              </ul>
            </div>
          ` : ''}

          ${isMemoryError ? `
            <div style="
              margin-top: 1.5rem;
              padding: 1rem;
              background: rgba(232, 62, 140, 0.1);
              border-radius: 6px;
              border: 1px solid rgba(232, 62, 140, 0.3);
            ">
              <h4 style="margin: 0 0 0.5rem 0; color: #8b1049;">Memory Management Tips:</h4>
              <ul style="
                margin: 0; 
                padding-left: 1.5rem; 
                color: #8b1049;
                text-align: left;
                font-size: 0.9rem;
              ">
                <li>Close unnecessary browser tabs</li>
                <li>Close other applications</li>
                <li>Restart your browser</li>
                <li>Check available system memory</li>
              </ul>
            </div>
          ` : ''}

          ${isScriptError ? `
            <div style="
              margin-top: 1.5rem;
              padding: 1rem;
              background: rgba(32, 201, 151, 0.1);
              border-radius: 6px;
              border: 1px solid rgba(32, 201, 151, 0.3);
            ">
              <h4 style="margin: 0 0 0.5rem 0; color: #0d6b4a;">Script Error Tips:</h4>
              <ul style="
                margin: 0; 
                padding-left: 1.5rem; 
                color: #0d6b4a;
                text-align: left;
                font-size: 0.9rem;
              ">
                <li>Clear browser cache and cookies</li>
                <li>Try refreshing the page</li>
                <li>Disable browser extensions</li>
                <li>Update your browser</li>
              </ul>
            </div>
          ` : ''}
        </div>
      `;

      // Add event listeners
      const primaryBtn = overlay.querySelector('#primary-action');
      const secondaryBtn = overlay.querySelector('#secondary-action');

      const closeOverlay = () => {
        if (overlay.parentNode) {
          overlay.style.opacity = '0';
          setTimeout(() => {
            if (overlay.parentNode) {
              overlay.remove();
            }
            this.currentOverlay = null;
            this.isHandlingError = false;
          }, 300);
        }
      };

      primaryBtn.addEventListener('click', () => {
        closeOverlay();
        if (isNetworkError) {
          // Retry connection by reloading
          window.location.reload();
        } else if (isAuthError) {
          // Redirect to home for auth issues
          window.location.href = '/';
        } else if (isResourceError) {
          // Retry loading resources
          window.location.reload();
        } else if (isBrowserError) {
          // Open browser settings help
          window.open('https://support.google.com/chrome/answer/95617', '_blank');
        } else if (isMemoryError) {
          // Close other tabs and reload
          window.location.reload();
        } else if (isScriptError) {
          // Refresh page for script errors
          window.location.reload();
        } else {
          // Refresh page for other errors
          window.location.reload();
        }
      });

      secondaryBtn.addEventListener('click', () => {
        closeOverlay();
        if (isNetworkError) {
          // Open connection check in new tab
          window.open('https://www.google.com/search?q=check+internet+connection', '_blank');
        } else if (isBrowserError) {
          // Suggest different browser
          window.open('https://www.google.com/chrome/', '_blank');
        } else if (isMemoryError) {
          // Refresh page
          window.location.reload();
        } else {
          // Go home for other errors
          window.location.href = '/';
        }
      });

      // Add hover effects
      [primaryBtn, secondaryBtn].forEach(btn => {
        btn.addEventListener('mouseover', (e) => {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        });
        
        btn.addEventListener('mouseout', (e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        });
      });

      // Add to DOM
      document.body.appendChild(overlay);
      this.currentOverlay = overlay;
      
      // Fade in the overlay
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 10);

    } catch (error) {
      console.error('Error creating overlay:', error);
      this.isHandlingError = false;
    }
  };

  // Initialize the global error handler
  init() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    
    // Handle unhandled errors
    window.addEventListener('error', this.handleError);
    
    // Handle resource loading errors
    window.addEventListener('error', this.handleResourceError, true);
    
    // Override console.error to catch more errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      // Check if any of the arguments contain error information
      const errorString = args.join(' ');
      if (errorString.includes('Clerk') || 
          errorString.includes('Failed to fetch') || 
          errorString.includes('Network Error') ||
          errorString.includes('Resource') ||
          errorString.includes('Loading') ||
          errorString.includes('CORS') ||
          errorString.includes('Memory') ||
          errorString.includes('Script')) {
        this.queueError(new Error(errorString));
      }
    };
  }

  // Clean up the error handler
  cleanup() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('error', this.handleResourceError, true);
    
    // Remove any existing error overlay
    this.removeExistingOverlay();
    
    // Clear error queue
    this.errorQueue = [];
    this.isProcessingQueue = false;
    this.isHandlingError = false;
  }
}

// Create and export the global error handler instance
const globalErrorHandler = new GlobalErrorHandler();

export default globalErrorHandler; 