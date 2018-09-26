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

    this.sprite = scene.physics.add.sprite(228, 128, 'enemy');//.setPipeline('Light2D');;
    this.sprite.setDepth(2);

    this.hp = 100;
  }

  isHit(damage) {
    console.log("Enemy is hit");
    this.hp -= damage;
    if(this.hp <= 0) {
      console.log("Enemy is dead");
    }
  }
}
