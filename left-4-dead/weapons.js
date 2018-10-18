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
  createBullets(x, y, rotation) {}

  shoot() {
    if(this.isReloading)
      return;

    if((this.scene.time.now - this.lastShotTime) > this.rate) {

      if(this.bulletBar) {
        this.bulletBar.useABullet();
      }

      this.lastShotTime = this.scene.time.now;

      this.scene.sounds[this.constructor.name.toLowerCase()].playInSpace(this.scene, this.owner.getCenter());

      this.createBullets(this.owner.x, this.owner.y, this.owner.rotation, this.owner.tintBottomLeft);

      if(this.owner.name == "player")
        this.scene.camera.shake(100, 0.0005);
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

  createBullets(x, y, rotation, color) {
    var randX = x + Math.random()*3 - Math.random()*3;
    var randY = y + Math.random()*3 - Math.random()*3;
    this.scene.bullets.fire(randX, randY, rotation - 0.1, this.damage, color);
    this.scene.bullets.fire(randX, randY, rotation + 0.1, this.damage, color);
  }
}
Pistols.index = 5;

class Shotgun extends Weapon {
  constructor(owner, scene, rate, damage) {
    super(owner, scene, rate, damage, "shotgun");
    this.index = Shotgun.index;
  }

  createBullets(x, y, rotation, color) {
    for(var i=0; i<10; i++) {
      var randX = x + Math.random()*3 - Math.random()*3;
      var randY = y + Math.random()*3 - Math.random()*3;
      this.scene.bullets.fire(randX, randY, rotation - 0.5 + i/10, this.damage, color);
    }
    setTimeout(function() {
      for(var i=0; i<10; i++) {
        var randX = x + Math.random()*3 - Math.random()*3;
        var randY = y + Math.random()*3 - Math.random()*3;
        this.scene.bullets.fire(randX, randY, rotation - 0.5 + i/10, this.damage, color);
      }
    }.bind(this), 50)
  }
}
Shotgun.index = 10;

class Uzi extends Weapon {
  constructor(owner, scene, rate, damage) {
    super(owner, scene, rate, damage, "uzi");
    this.index = Uzi.index;
  }

  createBullets(x, y, rotation, color) {
    var randX = x + Math.random()*3 - Math.random()*3;
    var randY = y + Math.random()*3 - Math.random()*3;
    this.scene.bullets.fire(randX, randY, rotation, this.damage, color);
  }
}
Uzi.index = 15;

class Grenade extends Weapon {
  constructor(owner, scene, rate, damage) {
    super(owner, scene, rate, damage, "grenade");
    this.index = Grenade.index;
  }

  createBullets(x, y, rotation, color) {
    this.scene.bullets.fire(randX, randY, rotation, this.damage, color);
  }
}
Grenade.index = 20;
