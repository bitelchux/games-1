class Lights {
  constructor(scene) {
    this.scene = scene;
    var player = scene.allies.player;
    this.main = scene.lights.addLight(scene.allies.player.sprite.x, player.sprite.y, 125);
    this.main.setColor(0xffffff).setIntensity(1);

    scene.lights.enable().setAmbientColor(0x020202);
  }

  update() {
    var player = this.scene.allies.player;
    var playerX = player.sprite.x;
    var playerY = player.sprite.y;

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
