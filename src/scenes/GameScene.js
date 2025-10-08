import WordSlot from '../objects/WordSlot.js';
import DraggableWord from '../objects/DraggableWord.js';
import ConnectionLine from '../objects/ConnectionLine.js';
import { LevelManager } from '../data/LevelManager.js';
import { ResponsiveManager, AudioManager, GameState, ParticleSystem } from '../utils/GameUtils.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.levelManager = new LevelManager();
    this.gameState = new GameState();
  }

  create() {
    const { width, height } = this.scale;
    
    // Initialize managers
    this.responsiveManager = new ResponsiveManager(this);
    this.audioManager = new AudioManager(this);
    this.particleSystem = new ParticleSystem(this);
    
    // Initialize audio
    this.audioManager.preloadSounds();
    
    // Background
    this.createBackground();
    
    // Initialize game objects
    this.wordSlots = [];
    this.draggableWords = [];
    this.connectionLines = [];
    
    // UI Elements
    this.createUI();
    
    // Load first level
    this.loadLevel(this.levelManager.getCurrentLevel());
    
    // Handle resize
    this.scale.on('resize', this.handleResize, this);
  }

  createBackground() {
    const { width, height } = this.scale;
    
    // Create gradient background
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e, 1, 1, 1, 1);
    gradient.fillRect(0, 0, width, height);
    
    // Add subtle pattern
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      
      const dot = this.add.graphics();
      dot.fillStyle(0x3498db, 0.1);
      dot.fillCircle(x, y, size);
    }
  }

  createUI() {
    const { width, height } = this.scale;
    
    // Header panel
    const headerPanel = this.add.graphics();
    headerPanel.fillStyle(0x2c3e50, 0.9);
    headerPanel.fillRect(0, 0, width, 80);
    headerPanel.lineStyle(2, 0x34495e);
    headerPanel.moveTo(0, 80);
    headerPanel.lineTo(width, 80);
    headerPanel.strokePath();
    
    // Level info
    this.levelText = this.add.text(20, 25, 'Level 1', {
      fontSize: '24px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
    
    this.levelNameText = this.add.text(20, 50, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      fill: '#bdc3c7'
    });
    
    // Control buttons
    this.createButton(width - 200, 25, 'MENU', 120, 30, () => {
      this.scene.start('MenuScene');
    });
    
    this.createButton(width - 200, 60, 'RESET', 120, 30, () => {
      this.resetLevel();
    });
    
    // Level navigation (will be positioned based on level progress)
    this.prevButton = this.createButton(width - 350, 25, '◀ PREV', 80, 30, () => {
      this.previousLevel();
    });
    
    this.nextButton = this.createButton(width - 350, 60, 'NEXT ▶', 80, 30, () => {
      this.nextLevel();
    });
    
    // Progress indicator
    this.progressText = this.add.text(width/2, 25, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    // Instructions
    this.instructionText = this.add.text(width/2, height - 30, 'Drag words to slots • Match connected letters', {
      fontSize: '16px',
      fontFamily: 'Arial',
      fill: '#bdc3c7',
      alpha: 0.8
    }).setOrigin(0.5);
    
    // Success message (hidden initially)
    this.successMessage = this.add.container(width/2, height/2);
    this.successMessage.setVisible(false);
    this.createSuccessMessage();
  }

  createButton(x, y, text, width, height, callback) {
    const button = this.add.graphics();
    button.fillStyle(0x3498db);
    button.fillRoundedRect(0, 0, width, height, 5);
    button.lineStyle(2, 0x2980b9);
    button.strokeRoundedRect(0, 0, width, height, 5);
    
    const buttonText = this.add.text(width/2, height/2, text, {
      fontSize: '14px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const container = this.add.container(x, y, [button, buttonText]);
    container.setSize(width, height);
    container.setInteractive();
    
    // Hover effects
    container.on('pointerover', () => {
      button.clear();
      button.fillStyle(0x2980b9);
      button.fillRoundedRect(0, 0, width, height, 5);
      button.lineStyle(2, 0x1f5f7d);
      button.strokeRoundedRect(0, 0, width, height, 5);
      this.game.canvas.style.cursor = 'pointer';
    });
    
    container.on('pointerout', () => {
      button.clear();
      button.fillStyle(0x3498db);
      button.fillRoundedRect(0, 0, width, height, 5);
      button.lineStyle(2, 0x2980b9);
      button.strokeRoundedRect(0, 0, width, height, 5);
      this.game.canvas.style.cursor = 'default';
    });
    
    container.on('pointerdown', callback);
    
    return container;
  }

  createSuccessMessage() {
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 0.95);
    bg.fillRoundedRect(-200, -100, 400, 200, 20);
    bg.lineStyle(4, 0x2ecc71);
    bg.strokeRoundedRect(-200, -100, 400, 200, 20);
    
    const title = this.add.text(0, -40, 'LEVEL COMPLETE!', {
      fontSize: '32px',
      fontFamily: 'Arial',
      fill: '#2ecc71',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const message = this.add.text(0, 0, 'All connections matched!', {
      fontSize: '18px',
      fontFamily: 'Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    const continueBtn = this.createButton(-60, 40, 'CONTINUE', 120, 40, () => {
      this.nextLevel();
    });
    
    this.successMessage.add([bg, title, message, continueBtn]);
  }

  loadLevel(levelData) {
    if (!levelData) {
      console.warn('No level data provided');
      return;
    }
    
    // Clear existing objects
    this.clearLevel();
    
    // Update UI
    this.levelText.setText(`Level ${levelData.id}`);
    this.levelNameText.setText(levelData.name || '');
    this.progressText.setText(`${this.levelManager.currentLevel + 1} / ${this.levelManager.levels.length}`);
    
    // Create word slots
    levelData.slots.forEach(slotData => {
      const slot = new WordSlot(this, slotData.x, slotData.y, slotData.wordLength, slotData.id);
      this.wordSlots.push(slot);
    });
    
    // Create connections
    levelData.connections.forEach(connData => {
      const fromSlot = this.wordSlots.find(s => s.id === connData.fromSlot);
      const toSlot = this.wordSlots.find(s => s.id === connData.toSlot);
      
      if (fromSlot && toSlot) {
        fromSlot.addConnection(connData.fromIndex, toSlot, connData.toIndex);
        
        const line = new ConnectionLine(this, fromSlot, connData.fromIndex, toSlot, connData.toIndex);
        this.connectionLines.push(line);
      }
    });
    
    // Create draggable words
    this.createDraggableWords(levelData.words);
    
    // Update button states
    this.updateNavigationButtons();
  }

  createDraggableWords(words) {
    const { width, height } = this.scale;
    const wordsPerRow = Math.min(4, words.length);
    const rows = Math.ceil(words.length / wordsPerRow);
    
    const startY = height - 150;
    const rowHeight = 60;
    
    words.forEach((word, index) => {
      const row = Math.floor(index / wordsPerRow);
      const col = index % wordsPerRow;
      const colCount = Math.min(wordsPerRow, words.length - row * wordsPerRow);
      
      const x = (width / (colCount + 1)) * (col + 1);
      const y = startY + row * rowHeight;
      
      const draggableWord = new DraggableWord(this, x, y, word);
      this.draggableWords.push(draggableWord);
    });
  }

  clearLevel() {
    // Clear word slots
    this.wordSlots.forEach(slot => slot.destroy());
    this.wordSlots = [];
    
    // Clear draggable words
    this.draggableWords.forEach(word => word.destroy());
    this.draggableWords = [];
    
    // Clear connection lines
    this.connectionLines.forEach(line => line.destroy());
    this.connectionLines = [];
    
    // Hide success message
    this.successMessage.setVisible(false);
  }

  checkLevelComplete() {
    // Check if all slots are filled and all connections are valid
    const allSlotsFilled = this.wordSlots.every(slot => slot.word !== null);
    const allConnectionsValid = this.wordSlots.every(slot => slot.checkConnections());
    
    if (allSlotsFilled && allConnectionsValid) {
      // Play success sound
      this.audioManager.playSound('success');
      
      // Create particle effects
      this.wordSlots.forEach(slot => {
        this.particleSystem.createSuccessEffect(slot.x, slot.y);
      });
      
      // Mark level as completed
      const currentLevel = this.levelManager.getCurrentLevel();
      if (currentLevel) {
        this.gameState.completeLevel(currentLevel.id, Date.now());
      }
      
      this.time.delayedCall(500, () => {
        this.showSuccessMessage();
      });
    } else {
      // Play click sound for word placement
      this.audioManager.playSound('click');
    }
    
    // Update connection line visuals
    this.connectionLines.forEach(line => line.update());
  }

  showSuccessMessage() {
    this.successMessage.setVisible(true);
    this.successMessage.setScale(0);
    
    this.tweens.add({
      targets: this.successMessage,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
  }

  resetLevel() {
    const currentLevel = this.levelManager.getCurrentLevel();
    if (currentLevel) {
      this.loadLevel(currentLevel);
    }
  }

  nextLevel() {
    const nextLevel = this.levelManager.nextLevel();
    if (nextLevel) {
      this.loadLevel(nextLevel);
    } else {
      // All levels complete
      this.scene.start('MenuScene');
    }
  }

  previousLevel() {
    const prevLevel = this.levelManager.previousLevel();
    if (prevLevel) {
      this.loadLevel(prevLevel);
    }
  }

  updateNavigationButtons() {
    this.prevButton.setVisible(this.levelManager.currentLevel > 0);
    this.nextButton.setVisible(this.levelManager.currentLevel < this.levelManager.levels.length - 1);
  }

  handleResize() {
    // Handle responsive layout
    const { width, height } = this.scale;
    
    // Update background
    this.createBackground();
    
    // Reposition UI elements
    if (this.instructionText) {
      this.instructionText.setPosition(width/2, height - 30);
    }
    
    // Reposition word area if needed
    this.draggableWords.forEach((word, index) => {
      const wordsPerRow = Math.min(4, this.draggableWords.length);
      const row = Math.floor(index / wordsPerRow);
      const col = index % wordsPerRow;
      const colCount = Math.min(wordsPerRow, this.draggableWords.length - row * wordsPerRow);
      
      const x = (width / (colCount + 1)) * (col + 1);
      const y = height - 150 + row * 60;
      
      word.originalX = x;
      word.originalY = y;
      
      if (!word.placedInSlot) {
        word.x = x;
        word.y = y;
      }
    });
  }

  update() {
    // Update connection lines
    this.connectionLines.forEach(line => {
      if (line.active) {
        line.update();
      }
    });
  }
}
