class BulletBar extends Phaser.GameObjects.GameObject {
  constructor(scene, name, max, reloadTime) {
    super(scene,"bulletbar");
    this.scene = scene;
    this.name = name;
    this.max = max;
    this.currentNb = max;
    this.reloadTime = reloadTime;
    this.sprites = scene.add.group();
    this.setupSprites();
    this.setupReload();
  }

  setupSprites() {
    for(var i=0; i<this.currentNb; i++) {
      var sprite = this.scene.physics.add.image(20 + i*8, 50, this.name);
      sprite.setDepth(4);
      sprite.setScrollFactor(0);
      this.sprites.add(sprite);
    }
  }

  setupReload() {
    this.reloadImage = this.scene.physics.add.image(20, 50, "reload");
    this.reloadImage.setVisible(false);
    this.reloadImage.setDepth(4);
    this.reloadImage.setScrollFactor(0);
  }

  useABullet() {
    var lastSprite = this.sprites.getLast(true);
    this.sprites.killAndHide(lastSprite);
    if(this.sprites.countActive() == 0) {
      this.reload();
    }
  }

  reload() {
    this.emit('reload', this);
    this.reloadImage.setVisible(true);
    this.scene.tweens.add({
        targets: this.reloadImage,
        displayWidth: 80,
        x: 60,
        duration: this.reloadTime,
        callbackScope: this,
        onComplete: this.reloadFinished
    });
  }

  reloadFinished() {
    this.emit('reloadFinished', this);
    this.sprites.getChildren().forEach(function(sprite) {
      sprite.setActive(true);
      sprite.setVisible(true);
    });
    this.reloadImage.displayWidth = 16;
    this.reloadImage.x = 20;
    this.reloadImage.setVisible(false);
  }

  isEmpty() {
    return this.sprites.getLength() == 0;
  }
}
