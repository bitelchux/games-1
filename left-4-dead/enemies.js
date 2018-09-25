class Enemies {
  constructor(scene) {
    this.scene = scene;
    this.group = [];
    this.addEnemy();
  }

  addEnemy() {
    this.group.push(new Enemy(this.scene));
  }
}

class Enemy {
  constructor(scene) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(228, 128, 'enemy');
    this.sprite.setDepth(2);
  }

  isHit() {
    console.log("Enemy is hit");
  }
}
