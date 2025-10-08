export default class ConnectionLine extends Phaser.GameObjects.Graphics {
  constructor(scene, fromSlot, fromIndex, toSlot, toIndex) {
    super(scene);
    
    this.scene = scene;
    this.fromSlot = fromSlot;
    this.fromIndex = fromIndex;
    this.toSlot = toSlot;
    this.toIndex = toIndex;
    
    this.setDepth(-1); // Behind other objects
    scene.add.existing(this);
    
    this.draw();
  }

  draw() {
    this.clear();
    
    const fromPos = this.fromSlot.getGlobalLetterPosition(this.fromIndex);
    const toPos = this.toSlot.getGlobalLetterPosition(this.toIndex);
    
    // Determine line color based on connection validity
    let color = 0x95a5a6; // default gray
    
    if (this.fromSlot.word && this.toSlot.word) {
      const isValid = this.fromSlot.isConnectionValid(this.fromIndex, {
        targetSlot: this.toSlot,
        targetIndex: this.toIndex
      });
      color = isValid ? 0x2ecc71 : 0xe74c3c; // green or red
    }
    
    this.lineStyle(4, color, 0.8);
    
    // Draw curved line
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;
    const curveOffset = 50;
    
    // Calculate perpendicular offset for curve
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length > 0) {
      const perpX = -dy / length * curveOffset;
      const perpY = dx / length * curveOffset;
      
      const controlX = midX + perpX;
      const controlY = midY + perpY;
      
      // Draw bezier curve
      const curve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(fromPos.x, fromPos.y),
        new Phaser.Math.Vector2(controlX, controlY),
        new Phaser.Math.Vector2(toPos.x, toPos.y)
      );
      
      curve.draw(this, 32);
    }
    
    // Draw connection points
    this.fillStyle(color, 1);
    this.fillCircle(fromPos.x, fromPos.y, 6);
    this.fillCircle(toPos.x, toPos.y, 6);
  }

  update() {
    this.draw();
  }

  destroy() {
    super.destroy();
  }
}
