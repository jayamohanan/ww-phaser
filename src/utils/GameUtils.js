export class ResponsiveManager {
  constructor(scene) {
    this.scene = scene;
    this.isMobile = this.detectMobile();
    this.isTablet = this.detectTablet();
    this.orientation = this.getOrientation();
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.orientation = this.getOrientation();
        this.handleOrientationChange();
      }, 100);
    });
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && 'ontouchstart' in window);
  }

  detectTablet() {
    return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768 && window.innerWidth <= 1024;
  }

  getOrientation() {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  getOptimalFontSize(baseFontSize) {
    const scale = this.getUIScale();
    return Math.max(12, Math.floor(baseFontSize * scale));
  }

  getUIScale() {
    if (this.isMobile) {
      return this.orientation === 'portrait' ? 0.8 : 0.9;
    }
    return 1.0;
  }

  getButtonSize(baseWidth, baseHeight) {
    const scale = this.getUIScale();
    const minTouchSize = this.isMobile ? 44 : 0; // iOS guideline minimum touch target
    
    return {
      width: Math.max(minTouchSize, baseWidth * scale),
      height: Math.max(minTouchSize, baseHeight * scale)
    };
  }

  handleOrientationChange() {
    if (this.scene.handleOrientationChange) {
      this.scene.handleOrientationChange(this.orientation);
    }
  }

  adaptLayoutForMobile(gameObjects) {
    if (!this.isMobile) return;

    gameObjects.forEach(obj => {
      if (obj.setScale) {
        obj.setScale(this.getUIScale());
      }
    });
  }
}

export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {};
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.muted = false;
  }

  preloadSounds() {
    // Generate simple audio data URLs for basic sounds
    this.createSimpleSounds();
  }

  createSimpleSounds() {
    // Create simple beep sounds using data URLs
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Success sound
    this.createTone('success', 523.25, 0.2, 'sine');
    
    // Error sound
    this.createTone('error', 146.83, 0.3, 'sawtooth');
    
    // Click sound
    this.createTone('click', 800, 0.1, 'square');
    
    // Level complete sound
    this.createChord('levelComplete', [523.25, 659.25, 783.99], 0.5);
  }

  createTone(name, frequency, duration, waveType = 'sine') {
    // Create a simple oscillator-based sound
    // This is a placeholder - in a real game you'd load actual audio files
    this.sounds[name] = {
      frequency,
      duration,
      waveType,
      type: 'tone'
    };
  }

  createChord(name, frequencies, duration) {
    this.sounds[name] = {
      frequencies,
      duration,
      type: 'chord'
    };
  }

  playSound(name, volume = 1) {
    if (this.muted || !this.sounds[name]) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const sound = this.sounds[name];
      
      if (sound.type === 'tone') {
        this.playTone(audioContext, sound.frequency, sound.duration * 1000, sound.waveType, volume * this.sfxVolume);
      } else if (sound.type === 'chord') {
        sound.frequencies.forEach((freq, index) => {
          setTimeout(() => {
            this.playTone(audioContext, freq, sound.duration * 1000, 'sine', volume * this.sfxVolume * 0.3);
          }, index * 100);
        });
      }
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }

  playTone(audioContext, frequency, duration, waveType, volume) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = waveType;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  }

  setMuted(muted) {
    this.muted = muted;
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }
}

export class GameState {
  constructor() {
    this.currentLevel = 0;
    this.completedLevels = new Set();
    this.bestTimes = {};
    this.settings = {
      soundEnabled: true,
      musicEnabled: true,
      difficulty: 'normal'
    };
    
    this.load();
  }

  save() {
    try {
      const saveData = {
        currentLevel: this.currentLevel,
        completedLevels: Array.from(this.completedLevels),
        bestTimes: this.bestTimes,
        settings: this.settings
      };
      localStorage.setItem('wordweb_save', JSON.stringify(saveData));
    } catch (e) {
      console.warn('Failed to save game state:', e);
    }
  }

  load() {
    try {
      const saveData = localStorage.getItem('wordweb_save');
      if (saveData) {
        const data = JSON.parse(saveData);
        this.currentLevel = data.currentLevel || 0;
        this.completedLevels = new Set(data.completedLevels || []);
        this.bestTimes = data.bestTimes || {};
        this.settings = { ...this.settings, ...data.settings };
      }
    } catch (e) {
      console.warn('Failed to load game state:', e);
    }
  }

  completeLevel(levelId, time) {
    this.completedLevels.add(levelId);
    
    if (!this.bestTimes[levelId] || time < this.bestTimes[levelId]) {
      this.bestTimes[levelId] = time;
    }
    
    this.save();
  }

  isLevelCompleted(levelId) {
    return this.completedLevels.has(levelId);
  }

  getBestTime(levelId) {
    return this.bestTimes[levelId] || null;
  }

  reset() {
    this.currentLevel = 0;
    this.completedLevels.clear();
    this.bestTimes = {};
    this.save();
  }
}

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  createSuccessEffect(x, y) {
    // Create celebration particles
    for (let i = 0; i < 10; i++) {
      const particle = this.scene.add.graphics();
      particle.fillStyle(Phaser.Display.Color.HSVToRGB(Math.random(), 1, 1).color);
      particle.fillCircle(0, 0, 3);
      particle.x = x;
      particle.y = y;
      
      const angle = (Math.PI * 2 * i) / 10;
      const speed = 100 + Math.random() * 100;
      
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 1000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  createConnectionEffect(fromX, fromY, toX, toY) {
    // Create a spark effect along the connection
    const distance = Phaser.Math.Distance.Between(fromX, fromY, toX, toY);
    const steps = Math.floor(distance / 20);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Phaser.Math.Interpolation.Linear([fromX, toX], t);
      const y = Phaser.Math.Interpolation.Linear([fromY, toY], t);
      
      const spark = this.scene.add.graphics();
      spark.fillStyle(0xf1c40f);
      spark.fillCircle(0, 0, 2);
      spark.x = x;
      spark.y = y;
      
      this.scene.tweens.add({
        targets: spark,
        alpha: 0,
        scale: 2,
        duration: 300,
        delay: i * 50,
        onComplete: () => {
          spark.destroy();
        }
      });
    }
  }
}
