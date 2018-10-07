class BulletBar extends Phaser.GameObjects.GameObject {
  constructor(scene, max, reloadTime, visible = true) {
    super(scene,"bulletbar");
    this.scene = scene;
    this.max = max;
    this.reloadTime = reloadTime;
    this.visible = visible;
    this.sprites = scene.add.group();
    this.setupSprites();
    this.setupReload();
  }

  setupSprites() {
    for(var i=0; i<this.max; i++) {
      var sprite = this.scene.physics.add.image(20 + i*6, 50, "bullet");
      sprite.setDepth(4);
      sprite.setVisible(this.visible);
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
    this.scene.sounds.reloading.play();
    this.emit('reload', this);
    this.reloadImage.setVisible(this.visible);
    this.scene.tweens.add({
        targets: this.reloadImage,
        displayWidth: 6*this.max,
        x: 6*this.max/2 + 20,
        duration: this.reloadTime,
        callbackScope: this,
        onComplete: this.reloadFinished
    });
  }

  reloadFinished() {
    this.emit('reloadFinished', this);
    this.sprites.getChildren().forEach(function(sprite) {
      sprite.setActive(true);
      sprite.setVisible(this.visible);
    }.bind(this));
    this.reloadImage.displayWidth = 16;
    this.reloadImage.x = 20;
    this.reloadImage.setVisible(false);
  }

  isEmpty() {
    return this.sprites.getLength() == 0;
  }

  kill() {
    this.sprites.getChildren().forEach(function(sprite) {
      sprite.setActive(false);
      sprite.setVisible(false);
    })
  }
}
