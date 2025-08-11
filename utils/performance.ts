import { logger } from './logger';

interface PerformanceMetrics {
  renderCount: number;
  memoHits: number;
  memoMisses: number;
  lastRenderTime?: number;
}

// Global performance tracking
const performanceMetrics: Map<string, PerformanceMetrics> = new Map();

/**
 * Track component render performance
 */
export const trackRender = (componentName: string) => {
  const metrics = performanceMetrics.get(componentName) || {
    renderCount: 0,
    memoHits: 0,
    memoMisses: 0,
  };
  
  metrics.renderCount++;
  metrics.lastRenderTime = Date.now();
  
  performanceMetrics.set(componentName, metrics);
  
  if (__DEV__) {
    logger.debug(`🔄 ${componentName} render #${metrics.renderCount}`);
  }
};

/**
 * Track memoization hits/misses
 */
export const trackMemoization = (componentName: string, hit: boolean) => {
  const metrics = performanceMetrics.get(componentName) || {
    renderCount: 0,
    memoHits: 0,
    memoMisses: 0,
  };
  
  if (hit) {
    metrics.memoHits++;
  } else {
    metrics.memoMisses++;
  }
  
  performanceMetrics.set(componentName, metrics);
  
  if (__DEV__) {
    const hitRate = (metrics.memoHits / (metrics.memoHits + metrics.memoMisses)) * 100;
    logger.debug(`📊 ${componentName} memo hit rate: ${hitRate.toFixed(1)}%`);
  }
};

/**
 * Measure function execution time
 */
export const measurePerformance = <T>(
  name: string,
  fn: () => T
): T => {
  if (!__DEV__) {
    return fn();
  }
  
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  logger.debug(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
  
  return result;
};

/**
 * Create a performance-aware hook
 */
export const withPerformanceTracking = <T extends any[], R>(
  hookName: string,
  hook: (...args: T) => R
) => {
  return (...args: T): R => {
    trackRender(hookName);
    return measurePerformance(hookName, () => hook(...args));
  };
};

/**
 * Get performance metrics for debugging
 */
export const getPerformanceMetrics = (): Record<string, PerformanceMetrics> => {
  const result: Record<string, PerformanceMetrics> = {};
  performanceMetrics.forEach((metrics, componentName) => {
    result[componentName] = { ...metrics };
  });
  return result;
};

/**
 * Reset performance metrics
 */
export const resetPerformanceMetrics = () => {
  performanceMetrics.clear();
  if (__DEV__) {
    logger.debug('🗑️ Performance metrics reset');
  }
};

/**
 * Performance validation utilities
 */
export const validatePerformance = {
  /**
   * Check if a component is rendering too frequently
   */
  checkRenderFrequency: (componentName: string, maxRendersPerSecond: number = 10) => {
    const metrics = performanceMetrics.get(componentName);
    if (!metrics || !metrics.lastRenderTime) return true;
    
    const timeSinceLastRender = Date.now() - metrics.lastRenderTime;
    const minTimeBetweenRenders = 1000 / maxRendersPerSecond;
    
    return timeSinceLastRender >= minTimeBetweenRenders;
  },
  
  /**
   * Check memoization effectiveness
   */
  checkMemoizationEffectiveness: (componentName: string, minHitRate: number = 0.7) => {
    const metrics = performanceMetrics.get(componentName);
    if (!metrics || (metrics.memoHits + metrics.memoMisses) === 0) return true;
    
    const hitRate = metrics.memoHits / (metrics.memoHits + metrics.memoMisses);
    return hitRate >= minHitRate;
  },
};

// Development-only performance reporting
if (__DEV__) {
  // Report performance metrics every 30 seconds in development
  setInterval(() => {
    const metrics = getPerformanceMetrics();
    const componentNames = Object.keys(metrics);
    
    if (componentNames.length > 0) {
      logger.debug('📈 Performance Report:');
      componentNames.forEach(name => {
        const metric = metrics[name];
        const hitRate = metric.memoHits + metric.memoMisses > 0 
          ? (metric.memoHits / (metric.memoHits + metric.memoMisses) * 100).toFixed(1)
          : 'N/A';
        logger.debug(`  ${name}: ${metric.renderCount} renders, ${hitRate}% memo hit rate`);
      });
    }
  }, 30000);
}