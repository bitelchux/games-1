class Enemies extends Phaser.GameObjects.Group {
  constructor(scene) {
    super(scene, { runChildUpdate: true });
    scene.add.existing(this);
    this.scene = scene;
  }

  spawnZombie(x, y, startsPursuit) {
    var inactiveZombie = this.getChildren().find(function(enemy) {
      return enemy.config.key == 'zombie' && enemy.active == false;
    });
    if(inactiveZombie) {
      inactiveZombie.spawn(x, y, startsPursuit);
    }
    else {
      this.add(new Zombie(this.scene, x, y, startsPursuit));
    }
  }

  getEnemiesAround(point, radius) {
    var enemies = [];
    var circle = new Phaser.Geom.Circle(point.x, point.y, radius);

    this.getChildren().forEach(function(enemy) {
      if(enemy.active && circle.contains(enemy.x, enemy.y)) {
        enemies.push(enemy);
      }
    });

    return enemies;
  }

  clear() {
    this.getChildren().forEach(function(enemy) {
      enemy.clear();
    });
  }
}

/* config = {key, x, y, speed, hp, attack:{damage, rate, sounds}}*/
class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, config, startsPursuit = true) {
    super(scene, config.x, config.y, config.key);
    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.scene = scene;
    this.config = config;
    this.startsPursuit = startsPursuit;

    this.setPipeline("Light2D");
    this.setDepth(2);

    this.pursuitInterval = null;
    this.path = null;
    this.pathIndex = null;
    this.target = null;

    this.config.attack['lastTime'] = this.scene.time.now;

    // this.config.hp *= 80;

    if(this.startsPursuit) {
      this.startPursuit();
    } else {
      this.target = this.scene.allies.getClosestAllyTo(this.getCenter());
    }
  }

  // to override for special behaviors
  whenStartPursuit() {}

  whenNearbyTarget(delta) {
    this.attack();
  }

  whenInRangeTarget(delta) {}

  whenDistantTarget(delta) {}

  whenAttack() {}

  whenIsHit(bullet) {}

  whenDie(killer) {}

  update(time, delta) {
    this.clearTint()
    var targetCoord = this.target.getCenter();
    var meCoord = this.getCenter();
    var distance = meCoord.distance(targetCoord);
    if(distance < 10) {
      this.whenNearbyTarget(delta);
    } else {
      if(distance < 125) {
        this.whenInRangeTarget(delta);
      }
      this.whenDistantTarget(delta);
    }
  }

  startPursuit() {
    this.startsPursuit = true;
    this.target = this.scene.allies.getClosestAllyTo(this.getCenter());
    this.whenStartPursuit();
    this.pursuitInterval = window.setInterval(function(){
      this.target = this.scene.allies.getClosestAllyTo(this.getCenter());
      this.setPathTo(this.target.x, this.target.y);
    }.bind(this), this.config.pathUpdateTime);
    window.intervals.push(this.pursuitInterval);
  }

  setPathTo(x, y) {
    var finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true
    });

    var level = this.scene.level;
    var map = level.tilemap;
    var grid = new PF.Grid(map.width, map.height);
    level.obstaclesLayer.forEachTile(function(tile){
      if(tile.canCollide) {
        grid.setWalkableAt(tile.x, tile.y, false);
      }
    }, this,0,0,map.width,map.height,{isNotEmpty: true});

    this.path = new Phaser.Curves.Path(this.x, this.y);

    var startTile = map.worldToTileXY(this.x, this.y);
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

      var curve = this.path.curves[this.pathIndex];
      var distance = curve.p0.distance(curve.p1);

      //going up
      if(curve.p1.y < curve.p0.y) {
        this.anims.play(this.config.key + '-walk-left-up', true);
      }
      //going down
      else {
        this.anims.play(this.config.key + '-walk-left-down', true);
      }

      //going right
      if(curve.p1.x > curve.p0.x) {
        this.setFlipX(1);
      }
      //going left
      else {
        this.setFlipX(0);
      }

      var direction = new Phaser.Math.Vector2(curve.p1.x - curve.p0.x, curve.p1.y - curve.p0.y).normalize();
      var angle = Math.atan2(curve.p1.y - curve.p0.y, curve.p1.x - curve.p0.x) * 180 / Math.PI;

      this.x += delta*direction.x*this.config.speed;
      this.y += delta*direction.y*this.config.speed;

      if(this.getCenter().distance(curve.p1) < 2) {
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

  isHit(bullet) {
    this.whenIsHit(bullet);
    this.setTintFill(0xff0000);

    if(!this.startsPursuit) {
      this.startPursuit()
    }

    if(this.config.hp > 0) {
      this.config.hp -= bullet.damage;
      if(this.config.hp <= 0) {
        this.die(bullet.owner);
      }
    }
  }

  die(killer) {
    this.whenDie(killer);
    this.clear();
  }

  clear() {
    this.scene.enemies.remove(this);
    clearInterval(this.pursuitInterval);
    this.destroy();
  }
}

