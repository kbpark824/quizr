import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number | boolean | null | undefined>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error details
    logger.error('Error boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report error to monitoring service in production
    if (!__DEV__) {
      this.reportErrorToService(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state when props change (if enabled)
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, idx) => prevResetKeys[idx] !== key
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, you might want to send errors to a service like Sentry
    // For now, we'll just log them in a structured way
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      userAgent: navigator.userAgent || 'unknown',
      errorId: this.state.errorId,
    };

    // TODO: Send to error reporting service
    logger.error('Production error report:', errorReport);
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleRetry = () => {
    logger.debug('User initiated error boundary reset');
    this.resetErrorBoundary();
  };

  private handleAutoRetry = () => {
    logger.debug('Auto-retrying after error boundary');
    this.resetTimeoutId = setTimeout(() => {
      this.resetErrorBoundary();
    }, 3000) as unknown as number;
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorMessage}>
              We encountered an unexpected error. Don't worry, this happens sometimes!
            </Text>
            
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.debugText}>
                  {this.state.error.name}: {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text style={styles.debugStack}>
                    {this.state.error.stack}
                  </Text>
                )}
                {this.state.errorInfo?.componentStack && (
                  <>
                    <Text style={styles.debugTitle}>Component Stack:</Text>
                    <Text style={styles.debugStack}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  </>
                )}
              </ScrollView>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
              
              {!__DEV__ && (
                <TouchableOpacity style={styles.autoRetryButton} onPress={this.handleAutoRetry}>
                  <Text style={styles.autoRetryButtonText}>Auto Retry in 3s</Text>
                </TouchableOpacity>
              )}
            </View>

            {this.state.errorId && (
              <Text style={styles.errorId}>
                Error ID: {this.state.errorId}
              </Text>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

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
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
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
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    maxHeight: 200,
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  debugStack: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  retryButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    maxWidth: 120,
  },
  retryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  autoRetryButton: {
    backgroundColor: '#757575',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    maxWidth: 120,
  },
  autoRetryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },
  errorId: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});

// Convenient wrapper component for common use cases
export const AppErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      // You can customize error handling here
      logger.error('App-level error caught:', { error: error.message });
    }}
  >
    {children}
  </ErrorBoundary>
);

// Error boundary for specific sections
export const SectionErrorBoundary: React.FC<{ 
  children: ReactNode; 
  sectionName: string;
  fallback?: ReactNode;
}> = ({ children, sectionName, fallback }) => (
  <ErrorBoundary
    fallback={fallback || (
      <View style={styles.sectionErrorContainer}>
        <Text style={styles.sectionErrorText}>
          {sectionName} is temporarily unavailable
        </Text>
        <Text style={styles.sectionErrorSubtext}>
          Please try refreshing the app
        </Text>
      </View>
    )}
    onError={(error) => {
      logger.error(`${sectionName} section error:`, { error: error.message });
    }}
  >
    {children}
  </ErrorBoundary>
);

const sectionErrorStyles = StyleSheet.create({
  sectionErrorContainer: {
    padding: 20,
    backgroundColor: '#fff3e0',
    borderRadius: 5,
    margin: 10,
    alignItems: 'center',
  },
  sectionErrorText: {
    fontSize: 16,
    color: '#f57c00',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionErrorSubtext: {
    fontSize: 14,
    color: '#ff8f00',
    textAlign: 'center',
    marginTop: 5,
  },
});

Object.assign(styles, sectionErrorStyles);