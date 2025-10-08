export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload() {
    const { width, height } = this.scale;
    
    // Create loading screen elements
    this.createLoadingScreen(width, height);
    
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

  createLoadingScreen(width, height) {
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e, 1, 1, 1, 1);
    bg.fillRect(0, 0, width, height);
    
    // Loading text
    const loadingText = this.add.text(width/2, height/2 - 50, 'WORD WEB', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Loading bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x34495e);
    barBg.fillRoundedRect(width/2 - 150, height/2 + 20, 300, 20, 10);
    
    // Loading bar
    this.loadingBar = this.add.graphics();
    
    // Loading progress text
    this.loadingText = this.add.text(width/2, height/2 + 60, 'Loading...', {
      fontSize: '18px',
      fontFamily: 'Arial',
      fill: '#bdc3c7'
    }).setOrigin(0.5);
    
    // Animate loading bar
    this.animateLoadingBar(width);
  }

  animateLoadingBar(width) {
    let progress = 0;
    const timer = this.time.addEvent({
      delay: 50,
      callback: () => {
        progress += 0.02;
        
        this.loadingBar.clear();
        this.loadingBar.fillStyle(0x3498db);
        this.loadingBar.fillRoundedRect(
          width/2 - 150, 
          height/2 + 20, 
          300 * Math.min(progress, 1), 
          20, 
          10
        );
        
        if (progress >= 1) {
          timer.remove();
        }
      },
      loop: true
    });
  }
}