class Zombie extends Enemy {
  constructor(scene, x, y, startsPursuit) {
    var config = {
      key:'zombie',
      x: x, y: y,
      speed: 0.035 * window.speed,
      hp: 50,
      pathUpdateTime: 250,
      attack: {
        damage: 4,
        rate: 1000,
        sounds: scene.sounds.zombiefast
      }
    };
    super(scene, config, startsPursuit);
    this.setScale(1.05);
  }

  spawn(x, y, startsPursuit) {
    this.x = x;
    this.y = y;
    this.setActive(true);
    this.setVisible(true);
    this.startsPursuit = startsPursuit;
  }

  whenInRangeTarget(delta) {
    if(!this.startsPursuit) {
      this.startPursuit();
    }
  }

  whenDistantTarget(delta) {
    this.followPath(delta);
  }

  whenIsHit(bullet) {
    var kickbackVector = new Phaser.Math.Vector2(this.x - bullet.x, this.y - bullet.y);
    this.x += kickbackVector.x/10;
    this.y += kickbackVector.y/10;
  }

  die(killer) {
    window.gameplayStats[killer.name].nbZombiesKilled += 1;
    clearInterval(this.pursuitInterval);
    this.startsPursuit = false;
    this.config.hp = 100;
    this.setActive(false);
    this.setVisible(false);
    this.scene.add.image(this.x, this.y, 'zombie', 'zombie-dead.png').setPipeline("Light2D");
  }

  clear() {
    this.scene.enemies.remove(this);
    clearInterval(this.pursuitInterval);
  }
}

class Boomer extends Enemy {
  constructor(scene, x, y) {
    var config = {
      key:'boomer',
      x: x, y: y,
      speed: 0.025 * window.speed,
      hp: 100,
      pathUpdateTime: 250,
      attack: {
        damage: 15,
        rate: 5000,
        sounds: scene.sounds.boomerattack
      }
    };
    super(scene, config);
    this.setScale(1.5);
  }

  whenStartPursuit() {
    this.scene.sounds.boomercry.playInSpace(this.scene, this.getCenter());
  }

  whenDistantTarget(delta) {
    this.followPath(delta);
  }

  die(killer) {
    window.gameplayStats[killer.name].nbBoomersKilled += 1;

    var allies = this.scene.allies.getAlliesAround(this.getCenter(), 32);
    if(allies.length > 0) {
      this.scene.aidirector.spawnMob();
      this.scene.sounds.changeMusic('boomermusic');
    }
    this.scene.enemies.remove(this);
    clearInterval(this.pursuitInterval);

    this.setScale(2);
    this.anims.play('boomer-explode');
    this.scene.sounds.boomerexplode.playInSpace(this.scene, this.getCenter());
    this.scene.camera.shake(100, 0.005);

    this.on('animationcomplete', function(animation) {
      if(animation.key == "boomer-explode") {
        this.scene.add.image(this.x, this.y, 'boomer', 'boomer-dead.png').setPipeline("Light2D").setScale(1.5).setDepth(this.y);
        this.destroy();
      }
    }, this);
  }
}

