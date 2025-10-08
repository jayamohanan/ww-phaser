import WordSlot from '../objects/WordSlot.js';
import ConnectionLine from '../objects/ConnectionLine.js';
import { LevelManager } from '../data/LevelManager.js';

export default class LevelEditorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelEditorScene' });
    this.levelManager = new LevelManager();
  }

  create() {
    const { width, height } = this.scale;
    
    // Initialize editor state
    this.editorMode = 'place'; // 'place', 'connect', 'test'
    this.selectedSlot = null;
    this.connectionStart = null;
    this.wordSlots = [];
    this.connectionLines = [];
    this.currentLevel = {
      name: 'Custom Level',
      slots: [],
      connections: [],
      words: []
    };
    
    this.createBackground();
    this.createUI();
    this.createToolPanel();
    
    // Handle input
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointermove', this.handlePointerMove, this);
    
    this.scale.on('resize', this.handleResize, this);
  }

  createBackground() {
    const { width, height } = this.scale;
    
    // Grid background for editor
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x34495e, 0.3);
    
    const gridSize = 20;
    for (let x = 0; x <= width; x += gridSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(width, y);
    }
    graphics.strokePath();
    
    // Main background
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 0.8);
    bg.fillRect(0, 0, width, height);
    bg.setDepth(-2);
  }

  createUI() {
    const { width, height } = this.scale;
    
    // Header
    const header = this.add.graphics();
    header.fillStyle(0x2c3e50, 0.95);
    header.fillRect(0, 0, width, 60);
    header.lineStyle(2, 0x34495e);
    header.moveTo(0, 60);
    header.lineTo(width, 60);
    header.strokePath();
    
    // Title
    this.add.text(20, 20, 'LEVEL EDITOR', {
      fontSize: '24px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
    
    // Mode indicator
    this.modeText = this.add.text(width/2, 20, 'Mode: PLACE SLOTS', {
      fontSize: '18px',
      fontFamily: 'Arial',
      fill: '#3498db'
    }).setOrigin(0.5);
    
    // Menu button
    this.createButton(width - 120, 15, 'MENU', 100, 30, () => {
      this.scene.start('MenuScene');
    });
  }

  createToolPanel() {
    const { width, height } = this.scale;
    
    // Tool panel background
    const panelWidth = 200;
    const panel = this.add.graphics();
    panel.fillStyle(0x34495e, 0.9);
    panel.fillRect(width - panelWidth, 60, panelWidth, height - 60);
    panel.lineStyle(2, 0x2c3e50);
    panel.moveTo(width - panelWidth, 60);
    panel.lineTo(width - panelWidth, height);
    panel.strokePath();
    
    let yPos = 80;
    const buttonSpacing = 50;
    
    // Mode buttons
    this.add.text(width - panelWidth + 10, yPos, 'MODES:', {
      fontSize: '16px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
    yPos += 30;
    
    this.placeModeBtn = this.createToolButton(width - panelWidth + 10, yPos, 'PLACE SLOTS', () => {
      this.setMode('place');
    });
    yPos += buttonSpacing;
    
    this.connectModeBtn = this.createToolButton(width - panelWidth + 10, yPos, 'CONNECT', () => {
      this.setMode('connect');
    });
    yPos += buttonSpacing;
    
    this.testModeBtn = this.createToolButton(width - panelWidth + 10, yPos, 'TEST', () => {
      this.setMode('test');
    });
    yPos += buttonSpacing + 20;
    
    // Slot size selector
    this.add.text(width - panelWidth + 10, yPos, 'WORD LENGTH:', {
      fontSize: '14px',
      fontFamily: 'Arial',
      fill: '#ffffff'
    });
    yPos += 25;
    
    this.slotSizeText = this.add.text(width - panelWidth + 10, yPos, 'Size: 3', {
      fontSize: '14px',
      fontFamily: 'Arial',
      fill: '#3498db'
    });
    
    this.slotSize = 3;
    this.createSizeButtons(width - panelWidth + 100, yPos);
    yPos += buttonSpacing;
    
    // Actions
    this.add.text(width - panelWidth + 10, yPos, 'ACTIONS:', {
      fontSize: '16px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
    yPos += 30;
    
    this.createToolButton(width - panelWidth + 10, yPos, 'CLEAR ALL', () => {
      this.clearLevel();
    });
    yPos += buttonSpacing;
    
    this.createToolButton(width - panelWidth + 10, yPos, 'SAVE LEVEL', () => {
      this.saveLevel();
    });
    yPos += buttonSpacing;
    
    this.createToolButton(width - panelWidth + 10, yPos, 'LOAD LEVEL', () => {
      this.loadLevel();
    });
    yPos += buttonSpacing;
    
    // Instructions
    yPos += 20;
    this.instructionText = this.add.text(width - panelWidth + 10, yPos, this.getInstructionText(), {
      fontSize: '12px',
      fontFamily: 'Arial',
      fill: '#bdc3c7',
      wordWrap: { width: panelWidth - 20 }
    });
    
    this.updateModeButtons();
  }

  createButton(x, y, text, width, height, callback) {
    const button = this.add.graphics();
    button.fillStyle(0x3498db);
    button.fillRoundedRect(0, 0, width, height, 5);
    
    const buttonText = this.add.text(width/2, height/2, text, {
      fontSize: '14px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const container = this.add.container(x, y, [button, buttonText]);
    container.setSize(width, height);
    container.setInteractive();
    
    container.on('pointerover', () => {
      button.clear();
      button.fillStyle(0x2980b9);
      button.fillRoundedRect(0, 0, width, height, 5);
      this.game.canvas.style.cursor = 'pointer';
    });
    
    container.on('pointerout', () => {
      button.clear();
      button.fillStyle(0x3498db);
      button.fillRoundedRect(0, 0, width, height, 5);
      this.game.canvas.style.cursor = 'default';
    });
    
    container.on('pointerdown', callback);
    
    return container;
  }

  createToolButton(x, y, text, callback) {
    return this.createButton(x, y, text, 180, 35, callback);
  }

  createSizeButtons(x, y) {
    const minusBtn = this.createButton(x, y, '-', 20, 20, () => {
      if (this.slotSize > 1) {
        this.slotSize--;
        this.slotSizeText.setText(`Size: ${this.slotSize}`);
      }
    });
    
    const plusBtn = this.createButton(x + 25, y, '+', 20, 20, () => {
      if (this.slotSize < 10) {
        this.slotSize++;
        this.slotSizeText.setText(`Size: ${this.slotSize}`);
      }
    });
  }

  setMode(mode) {
    this.editorMode = mode;
    this.selectedSlot = null;
    this.connectionStart = null;
    
    // Clear slot highlights
    this.wordSlots.forEach(slot => {
      for (let i = 0; i < slot.wordLength; i++) {
        slot.highlightConnectionPoint(i, false);
      }
    });
    
    this.updateModeDisplay();
    this.updateModeButtons();
  }

  updateModeDisplay() {
    const modeTexts = {
      'place': 'Mode: PLACE SLOTS',
      'connect': 'Mode: CONNECT SLOTS',
      'test': 'Mode: TEST LEVEL'
    };
    this.modeText.setText(modeTexts[this.editorMode] || 'Mode: UNKNOWN');
    this.instructionText.setText(this.getInstructionText());
  }

  updateModeButtons() {
    // Reset all buttons
    [this.placeModeBtn, this.connectModeBtn, this.testModeBtn].forEach(btn => {
      const graphics = btn.list[0];
      graphics.clear();
      graphics.fillStyle(0x3498db);
      graphics.fillRoundedRect(0, 0, 180, 35, 5);
    });
    
    // Highlight active button
    let activeBtn;
    switch (this.editorMode) {
      case 'place': activeBtn = this.placeModeBtn; break;
      case 'connect': activeBtn = this.connectModeBtn; break;
      case 'test': activeBtn = this.testModeBtn; break;
    }
    
    if (activeBtn) {
      const graphics = activeBtn.list[0];
      graphics.clear();
      graphics.fillStyle(0x2ecc71);
      graphics.fillRoundedRect(0, 0, 180, 35, 5);
    }
  }

  getInstructionText() {
    switch (this.editorMode) {
      case 'place':
        return 'Click to place word slots. Right-click to delete slots.';
      case 'connect':
        return 'Click on letter positions to create connections between slots.';
      case 'test':
        return 'Test your level. Add words in the panel below.';
      default:
        return '';
    }
  }

  handlePointerDown(pointer) {
    const { width } = this.scale;
    
    // Ignore clicks in tool panel
    if (pointer.x > width - 200) return;
    
    switch (this.editorMode) {
      case 'place':
        this.handlePlaceMode(pointer);
        break;
      case 'connect':
        this.handleConnectMode(pointer);
        break;
      case 'test':
        this.handleTestMode(pointer);
        break;
    }
  }

  handlePlaceMode(pointer) {
    if (pointer.rightButtonDown()) {
      // Delete slot under cursor
      const slot = this.findSlotAt(pointer.x, pointer.y);
      if (slot) {
        this.deleteSlot(slot);
      }
    } else {
      // Place new slot
      this.placeSlot(pointer.x, pointer.y);
    }
  }

  handleConnectMode(pointer) {
    const slot = this.findSlotAt(pointer.x, pointer.y);
    if (slot) {
      const letterIndex = this.findLetterIndexAt(slot, pointer.x, pointer.y);
      if (letterIndex !== -1) {
        if (!this.connectionStart) {
          // Start connection
          this.connectionStart = { slot, letterIndex };
          slot.highlightConnectionPoint(letterIndex, true);
        } else {
          // Complete connection
          if (this.connectionStart.slot !== slot) {
            this.createConnection(
              this.connectionStart.slot, this.connectionStart.letterIndex,
              slot, letterIndex
            );
          }
          
          // Clear highlights
          this.connectionStart.slot.highlightConnectionPoint(this.connectionStart.letterIndex, false);
          this.connectionStart = null;
        }
      }
    } else if (this.connectionStart) {
      // Cancel connection
      this.connectionStart.slot.highlightConnectionPoint(this.connectionStart.letterIndex, false);
      this.connectionStart = null;
    }
  }

  handleTestMode(pointer) {
    // Test mode handling would go here
    // For now, just basic interaction
  }

  placeSlot(x, y) {
    const snapSize = 20;
    const snappedX = Math.round(x / snapSize) * snapSize;
    const snappedY = Math.round(y / snapSize) * snapSize;
    
    const id = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const slot = new WordSlot(this, snappedX, snappedY, this.slotSize, id);
    this.wordSlots.push(slot);
    
    // Add to level data
    this.currentLevel.slots.push({
      x: snappedX,
      y: snappedY,
      wordLength: this.slotSize,
      id: id
    });
  }

  deleteSlot(slot) {
    // Remove connections involving this slot
    this.connectionLines = this.connectionLines.filter(line => {
      if (line.fromSlot === slot || line.toSlot === slot) {
        line.destroy();
        return false;
      }
      return true;
    });
    
    // Remove from level data
    this.currentLevel.slots = this.currentLevel.slots.filter(s => s.id !== slot.id);
    this.currentLevel.connections = this.currentLevel.connections.filter(c => 
      c.fromSlot !== slot.id && c.toSlot !== slot.id
    );
    
    // Remove from scene
    const index = this.wordSlots.indexOf(slot);
    if (index > -1) {
      this.wordSlots.splice(index, 1);
      slot.destroy();
    }
  }

  findSlotAt(x, y) {
    for (const slot of this.wordSlots) {
      const bounds = slot.getBounds();
      if (Phaser.Geom.Rectangle.Contains(bounds, x, y)) {
        return slot;
      }
    }
    return null;
  }

  findLetterIndexAt(slot, x, y) {
    for (let i = 0; i < slot.boxes.length; i++) {
      const box = slot.boxes[i];
      const worldPos = slot.getWorldTransformMatrix().transformPoint(box.x, box.y);
      const bounds = new Phaser.Geom.Rectangle(worldPos.x, worldPos.y, 40, 40);
      
      if (Phaser.Geom.Rectangle.Contains(bounds, x, y)) {
        return i;
      }
    }
    return -1;
  }

  createConnection(fromSlot, fromIndex, toSlot, toIndex) {
    // Check if connection already exists
    const existing = this.connectionLines.find(line => 
      (line.fromSlot === fromSlot && line.fromIndex === fromIndex && 
       line.toSlot === toSlot && line.toIndex === toIndex) ||
      (line.fromSlot === toSlot && line.fromIndex === toIndex && 
       line.toSlot === fromSlot && line.toIndex === fromIndex)
    );
    
    if (existing) return;
    
    // Add connection to slots
    fromSlot.addConnection(fromIndex, toSlot, toIndex);
    
    // Create visual line
    const line = new ConnectionLine(this, fromSlot, fromIndex, toSlot, toIndex);
    this.connectionLines.push(line);
    
    // Add to level data
    this.currentLevel.connections.push({
      fromSlot: fromSlot.id,
      fromIndex: fromIndex,
      toSlot: toSlot.id,
      toIndex: toIndex
    });
  }

  clearLevel() {
    // Clear all objects
    this.wordSlots.forEach(slot => slot.destroy());
    this.wordSlots = [];
    
    this.connectionLines.forEach(line => line.destroy());
    this.connectionLines = [];
    
    // Reset level data
    this.currentLevel = {
      name: 'Custom Level',
      slots: [],
      connections: [],
      words: []
    };
    
    this.selectedSlot = null;
    this.connectionStart = null;
  }

  saveLevel() {
    if (this.currentLevel.slots.length === 0) {
      alert('Please add some word slots first!');
      return;
    }
    
    // Generate words prompt
    const wordLengths = this.currentLevel.slots.map(s => s.wordLength);
    const uniqueLengths = [...new Set(wordLengths)];
    
    const wordsNeeded = prompt(
      `Enter words for your level (separated by commas).\n` +
      `You need words of lengths: ${uniqueLengths.join(', ')}\n` +
      `Total slots: ${this.currentLevel.slots.length}`,
      'CAT,DOG,BIRD'
    );
    
    if (wordsNeeded) {
      this.currentLevel.words = wordsNeeded.split(',').map(w => w.trim().toUpperCase());
      
      const levelName = prompt('Enter level name:', this.currentLevel.name);
      if (levelName) {
        this.currentLevel.name = levelName;
      }
      
      // Validate and save
      if (this.levelManager.validateLevel(this.currentLevel)) {
        this.levelManager.addCustomLevel(this.currentLevel);
        alert('Level saved successfully!');
      } else {
        alert('Level validation failed. Please check your level setup.');
      }
    }
  }

  loadLevel() {
    // For now, just load the first default level as an example
    const level = this.levelManager.levels[0];
    if (level) {
      this.clearLevel();
      this.currentLevel = JSON.parse(JSON.stringify(level));
      
      // Recreate slots
      level.slots.forEach(slotData => {
        const slot = new WordSlot(this, slotData.x, slotData.y, slotData.wordLength, slotData.id);
        this.wordSlots.push(slot);
      });
      
      // Recreate connections
      level.connections.forEach(connData => {
        const fromSlot = this.wordSlots.find(s => s.id === connData.fromSlot);
        const toSlot = this.wordSlots.find(s => s.id === connData.toSlot);
        
        if (fromSlot && toSlot) {
          this.createConnection(fromSlot, connData.fromIndex, toSlot, connData.toIndex);
        }
      });
    }
  }

  handlePointerMove(pointer) {
    // Handle hover effects for connect mode
    if (this.editorMode === 'connect' && !this.connectionStart) {
      const slot = this.findSlotAt(pointer.x, pointer.y);
      
      // Clear all highlights
      this.wordSlots.forEach(s => {
        for (let i = 0; i < s.wordLength; i++) {
          s.highlightConnectionPoint(i, false);
        }
      });
      
      // Highlight hovered letter
      if (slot) {
        const letterIndex = this.findLetterIndexAt(slot, pointer.x, pointer.y);
        if (letterIndex !== -1) {
          slot.highlightConnectionPoint(letterIndex, true);
        }
      }
    }
  }

  handleResize() {
    // Handle responsive layout
    this.createBackground();
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
