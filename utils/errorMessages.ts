export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  NO_DATA = 'NO_DATA',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export interface ErrorDetails {
  type: ErrorType;
  title: string;
  message: string;
  suggestion: string;
  canRetry: boolean;
  icon?: string;
}

export function getErrorDetails(error: any): ErrorDetails {
  // Check for specific error patterns
  if (error?.message?.includes('Network request failed') || 
      error?.code === 'NETWORK_ERROR' ||
      error?.message?.includes('fetch') ||
      error?.message?.includes('Could not connect') ||
      error?.name === 'NetworkError') {
    return {
      type: ErrorType.NETWORK_ERROR,
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection.',
      suggestion: 'Make sure you\'re connected to Wi-Fi or cellular data and try again.',
      canRetry: true,
      icon: '📡'
    };
  }

  if (error?.message?.includes('timeout') || error?.code === 'TIMEOUT') {
    return {
      type: ErrorType.TIMEOUT,
      title: 'Request Timeout',
      message: 'The request is taking too long to complete.',
      suggestion: 'This might be due to slow internet. Please try again.',
      canRetry: true,
      icon: '⏰'
    };
  }

  if (error?.status === 429 || error?.message?.includes('rate limit')) {
    return {
      type: ErrorType.RATE_LIMIT,
      title: 'Too Many Requests',
      message: 'You\'ve made too many requests recently.',
      suggestion: 'Please wait a moment before trying again.',
      canRetry: true,
      icon: '🚦'
    };
  }

  if (error?.status >= 500 || error?.message?.includes('server error')) {
    return {
      type: ErrorType.API_ERROR,
      title: 'Server Issue',
      message: 'Our servers are having trouble right now.',
      suggestion: 'This is temporary. Please try again in a few minutes.',
      canRetry: true,
      icon: '🔧'
    };
  }

  if (error?.message?.includes('No question found') || error?.message?.includes('No data')) {
    return {
      type: ErrorType.NO_DATA,
      title: 'No Question Available',
      message: 'There\'s no trivia question available right now.',
      suggestion: 'New questions are added daily. Check back tomorrow!',
      canRetry: false,
      icon: '📝'
    };
  }

  // Default/unknown error
  return {
    type: ErrorType.UNKNOWN,
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred while loading the question.',
    suggestion: 'Please try again. If the problem persists, restart the app.',
    canRetry: true,
    icon: '⚠️'
  };
}

export function getErrorTitle(errorMessage: string): string {
  const errorDetails = getErrorDetails({ message: errorMessage });
  return errorDetails.title;
}

export function getErrorSuggestion(errorMessage: string): string {
  const errorDetails = getErrorDetails({ message: errorMessage });
  return errorDetails.suggestion;
}

export function getContextualHelp(error: any, context?: string): string[] {
  const errorDetails = getErrorDetails(error);
  const baseHelp = [errorDetails.suggestion];
  
  switch (errorDetails.type) {
    case ErrorType.NETWORK_ERROR:
      return [
        ...baseHelp,
        'Try switching between Wi-Fi and cellular data',
        'Check if other apps can access the internet',
        'Move to an area with better signal strength'
      ];
    
    case ErrorType.TIMEOUT:
      return [
        ...baseHelp,
        'Check your internet speed',
        'Try again when you have a more stable connection',
        'Close other apps that might be using bandwidth'
      ];
    
    case ErrorType.API_ERROR:
      return [
        ...baseHelp,
        'This is likely a temporary server issue',
        'Our team has been notified automatically',
        'Try again in a few minutes'
      ];
    
    case ErrorType.NO_DATA:
      return [
        'Questions are updated daily at midnight',
        'Make sure you have the latest app version',
        'Contact support if this continues tomorrow'
      ];
    
    case ErrorType.RATE_LIMIT:
      return [
        ...baseHelp,
        'You can try again in a few minutes',
        'This helps us keep the service running smoothly for everyone'
      ];
    
    default:
      return [
        ...baseHelp,
        'Try closing and reopening the app',
        'Restart your device if the problem continues',
        'Contact support if issues persist'
      ];
  }
}