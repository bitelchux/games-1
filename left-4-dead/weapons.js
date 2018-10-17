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

  shoot(sprite) {
    if(this.isReloading)
      return;

    if((this.scene.time.now - this.lastShotTime) > this.rate) {

      if(this.bulletBar) {
        this.bulletBar.useABullet();
      }

      this.lastShotTime = this.scene.time.now;

      this.scene.sounds[this.constructor.name.toLowerCase()].playInSpace(this.scene, this.owner.sprite.getCenter());

      this.createBullets(sprite.x, sprite.y, sprite.rotation);

      if(sprite.name == "player")
        this.scene.camera.shake(100, 0.001);
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

  createBullets(x, y, rotation) {
    var randX = x + Math.random()*3 - Math.random()*3;
    var randY = y + Math.random()*3 - Math.random()*3;
    var bullet1 = new Bullet(this.scene, randX, randY, rotation - 0.1, this.damage);
    var bullet2 = new Bullet(this.scene, randX, randY, rotation + 0.1, this.damage);
  }
}
Pistols.index = 5;

class Shotgun extends Weapon {
  constructor(owner, scene, rate, damage) {
    super(owner, scene, rate, damage, "shotgun");
    this.index = Shotgun.index;
  }

  createBullets(x, y, rotation) {
    for(var i=0; i<10; i++) {
      var randX = x + Math.random()*3 - Math.random()*3;
      var randY = y + Math.random()*3 - Math.random()*3;
      new Bullet(this.scene, randX, randY, rotation - 0.5 + i/10, this.damage);
    }
    setTimeout(function() {
      for(var i=0; i<10; i++) {
        var randX = x + Math.random()*3 - Math.random()*3;
        var randY = y + Math.random()*3 - Math.random()*3;
        new Bullet(this.scene, randX, randY, rotation - 0.5 + i/10, this.damage);
      }
    }.bind(this), 100)
  }
}
Shotgun.index = 10;

class Uzi extends Weapon {
  constructor(owner, scene, rate, damage) {
    super(owner, scene, rate, damage, "uzi");
    this.index = Uzi.index;
  }

  createBullets(x, y, rotation) {
    var randX = x + Math.random()*3 - Math.random()*3;
    var randY = y + Math.random()*3 - Math.random()*3;
    var bullet = new Bullet(this.scene, randX, randY, rotation, this.damage);
  }
}
Uzi.index = 15;

class Grenade extends Weapon {
  constructor(owner, scene, rate, damage) {
    super(owner, scene, rate, damage, "grenade");
    this.index = Grenade.index;
  }

  createBullets(x, y, rotation) {
    var bullet = new Bullet(this.scene, x, y, rotation, this.damage);
  }
}
Grenade.index = 20;


class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, rotation, damage) {
    super(scene, x, y, 'bullet');
    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.scene = scene;
    this.setPipeline("Light2D");
    this.setDepth(3);

    this.speed = Phaser.Math.GetSpeed(300000, 1);
    this.body.setVelocity(Math.cos(rotation)*this.speed, Math.sin(rotation)*this.speed);
    this.damage = damage;

    scene.physics.add.overlap(this, scene.enemies.getAll(), this.hitEnemy, null, this);
    scene.physics.add.collider(this, scene.forest.obstaclesLayer, this.die, null, this);

    this.anims.play('bullet-fired', true);

    setTimeout(function() {
      this.die();
    }.bind(this), 2000);
  }

  hitEnemy(bullet, enemy) {
    enemy.isHit(bullet.damage);
    this.die();
  }

  die() {
    if(this.body)
      this.body.setVelocity(0, 0);

    this.x += Math.random()*5 - Math.random()*5;
    this.y += Math.random()*5 - Math.random()*5;
    var scale = Math.random();
    this.setFrame('bullet-impact.png');
    this.setScale(scale);

    setTimeout(function(){
      this.destroy();
    }.bind(this), 100);
  }
}
