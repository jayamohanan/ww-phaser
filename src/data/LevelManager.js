export const defaultLevels = [
  {
    id: 1,
    name: "First Steps",
    slots: [
      { x: 300, y: 200, wordLength: 3, id: "slot1" },
      { x: 500, y: 200, wordLength: 3, id: "slot2" }
    ],
    connections: [
      { fromSlot: "slot1", fromIndex: 2, toSlot: "slot2", toIndex: 0 }
    ],
    words: ["CAT", "TOY"],
    solution: {
      "slot1": "CAT",
      "slot2": "TOY"
    }
  },
  {
    id: 2,
    name: "Triangle",
    slots: [
      { x: 400, y: 150, wordLength: 4, id: "slot1" },
      { x: 300, y: 300, wordLength: 4, id: "slot2" },
      { x: 500, y: 300, wordLength: 4, id: "slot3" }
    ],
    connections: [
      { fromSlot: "slot1", fromIndex: 0, toSlot: "slot2", toIndex: 0 },
      { fromSlot: "slot1", fromIndex: 3, toSlot: "slot3", toIndex: 0 },
      { fromSlot: "slot2", fromIndex: 3, toSlot: "slot3", toIndex: 3 }
    ],
    words: ["BOAT", "BEAR", "TREE"],
    solution: {
      "slot1": "BOAT",
      "slot2": "BEAR", 
      "slot3": "TREE"
    }
  },
  {
    id: 3,
    name: "Cross Roads",
    slots: [
      { x: 400, y: 200, wordLength: 4, id: "center" },
      { x: 250, y: 200, wordLength: 4, id: "left" },
      { x: 550, y: 200, wordLength: 4, id: "right" },
      { x: 400, y: 100, wordLength: 4, id: "top" },
      { x: 400, y: 300, wordLength: 4, id: "bottom" }
    ],
    connections: [
      { fromSlot: "center", fromIndex: 0, toSlot: "left", toIndex: 3 },
      { fromSlot: "center", fromIndex: 3, toSlot: "right", toIndex: 0 },
      { fromSlot: "center", fromIndex: 1, toSlot: "top", toIndex: 1 },
      { fromSlot: "center", fromIndex: 2, toSlot: "bottom", toIndex: 2 }
    ],
    words: ["GAME", "TEAM", "MAKE", "LAKE", "TAKE"],
    solution: {
      "center": "GAME",
      "left": "TEAM",
      "right": "MAKE", 
      "top": "LAKE",
      "bottom": "TAKE"
    }
  },
  {
    id: 4,
    name: "Word Chain",
    slots: [
      { x: 200, y: 200, wordLength: 5, id: "word1" },
      { x: 400, y: 200, wordLength: 5, id: "word2" },
      { x: 600, y: 200, wordLength: 5, id: "word3" },
      { x: 300, y: 350, wordLength: 5, id: "word4" },
      { x: 500, y: 350, wordLength: 5, id: "word5" }
    ],
    connections: [
      { fromSlot: "word1", fromIndex: 4, toSlot: "word2", toIndex: 0 },
      { fromSlot: "word2", fromIndex: 4, toSlot: "word3", toIndex: 0 },
      { fromSlot: "word2", fromIndex: 2, toSlot: "word4", toIndex: 0 },
      { fromSlot: "word3", fromIndex: 2, toSlot: "word5", toIndex: 2 }
    ],
    words: ["HEART", "TOWER", "REACH", "WRIST", "PLACE"],
    solution: {
      "word1": "HEART",
      "word2": "TOWER",
      "word3": "REACH",
      "word4": "WRIST",
      "word5": "PLACE"
    }
  },
  {
    id: 5,
    name: "Spider Web",
    slots: [
      { x: 400, y: 200, wordLength: 6, id: "center" },
      { x: 250, y: 120, wordLength: 6, id: "nw" },
      { x: 550, y: 120, wordLength: 6, id: "ne" },
      { x: 250, y: 280, wordLength: 6, id: "sw" },
      { x: 550, y: 280, wordLength: 6, id: "se" },
      { x: 150, y: 200, wordLength: 6, id: "w" },
      { x: 650, y: 200, wordLength: 6, id: "e" }
    ],
    connections: [
      { fromSlot: "center", fromIndex: 0, toSlot: "w", toIndex: 5 },
      { fromSlot: "center", fromIndex: 5, toSlot: "e", toIndex: 0 },
      { fromSlot: "center", fromIndex: 1, toSlot: "nw", toIndex: 4 },
      { fromSlot: "center", fromIndex: 2, toSlot: "ne", toIndex: 3 },
      { fromSlot: "center", fromIndex: 3, toSlot: "sw", toIndex: 2 },
      { fromSlot: "center", fromIndex: 4, toSlot: "se", toIndex: 1 }
    ],
    words: ["SPIDER", "GARDEN", "BRIGHT", "PLANET", "ORANGE", "PURPLE", "YELLOW"],
    solution: {
      "center": "SPIDER",
      "w": "GARDEN",
      "e": "BRIGHT",
      "nw": "PLANET",
      "ne": "ORANGE",
      "sw": "PURPLE",
      "se": "YELLOW"
    }
  }
];

export class LevelManager {
  constructor() {
    this.levels = [...defaultLevels];
    this.currentLevel = 0;
    this.customLevels = this.loadCustomLevels();
  }

  getCurrentLevel() {
    return this.levels[this.currentLevel] || null;
  }

  nextLevel() {
    if (this.currentLevel < this.levels.length - 1) {
      this.currentLevel++;
      return this.getCurrentLevel();
    }
    return null;
  }

  previousLevel() {
    if (this.currentLevel > 0) {
      this.currentLevel--;
      return this.getCurrentLevel();
    }
    return null;
  }

  setLevel(levelIndex) {
    if (levelIndex >= 0 && levelIndex < this.levels.length) {
      this.currentLevel = levelIndex;
      return this.getCurrentLevel();
    }
    return null;
  }

  addCustomLevel(levelData) {
    const newLevel = {
      ...levelData,
      id: Date.now(),
      isCustom: true
    };
    this.customLevels.push(newLevel);
    this.saveCustomLevels();
    return newLevel;
  }

  loadCustomLevels() {
    try {
      const saved = localStorage.getItem('wordweb_custom_levels');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to load custom levels:', e);
      return [];
    }
  }

  saveCustomLevels() {
    try {
      localStorage.setItem('wordweb_custom_levels', JSON.stringify(this.customLevels));
    } catch (e) {
      console.warn('Failed to save custom levels:', e);
    }
  }

  getAllLevels() {
    return [...this.levels, ...this.customLevels];
  }

  validateLevel(levelData) {
    // Check required properties
    if (!levelData.slots || !Array.isArray(levelData.slots)) return false;
    if (!levelData.words || !Array.isArray(levelData.words)) return false;
    if (!levelData.connections || !Array.isArray(levelData.connections)) return false;

    // Check that all slots have valid properties
    for (const slot of levelData.slots) {
      if (!slot.id || typeof slot.x !== 'number' || typeof slot.y !== 'number' || !slot.wordLength) {
        return false;
      }
    }

    // Check that connections reference valid slots
    const slotIds = new Set(levelData.slots.map(s => s.id));
    for (const connection of levelData.connections) {
      if (!slotIds.has(connection.fromSlot) || !slotIds.has(connection.toSlot)) {
        return false;
      }
    }

    return true;
  }
}
