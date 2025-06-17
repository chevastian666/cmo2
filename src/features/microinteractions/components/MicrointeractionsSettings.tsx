import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Settings, X } from 'lucide-react';
import { cn } from '../../../utils/utils';
import { asmrSoundService, useASMRSound } from '../services/soundService';

interface MicrointeractionsConfig {
  animationsEnabled: boolean;
  animationIntensity: 'low' | 'medium' | 'high';
  particlesEnabled: boolean;
  soundsEnabled: boolean;
  soundVolume: number;
  reducedMotion: boolean;
}

export const MicrointeractionsSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { config: soundConfig, playHover, playOpen, playClose } = useASMRSound();
  
  const [config, setConfig] = useState<MicrointeractionsConfig>({
    animationsEnabled: true,
    animationIntensity: 'medium',
    particlesEnabled: true,
    soundsEnabled: soundConfig.enabled,
    soundVolume: soundConfig.volume,
    reducedMotion: false
  });

  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('microinteractions-config');
    if (saved) {
      const parsed = JSON.parse(saved);
      setConfig(prev => ({ ...prev, ...parsed }));
    }

    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setConfig(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));

    const handleChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save config changes
  const updateConfig = (updates: Partial<MicrointeractionsConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem('microinteractions-config', JSON.stringify(newConfig));

    // Update sound service
    if ('soundsEnabled' in updates) {
      asmrSoundService.setEnabled(updates.soundsEnabled!);
    }
    if ('soundVolume' in updates) {
      asmrSoundService.setVolume(updates.soundVolume!);
    }
  };

  const handleToggle = () => {
    if (isOpen) {
      playClose();
      setIsOpen(false);
    } else {
      playOpen();
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={handleToggle}
        onMouseEnter={() => playHover()}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        title="Configuración de microinteracciones"
      >
        <Sparkles className="h-5 w-5 text-purple-400" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleToggle}
          />

          {/* Panel */}
          <div className="fixed right-4 bottom-20 w-80 bg-gray-900 rounded-lg shadow-2xl border border-gray-800 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-white">Microinteracciones</h3>
              </div>
              <button
                onClick={handleToggle}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Animations */}
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Animaciones</span>
                  <input
                    type="checkbox"
                    checked={config.animationsEnabled && !config.reducedMotion}
                    onChange={(e) => updateConfig({ animationsEnabled: e.target.checked })}
                    disabled={config.reducedMotion}
                    className="toggle-checkbox"
                  />
                </label>

                {config.animationsEnabled && !config.reducedMotion && (
                  <div className="ml-4 space-y-1">
                    <label className="text-xs text-gray-400">Intensidad</label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map(level => (
                        <button
                          key={level}
                          onClick={() => updateConfig({ animationIntensity: level })}
                          className={cn(
                            'px-3 py-1 text-xs rounded transition-colors',
                            config.animationIntensity === level
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          )}
                        >
                          {level === 'low' ? 'Baja' : level === 'medium' ? 'Media' : 'Alta'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Particles */}
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Partículas</span>
                <input
                  type="checkbox"
                  checked={config.particlesEnabled && !config.reducedMotion}
                  onChange={(e) => updateConfig({ particlesEnabled: e.target.checked })}
                  disabled={config.reducedMotion}
                  className="toggle-checkbox"
                />
              </label>

              {/* Sounds */}
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    Sonidos ASMR
                    {config.soundsEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                  </span>
                  <input
                    type="checkbox"
                    checked={config.soundsEnabled}
                    onChange={(e) => updateConfig({ soundsEnabled: e.target.checked })}
                    className="toggle-checkbox"
                  />
                </label>

                {config.soundsEnabled && (
                  <div className="ml-4 space-y-1">
                    <label className="text-xs text-gray-400">Volumen</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.soundVolume * 100}
                      onChange={(e) => updateConfig({ soundVolume: Number(e.target.value) / 100 })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="text-xs text-gray-500 text-right">{Math.round(config.soundVolume * 100)}%</div>
                  </div>
                )}
              </div>

              {/* System preference notice */}
              {config.reducedMotion && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded text-xs text-yellow-400">
                  Las animaciones están desactivadas porque tu sistema tiene activado "Reducir movimiento"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
              Las preferencias se guardan automáticamente
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .toggle-checkbox {
          width: 40px;
          height: 20px;
          appearance: none;
          background-color: #374151;
          border-radius: 10px;
          position: relative;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .toggle-checkbox:checked {
          background-color: #8b5cf6;
        }

        .toggle-checkbox:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toggle-checkbox::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: white;
          top: 2px;
          left: 2px;
          transition: transform 0.3s;
        }

        .toggle-checkbox:checked::after {
          transform: translateX(20px);
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #8b5cf6;
          border-radius: 50%;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: #8b5cf6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </>
  );
};