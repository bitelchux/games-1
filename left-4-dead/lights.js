class Lights {
  constructor(scene) {
    this.scene = scene;
    this.group = [];
    scene.lights.enable().setAmbientColor(0x060606);
  }

  addOwnerLight(owner) {
    var light = this.scene.lights.addLight(owner.x, owner.y, 125);
    light.setColor(0xffffff).setIntensity(.5);
    light['owner'] = owner;
    this.group.push(light);
  }

  addLight(x, y, range = 100, intensity = 1, color = 0xffffff) {
    var light = this.scene.lights.addLight(x, y, range);
    light.setColor(color).setIntensity(intensity);
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

    var t1 = window.setTimeout(function(){
      tempLight.setRadius(r);
    }.bind(this), time/3);
    window.timeouts.push(t1);

    var t2 = window.setTimeout(function(){
      tempLight.setRadius(r/3);
    }.bind(this), time*2/3);
    window.timeouts.push(t2);

    var t3 = window.setTimeout(function(){
      this.scene.lights.removeLight(tempLight);
    }.bind(this), time);
    window.timeouts.push(t3);
  }
}
