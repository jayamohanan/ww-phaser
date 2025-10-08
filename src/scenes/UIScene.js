export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // This scene will handle UI overlays and mobile-specific controls
    this.isMobile = this.sys.game.device.input.touch;
    
    if (this.isMobile) {
      this.createMobileControls();
    }
    
    // Create pause overlay (initially hidden)
    this.createPauseOverlay();
    
    // Handle pause events
    this.game.events.on('pause', this.showPauseOverlay, this);
    this.game.events.on('resume', this.hidePauseOverlay, this);
  }

  createMobileControls() {
    const { width, height } = this.scale;
    
    // Create help button for mobile
    this.helpButton = this.add.graphics();
    this.helpButton.fillStyle(0x3498db, 0.8);
    this.helpButton.fillCircle(0, 0, 25);
    this.helpButton.lineStyle(2, 0x2980b9);
    this.helpButton.strokeCircle(0, 0, 25);
    
    const helpText = this.add.text(0, 0, '?', {
      fontSize: '24px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.helpContainer = this.add.container(width - 50, height - 50, [this.helpButton, helpText]);
    this.helpContainer.setSize(50, 50);
    this.helpContainer.setInteractive();
    
    this.helpContainer.on('pointerdown', this.showHelpModal, this);
    
    // Touch feedback
    this.helpContainer.on('pointerover', () => {
      this.helpButton.clear();
      this.helpButton.fillStyle(0x2980b9, 0.8);
      this.helpButton.fillCircle(0, 0, 25);
      this.helpButton.lineStyle(2, 0x1f5f7d);
      this.helpButton.strokeCircle(0, 0, 25);
    });
    
    this.helpContainer.on('pointerout', () => {
      this.helpButton.clear();
      this.helpButton.fillStyle(0x3498db, 0.8);
      this.helpButton.fillCircle(0, 0, 25);
      this.helpButton.lineStyle(2, 0x2980b9);
      this.helpButton.strokeCircle(0, 0, 25);
    });
  }

  createPauseOverlay() {
    const { width, height } = this.scale;
    
    this.pauseOverlay = this.add.container(width/2, height/2);
    this.pauseOverlay.setVisible(false);
    
    // Dark background
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(-width/2, -height/2, width, height);
    
    // Pause panel
    const panel = this.add.graphics();
    panel.fillStyle(0x2c3e50, 0.95);
    panel.fillRoundedRect(-200, -150, 400, 300, 20);
    panel.lineStyle(4, 0x34495e);
    panel.strokeRoundedRect(-200, -150, 400, 300, 20);
    
    // Pause text
    const pauseText = this.add.text(0, -80, 'GAME PAUSED', {
      fontSize: '32px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Resume button
    const resumeBtn = this.createOverlayButton(0, -20, 'RESUME', () => {
      this.hidePauseOverlay();
    });
    
    // Menu button
    const menuBtn = this.createOverlayButton(0, 40, 'MAIN MENU', () => {
      this.hidePauseOverlay();
      this.scene.stop('GameScene');
      this.scene.stop('LevelEditorScene');
      this.scene.start('MenuScene');
    });
    
    this.pauseOverlay.add([overlay, panel, pauseText, resumeBtn, menuBtn]);
  }

  createOverlayButton(x, y, text, callback) {
    const button = this.add.graphics();
    button.fillStyle(0x3498db);
    button.fillRoundedRect(-80, -20, 160, 40, 10);
    button.lineStyle(2, 0x2980b9);
    button.strokeRoundedRect(-80, -20, 160, 40, 10);
    
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '18px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const container = this.add.container(x, y, [button, buttonText]);
    container.setSize(160, 40);
    container.setInteractive();
    
    container.on('pointerover', () => {
      button.clear();
      button.fillStyle(0x2980b9);
      button.fillRoundedRect(-80, -20, 160, 40, 10);
      button.lineStyle(2, 0x1f5f7d);
      button.strokeRoundedRect(-80, -20, 160, 40, 10);
    });
    
    container.on('pointerout', () => {
      button.clear();
      button.fillStyle(0x3498db);
      button.fillRoundedRect(-80, -20, 160, 40, 10);
      button.lineStyle(2, 0x2980b9);
      button.strokeRoundedRect(-80, -20, 160, 40, 10);
    });
    
    container.on('pointerdown', callback);
    
    return container;
  }

  showHelpModal() {
    const { width, height } = this.scale;
    
    if (this.helpModal) {
      this.helpModal.destroy();
    }
    
    this.helpModal = this.add.container(width/2, height/2);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRect(-width/2, -height/2, width, height);
    
    // Modal panel
    const panel = this.add.graphics();
    panel.fillStyle(0x2c3e50, 0.95);
    panel.fillRoundedRect(-250, -200, 500, 400, 20);
    panel.lineStyle(4, 0x34495e);
    panel.strokeRoundedRect(-250, -200, 500, 400, 20);
    
    // Help content
    const title = this.add.text(0, -150, 'HOW TO PLAY', {
      fontSize: '24px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const instructions = [
      '• Drag words from the bottom to empty slots',
      '• Words must be the same length as the slot',
      '• Connected slots must share the same letter',
      '• Green connections = correct match',
      '• Red connections = wrong match',
      '• Complete all connections to win!'
    ];
    
    instructions.forEach((instruction, index) => {
      this.add.text(-220, -100 + index * 25, instruction, {
        fontSize: '16px',
        fontFamily: 'Arial',
        fill: '#ffffff'
      });
    });
    
    // Close button
    const closeBtn = this.createOverlayButton(0, 150, 'CLOSE', () => {
      this.helpModal.destroy();
      this.helpModal = null;
    });
    
    this.helpModal.add([bg, panel, title, closeBtn]);
    
    // Add instruction texts to modal
    instructions.forEach((instruction, index) => {
      const text = this.add.text(-220, -100 + index * 25, instruction, {
        fontSize: '16px',
        fontFamily: 'Arial',
        fill: '#ffffff'
      });
      this.helpModal.add(text);
    });
    
    this.helpModal.setDepth(1000);
  }

  showPauseOverlay() {
    this.pauseOverlay.setVisible(true);
    this.pauseOverlay.setDepth(1000);
  }

  hidePauseOverlay() {
    this.pauseOverlay.setVisible(false);
  }

  // Mobile-specific touch handling
  enableMobileOptimizations() {
    // Prevent zoom on double tap
    this.input.manager.touch.capture = true;
    
    // Add touch feedback to all interactive objects
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      if (gameObject.setTint) {
        gameObject.setTint(0xcccccc);
      }
    });
    
    this.input.on('gameobjectup', (pointer, gameObject) => {
      if (gameObject.clearTint) {
        gameObject.clearTint();
      }
    });
  }

  resize() {
    const { width, height } = this.scale;
    
    // Reposition mobile controls
    if (this.helpContainer) {
      this.helpContainer.setPosition(width - 50, height - 50);
    }
    
    // Resize overlays
    if (this.pauseOverlay) {
      this.pauseOverlay.setPosition(width/2, height/2);
    }
  }
}
