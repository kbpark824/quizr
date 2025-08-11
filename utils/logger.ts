// Simple logging utility for development vs production
const isDevelopment = __DEV__;

export const logger = {
  log: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    // Always log errors
    console.error(message, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    // Always log warnings
    console.warn(message, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
};