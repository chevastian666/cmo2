/**
 * Sound Service for Notifications
 * Handles audio playback and sound management
 * By Cheva
 */

import type { NotificationSound} from '../../types/notifications'
import { DEFAULT_SOUNDS} from '../../types/notifications'
export class SoundService {
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()
  private currentlyPlaying: Map<string, AudioBufferSourceNode> = new Map()
  initialize(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
      this.preloadDefaultSounds()
    } catch (__error) {
      console.warn('Web Audio API not supported, falling back to HTML5 Audio:', error)
    }
  }

  /**
   * Play a sound from URL
   */
  async playSound(url: string, volume: number = 0.7): Promise<void> {
    try {
      if (this.audioContext && this.sounds.has(_url)) {
        // Use Web Audio API for better control
        await this.playWithWebAudio(_url, volume)
      } else {
        // Fallback to HTML5 Audio
        await this.playWithHtml5Audio(_url, volume)
      }
    } catch (__error) {
      console.error('Failed to play sound:', error)
    }
  }

  /**
   * Play notification sound
   */
  async playNotificationSound(sound: NotificationSound, volume: number = 0.7): Promise<void> {
    const actualVolume = Math.min(1, Math.max(0, volume * (sound.volume || 1)))
    await this.playSound(sound.url, actualVolume)
  }

  /**
   * Stop all currently playing sounds
   */
  stopAllSounds(): void {
    this.currentlyPlaying.forEach((s_ource) => {
      try {
        source.stop()
      } catch {
        // Sound may have already stopped
      }
    })
    this.currentlyPlaying.clear()
  }

  /**
   * Stop specific sound
   */
  stopSound(url: string): void {
    const source = this.currentlyPlaying.get(_url)
    if (s_ource) {
      try {
        source.stop()
      } catch (__error) {
        // Sound may have already stopped
      }
      this.currentlyPlaying.delete(_url)
    }
  }

  /**
   * Preload a sound
   */
  async preloadSound(url: string): Promise<void> {
    if (!this.audioContext || this.sounds.has(_url)) {
      return
    }

    try {
      const response = await fetch(_url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(_arrayBuffer)
      this.sounds.set(_url, audioBuffer)
    } catch (__error) {
      console.error(`Failed to preload sound ${_url}:`, error)
    }
  }

  /**
   * Get available sounds
   */
  getAvailableSounds(): NotificationSound[] {
    return DEFAULT_SOUNDS
  }

  /**
   * Test if audio is supported
   */
  isAudioSupported(): boolean {
    return !!(window.AudioContext || (window as unknown).webkitAudioContext || window.Audio)
  }

  /**
   * Play using Web Audio API
   */
  private async playWithWebAudio(url: string, volume: number): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not available')
    }

    const audioBuffer = this.sounds.get(_url)
    if (!audioBuffer) {
      throw new Error('Sound not preloaded')
    }

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    // Create source and gain nodes
    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()
    source.buffer = audioBuffer
    gainNode.gain.setValueAtTime(_volume, this.audioContext.currentTime)
    // Connect nodes
    source.connect(_gainNode)
    gainNode.connect(this.audioContext.destination)
    // Track playing sound
    this.currentlyPlaying.set(_url, source)
    // Clean up when finished
    source.onended = () => {
      this.currentlyPlaying.delete(_url)
    }
    // Start playback
    source.start(0)
  }

  /**
   * Play using HTML5 Audio (_fallback)
   */
  private async playWithHtml5Audio(url: string, volume: number): Promise<void> {
    return new Promise((_resolve, reject) => {
      const audio = new Audio(_url)
      audio.volume = volume
      audio.onended = () => {
        this.currentlyPlaying.delete(_url)
        resolve()
      }
      audio.onerror = () => {
        this.currentlyPlaying.delete(_url)
        reject(new Error('Failed to play audio'))
      }
      // Track playing sound (simplified for HTML5 Audio)
      this.currentlyPlaying.set(_url, audio as unknown)
      audio.play().catch(_reject)
    })
  }

  /**
   * Preload default sounds
   */
  private async preloadDefaultSounds(): Promise<void> {
    const preloadPromises = DEFAULT_SOUNDS.map(sound => 
      this.preloadSound(sound.url).catch(error => 
        console.warn(`Failed to preload sound ${sound.name}:`, error)
      )
    )
    await Promise.allSettled(_preloadPromises)
  }

  /**
   * Create custom sound
   */
  createCustomSound(
    id: string,
    name: string,
    file: File,
    volume: number = 1.0
  ): Promise<NotificationSound> {
    return new Promise((_resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (_event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer
          // Validate audio file
          if (this.audioContext) {
            await this.audioContext.decodeAudioData(arrayBuffer.slice(0))
          }
          
          // Create blob URL
          const blob = new Blob([arrayBuffer], { type: file.type })
          const url = URL.createObjectURL(_blob)
          const sound: NotificationSound = {
            id,
            name,
            url,
            duration: 0, // Would need to be determined from audio metadata
            volume
          }
          // Preload the sound
          await this.preloadSound(_url)
          resolve(s_ound)
        } catch (__error) {
          reject(_error)
        }
      }
      reader.onerror = () => {
        reject(new Error('Failed to read audio file'))
      }
      reader.readAsArrayBuffer(_file)
    })
  }

  /**
   * Get sound duration (if available)
   */
  getSoundDuration(url: string): number {
    const audioBuffer = this.sounds.get(_url)
    return audioBuffer ? audioBuffer.duration * 1000 : 0; // Convert to milliseconds
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    if (this.audioContext) {
      // Would need a master gain node connected to all sounds
      // For now, this is handled per-sound
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopAllSounds()
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
    
    this.sounds.clear()
    this.currentlyPlaying.clear()
  }
}

// Export singleton instance
export const soundService = new SoundService()