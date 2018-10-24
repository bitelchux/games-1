class Weapon {
  constructor(owner, scene, rate, damage, name) {
    this.owner = owner;
    this.scene = scene;
    this.rate = rate;
    this.damage = damage;
    this.name = name;
    this.lastShotTime = scene.time.now;
    this.bulletBar = null;
    this.isReloading = false;
  }

  // to override
  createBullets(owner, rotation) {}

  shoot() {
    if(this.isReloading)
      return;

    if((this.scene.time.now - this.lastShotTime) > this.rate) {

      if(this.bulletBar) {
        this.bulletBar.useABullet();
      }

      this.lastShotTime = this.scene.time.now;

      this.scene.sounds[this.constructor.name.toLowerCase()].playInSpace(this.scene, this.owner.getCenter());

      var rotation;
      switch(this.owner.direction) {
        case "upleft":
          rotation = -3*Math.PI/4;
          break;
        case "upright":
          rotation = -Math.PI/4;
          break;
        case "downleft":
          rotation = 3*Math.PI/4;
          break;
        case "downright":
          rotation = Math.PI/4;
          break;
        case "up":
          rotation = -Math.PI/2;
          break;
        case "down":
          rotation = Math.PI/2;
          break;
        case "left":
          rotation = Math.PI;
          break;
        case "right":
          rotation = 0;
          break;
      }

      this.createBullets(this.owner, rotation);

      if(this.owner.name == "player")
        this.scene.camera.shake(100, 0.0001);
    }
  }

  reload() {
    this.isReloading = true;
  }
}

class Pistols extends Weapon {
  constructor(owner, scene, rate, damage) {
    super(owner, scene, rate, damage, "pistols");
    this.index = Pistols.index;
  }

  createBullets(owner, rotation) {
    var randX = owner.x + Math.random()*3 - Math.random()*3;
    var randY = owner.y + Math.random()*3 - Math.random()*3;
    this.scene.bullets.fire(owner, randX, randY, rotation - 0.1, this.damage, owner.color);
    this.scene.bullets.fire(owner, randX, randY, rotation + 0.1, this.damage, owner.color);
  }
}
Pistols.index = 5;

class Shotgun extends Weapon {
  constructor(owner, scene, rate, damage) {
    super(owner, scene, rate, damage, "shotgun");
    this.index = Shotgun.index;
  }

  createBullets(owner, rotation) {
    for(var i=0; i<10; i++) {
      var randX = owner.x + Math.random()*3 - Math.random()*3;
      var randY = owner.y + Math.random()*3 - Math.random()*3;
      this.scene.bullets.fire(owner, randX, randY, rotation - 0.5 + i/10, this.damage, owner.color);
    }
    var t = window.setTimeout(function() {
      for(var i=0; i<10; i++) {
        var randX = owner.x + Math.random()*3 - Math.random()*3;
        var randY = owner.y + Math.random()*3 - Math.random()*3;
        this.scene.bullets.fire(owner, randX, randY, rotation - 0.5 + i/10, this.damage, owner.color);
      }
    }.bind(this), 50);
    window.timeouts.push(t);
  }
}
Shotgun.index = 10;

class Uzi extends Weapon {
  constructor(owner, scene, rate, damage) {
    super(owner, scene, rate, damage, "uzi");
    this.index = Uzi.index;
  }

  createBullets(owner, rotation) {
    var randX = owner.x + Math.random()*3 - Math.random()*3;
    var randY = owner.y + Math.random()*3 - Math.random()*3;
    this.scene.bullets.fire(owner, randX, randY, rotation, this.damage, owner.color);
  }
}
Uzi.index = 15;
