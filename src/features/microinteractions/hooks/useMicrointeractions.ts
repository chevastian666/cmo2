import { useEffect, useState } from 'react';

interface MicrointeractionsConfig {
  animationsEnabled: boolean;
  animationIntensity: 'low' | 'medium' | 'high';
  particlesEnabled: boolean;
  soundsEnabled: boolean;
  soundVolume: number;
  reducedMotion: boolean;
}

export const useMicrointeractions = () => {
  const [config, setConfig] = useState<MicrointeractionsConfig>({
    animationsEnabled: true,
    animationIntensity: 'medium',
    particlesEnabled: true,
    soundsEnabled: true,
    soundVolume: 0.1,
    reducedMotion: false
  });

  useEffect(() => {
    // Load config
    const saved = localStorage.getItem('microinteractions-config');
    if (saved) {
      setConfig(prev => ({ ...prev, ...JSON.parse(saved) }));
    }

    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setConfig(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));

    // Listen for changes
    const handleStorageChange = () => {
      const updated = localStorage.getItem('microinteractions-config');
      if (updated) {
        setConfig(prev => ({ ...prev, ...JSON.parse(updated) }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const shouldAnimate = config.animationsEnabled && !config.reducedMotion;
  const shouldShowParticles = config.particlesEnabled && !config.reducedMotion;

  const getAnimationClass = (baseClass: string) => {
    if (!shouldAnimate) return '';
    
    const intensityModifier = {
      low: 'animation-slow',
      medium: '',
      high: 'animation-fast'
    };

    return `${baseClass} ${intensityModifier[config.animationIntensity]}`;
  };

  return {
    config,
    shouldAnimate,
    shouldShowParticles,
    getAnimationClass
  };
};