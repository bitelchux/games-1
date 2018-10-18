class Lights {
  constructor(scene) {
    this.scene = scene;
    this.group = [];
    scene.lights.enable().setAmbientColor(0x030303);
  }

  addLight(owner) {
    var light = this.scene.lights.addLight(owner.x, owner.y, 125);
    light.setColor(0xffffff).setIntensity(.5);
    light['owner'] = owner;
    this.group.push(light);
  }

  update() {
    this.group.forEach(function(light) {
      var x = light.owner.x;
      var y = light.owner.y;
      if(x != light.x || y != light.y) {
        light.x = x;
        light.y = y;
      }
    }.bind(this));
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
