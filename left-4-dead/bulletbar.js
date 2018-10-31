class BulletBar extends Phaser.GameObjects.GameObject {
  constructor(owner, scene, max, reloadTime, visible = true) {
    super(scene,"bulletbar");
    this.owner = owner;
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
      var sprite = this.scene.physics.add.image(270 + i*6, 285, "bulletshell").setScale(0.7);
      sprite.setDepth(4);
      sprite.setVisible(this.visible);
      sprite.setScrollFactor(0);
      this.sprites.add(sprite);
    }
  }

  setupReload() {
    this.reloadImage = this.scene.physics.add.image(270, 285, "reload");
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
    this.scene.sounds.reloading.play(this.scene, this.owner.getCenter());
    this.emit('reload', this);
    this.reloadImage.setVisible(this.visible);
    this.scene.tweens.add({
        targets: this.reloadImage,
        displayWidth: 6*this.max,
        x: 6*this.max/2 + 270,
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
    this.reloadImage.x = 270;
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