class Hunter extends Enemy {
  constructor(scene, x, y) {
    var config = {
      key:'hunter',
      x: x, y: y,
      speed: 0.015 * window.speed,
      hp: 200,
      pathUpdateTime: 250,
      attack: {
        damage: 10,
        rate: 1000,
        sounds: scene.sounds.hunterattack
      }
    };
    super(scene, config);
    this.setScale(1.3);

    this.isOnTarget = false;
    this.jumpTimeout;
  }

  startPursuit() {
    this.scene.sounds.changeMusic('huntermusic');
    this.scene.sounds.huntercry.playInSpace(this.scene, this.getCenter());
    this.startsPursuit = true;
    this.target = this.scene.allies.getWeakestAlly();
    this.pursuitInterval = window.setInterval(function(){
      this.target = this.scene.allies.getWeakestAlly(this.getCenter());
      this.setPathTo(this.target.x, this.target.y);
    }.bind(this), this.config.pathUpdateTime);
    window.intervals.push(this.pursuitInterval);
  }

  update(time, delta) {
    var targetCoord = this.target.getCenter();
    var meCoord = this.getCenter();
    var distance = meCoord.distance(targetCoord);
    if(distance > 90) {
      this.followPath(delta);
    } else if (!this.isOnTarget && !this.jumpTimeout) {
      this.jumpTimeout = window.setTimeout(function(){
        this.jumpOnTarget(delta);
      }.bind(this), 1000);
      window.timeouts.push(this.jumpTimeout);
    }
  }

  jumpOnTarget(delta) {
    this.isOnTarget = true;
    this.scene.sounds.hunterjump.play();
    this.scene.tweens.add({
        targets: this,
        x: this.target.x,
        y: this.target.y,
        duration: 500
    });
    this.target.isHit(100);
  }

  whenDie(killer) {
    window.gameplayStats[killer.name].nbHuntersKilled += 1;
    this.scene.add.image(this.x, this.y, 'hunter', 'hunter-dead.png').setPipeline("Light2D").setScale(1.3).setDepth(this.y);
  }
}

class Smoker extends Enemy {
  constructor(scene, x, y) {
    var config = {
      key:'smoker',
      x: x, y: y,
      speed: 0.025 * window.speed,
      hp: 200,
      pathUpdateTime: 250,
      attack: {
        damage: 15,
        rate: 1000,
        sounds: scene.sounds.smokerattack
      }
    };
    super(scene, config);
    this.setScale(1.2);

    this.draggingTarget = false;
    this.dragTween = null;
  }

  startPursuit() {
    this.scene.sounds.changeMusic('smokermusic');
    this.scene.sounds.smokercry.playInSpace(this.scene, this.getCenter());
    this.startsPursuit = true;
    this.target = this.scene.allies.getClosestAllyTo(this.getCenter());
    this.pursuitInterval = window.setInterval(function(){
      this.target = this.scene.allies.getClosestAllyTo(this.getCenter());
      this.setPathTo(this.target.x, this.target.y);
    }.bind(this), this.config.pathUpdateTime);
    window.intervals.push(this.pursuitInterval);
  }

  update(time, delta) {
    var targetCoord = this.target.getCenter();
    var meCoord = this.getCenter();
    var distance = meCoord.distance(targetCoord);
    if(distance > 150) {
      this.followPath(delta);
    } else if (!this.draggingTarget) {
      this.dragTarget(delta);
    } else if (distance < 10) {
      this.attack();
    }
  }

