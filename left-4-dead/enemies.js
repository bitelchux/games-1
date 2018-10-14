class Enemies {
  constructor(scene) {
    this.scene = scene;
    this.group = [];
  }

  add(enemy) {
    this.group.push(enemy);
  }

  remove(enemy) {
    this.group.splice(this.group.indexOf(enemy), 1);
  }

  removeMultiple(enemies) {
    enemies.forEach(function(enemy) {
        this.remove(enemy);
    }.bind(this));
  }

  getAll() {
    return this.group.slice();
  }

  count() {
    return this.group.length;
  }

  contains(enemyType) {
    return this.group.some(function(enemy) {
      return enemy.config.key == enemyType;
    }.bind(this));
  }

  getWanderersInside(point, radius) {
    var wanderers = [];
    var circle = new Phaser.Geom.Circle(point.x, point.y, radius);
    this.group.forEach(function(enemy) {
      if(!enemy.startsPursuit && circle.contains(enemy.sprite.x, enemy.sprite.y)) {
        wanderers.push(enemy);
      }
    });
    return wanderers;
  }

  getWanderersOutside(point, radius) {
    var wanderers = [];
    var circle = new Phaser.Geom.Circle(point.x, point.y, radius);
    this.group.forEach(function(enemy) {
      if(!enemy.startsPursuit && !circle.contains(enemy.sprite.x, enemy.sprite.y)) {
        wanderers.push(enemy);
      }
    });
    return wanderers;
  }

  getEnemiesAround(point, radius) {
    var enemies = [];
    var circle = new Phaser.Geom.Circle(point.x, point.y, radius);

    this.group.forEach(function(enemy) {
      if(circle.contains(enemy.sprite.x, enemy.sprite.y)) {
        enemies.push(enemy);
      }
    });

    return enemies;
  }

  update(time, delta) {
    this.group.forEach(function(enemy) {
      enemy.update(time, delta);
    });
  }
}

/* config = {key, x, y, speed, hp, attack:{damage, rate, sounds}}*/
class Enemy {
  constructor(scene, config, startsPursuit = true) {
    this.scene = scene;
    this.config = config;
    this.startsPursuit = startsPursuit;

    this.sprite = scene.add.sprite(config.x, config.y, config.key).setPipeline("Light2D");
    this.sprite.setDepth(2);

    this.path = null;
    this.pathIndex = null;
    this.target = null;

    this.config.attack['lastTime'] = this.scene.time.now;

    if(this.startsPursuit) {
      this.startPursuit();
    } else {
      this.target = this.scene.allies.getClosestAllyTo(this.sprite.getCenter());
    }
  }

  // to override for special behaviors
  whenStartPursuit() {}

  whenNearbyTarget(delta) {
    this.attack();
  }

  whenDistantTarget() {}

  whenAttack() {}

  whenDie() {}

  update(time, delta) {
    var targetCoord = this.target.sprite.getCenter();
    var meCoord = this.sprite.getCenter();
    var distance = meCoord.distance(targetCoord);
    if(distance < 10) {
      this.whenNearbyTarget(delta);
    } else {
      this.whenDistantTarget(delta);
    }
  }

  startPursuit() {
    this.target = this.scene.allies.getClosestAllyTo(this.sprite.getCenter());
    this.whenStartPursuit();
    setInterval(function(){
      this.target = this.scene.allies.getClosestAllyTo(this.sprite.getCenter());
      this.setPathTo(this.target.sprite.x, this.target.sprite.y);
    }.bind(this), this.config.pathUpdateTime);
  }

