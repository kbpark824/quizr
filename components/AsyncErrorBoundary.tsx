import React, { ReactNode, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { logger } from '@/utils/logger';

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error) => void;
  resetKeys?: Array<string | number | boolean | null | undefined>;
}

interface AsyncError {
  error: Error;
  timestamp: number;
  id: string;
}

/**
 * AsyncErrorBoundary - Handles errors that occur in async operations (hooks, promises)
 * that don't get caught by regular React error boundaries
 */
export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  resetKeys = [],
}) => {
  const [asyncError, setAsyncError] = useState<AsyncError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Reset error when resetKeys change
  useEffect(() => {
    if (asyncError) {
      setAsyncError(null);
      setRetryCount(0);
    }
  }, resetKeys);

  // Global error handler for unhandled promise rejections in this context
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Only handle if we don't already have an error
      if (!asyncError) {
        const error = new Error(
          `Unhandled Promise Rejection: ${event.reason?.message || event.reason}`
        );
        handleAsyncError(error);
        event.preventDefault();
      }
    };

    // Note: In React Native, we might need to handle this differently
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, [asyncError]);

  const handleAsyncError = (error: Error) => {
    const asyncErrorObj: AsyncError = {
      error,
      timestamp: Date.now(),
      id: `async-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    logger.error('Async error caught:', {
      error: error.message,
      stack: error.stack,
      errorId: asyncErrorObj.id,
      retryCount,
    });

    setAsyncError(asyncErrorObj);
    onError?.(error);
  };

  const handleRetry = () => {
    logger.debug('Retrying after async error', { 
      errorId: asyncError?.id,
      retryCount: retryCount + 1 
    });
    
    setAsyncError(null);
    setRetryCount(prev => prev + 1);
  };

  if (asyncError) {
    // Use custom fallback if provided
    if (fallback) {
      return <>{fallback(asyncError.error, handleRetry)}</>;
    }

    // Default async error UI
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>
            We're having trouble loading your content. This might be due to a network issue or server problem.
          </Text>
          
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>
                Error: {asyncError.error.message}
              </Text>
              <Text style={styles.debugText}>
                Retry Count: {retryCount}
              </Text>
              <Text style={styles.debugText}>
                Error ID: {asyncError.id}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>
              Try Again {retryCount > 0 && `(${retryCount})`}
            </Text>
          </TouchableOpacity>

          {retryCount > 2 && (
            <Text style={styles.helpText}>
              Still having issues? Please check your internet connection or try again later.
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Create a context to pass error handler to children
  return (
    <AsyncErrorContext.Provider value={handleAsyncError}>
      {children}
    </AsyncErrorContext.Provider>
  );
};

// Context for child components to report async errors
const AsyncErrorContext = React.createContext<((error: Error) => void) | null>(null);

// Hook for child components to report async errors
export const useAsyncErrorHandler = () => {
  const handleError = React.useContext(AsyncErrorContext);
  
  if (!handleError) {
    // Fallback to logging if not within AsyncErrorBoundary
    return (error: Error) => {
      logger.error('Async error (no boundary):', error);
    };
  }

  return handleError;
};

// Higher-order component to wrap async operations
export const withAsyncErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <AsyncErrorBoundary
        onError={(error) => {
          logger.error(`Error in ${componentName || Component.name}:`, error);
        }}
      >
        <Component {...props} />
      </AsyncErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withAsyncErrorHandling(${componentName || Component.name})`;
  return WrappedComponent;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: '90%',
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e65100',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  debugContainer: {
    backgroundColor: '#fff3e0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#ff8f00',
    marginBottom: 3,
  },
  retryButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  helpText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});