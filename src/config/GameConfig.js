// Game Configuration
export const GAME_CONFIG = {
  // Display settings
  CANVAS: {
    WIDTH: 1024,
    HEIGHT: 768,
    MIN_WIDTH: 320,
    MIN_HEIGHT: 240,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080
  },
  
  // Responsive breakpoints
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1920
  },
  
  // Game mechanics
  GAMEPLAY: {
    MIN_WORD_LENGTH: 2,
    MAX_WORD_LENGTH: 10,
    DRAG_THRESHOLD: 10,
    SNAP_DISTANCE: 100,
    ANIMATION_DURATION: 300
  },
  
  // Visual settings
  VISUALS: {
    SLOT_BOX_SIZE: 40,
    SLOT_SPACING: 5,
    CONNECTION_LINE_WIDTH: 4,
    PARTICLE_COUNT: 10,
    GRID_SIZE: 20
  },
  
  // Color scheme
  COLORS: {
    PRIMARY: 0x3498db,
    PRIMARY_DARK: 0x2980b9,
    SUCCESS: 0x2ecc71,
    ERROR: 0xe74c3c,
    WARNING: 0xf39c12,
    BACKGROUND: 0x2c3e50,
    BACKGROUND_LIGHT: 0x34495e,
    TEXT_PRIMARY: 0xffffff,
    TEXT_SECONDARY: 0xbdc3c7,
    SLOT_EMPTY: 0xecf0f1,
    SLOT_FILLED: 0x3498db,
    CONNECTION_DEFAULT: 0x95a5a6,
    CONNECTION_VALID: 0x2ecc71,
    CONNECTION_INVALID: 0xe74c3c,
    CONNECTION_PENDING: 0xf39c12
  },
  
  // Typography
  FONTS: {
    PRIMARY: 'Arial',
    DISPLAY: 'Arial Black',
    SIZES: {
      DISPLAY: 64,
      TITLE: 32,
      SUBTITLE: 24,
      BODY: 18,
      BUTTON: 20,
      SMALL: 14,
      MINI: 12
    }
  },
  
  // Audio settings
  AUDIO: {
    MASTER_VOLUME: 0.7,
    SFX_VOLUME: 0.8,
    MUSIC_VOLUME: 0.6,
    ENABLED: true
  },
  
  // Performance settings
  PERFORMANCE: {
    TARGET_FPS: 60,
    ENABLE_DEBUG: false,
    ENABLE_STATS: false,
    TEXTURE_FILTER: 'LINEAR',
    ANTIALIAS: true
  },
  
  // Local storage keys
  STORAGE_KEYS: {
    GAME_SAVE: 'wordweb_save',
    CUSTOM_LEVELS: 'wordweb_custom_levels',
    SETTINGS: 'wordweb_settings',
    TUTORIAL_SEEN: 'wordweb_tutorial_seen'
  }
};

// Device detection utilities
export const DEVICE_UTILS = {
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= GAME_CONFIG.BREAKPOINTS.MOBILE && 'ontouchstart' in window);
  },
  
  isTablet() {
    return /iPad|Android/i.test(navigator.userAgent) && 
           window.innerWidth > GAME_CONFIG.BREAKPOINTS.MOBILE && 
           window.innerWidth <= GAME_CONFIG.BREAKPOINTS.TABLET;
  },
  
  isDesktop() {
    return !this.isMobile() && !this.isTablet();
  },
  
  getOrientation() {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  },
  
  hasTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  supportsLocalStorage() {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Validation utilities
export const VALIDATION = {
  isValidWord(word) {
    return typeof word === 'string' && 
           word.length >= GAME_CONFIG.GAMEPLAY.MIN_WORD_LENGTH && 
           word.length <= GAME_CONFIG.GAMEPLAY.MAX_WORD_LENGTH &&
           /^[A-Za-z]+$/.test(word);
  },
  
  isValidLevel(levelData) {
    if (!levelData || typeof levelData !== 'object') return false;
    if (!levelData.slots || !Array.isArray(levelData.slots)) return false;
    if (!levelData.words || !Array.isArray(levelData.words)) return false;
    if (!levelData.connections || !Array.isArray(levelData.connections)) return false;
    
    // Validate slots
    for (const slot of levelData.slots) {
      if (!slot.id || typeof slot.x !== 'number' || typeof slot.y !== 'number' || !slot.wordLength) {
        return false;
      }
    }
    
    // Validate words
    for (const word of levelData.words) {
      if (!this.isValidWord(word)) {
        return false;
      }
    }
    
    // Validate connections
    const slotIds = new Set(levelData.slots.map(s => s.id));
    for (const connection of levelData.connections) {
      if (!slotIds.has(connection.fromSlot) || !slotIds.has(connection.toSlot)) {
        return false;
      }
      if (typeof connection.fromIndex !== 'number' || typeof connection.toIndex !== 'number') {
        return false;
      }
    }
    
    return true;
  }
};

// Math utilities
export const MATH_UTILS = {
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },
  
  lerp(start, end, amount) {
    return start * (1 - amount) + end * amount;
  },
  
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
  
  angleTowards(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },
  
  randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  },
  
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
};

// Animation easing functions
export const EASING = {
  easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  
  easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  },
  
  easeIn(t) {
    return t * t * t;
  },
  
  bounce(t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }
};

export default {
  GAME_CONFIG,
  DEVICE_UTILS,
  VALIDATION,
  MATH_UTILS,
  EASING
};
