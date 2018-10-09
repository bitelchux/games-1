class HelpBar extends Phaser.GameObjects.GameObject {
  constructor(scene) {
    super(scene);
    this.scene = scene;
    this.helpImage = this.scene.physics.add.image(0, 0, "help");
    this.helpImage.displayWidth = 32;
    this.helpImage.setVisible(false);
    this.helpImage.setDepth(4);
    this.tween;
  }

  hide() {
    this.helpImage.setVisible(false);
  }

  show() {
    this.helpImage.setVisible(true);
  }

  update(x, y) {
    this.helpImage.setPosition(x, y);
  }

  help() {
    this.show();
    this.tween = this.scene.tweens.add({
        targets: this.helpImage,
        displayWidth: 0,
        duration: 3000,
        callbackScope: this,
        onComplete: this.helpComplete
    });
  }

  helpStop() {
    this.helpImage.displayWidth = 16;
    this.hide();
  }

  helpComplete() {
    this.hide();
    this.helpImage.displayWidth = 16;
    this.emit('helpComplete', this);
  }
}
