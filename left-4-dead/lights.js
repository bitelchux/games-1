class Lights {
  constructor(scene) {
    this.scene = scene;

    this.main = scene.lights.addLight(scene.player.sprite.x, scene.player.sprite.y, 150);
    this.main.setColor(0xffffff).setIntensity(1);

    scene.lights.enable().setAmbientColor(0x040404);
  }

  update() {
    var playerX = this.scene.player.sprite.x;
    var playerY = this.scene.player.sprite.y;

    if(playerX != this.main.x || playerY != this.main.y) {
      this.main.x = playerX;
      this.main.y = playerY;
    }
  }

  addTempLight(x, y, r, color, intensity, time) {
    var tempLight = this.scene.lights.addLight(x, y, r*2/3);
    tempLight.setColor(color).setIntensity(intensity);

    setTimeout(function(){
      tempLight.setRadius(r);
    }.bind(this), time/3);

    setTimeout(function(){
      tempLight.setRadius(r/3);
    }.bind(this), time*2/3);

    setTimeout(function(){
      this.scene.lights.removeLight(tempLight);
    }.bind(this), time);
  }
}