  setPathTo(x, y) {
    var finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true
    });

    var forest = this.scene.forest;
    var map = forest.tilemap;
    var grid = new PF.Grid(map.width, map.height);
    forest.obstaclesLayer.forEachTile(function(tile){
      if(tile.canCollide) {
        grid.setWalkableAt(tile.x, tile.y, false);
      }
    }, this,0,0,map.width,map.height,{isNotEmpty: true});

    this.path = new Phaser.Curves.Path(this.sprite.x, this.sprite.y);

    var startTile = map.worldToTileXY(this.sprite.x, this.sprite.y);
    var endTile = map.worldToTileXY(x, y);

    var tilePath = finder.findPath(startTile.x, startTile.y, endTile.x, endTile.y, grid);
    tilePath.shift();
    tilePath.forEach(function(tileCoord) {
      this.path.lineTo(tileCoord[0]*16 + 8, tileCoord[1]*16 + 8);
    }.bind(this));

    this.path;
    this.pathIndex = 0;
  }

  followPath(delta) {
    if(this.path && this.path.curves.length > 0) {
      this.sprite.anims.play(this.config.key + '-walk', true);

      var curve = this.path.curves[this.pathIndex];
      var direction = new Phaser.Math.Vector2(curve.p1.x - curve.p0.x, curve.p1.y - curve.p0.y).normalize();
      var angle = Math.atan2(curve.p1.y - curve.p0.y, curve.p1.x - curve.p0.x) * 180 / Math.PI;

      this.sprite.x += delta*direction.x*this.config.speed;
      this.sprite.y += delta*direction.y*this.config.speed;
      this.sprite.setAngle(angle);

      if(this.sprite.getCenter().distance(curve.p1) < 2) {
        this.pathIndex += 1;
        if(this.pathIndex == this.path.curves.length) {
          this.path = null;
        }
      }
    }
  }

  attack() {
    var now = this.scene.time.now;
    if(now - this.config.attack.lastTime > this.config.attack.rate) {
      this.whenAttack();
      this.config.attack.lastTime = now;
      this.target.isHit(this.config.attack.damage);
      var isAnyAttackSoundPlaying = false;
      var attackSounds = this.config.attack.sounds;
      attackSounds.forEach(function(sound) {
        if(sound.isPlaying)
          isAnyAttackSoundPlaying = true;
      });
      if(!isAnyAttackSoundPlaying)
        attackSounds[Math.floor(Math.random()*(attackSounds.length-1))].play();
    }
  }

  isHit(damage) {
    if(!this.startsPursuit) {
      this.startPursuit()
    }

    if(this.config.hp > 0) {
      this.config.hp -= damage;
      if(this.config.hp <= 0) {
        this.die();
      }
    }
  }

  die() {
    this.whenDie();
    this.sprite.destroy();
    this.scene.enemies.remove(this);
  }
}

class Zombie extends Enemy {
  constructor(scene, x, y, startsPursuit) {
    var config = {
      key:'zombie',
      x: x, y: y,
      speed: 0.035,
      hp: 500,
      pathUpdateTime: 250,
      attack: {
        damage: 10,
        rate: 1000,
        sounds: scene.sounds.zombiefast
      }
    };
    super(scene, config, startsPursuit);
  }

  whenDistantTarget(delta) {
    this.followPath(delta);
  }
}

class Boomer extends Enemy {
  constructor(scene, x, y) {
    var config = {
      key:'boomer',
      x: x, y: y,
      speed: 0.025,
      hp: 1000,
      pathUpdateTime: 250,
      attack: {
        damage: 5,
        rate: 5000,
        sounds: scene.sounds.boomerattack
      }
    };
    super(scene, config);
  }

  whenStartPursuit() {
    this.scene.sounds.boomercry.playInSpace(this.scene, this.sprite.getCenter());
  }

  whenDistantTarget(delta) {
    this.followPath(delta);
  }

  whenAttack() {
    this.scene.enemies.spawnZombies(20);
  }

  whenDie() {
    var allies = this.scene.allies.getAlliesAround(this.sprite.getCenter(), 32);
    if(allies.length > 0) {
      this.scene.sounds.boomerexplode.playInSpace(this.scene, this.sprite.getCenter());
      this.scene.enemies.spawnWaves(2, 20, 2000);
    }
  }
}

class Hunter extends Enemy {
  constructor(scene, x, y) {
    var config = {
      key:'hunter',
      x: x, y: y,
      speed: 0.015,
      hp: 5000,
      pathUpdateTime: 250,
      attack: {
        damage: 10,
        rate: 1000,
        sounds: scene.sounds.hunterattack
      }
    };
    super(scene, config);

    this.isOnTarget = false;
  }

  startPursuit() {
    this.target = this.scene.allies.getWeakestAlly();
    this.scene.sounds.huntercry.playInSpace(this.scene, this.sprite.getCenter());
    setInterval(function(){
      this.target = this.scene.allies.getWeakestAlly(this.sprite.getCenter());
      this.setPathTo(this.target.sprite.x, this.target.sprite.y);
    }.bind(this), this.config.pathUpdateTime);
  }

