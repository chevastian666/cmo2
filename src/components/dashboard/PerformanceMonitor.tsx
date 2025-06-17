import React, { useEffect, useState, Profiler, ProfilerOnRenderCallback } from 'react';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

interface RenderMetric {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: Set<any>;
}

interface PerformanceStats {
  fps: number;
  renderCount: number;
  avgRenderTime: number;
  slowRenders: number;
  droppedFrames: number;
  memoryUsage?: number;
}

export const PerformanceMonitor: React.FC<{ show?: boolean }> = ({ show = true }) => {
  const [metrics, setMetrics] = useState<RenderMetric[]>([]);
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    renderCount: 0,
    avgRenderTime: 0,
    slowRenders: 0,
    droppedFrames: 0
  });

  // FPS monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setStats(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      rafId = requestAnimationFrame(measureFPS);
    };

    rafId = requestAnimationFrame(measureFPS);

    return () => cancelAnimationFrame(rafId);
  }, []);

  // Memory monitoring
  useEffect(() => {
    const measureMemory = () => {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        setStats(prev => ({ ...prev, memoryUsage: usedMB }));
      }
    };

    const interval = setInterval(measureMemory, 2000);
    return () => clearInterval(interval);
  }, []);

  const onRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  ) => {
    const metric: RenderMetric = {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions
    };

    setMetrics(prev => {
      const newMetrics = [...prev.slice(-49), metric]; // Keep last 50
      
      // Calculate stats
      const renderCount = newMetrics.length;
      const avgRenderTime = newMetrics.reduce((sum, m) => sum + m.actualDuration, 0) / renderCount;
      const slowRenders = newMetrics.filter(m => m.actualDuration > 16).length;
      
      setStats(prevStats => ({
        ...prevStats,
        renderCount,
        avgRenderTime,
        slowRenders,
        droppedFrames: prevStats.droppedFrames + (actualDuration > 16 ? 1 : 0)
      }));

      return newMetrics;
    });
  };

  if (!show) return null;

  const fpsColor = stats.fps >= 55 ? 'text-green-400' : 
                   stats.fps >= 30 ? 'text-yellow-400' : 'text-red-400';
  
  const renderTimeColor = stats.avgRenderTime <= 16 ? 'text-green-400' :
                         stats.avgRenderTime <= 33 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-lg p-4 shadow-lg z-50 min-w-[300px]">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-blue-500" />
        Performance Monitor
      </h3>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1">
              <Zap className="h-3 w-3" /> FPS
            </span>
            <span className={`font-mono ${fpsColor}`}>{stats.fps}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Avg Render
            </span>
            <span className={`font-mono ${renderTimeColor}`}>
              {stats.avgRenderTime.toFixed(2)}ms
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Renders</span>
            <span className="font-mono text-gray-300">{stats.renderCount}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Slow</span>
            <span className={`font-mono ${stats.slowRenders > 0 ? 'text-yellow-400' : 'text-gray-300'}`}>
              {stats.slowRenders}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Dropped</span>
            <span className={`font-mono ${stats.droppedFrames > 0 ? 'text-red-400' : 'text-gray-300'}`}>
              {stats.droppedFrames}
            </span>
          </div>

          {stats.memoryUsage && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Memory</span>
              <span className="font-mono text-gray-300">{stats.memoryUsage}MB</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent renders visualization */}
      <div className="mt-3 pt-3 border-t border-gray-800">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Recent Renders</span>
          <TrendingUp className="h-3 w-3 text-gray-400" />
        </div>
        <div className="flex gap-px h-8">
          {metrics.slice(-30).map((metric, i) => {
            const height = Math.min(100, (metric.actualDuration / 33) * 100);
            const color = metric.actualDuration <= 16 ? 'bg-green-500' :
                         metric.actualDuration <= 33 ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <div
                key={i}
                className={`flex-1 ${color} opacity-70 transition-all`}
                style={{ height: `${height}%`, alignSelf: 'flex-end' }}
                title={`${metric.actualDuration.toFixed(2)}ms`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Profiler wrapper component
interface ProfiledComponentProps {
  id: string;
  children: React.ReactNode;
  onRender?: ProfilerOnRenderCallback;
}

export const ProfiledComponent: React.FC<ProfiledComponentProps> = ({ 
  id, 
  children, 
  onRender 
}) => {
  return (
    <Profiler id={id} onRender={onRender || (() => {})}>
      {children}
    </Profiler>
  );
};