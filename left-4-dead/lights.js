class Lights {
  constructor(scene) {
    this.scene = scene;

    this.main = scene.lights.addLight(scene.player.sprite.x, scene.player.sprite.y, 100);
    this.main.setColor(0xffffff).setIntensity(1.7);

    scene.lights.enable().setAmbientColor(0x111111);
  }

  update() {
    var playerX = this.scene.player.sprite.x;
    var playerY = this.scene.player.sprite.y;

    if(playerX != this.main.x || playerY != this.main.y) {
      this.main.x = playerX;
      this.main.y = playerY;
    }
  }
}
