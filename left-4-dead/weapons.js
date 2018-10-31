class Weapon extends Phaser.Physics.Arcade.Image {
  constructor(owner, scene, rate, damage, name) {
    super(scene, owner.x, owner.y, name);
    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.owner = owner;
    this.scene = scene;
    this.rate = rate;
    this.damage = damage;
    this.name = name;
    this.lastShotTime = scene.time.now;
    this.bulletBar = null;
    this.isReloading = false;
    this.setScale(0.8);
  }

  update() {
    this.y = this.owner.y + 3;

    if(this.owner.frame.name.includes("down")) {
      this.depth = this.y;
    } else {
      this.depth = 0;
    }

    this.setFlipX(!this.owner.flipX);

    if(this.flipX) {
      this.x = this.owner.x - 4;
    } else {
      this.x = this.owner.x + 4;
    }
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

      if(this.owner.name == this.scene.allies.player.name)
        this.scene.camera.shake(100, 0.0001);
    }
  }

  reload() {
    this.isReloading = true;
  }
}

class Pistols extends Weapon {
  constructor(owner) {
    super(owner, owner.scene, 100, 17, "pistols");
    this.index = Pistols.index;
  }

  createBullets(owner, rotation) {
    var randX = owner.x + Math.random()*3 - Math.random()*3;
    var randY = owner.y + Math.random()*3 - Math.random()*3;
    this.scene.bullets.fire(owner, randX, randY, rotation - 0.2, this.damage, owner.color);
    this.scene.bullets.fire(owner, randX, randY, rotation + 0.2, this.damage, owner.color);
  }
}
Pistols.index = 5;

class Shotgun extends Weapon {
  constructor(owner) {
    super(owner, owner.scene, 750, 30, "shotgun");
    this.index = Shotgun.index;
  }

  createBullets(owner, rotation) {
    for(var i=0; i<5; i++) {
      var randX = owner.x + Math.random()*3 - Math.random()*3;
      var randY = owner.y + Math.random()*3 - Math.random()*3;
      this.scene.bullets.fire(owner, randX, randY, rotation - 0.7 + i*2/7, this.damage, owner.color);
    }
    var t = window.setTimeout(function() {
      for(var i=0; i<5; i++) {
        var randX = owner.x + Math.random()*3 - Math.random()*3;
        var randY = owner.y + Math.random()*3 - Math.random()*3;
        this.scene.bullets.fire(owner, randX, randY, rotation - 0.7 + i*2/7, this.damage, owner.color);
      }
    }.bind(this), 50);
    window.timeouts.push(t);
  }
}
Shotgun.index = 10;

class Uzi extends Weapon {
  constructor(owner) {
    super(owner, owner.scene, 63, 20, "uzi");
    this.index = Uzi.index;
  }

  createBullets(owner, rotation) {
    var randX = owner.x + Math.random()*3 - Math.random()*3;
    var randY = owner.y + Math.random()*3 - Math.random()*3;
    this.scene.bullets.fire(owner, randX, randY, rotation, this.damage, owner.color);
  }
}
Uzi.index = 15;

class Rifle extends Weapon {
  constructor(owner) {
    super(owner, owner.scene, 200, 40, "rifle");
    this.index = Rifle.index;
  }

  createBullets(owner, rotation) {
    var randX = owner.x + Math.random()*3 - Math.random()*3;
    var randY = owner.y + Math.random()*3 - Math.random()*3;
    this.scene.bullets.fire(owner, randX, randY, rotation, this.damage, owner.color);
  }
}
Rifle.index = 20;