  dragTarget(delta) {
    this.draggingTarget = true;
    this.scene.sounds.smokerdrag.play();

    var dragDestination = this.scene.level.getCoordBeforeObstacleFromAtoB(this.target.getCenter(), this.getCenter());
    var dragDistance = this.target.getCenter().distance(dragDestination);

    this.graphics = this.scene.add.graphics();
    this.graphics.lineStyle(2, 0xffffff);

    this.scene.tweens.add({
        targets: this.target,
        x: dragDestination.x,
        y: dragDestination.y,
        duration: dragDistance / 0.1,
        onUpdate: function() {
          var line = new Phaser.Geom.Line(this.target.x, this.target.y, dragDestination.x, dragDestination.y);
          this.graphics.clear();
          this.graphics.strokeLineShape(line);
        },
        onComplete: function() {
          this.graphics.clear();
        },
        callbackScope: this
    });
    this.target.isHit(100);
  }

  whenDie(killer) {
    window.gameplayStats[killer.name].nbSmokersKilled += 1;
    if(this.dragTween)
      this.dragTween.stop();

    this.scene.add.image(this.x, this.y, 'smoker', 'smoker-dead.png').setPipeline("Light2D").setScale(1.2).setDepth(this.y);
  }
}

class Tank extends Enemy {
  constructor(scene, x, y) {
    var config = {
      key:'tank',
      x: x, y: y,
      speed: 0.040 * window.speed,
      hp: 3000,
      pathUpdateTime: 250,
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
    this.setScale(2);
    this.scene.sounds.changeMusic('tankmusic');
    this.rock = null;
    this.isThrowing = false;
  }

  whenInRangeTarget(delta) {
    if(!this.isThrowing) {
      this.isThrowing = Math.random() < 0.001;
      if(this.isThrowing) {
        this.throwRock();
      }
    }
  }

  whenDistantTarget(delta) {
    if(!this.isThrowing) {
      this.followPath(delta);
      if(!this.scene.sounds.tankwalk.isPlaying) {
        var player = this.scene.allies.player;
        this.scene.sounds.tankwalk.playInSpace(this.scene, this.getCenter());
      }
    }
  }

  whenAttack() {
    if(this.target) {
      var hitDirection = new Phaser.Math.Vector2(this.target.x - this.x, this.target.y - this.y).normalize();
      this.target.body.setVelocity(hitDirection.x*100, hitDirection.y*100);
      this.scene.tweens.add({
        targets: this.target.body.velocity,
        x: 0,
        y: 0,
        duration: 2000
      });
    }
  }

  throwRock() {
    var now = this.scene.time.now;
    if(now - this.config.attack.lastTime > this.config.attack.rate) {
      this.config.attack.lastTime = now;
      this.rock = new Rock(this, this.scene, this.x, this.y);
    } else {
      this.isThrowing = false;
    }
  }

  whenDie(killer) {
    this.scene.sounds.tankmusic.stop();
    this.rock = null;
    this.scene.add.image(this.x, this.y, 'tank', 'tank-dead.png').setPipeline("Light2D").setScale(2).setDepth(this.y);
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

    this.scene.physics.add.overlap(this.scene.allies.group, this.sprite, this.damageTarget, null, this).name = 'rock_overlap';

    var speed = 100 * window.speed;
    var targetCoord = target.getCenter();
    var direction = new Phaser.Math.Vector2(targetCoord.x - this.sprite.x, targetCoord.y - this.sprite.y).normalize();
    this.sprite.body.setVelocity(direction.x * speed, direction.y * speed);
    var t = window.setTimeout(function(){
      this.explode();
    }.bind(this), 1000);
    window.timeouts.push(t);
  }

  explode() {
    this.tank.config.rockexplodeSound.play();
    this.isExploding = true;
    this.sprite.body.setVelocity(0,0);
    this.sprite.anims.play('rock-anim', true);
  }

  damageTarget(target) {
    var collider = this.scene.physics.world.colliders.getActive().find(function(i){
      return i.name == 'rock_overlap'
    });
    if(collider)
      collider.destroy();

    var ally = this.scene.allies.getAlly(target.name)
    ally.isHit(this.damage);
    this.explode();
  }
}
