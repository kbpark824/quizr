import { getPerformanceMetrics, resetPerformanceMetrics, validatePerformance } from './performance';
import { logger } from './logger';

/**
 * Development-only performance debugging utilities
 */
export const PerformanceDebugger = {
  /**
   * Log current performance metrics
   */
  logMetrics: () => {
    if (!__DEV__) return;
    
    const metrics = getPerformanceMetrics();
    const componentNames = Object.keys(metrics);
    
    if (componentNames.length === 0) {
      logger.debug('📊 No performance metrics available');
      return;
    }
    
    logger.debug('📊 Current Performance Metrics:');
    logger.debug('═'.repeat(50));
    
    componentNames.forEach(name => {
      const metric = metrics[name];
      const totalMemoChecks = metric.memoHits + metric.memoMisses;
      const hitRate = totalMemoChecks > 0 
        ? (metric.memoHits / totalMemoChecks * 100).toFixed(1)
        : 'N/A';
      
      logger.debug(`🔄 ${name}:`);
      logger.debug(`   Renders: ${metric.renderCount}`);
      logger.debug(`   Memo Hits: ${metric.memoHits}`);
      logger.debug(`   Memo Misses: ${metric.memoMisses}`);
      logger.debug(`   Hit Rate: ${hitRate}%`);
      logger.debug('');
    });
  },
  
  /**
   * Validate performance and log warnings
   */
  validateAndLog: () => {
    if (!__DEV__) return;
    
    const metrics = getPerformanceMetrics();
    const componentNames = Object.keys(metrics);
    let hasIssues = false;
    
    componentNames.forEach(name => {
      const renderFrequencyOk = validatePerformance.checkRenderFrequency(name, 10);
      const memoEffectivenessOk = validatePerformance.checkMemoizationEffectiveness(name, 0.7);
      
      if (!renderFrequencyOk) {
        logger.warn(`⚠️ ${name}: Rendering too frequently (>10 renders/second)`);
        hasIssues = true;
      }
      
      if (!memoEffectivenessOk) {
        const metric = metrics[name];
        const totalMemoChecks = metric.memoHits + metric.memoMisses;
        const hitRate = totalMemoChecks > 0 
          ? (metric.memoHits / totalMemoChecks * 100).toFixed(1)
          : '0';
        logger.warn(`⚠️ ${name}: Low memoization effectiveness (${hitRate}% hit rate, expected >70%)`);
        hasIssues = true;
      }
    });
    
    if (!hasIssues && componentNames.length > 0) {
      logger.debug('✅ All components performing within expected parameters');
    }
  },
  
  /**
   * Clear all metrics
   */
  reset: () => {
    if (!__DEV__) return;
    resetPerformanceMetrics();
    logger.debug('🗑️ Performance metrics cleared');
  },
  
  /**
   * Start performance monitoring
   */
  startMonitoring: (intervalMs: number = 30000) => {
    if (!__DEV__) return;
    
    logger.debug('🚀 Performance monitoring started');
    
    const interval = setInterval(() => {
      PerformanceDebugger.validateAndLog();
    }, intervalMs);
    
    // Return cleanup function
    return () => {
      clearInterval(interval);
      logger.debug('⏹️ Performance monitoring stopped');
    };
  },
  
  /**
   * Generate performance report
   */
  generateReport: () => {
    if (!__DEV__) return '';
    
    const metrics = getPerformanceMetrics();
    const componentNames = Object.keys(metrics);
    
    if (componentNames.length === 0) {
      return 'No performance data available';
    }
    
    let report = 'Performance Report\n';
    report += '=================\n\n';
    
    componentNames.forEach(name => {
      const metric = metrics[name];
      const totalMemoChecks = metric.memoHits + metric.memoMisses;
      const hitRate = totalMemoChecks > 0 
        ? (metric.memoHits / totalMemoChecks * 100).toFixed(1)
        : 'N/A';
      
      report += `Component: ${name}\n`;
      report += `  Renders: ${metric.renderCount}\n`;
      report += `  Memoization Hit Rate: ${hitRate}%\n`;
      report += `  Last Render: ${metric.lastRenderTime ? new Date(metric.lastRenderTime).toLocaleTimeString() : 'N/A'}\n\n`;
    });
    
    return report;
  },
};

// Auto-start monitoring in development
if (__DEV__) {
  // Start monitoring after a short delay to allow components to initialize
  setTimeout(() => {
    PerformanceDebugger.startMonitoring();
  }, 5000);
  
  // Add global debugging helpers
  if (typeof global !== 'undefined') {
    (global as any).perf = PerformanceDebugger;
  }
}