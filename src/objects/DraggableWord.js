export default class DraggableWord extends Phaser.GameObjects.Container {
  constructor(scene, x, y, word) {
    super(scene, x, y);
    
    this.scene = scene;
    this.word = word.toUpperCase();
    this.originalX = x;
    this.originalY = y;
    this.isBeingDragged = false;
    this.placedInSlot = null;
    
    this.createWord();
    this.setupInteractions();
    
    scene.add.existing(this);
  }

  createWord() {
    const padding = 10;
    const height = 50;
    const width = this.word.length * 30 + padding * 2;
    
    // Background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x3498db);
    this.background.fillRoundedRect(-width/2, -height/2, width, height, 10);
    this.background.lineStyle(2, 0x2980b9);
    this.background.strokeRoundedRect(-width/2, -height/2, width, height, 10);
    
    // Text
    this.text = this.scene.add.text(0, 0, this.word, {
      fontSize: '24px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add([this.background, this.text]);
    this.setSize(width, height);
  }

  setupInteractions() {
    this.setInteractive();
    
    this.on('pointerdown', this.startDrag, this);
    this.on('pointermove', this.drag, this);
    this.on('pointerup', this.endDrag, this);
    
    // Hover effects
    this.on('pointerover', () => {
      if (!this.isBeingDragged) {
        this.setScale(1.05);
        this.scene.game.canvas.style.cursor = 'grab';
      }
    });
    
    this.on('pointerout', () => {
      if (!this.isBeingDragged) {
        this.setScale(1);
        this.scene.game.canvas.style.cursor = 'default';
      }
    });
  }

  startDrag(pointer) {
    this.isBeingDragged = true;
    this.setDepth(1000);
    this.setScale(1.1);
    this.scene.game.canvas.style.cursor = 'grabbing';
    
    // Remove from current slot if placed
    if (this.placedInSlot) {
      this.placedInSlot.clearWord();
      this.placedInSlot = null;
    }
    
    // Store drag offset
    this.dragOffsetX = this.x - pointer.worldX;
    this.dragOffsetY = this.y - pointer.worldY;
    
    // Visual feedback
    this.updateAppearance('dragging');
  }

  drag(pointer) {
    if (this.isBeingDragged) {
      this.x = pointer.worldX + this.dragOffsetX;
      this.y = pointer.worldY + this.dragOffsetY;
      
      // Check for slot hover
      this.checkSlotHover(pointer);
    }
  }

  endDrag(pointer) {
    this.isBeingDragged = false;
    this.setDepth(0);
    this.setScale(1);
    this.scene.game.canvas.style.cursor = 'default';
    
    // Try to place in a slot
    const targetSlot = this.findNearestSlot(pointer);
    
    if (targetSlot && this.canPlaceInSlot(targetSlot)) {
      this.placeInSlot(targetSlot);
    } else {
      this.returnToOriginalPosition();
    }
    
    this.updateAppearance('normal');
  }

  checkSlotHover(pointer) {
    const slots = this.scene.wordSlots || [];
    
    // Clear previous highlights
    slots.forEach(slot => {
      for (let i = 0; i < slot.wordLength; i++) {
        slot.highlightConnectionPoint(i, false);
      }
    });
    
    // Highlight current hover target
    const hoverSlot = this.findNearestSlot(pointer);
    if (hoverSlot && this.canPlaceInSlot(hoverSlot)) {
      for (let i = 0; i < hoverSlot.wordLength; i++) {
        hoverSlot.highlightConnectionPoint(i, true);
      }
    }
  }

  findNearestSlot(pointer) {
    const slots = this.scene.wordSlots || [];
    let nearestSlot = null;
    let minDistance = 100; // Threshold distance
    
    for (const slot of slots) {
      const distance = Phaser.Math.Distance.Between(
        pointer.worldX, pointer.worldY,
        slot.x, slot.y
      );
      
      if (distance < minDistance && !slot.word) {
        minDistance = distance;
        nearestSlot = slot;
      }
    }
    
    return nearestSlot;
  }

  canPlaceInSlot(slot) {
    return slot && !slot.word && slot.wordLength === this.word.length;
  }

  placeInSlot(slot) {
    if (slot.setWord(this.word)) {
      this.placedInSlot = slot;
      this.x = slot.x;
      this.y = slot.y;
      this.updateAppearance('placed');
      
      // Check if level is complete
      this.scene.checkLevelComplete();
    }
  }

  returnToOriginalPosition() {
    this.scene.tweens.add({
      targets: this,
      x: this.originalX,
      y: this.originalY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    this.updateAppearance('normal');
  }

  updateAppearance(state) {
    this.background.clear();
    
    let fillColor, strokeColor;
    
    switch (state) {
      case 'dragging':
        fillColor = 0x2980b9;
        strokeColor = 0x1f4e79;
        break;
      case 'placed':
        fillColor = 0x27ae60;
        strokeColor = 0x1e8449;
        break;
      default:
        fillColor = 0x3498db;
        strokeColor = 0x2980b9;
    }
    
    const width = this.word.length * 30 + 20;
    const height = 50;
    
    this.background.fillStyle(fillColor);
    this.background.fillRoundedRect(-width/2, -height/2, width, height, 10);
    this.background.lineStyle(2, strokeColor);
    this.background.strokeRoundedRect(-width/2, -height/2, width, height, 10);
  }

  reset() {
    if (this.placedInSlot) {
      this.placedInSlot.clearWord();
      this.placedInSlot = null;
    }
    this.returnToOriginalPosition();
  }
}
