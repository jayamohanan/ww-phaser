export default class TouchIndicator extends Phaser.GameObjects.Graphics {
  constructor(scene, x, y) {
    super(scene);
    
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isVisible = false;
    
    scene.add.existing(this);
    this.setDepth(1000);
  }

  show(x, y) {
    this.x = x;
    this.y = y;
    this.isVisible = true;
    this.alpha = 1;
    
    this.clear();
    this.lineStyle(3, 0x3498db, 0.8);
    this.fillStyle(0x3498db, 0.3);
    this.fillCircle(0, 0, 20);
    this.strokeCircle(0, 0, 20);
    
    // Animate the indicator
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.hide();
      }
    });
  }

  hide() {
    this.isVisible = false;
    this.clear();
    this.setScale(1);
  }
}

export class TutorialOverlay extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    
    this.scene = scene;
    this.currentStep = 0;
    this.steps = [];
    
    this.createOverlay();
    scene.add.existing(this);
    this.setDepth(999);
    this.setVisible(false);
  }

  createOverlay() {
    const { width, height } = this.scene.scale;
    
    // Semi-transparent background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x000000, 0.7);
    this.background.fillRect(0, 0, width, height);
    
    // Tutorial panel
    this.panel = this.scene.add.graphics();
    this.panel.fillStyle(0x2c3e50, 0.95);
    this.panel.fillRoundedRect(-250, -150, 500, 300, 20);
    this.panel.lineStyle(3, 0x3498db);
    this.panel.strokeRoundedRect(-250, -150, 500, 300, 20);
    
    // Tutorial text
    this.tutorialText = this.scene.add.text(0, -50, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);
    
    // Step indicator
    this.stepText = this.scene.add.text(0, -120, '', {
      fontSize: '14px',
      fontFamily: 'Arial',
      fill: '#bdc3c7'
    }).setOrigin(0.5);
    
    // Next button
    this.nextButton = this.createTutorialButton(0, 80, 'NEXT', () => {
      this.nextStep();
    });
    
    // Skip button
    this.skipButton = this.createTutorialButton(0, 120, 'SKIP TUTORIAL', () => {
      this.hide();
    });
    
    this.add([
      this.background,
      this.panel,
      this.tutorialText,
      this.stepText,
      this.nextButton,
      this.skipButton
    ]);
    
    this.setPosition(width/2, height/2);
  }

  createTutorialButton(x, y, text, callback) {
    const button = this.scene.add.graphics();
    button.fillStyle(0x3498db);
    button.fillRoundedRect(-80, -20, 160, 40, 10);
    
    const buttonText = this.scene.add.text(0, 0, text, {
      fontSize: '16px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const container = this.scene.add.container(x, y, [button, buttonText]);
    container.setSize(160, 40);
    container.setInteractive();
    
    container.on('pointerover', () => {
      button.clear();
      button.fillStyle(0x2980b9);
      button.fillRoundedRect(-80, -20, 160, 40, 10);
    });
    
    container.on('pointerout', () => {
      button.clear();
      button.fillStyle(0x3498db);
      button.fillRoundedRect(-80, -20, 160, 40, 10);
    });
    
    container.on('pointerdown', callback);
    
    return container;
  }

  setSteps(steps) {
    this.steps = steps;
    this.currentStep = 0;
    this.updateDisplay();
  }

  nextStep() {
    this.currentStep++;
    if (this.currentStep >= this.steps.length) {
      this.hide();
    } else {
      this.updateDisplay();
    }
  }

  updateDisplay() {
    if (this.currentStep < this.steps.length) {
      const step = this.steps[this.currentStep];
      this.tutorialText.setText(step.text);
      this.stepText.setText(`Step ${this.currentStep + 1} of ${this.steps.length}`);
      
      if (this.currentStep === this.steps.length - 1) {
        this.nextButton.list[1].setText('FINISH');
      }
    }
  }

  show() {
    this.setVisible(true);
    this.currentStep = 0;
    this.updateDisplay();
  }

  hide() {
    this.setVisible(false);
    
    // Save that tutorial was seen
    try {
      localStorage.setItem('wordweb_tutorial_seen', 'true');
    } catch (e) {
      console.warn('Could not save tutorial state');
    }
  }

  shouldShow() {
    try {
      return !localStorage.getItem('wordweb_tutorial_seen');
    } catch (e) {
      return true; // Show tutorial if localStorage fails
    }
  }
}
