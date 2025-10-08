export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload() {
    // Load any assets here if needed
    // For now, we'll just show a brief loading screen
    
    // Simulate loading time
    this.load.on('complete', () => {
      this.time.delayedCall(500, () => {
        this.scene.start('MenuScene');
      });
    });
    
    // Start loading (even if empty)
    this.load.start();
  }

    create() {
        const { width, height } = this.scale;
        
        // Create gradient background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1e3c72, 0x2a5298, 0x1e3c72, 0x2a5298, 1);
        graphics.fillRect(0, 0, width, height);
        
        // Game title
        this.add.text(width / 2, height / 3, 'WORD WEB', {
            fontSize: `${Math.min(width * 0.1, 64)}px`,
            fontFamily: 'Arial Black',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 5,
                stroke: false,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(width / 2, height / 2.2, 'Connect Words • Build Webs • Solve Puzzles', {
            fontSize: `${Math.min(width * 0.03, 20)}px`,
            fontFamily: 'Arial',
            fill: '#cccccc'
        }).setOrigin(0.5);
        
        // Loading bar background
        const loadingBarBg = this.add.graphics();
        loadingBarBg.fillStyle(0x444444);
        loadingBarBg.fillRoundedRect(width / 2 - 150, height / 1.5 - 15, 300, 30, 15);
        
        // Loading bar
        this.loadingBar = this.add.graphics();
        
        // Loading text
        const loadingText = this.add.text(width / 2, height / 1.3, 'Loading...', {
            fontSize: `${Math.min(width * 0.04, 24)}px`,
            fontFamily: 'Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Animated dots
        let dotCount = 0;
        this.time.addEvent({
            delay: 500,
            callback: () => {
                dotCount = (dotCount % 3) + 1;
                loadingText.setText('Loading' + '.'.repeat(dotCount));
            },
            loop: true
        });
        
        // Create fake particle texture
        const particleGraphics = this.add.graphics();
        particleGraphics.fillStyle(0xffffff);
        particleGraphics.fillCircle(2, 2, 2);
        particleGraphics.generateTexture('particle', 4, 4);
        particleGraphics.destroy();
        
        // Simulate loading progress
        let progress = 0;
        const progressTimer = this.time.addEvent({
            delay: 50,
            callback: () => {
                progress += 0.02;
                this.updateLoadingBar(progress);
                
                if (progress >= 1) {
                    progressTimer.destroy();
                    this.completeLoading();
                }
            },
            loop: true
        });
        
        // Auto-transition to menu after loading
        this.time.delayedCall(1000, () => {
            // Add some particle effects before transition
            const particles = this.add.particles(width / 2, height / 2, 'particle', {
                speed: { min: 50, max: 100 },
                scale: { start: 0.3, end: 0 },
                lifespan: 500,
                quantity: 10
            });
            
            this.time.delayedCall(500, () => {
                this.scene.start('MenuScene');
            });
        });
    }

    updateLoadingBar(progress) {
        const { width, height } = this.scale;
        
        this.loadingBar.clear();
        this.loadingBar.fillStyle(0x3498db);
        this.loadingBar.fillRoundedRect(
            width / 2 - 150, 
            height / 1.5 - 15, 
            300 * Math.min(progress, 1), 
            30, 
            15
        );
    }

    completeLoading() {
        // Loading complete - transition handled by the delayed call above
    }
}
