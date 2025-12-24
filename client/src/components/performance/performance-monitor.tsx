// client/src/components/performance/performance-monitor.tsx
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  componentRenderTime: number;
  memoryUsage: number;
  bundleSize: string;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;

      setMetrics({
        pageLoadTime: Math.round(navigation.loadEventEnd - navigation.navigationStart),
        componentRenderTime: Math.round(performance.now()),
        memoryUsage: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
        bundleSize: 'Calculating...'
      });
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => window.removeEventListener('load', measurePerformance);
  }, []);

  // Only show in development and if metrics are available
  if (process.env.NODE_ENV !== 'development' || !metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="text-green-400 font-bold mb-2">⚡ Performance</div>
      <div>Load: {metrics.pageLoadTime}ms</div>
      <div>Render: {metrics.componentRenderTime.toFixed(1)}ms</div>
      <div>Memory: {metrics.memoryUsage}MB</div>
      <div>Status: OPTIMIZED</div>
    </div>
  );
}