  update(time, delta) {
    var targetCoord = this.target.sprite.getCenter();
    var meCoord = this.sprite.getCenter();
    var distance = meCoord.distance(targetCoord);
    if(distance > 150) {
      this.followPath(delta);
    } else if (!this.isOnTarget) {
      this.jumpOnTarget(delta);
    }
  }

  jumpOnTarget(delta) {
    this.isOnTarget = true;
    this.scene.sounds.hunterjump.play();
    this.scene.tweens.add({
        targets: this.sprite,
        x: this.target.sprite.x,
        y: this.target.sprite.y,
        duration: 500
    });
    this.target.isHit(100);
  }
}

class Tank extends Enemy {
  constructor(scene, x, y) {
    var config = {
      key:'tank',
      x: x, y: y,
      speed: 0.040,
      hp: 10000,
      pathUpdateTime: 500,
      attack: {
        damage: 35,
        rate: 3000,
        sounds: scene.sounds.tankattack
      },
      pickrockSound: scene.sounds.tankpickrock,
      throwSound: scene.sounds.tankthrow,
      rockexplodeSound: scene.sounds.tankrockexplode,
      walkSound: scene.sounds.walkthrow
    };
    super(scene, config);
    this.scene.sounds.fadeOut('music', 500);
    scene.sounds.tankmusic.play();
    this.rock = null;
    this.isThrowing = false;
  }

  whenDistantTarget(delta) {
    if(!this.isThrowing) {
      this.isThrowing = Math.random() < 0.001;
      if(this.isThrowing) {
        this.throwRock();
      } else {
        this.followPath(delta);
        if(!this.scene.sounds.tankwalk.isPlaying) {
          var player = this.scene.allies.player;
          this.scene.sounds.tankwalk.playInSpace(this.scene, this.sprite.getCenter());
        }
      }
    }
  }

  whenAttack() {
    var hitDirection = new Phaser.Math.Vector2(this.target.sprite.x - this.sprite.x, this.target.sprite.y - this.sprite.y).normalize();
    this.target.sprite.body.setVelocity(hitDirection.x*100, hitDirection.y*100);
    this.scene.tweens.add({
        targets: this.target.sprite.body.velocity,
        x: 0,
        y: 0,
        duration: 2000
    });
  }

  throwRock() {
    var now = this.scene.time.now;
    if(now - this.config.attack.lastTime > this.config.attack.rate) {
      this.config.attack.lastTime = now;
      this.rock = new Rock(this, this.scene, this.sprite.x, this.sprite.y);
    }
  }

  whenDie() {
    this.scene.sounds.fadeOut('tankmusic', 500);
    this.scene.sounds.music.play();
    this.rock = null;
  }
}

class Rock {
  constructor(tank, scene, x, y) {
    this.tank = tank;
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(x, y, 'rock').setPipeline("Light2D");
    this.sprite.setDepth(3);

    this.damage = 35;
    this.isExploding = false;

    this.sprite.on('animationcomplete', function(animation) {
      if(animation.key == "rock-anim") {
        this.tank.isThrowing = false;
        this.sprite.destroy();
      }
    }, this);

    this.picked();
  }

  picked() {
    this.tank.config.pickrockSound.once('ended', function (sound) {
      this.thrown();
    }, this);
    this.tank.config.pickrockSound.play(this.scene, this.sprite.getCenter());
  }

  thrown() {
    this.tank.config.throwSound.play(this.scene, this.sprite.getCenter());
    var target = this.scene.allies.getClosestAllyTo(this.sprite.getCenter());

    this.scene.physics.add.overlap(this.scene.allies.getSprites(), this.sprite, this.damageTarget, null, this).name = 'rock_overlap';

    var speed = 100;
    var targetCoord = target.sprite.getCenter();
    var direction = new Phaser.Math.Vector2(targetCoord.x - this.sprite.x, targetCoord.y - this.sprite.y).normalize();
    this.sprite.body.setVelocity(direction.x * speed, direction.y * speed);
    setTimeout(function(){this.explode();}.bind(this), 1000);
  }

  explode() {
    this.tank.config.rockexplodeSound.play();
    this.isExploding = true;
    this.sprite.body.setVelocity(0,0);
    this.sprite.anims.play('rock-anim', true);
  }

  damageTarget(sprite) {
    this.scene.physics.world.colliders.getActive().find(function(i){
      return i.name == 'rock_overlap'
    }).destroy();
    var ally = this.scene.allies.getAlly(sprite.name)
    ally.isHit(this.damage);
    this.explode();
  }
}
