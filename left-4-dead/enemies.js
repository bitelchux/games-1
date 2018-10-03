class Enemies {
  constructor(scene) {
    this.scene = scene;
    this.group = [];

    this.spawns = {list:[], minRange: 125, maxRange: 300};
    this.startIntervalsAndTimeouts();
  }

  startIntervalsAndTimeouts(){
    //small wave
    var smallWaveInterval = setInterval(function(){
      this.spawnWaves(2, 5, 500);
    }.bind(this), 5000);

    //big wave
    var bigWaveInterval = setInterval(function(){
      this.scene.sounds.zombiewave.play();
      this.spawnWaves(3, 30, 2000);
    }.bind(this), 30000);

    //tank
    setTimeout(function(){
      this.spawnTank();
      clearInterval(smallWaveInterval);
      clearInterval(bigWaveInterval);
    }.bind(this), 50000);
  }

  spawnWaves(nbWaves, nbEnemiesPerWave, delayBetweenWaves) {
    for(var i=0; i<nbWaves; i++) {
      setTimeout(function(){
        this.spawnZombies(nbEnemiesPerWave);
      }.bind(this),delayBetweenWaves * i);
    }
  }

  spawnZombies(n) {
    var playerCoord = this.scene.player.sprite.getCenter();
    var spawns = this.scene.forest.getSpawns(playerCoord, this.spawns.minRange, this.spawns.maxRange);
    for(var i=0; i<n; i++) {
      var spawn = spawns[Math.floor(Math.random()*spawns.length)]
      this.group.push(new Zombie(this.scene, spawn.x, spawn.y));
    }
  }

  spawnTank() {
    var playerCoord = this.scene.player.sprite.getCenter();
    var spawns = this.scene.forest.getSpawns(playerCoord, 600, 800);
    var spawn = spawns[Math.floor(Math.random()*spawns.length)]
    this.group.push(new Tank(this.scene, spawn.x, spawn.y));
  }

  update(time, delta) {
    this.group.forEach(function(enemy) {
      enemy.update(time, delta);
    });
  }

  removeEnemy(enemy) {
    this.group.splice(this.group.indexOf(enemy), 1);
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
}

/* config = {key, x, y, speed, hp, attack:{damage, rate, sounds}}*/
class Enemy {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;

    this.sprite = scene.add.sprite(config.x, config.y, config.key).setPipeline("Light2D");
    this.sprite.setDepth(2);

    this.path = null;
    this.pathIndex = null;
    this.target = null;

    this.config.attack['lastTime'] = this.scene.time.now;

    this.whenStarting();
  }

  // to override for special behaviors
  whenStarting() {}

  whenNearbyPlayer() {}

  whenDistantPlayer() {}

  whenDie() {}

  update(time, delta) {
    var playerCoord = this.scene.player.sprite.getCenter();
    var meCoord = this.sprite.getCenter();
    var distance = meCoord.distance(playerCoord);
    if(distance < 10) {
      this.whenNearbyPlayer(delta);
    } else {
      this.whenDistantPlayer(delta);
    }
  }

  startPursuit() {
    var playerCoord = this.scene.player.sprite.getCenter();
    setInterval(function(){
      var playerCoord = this.scene.player.sprite.getCenter();
      this.setPathTo(playerCoord.x, playerCoord.y);
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
        var random_boolean = Math.random() < 0.1;
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
      this.config.attack.lastTime = now;
      this.scene.player.isHit(this.config.attack.damage);
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
    this.scene.enemies.removeEnemy(this);
  }
}

class Zombie extends Enemy {
  constructor(scene, x, y) {
    var config = {
      key:'zombie',
      x: x, y: y,
      speed: 0.035,
      hp: 100,
      pathUpdateTime: 250,
      attack: {
        damage: 5,
        rate: 300,
        sounds: scene.sounds.zombiefast
      }
    };
    super(scene, config);
  }

  whenStarting() {
    this.startPursuit();
  }

  whenNearbyPlayer(delta) {
    this.attack();
  }

  whenDistantPlayer(delta) {
    this.followPath(delta);
  }
}

class Tank extends Enemy {
  constructor(scene, x, y) {
    var config = {
      key:'tank',
      x: x, y: y,
      speed: 0.040,
      hp: 1000,
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

    scene.sounds.tankmusic.play();
    this.rock = null;
    this.isThrowing = false;
  }

  whenStarting() {
    this.startPursuit();
  }

  whenNearbyPlayer(delta) {
    this.attack();
  }

  whenDistantPlayer(delta) {
    if(!this.isThrowing) {
      this.isThrowing = Math.random() < 0.001;
      if(this.isThrowing) {
        this.throwRock();
      } else {
        this.followPath(delta);
      }
    }
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
    this.rock = null;
    this.scene.enemies.startIntervalsAndTimeouts();
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
    this.tank.config.pickrockSound.play();
  }

  thrown() {
    this.tank.config.throwSound.play();

    this.scene.physics.add.overlap(this.scene.player.sprite, this.sprite, this.damagePlayer, null, this).name = 'rock_overlap';

    var speed = 100;
    var playerCoord = this.scene.player.sprite.getCenter();
    var direction = new Phaser.Math.Vector2(playerCoord.x - this.sprite.x, playerCoord.y - this.sprite.y).normalize();
    this.sprite.body.setVelocity(direction.x * speed, direction.y * speed);
    setTimeout(function(){this.explode();}.bind(this), 1000);
  }

  explode() {
    this.tank.config.rockexplodeSound.play();
    this.isExploding = true;
    this.sprite.body.setVelocity(0,0);
    this.sprite.anims.play('rock-anim', true);
  }

  damagePlayer() {
    this.scene.physics.world.colliders.getActive().find(function(i){
      return i.name == 'rock_overlap'
    }).destroy();
    this.scene.player.isHit(this.damage);
    this.explode();
  }
}
