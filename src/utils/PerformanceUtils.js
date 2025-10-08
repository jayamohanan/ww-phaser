export class PerformanceMonitor {
  constructor(scene) {
    this.scene = scene;
    this.enabled = false; // Set to true for debugging
    this.fpsHistory = [];
    this.maxHistory = 60;
    
    if (this.enabled) {
      this.createDisplay();
    }
  }

  createDisplay() {
    const { width } = this.scene.scale;
    
    this.fpsText = this.scene.add.text(width - 100, 10, 'FPS: 60', {
      fontSize: '14px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 2 }
    });
    this.fpsText.setDepth(9999);
  }

  update() {
    if (!this.enabled) return;

    const fps = this.scene.game.loop.actualFps;
    this.fpsHistory.push(fps);
    
    if (this.fpsHistory.length > this.maxHistory) {
      this.fpsHistory.shift();
    }
    
    const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    
    if (this.fpsText) {
      this.fpsText.setText(`FPS: ${Math.round(avgFps)}`);
      
      // Color code based on performance
      if (avgFps >= 55) {
        this.fpsText.setFill('#2ecc71'); // Green
      } else if (avgFps >= 30) {
        this.fpsText.setFill('#f39c12'); // Orange
      } else {
        this.fpsText.setFill('#e74c3c'); // Red
      }
    }
  }
}

export class ObjectPool {
  constructor(scene, createFunction, resetFunction, initialSize = 10) {
    this.scene = scene;
    this.createFunction = createFunction;
    this.resetFunction = resetFunction;
    this.pool = [];
    this.activeObjects = [];
    
    // Pre-populate the pool
    for (let i = 0; i < initialSize; i++) {
      const obj = this.createFunction();
      obj.setActive(false).setVisible(false);
      this.pool.push(obj);
    }
  }

  get() {
    let obj;
    
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFunction();
    }
    
    obj.setActive(true).setVisible(true);
    this.activeObjects.push(obj);
    
    return obj;
  }

  release(obj) {
    const index = this.activeObjects.indexOf(obj);
    if (index > -1) {
      this.activeObjects.splice(index, 1);
      this.resetFunction(obj);
      obj.setActive(false).setVisible(false);
      this.pool.push(obj);
    }
  }

  releaseAll() {
    this.activeObjects.forEach(obj => {
      this.resetFunction(obj);
      obj.setActive(false).setVisible(false);
      this.pool.push(obj);
    });
    this.activeObjects.length = 0;
  }

  destroy() {
    this.pool.forEach(obj => obj.destroy());
    this.activeObjects.forEach(obj => obj.destroy());
    this.pool.length = 0;
    this.activeObjects.length = 0;
  }
}

export class AssetOptimizer {
  static optimizeTextures(scene) {
    // Ensure textures are properly sized for different devices
    const scale = scene.scale;
    const baseWidth = 1024;
    const currentWidth = scale.width;
    const scaleFactor = currentWidth / baseWidth;
    
    // Adjust texture filtering based on scale
    if (scaleFactor < 0.5) {
      // Use linear filtering for smaller displays
      scene.renderer.setTextureFilter(Phaser.Textures.LINEAR);
    } else {
      // Use nearest neighbor for crisp pixels on high-res displays
      scene.renderer.setTextureFilter(Phaser.Textures.NEAREST);
    }
  }

  static preloadCriticalAssets(scene) {
    // Preload only essential assets for faster startup
    // In this case, we're creating graphics programmatically, so minimal preloading needed
    
    // Create essential graphics data
    scene.load.start();
  }

  static unloadUnusedAssets(scene) {
    // Clean up unused textures and audio
    // This would be more relevant with actual image/audio assets
    
    if (scene.cache) {
      // Example of cache cleanup (if we had assets to clean)
      // scene.cache.audio.entries.clear();
    }
  }
}

export class MemoryManager {
  constructor(scene) {
    this.scene = scene;
    this.checkInterval = 5000; // Check every 5 seconds
    this.lastCheck = 0;
  }

  update(time) {
    if (time - this.lastCheck > this.checkInterval) {
      this.checkMemoryUsage();
      this.lastCheck = time;
    }
  }

  checkMemoryUsage() {
    // Only available in some browsers
    if (performance.memory) {
      const memory = performance.memory;
      const usedMB = memory.usedJSHeapSize / 1048576;
      const limitMB = memory.jsHeapSizeLimit / 1048576;
      
      // If memory usage is high, trigger cleanup
      if (usedMB / limitMB > 0.8) {
        this.performCleanup();
      }
    }
  }

  performCleanup() {
    // Trigger garbage collection friendly operations
    this.scene.children.list.forEach(child => {
      if (child.cleanup && typeof child.cleanup === 'function') {
        child.cleanup();
      }
    });
    
    // Clear any cached data
    if (this.scene.cache) {
      // Clean up temporary cache entries
    }
  }
}

export default {
  PerformanceMonitor,
  ObjectPool,
  AssetOptimizer,
  MemoryManager
};
