import { ResponsiveManager } from '../utils/GameUtils.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    // Create simple colored rectangles as placeholders for buttons
    this.load.image('button', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
  }

  create() {
    const { width, height } = this.scale;
    
    // Initialize responsive manager
    this.responsiveManager = new ResponsiveManager(this);
    
    // Background gradient effect
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x667eea, 0x667eea, 0x764ba2, 0x764ba2, 1, 1, 1, 1);
    gradient.fillRect(0, 0, width, height);

    // Title
    const titleSize = this.responsiveManager.getOptimalFontSize(64);
    const title = this.add.text(width/2, height/4, 'WORD WEB', {
      fontSize: `${titleSize}px`,
      fontFamily: 'Arial Black',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    }).setOrigin(0.5);

    // Subtitle
    const subtitleSize = this.responsiveManager.getOptimalFontSize(24);
    this.add.text(width/2, height/4 + 80, 'Connect words through letters', {
      fontSize: `${subtitleSize}px`,
      fontFamily: 'Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Buttons with responsive sizing
    const buttonSize = this.responsiveManager.getButtonSize(240, 50);
    this.createButton(width/2, height/2, 'PLAY GAME', buttonSize, () => {
      this.scene.start('GameScene');
    });

    this.createButton(width/2, height/2 + 80, 'LEVEL EDITOR', buttonSize, () => {
      this.scene.start('LevelEditorScene');
    });

    // Instructions
    const instructionSize = this.responsiveManager.getOptimalFontSize(18);
    this.add.text(width/2, height - 50, 'Drag words to slots • Connect matching letters', {
      fontSize: `${instructionSize}px`,
      fontFamily: 'Arial',
      fill: '#ffffff',
      alpha: 0.8
    }).setOrigin(0.5);

    // Responsive handling
    this.scale.on('resize', this.resize, this);
  }

  createButton(x, y, text, buttonSize, callback) {
    const button = this.add.graphics();
    button.fillStyle(0x3498db);
    button.fillRoundedRect(-buttonSize.width/2, -buttonSize.height/2, buttonSize.width, buttonSize.height, 10);
    button.lineStyle(3, 0x2980b9);
    button.strokeRoundedRect(-buttonSize.width/2, -buttonSize.height/2, buttonSize.width, buttonSize.height, 10);

    const textSize = this.responsiveManager.getOptimalFontSize(20);
    const buttonText = this.add.text(0, 0, text, {
      fontSize: `${textSize}px`,
      fontFamily: 'Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const container = this.add.container(x, y, [button, buttonText]);
    container.setSize(buttonSize.width, buttonSize.height);
    container.setInteractive();

    // Hover effects
    container.on('pointerover', () => {
      button.clear();
      button.fillStyle(0x2980b9);
      button.fillRoundedRect(-buttonSize.width/2, -buttonSize.height/2, buttonSize.width, buttonSize.height, 10);
      button.lineStyle(3, 0x1f5f7d);
      button.strokeRoundedRect(-buttonSize.width/2, -buttonSize.height/2, buttonSize.width, buttonSize.height, 10);
      this.game.canvas.style.cursor = 'pointer';
    });

    container.on('pointerout', () => {
      button.clear();
      button.fillStyle(0x3498db);
      button.fillRoundedRect(-buttonSize.width/2, -buttonSize.height/2, buttonSize.width, buttonSize.height, 10);
      button.lineStyle(3, 0x2980b9);
      button.strokeRoundedRect(-buttonSize.width/2, -buttonSize.height/2, buttonSize.width, buttonSize.height, 10);
      this.game.canvas.style.cursor = 'default';
    });

    container.on('pointerdown', callback);

    return container;
  }

  resize() {
    // Handle responsive resizing if needed
  }
}
