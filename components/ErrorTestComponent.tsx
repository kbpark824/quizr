import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * Component for testing error boundaries in development
 * This should NOT be included in production builds
 */
export const ErrorTestComponent: React.FC = () => {
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [shouldThrowAsyncError, setShouldThrowAsyncError] = useState(false);

  // Only render in development
  if (!__DEV__) {
    return null;
  }

  // Throw synchronous error for React error boundary testing
  if (shouldThrowError) {
    throw new Error('Test error for React Error Boundary');
  }

  // Simulate async error
  if (shouldThrowAsyncError) {
    setTimeout(() => {
      throw new Error('Test async error');
    }, 100);
    setShouldThrowAsyncError(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 Error Boundary Testing (Dev Only)</Text>
      
      <TouchableOpacity
        style={styles.errorButton}
        onPress={() => setShouldThrowError(true)}
      >
        <Text style={styles.buttonText}>Test React Error Boundary</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.asyncErrorButton}
        onPress={() => setShouldThrowAsyncError(true)}
      >
        <Text style={styles.buttonText}>Test Async Error</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.promiseErrorButton}
        onPress={() => {
          // Test unhandled promise rejection
          Promise.reject(new Error('Test promise rejection'));
        }}
      >
        <Text style={styles.buttonText}>Test Promise Rejection</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff3e0',
    margin: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e65100',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorButton: {
    backgroundColor: '#d32f2f',
    padding: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  asyncErrorButton: {
    backgroundColor: '#f57c00',
    padding: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  promiseErrorButton: {
    backgroundColor: '#7b1fa2',
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
});