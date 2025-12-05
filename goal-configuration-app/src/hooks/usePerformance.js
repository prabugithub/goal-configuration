import { useEffect, useRef, useCallback } from 'react';

/**
 * usePerformance - Hook for tracking and optimizing component performance
 * Measures render time, provides performance metrics
 */
export const usePerformance = (componentName) => {
  const renderStartRef = useRef(Date.now());
  const renderCountRef = useRef(0);

  useEffect(() => {
    const renderTime = Date.now() - renderStartRef.current;
    renderCountRef.current += 1;

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${componentName} rendered in ${renderTime}ms (render #${renderCountRef.current})`
      );
    }

    // Web Vitals reporting (optional)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`[Perf] ${entry.name}: ${entry.duration}ms`);
        }
      });
      observer.observe({ entryTypes: ['measure'] });
    }
  });

  const measurePerformance = useCallback((label) => {
    performance.mark(`${componentName}-${label}-start`);
    return () => {
      performance.mark(`${componentName}-${label}-end`);
      performance.measure(
        `${componentName}-${label}`,
        `${componentName}-${label}-start`,
        `${componentName}-${label}-end`
      );
    };
  }, [componentName]);

  return {
    measurePerformance,
    renderCount: renderCountRef.current,
  };
};

/**
 * useDebounce - Debounce values for expensive operations
 * Useful for search input, window resize, etc.
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = require('react').useState(value);

  require('react').useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useThrottle - Throttle function calls
 * Useful for scroll events, resize events
 */
export const useThrottle = (callback, delay = 300) => {
  const lastRunRef = useRef(Date.now());

  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delay) {
        callback(...args);
        lastRunRef.current = now;
      }
    },
    [callback, delay]
  );
};

/**
 * useLazyLoad - Lazy load components when in viewport
 * Great for images, charts, heavy components
 */
export const useLazyLoad = (ref, callback, options = {}) => {
  const { threshold = 0.1, rootMargin = '50px' } = options;

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, callback, threshold, rootMargin]);
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitoring = {
  /**
   * Get Web Vitals metrics
   */
  getWebVitals: () => {
    const vitals = {};

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            vitals.cls = (vitals.cls || 0) + entry.value;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0];
        vitals.fid = firstEntry.processingDuration;
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }

    return vitals;
  },

  /**
   * Get navigation timing metrics
   */
  getNavigationTiming: () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    return {
      pageLoadTime,
      connectTime,
      renderTime,
      dns: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp: perfData.connectEnd - perfData.connectStart,
      ttfb: perfData.responseStart - perfData.navigationStart,
    };
  },

  /**
   * Log performance metrics
   */
  logMetrics: (label = 'Performance Report') => {
    const timing = performanceMonitoring.getNavigationTiming();
    const vitals = performanceMonitoring.getWebVitals();

    console.group(label);
    console.table(timing);
    console.table(vitals);
    console.groupEnd();
  },

  /**
   * Check if rendering takes too long
   */
  warnSlowRender: (componentName, threshold = 16) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (renderTime > threshold) {
        console.warn(
          `[Slow Render] ${componentName} took ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
        );
      }
    };
  },
};

/**
 * Memory utilities
 */
export const memoryMonitoring = {
  /**
   * Get memory usage (if available)
   */
  getMemoryUsage: () => {
    if (!performance.memory) {
      console.warn('Memory API not available');
      return null;
    }

    return {
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      heapUsagePercent: (
        (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) *
        100
      ).toFixed(2) + '%',
    };
  },

  /**
   * Warn if memory usage is high
   */
  warnHighMemory: (threshold = 90) => {
    const memory = memoryMonitoring.getMemoryUsage();
    if (!memory) return;

    const usagePercent = parseFloat(memory.heapUsagePercent);
    if (usagePercent > threshold) {
      console.warn(
        `[High Memory] Heap usage: ${memory.heapUsagePercent} (threshold: ${threshold}%)`
      );
    }
  },
};

/**
 * Network monitoring
 */
export const networkMonitoring = {
  /**
   * Get request metrics for Network API
   */
  getRequestMetrics: () => {
    const entries = performance.getEntries();
    const requests = entries.filter((entry) => entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest');

    return requests.map((req) => ({
      name: req.name,
      duration: req.duration.toFixed(2) + 'ms',
      size: req.transferSize ? (req.transferSize / 1024).toFixed(2) + 'KB' : 'N/A',
    }));
  },

  /**
   * Get connection speed estimation
   */
  getConnectionSpeed: () => {
    if (!navigator.connection) {
      return 'Unknown';
    }

    const type = navigator.connection.effectiveType;
    const speed = {
      '4g': 'Fast (4G)',
      '3g': 'Moderate (3G)',
      '2g': 'Slow (2G)',
      'slow-2g': 'Very Slow (Slow 2G)',
    };

    return speed[type] || type;
  },
};

export default {
  usePerformance,
  useDebounce,
  useThrottle,
  useLazyLoad,
  performanceMonitoring,
  memoryMonitoring,
  networkMonitoring,
};
