class HelpSign extends Phaser.GameObjects.GameObject {
  constructor(scene) {
    super(scene);
    this.scene = scene;
    this.sprite = this.scene.physics.add.sprite(0, 0, 'helpsign');
    this.sprite.setDepth(4);
    this.sprite.setVisible(false);
  }

  hide() {
    this.sprite.setVisible(false);
    this.sprite.anims.stop();
  }

  show() {
    this.sprite.setVisible(true);
    this.sprite.anims.play('helpsign-anim', true);
  }

  update(x, y) {
    if(this.sprite.visible) {
      var cameraRect = this.scene.camera.worldView;

      if(x < cameraRect.x) {
        x = cameraRect.x + 8;
      } else if(x > (cameraRect.x + cameraRect.width)) {
        x = cameraRect.x + cameraRect.width - 8;
      }

      if(y < cameraRect.y) {
        y = cameraRect.y + 8;
      } else if(y > (cameraRect.y + cameraRect.height)) {
        y = cameraRect.y + cameraRect.height - 8;
      }
    }

    this.sprite.setPosition(x, y);
  }
}
