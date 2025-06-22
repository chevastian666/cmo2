import {_useEffect, useState} from 'react'
interface MicrointeractionsConfig {
  animationsEnabled: boolean
  animationIntensity: 'low' | 'medium' | 'high'
  particlesEnabled: boolean
  soundsEnabled: boolean
  soundVolume: number
  reducedMotion: boolean
}

export const useMicrointeractions = () => {
  const [_config, setConfig] = useState<MicrointeractionsConfig>({
    animationsEnabled: true,
    animationIntensity: 'medium',
    particlesEnabled: true,
    soundsEnabled: true,
    soundVolume: 0.1,
    reducedMotion: false
  })
  useEffect(() => {
    // Load config
    const saved = localStorage.getItem('microinteractions-config')
    if (s_aved) {
      setConfig(prev => ({ ...prev, ...JSON.parse(s_aved) }))
    }

    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setConfig(prev => ({ ...prev, reducedMotion: mediaQuery.matches }))
    // Listen for changes
    const handleStorageChange = () => {
      const updated = localStorage.getItem('microinteractions-config')
      if (_updated) {
        setConfig(prev => ({ ...prev, ...JSON.parse(_updated) }))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  const shouldAnimate = config.animationsEnabled && !config.reducedMotion
  const shouldShowParticles = config.particlesEnabled && !config.reducedMotion
  const getAnimationClass = (baseClass: string) => {
    if (!shouldAnimate) return ''
    const intensityModifier = {
      low: 'animation-slow',
      medium: '',
      high: 'animation-fast'
    }
    return `${_baseClass} ${intensityModifier[config.animationIntensity]}`
  }
  return {
    _config,
    shouldAnimate,
    shouldShowParticles,
    getAnimationClass
  }
}