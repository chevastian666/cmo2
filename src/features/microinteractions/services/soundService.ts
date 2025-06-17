interface SoundConfig {
  volume: number;
  enabled: boolean;
  respectedSystemPreference: boolean;
}

class ASMRSoundService {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private config: SoundConfig = {
    volume: 0.1, // Very low default volume
    enabled: true,
    respectedSystemPreference: true
  };

  // Sound file paths
  private readonly soundPaths = {
    success: '/sounds/crystal-success.mp3',
    notification: '/sounds/water-drop.mp3',
    complete: '/sounds/zen-bell.mp3',
    error: '/sounds/soft-wood.mp3',
    hover: '/sounds/whisper-hover.mp3',
    refresh: '/sounds/soft-refresh.mp3',
    open: '/sounds/paper-fold.mp3',
    close: '/sounds/paper-unfold.mp3'
  };

  constructor() {
    this.initializeAudioContext();
    this.loadSounds();
    this.loadConfig();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private async loadSounds() {
    if (!this.audioContext) return;

    for (const [name, path] of Object.entries(this.soundPaths)) {
      try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.sounds.set(name, audioBuffer);
      } catch (error) {
        console.warn(`Failed to load sound ${name}:`, error);
      }
    }
  }

  private loadConfig() {
    const savedConfig = localStorage.getItem('asmr-sound-config');
    if (savedConfig) {
      this.config = { ...this.config, ...JSON.parse(savedConfig) };
    }

    // Check system preference
    if (this.config.respectedSystemPreference) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        this.config.enabled = false;
      }
    }
  }

  saveConfig(updates: Partial<SoundConfig>) {
    this.config = { ...this.config, ...updates };
    localStorage.setItem('asmr-sound-config', JSON.stringify(this.config));
  }

  async play(soundName: string, options?: { volume?: number; pitch?: number }) {
    if (!this.config.enabled || !this.audioContext || this.audioContext.state === 'suspended') {
      return;
    }

    const buffer = this.sounds.get(soundName);
    if (!buffer) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set volume
      const volume = (options?.volume ?? 1) * this.config.volume;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

      // Set pitch if provided
      if (options?.pitch) {
        source.playbackRate.setValueAtTime(options.pitch, this.audioContext.currentTime);
      }

      // Add slight randomization for organic feel
      const detune = (Math.random() - 0.5) * 20; // ±10 cents
      source.detune.setValueAtTime(detune, this.audioContext.currentTime);

      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  // Convenience methods for common actions
  playSuccess() {
    this.play('success', { volume: 0.8 });
  }

  playNotification() {
    this.play('notification', { volume: 1 });
  }

  playComplete() {
    this.play('complete', { volume: 0.6 });
  }

  playError() {
    this.play('error', { volume: 0.7 });
  }

  playHover() {
    this.play('hover', { volume: 0.3 });
  }

  playRefresh() {
    this.play('refresh', { volume: 0.5 });
  }

  playOpen() {
    this.play('open', { volume: 0.6 });
  }

  playClose() {
    this.play('close', { volume: 0.6 });
  }

  // Create ambient soundscape
  async playAmbient() {
    if (!this.config.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Very subtle volume
    gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
    
    // Fade in
    gainNode.gain.exponentialRampToValueAtTime(0.02, this.audioContext.currentTime + 2);
    
    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 28);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 30);
  }

  // Resume audio context on user interaction
  async resume() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  setVolume(volume: number) {
    this.saveConfig({ volume: Math.max(0, Math.min(1, volume)) });
  }

  setEnabled(enabled: boolean) {
    this.saveConfig({ enabled });
  }

  getConfig() {
    return { ...this.config };
  }
}

export const asmrSoundService = new ASMRSoundService();

// Hook for React components
export const useASMRSound = () => {
  const playSound = (sound: string, options?: { volume?: number; pitch?: number }) => {
    asmrSoundService.play(sound, options);
  };

  const resumeContext = () => {
    asmrSoundService.resume();
  };

  return {
    playSound,
    playSuccess: () => asmrSoundService.playSuccess(),
    playNotification: () => asmrSoundService.playNotification(),
    playComplete: () => asmrSoundService.playComplete(),
    playError: () => asmrSoundService.playError(),
    playHover: () => asmrSoundService.playHover(),
    playRefresh: () => asmrSoundService.playRefresh(),
    playOpen: () => asmrSoundService.playOpen(),
    playClose: () => asmrSoundService.playClose(),
    playAmbient: () => asmrSoundService.playAmbient(),
    resumeContext,
    config: asmrSoundService.getConfig()
  };
};