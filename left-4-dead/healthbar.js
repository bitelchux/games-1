class HealthBar {
  constructor(scene) {
    this.scene = scene;
    this.hp = 100;
    this.sprite = scene.physics.add.sprite(40, 20, 'healthbar');
    this.sprite.setDepth(4);
    this.sprite.setScrollFactor(0);
  }

  gainHp(hp) {
    this.hp += hp;
    if(this.hp > 100) {
      this.hp = 100;
    }
    this.update();
  }

  loseHp(hp) {
    this.hp -= hp;
    if(this.hp < 0) {
      this.hp = 0;
    }
    this.update();
  }

  update() {
    if(this.hp > 66) {
      this.sprite.setFrame(0);
    } else if(this.hp > 33) {
      this.sprite.setFrame(1);
    } else if(this.hp > 0) {
      this.sprite.setFrame(2);
    } else {
      this.sprite.setFrame(3);
    }
  }

  isEmpty() {
    return this.hp == 0;
  }

  isOneThird() {
    return this.hp < 33;
  }

  isFull() {
    return this.hp == 100
  }
}
