// Import scenes
import LoadingScene from './scenes/LoadingScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import LevelEditorScene from './scenes/LevelEditorScene.js';
import UIScene from './scenes/UIScene.js';

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#2c3e50',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 320,
      height: 240
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [LoadingScene, MenuScene, GameScene, LevelEditorScene, UIScene]
};

// Initialize the game
const game = new Phaser.Game(config);

// Make game globally accessible for debugging
window.game = game;
