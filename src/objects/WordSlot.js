export default class WordSlot extends Phaser.GameObjects.Container {
  constructor(scene, x, y, wordLength, id = null) {
    super(scene, x, y);
    
    this.scene = scene;
    this.wordLength = wordLength;
    this.id = id || `slot_${Date.now()}_${Math.random()}`;
    this.word = null;
    this.connections = new Map(); // letterIndex -> {targetSlot, targetIndex}
    this.connectionLines = [];
    
    this.createSlot();
    scene.add.existing(this);
  }

  createSlot() {
    const boxSize = 40;
    const spacing = 5;
    
    this.boxes = [];
    this.letters = [];
    
    for (let i = 0; i < this.wordLength; i++) {
      // Create box background
      const box = this.scene.add.graphics();
      box.lineStyle(2, 0x34495e);
      box.fillStyle(0xecf0f1);
      box.fillRoundedRect(0, 0, boxSize, boxSize, 5);
      box.strokeRoundedRect(0, 0, boxSize, boxSize, 5);
      box.x = i * (boxSize + spacing);
      
      this.add(box);
      this.boxes.push(box);
      
      // Create letter text (initially empty)
      const letter = this.scene.add.text(
        i * (boxSize + spacing) + boxSize/2, 
        boxSize/2, 
        '', 
        {
          fontSize: '24px',
          fontFamily: 'Arial',
          fill: '#2c3e50',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);
      
      this.add(letter);
      this.letters.push(letter);
    }
    
    // Center the slot
    this.x -= (this.wordLength * (boxSize + spacing) - spacing) / 2;
  }

  setWord(word) {
    if (word && word.length === this.wordLength) {
      this.word = word.toUpperCase();
      for (let i = 0; i < this.wordLength; i++) {
        this.letters[i].setText(this.word[i]);
        this.updateBoxColor(i);
      }
      this.checkConnections();
      return true;
    }
    return false;
  }

  clearWord() {
    this.word = null;
    for (let i = 0; i < this.wordLength; i++) {
      this.letters[i].setText('');
      this.updateBoxColor(i, false);
    }
  }

  addConnection(letterIndex, targetSlot, targetIndex) {
    this.connections.set(letterIndex, { targetSlot, targetIndex });
    targetSlot.connections.set(targetIndex, { targetSlot: this, targetIndex: letterIndex });
  }

  removeConnection(letterIndex) {
    const connection = this.connections.get(letterIndex);
    if (connection) {
      connection.targetSlot.connections.delete(connection.targetIndex);
      this.connections.delete(letterIndex);
    }
  }

  checkConnections() {
    let allValid = true;
    
    for (let [letterIndex, connection] of this.connections) {
      const isValid = this.isConnectionValid(letterIndex, connection);
      this.updateBoxColor(letterIndex, isValid);
      if (!isValid) allValid = false;
    }
    
    return allValid;
  }

  isConnectionValid(letterIndex, connection) {
    if (!this.word || !connection.targetSlot.word) return false;
    
    const myLetter = this.word[letterIndex];
    const targetLetter = connection.targetSlot.word[connection.targetIndex];
    
    return myLetter === targetLetter;
  }

  updateBoxColor(letterIndex, isValid = null) {
    const box = this.boxes[letterIndex];
    box.clear();
    
    let fillColor = 0xecf0f1; // default
    let strokeColor = 0x34495e; // default
    
    if (this.connections.has(letterIndex)) {
      if (isValid === true) {
        fillColor = 0x2ecc71; // green for valid connection
        strokeColor = 0x27ae60;
      } else if (isValid === false) {
        fillColor = 0xe74c3c; // red for invalid connection
        strokeColor = 0xc0392b;
      } else {
        fillColor = 0xf39c12; // orange for pending connection
        strokeColor = 0xe67e22;
      }
    } else if (this.word) {
      fillColor = 0x3498db; // blue for filled slot
      strokeColor = 0x2980b9;
    }
    
    box.lineStyle(2, strokeColor);
    box.fillStyle(fillColor);
    box.fillRoundedRect(0, 0, 40, 40, 5);
    box.strokeRoundedRect(0, 0, 40, 40, 5);
  }

  getGlobalLetterPosition(letterIndex) {
    const localPos = this.letters[letterIndex];
    const worldPos = this.getWorldTransformMatrix().transformPoint(localPos.x, localPos.y);
    return { x: worldPos.x, y: worldPos.y };
  }

  highlightConnectionPoint(letterIndex, highlight = true) {
    if (letterIndex >= 0 && letterIndex < this.boxes.length) {
      const box = this.boxes[letterIndex];
      if (highlight) {
        box.lineStyle(4, 0xf1c40f);
        box.strokeRoundedRect(-2, -2, 44, 44, 5);
      } else {
        this.updateBoxColor(letterIndex);
      }
    }
  }

  isComplete() {
    return this.word !== null && this.checkConnections();
  }
}
