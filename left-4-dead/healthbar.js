class HealthBar {
  constructor(owner, scene, visible = true) {
    this.owner = owner;
    this.scene = scene;
    this.hp = 100;
    this.extrahp = 300;
    this.visible = visible;
    this.sprite = scene.physics.add.sprite(290, 270, 'healthbar');
    this.sprite.setDepth(4);
    this.sprite.setScrollFactor(0);
    this.sprite.setVisible(this.visible);
    this.sprite.setTint(owner.color);
  }

  gainHp(hp) {
    this.hp += hp;
    if(this.hp > 100) {
      this.hp = 100;
    }
    this.update();
  }

  loseHp(hp) {
    if(this.hp == 0) {
      this.extrahp -= hp;
    } else {
      this.hp -= hp;
      if(this.hp < 0) {
        this.hp = 0;
      }
    }

    this.update();
  }

  recoverSomeHp() {
    this.hp = 30;
    this.extrahp = 300;
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
    return this.extrahp == 0;
  }

  isExtra() {
    return this.hp == 0;
  }

  isCritical() {
    return this.hp < 33;
  }

  isNotCritical() {
    return this.hp >= 33;
  }
}
