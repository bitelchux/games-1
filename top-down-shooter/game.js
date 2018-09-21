window.Game = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Game () {
    Phaser.Scene.call(this, { key: 'game' });

    this.cursors;
    this.map;
    this.tileset;
    this.player;
    this.enemies;
    this.bullets;
    this.grenades;
    this.bulletImpacts;
    this.weapon;
    this.scoreText;
    this.score = 0;
    this.lastShot;
    this.spawnPoints = [{x:0,y:0}, {x:240,y:0}, {x:240,y:240}, {x:0,y:240}];
    this.enemySpawnInterval;

    this.sounds = {pistols: null, shotgun: null, uzi: null, grenade: {throw: null, explosion: null}};
  },

  preload: function() {
    this.load.image("tileset", "assets/tileset.png");
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 16, frameHeight: 16
    });
    this.load.spritesheet('enemy', 'assets/enemy.png', {
      frameWidth: 16, frameHeight: 16
    });
    this.load.spritesheet('bullet-impact', 'assets/bullet-impact.png', {
      frameWidth: 4, frameHeight: 4
    });
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('grenade', 'assets/grenade.png', {
      frameWidth: 64, frameHeight: 64
    });

    this.load.spritesheet('weapons', 'assets/weapons.png', {
      frameWidth: 64, frameHeight: 16
    });
    this.load.audio('pistolsSound', 'assets/pistols.wav');
    this.load.audio('shotgunSound', 'assets/shotgun.wav');
    this.load.audio('uziSound', 'assets/uzi.wav');
    this.load.audio('grenadeThrowSound', 'assets/grenade-throw.wav');
    this.load.audio('grenadeExplosionSound', 'assets/grenade-explosion.wav');
  },

  createMap: function() {
    this.map = this.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: 256,
      height: 256
    });

    this.tileset = this.map.addTilesetImage('tileset', null, 16, 16);
    this.groundLayer = this.map.createBlankDynamicLayer("groundLayer", this.tileset);
    this.stuffLayer = this.map.createBlankDynamicLayer("stuffLayer", this.tileset);
    this.groundLayer.fill(0);

    //trees
    for(var i=0; i<10; i++) {
      var x = Math.round(Math.random()*16);
      var y = Math.round(Math.random()*16);
      if(this.stuffLayer.getTileAt(x, y) == null) {
        this.stuffLayer.putTileAt(1, x, y);
      }
    }
    //rocks
    for(var i=0; i<6; i++) {
      var x = Math.round(Math.random()*16);
      var y = Math.round(Math.random()*16);
      if(this.stuffLayer.getTileAt(x, y) == null) {
        this.stuffLayer.putTileAt(2, x, y);
      }
    }
    //walls
    for(var i=0; i<4; i++) {
      var x = Math.round(Math.random()*16);
      var y = Math.round(Math.random()*16);
      if(this.stuffLayer.getTileAt(x, y) == null) {
        this.stuffLayer.putTileAt(3, x, y);
      }
    }

    this.stuffLayer.setCollision([2,3]);
    this.stuffLayer.setDepth(2);
  },

  createPlayer: function() {
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(1);
    this.player["isDying"] = false;

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('player', {start:0, end:2}),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'die',
      frames: this.anims.generateFrameNumbers('player', {start:4, end:6}),
      frameRate: 12
    });

    this.player.on('animationcomplete', function(animation, frame) {
      if(animation.key == 'die') {
        window.score = this.score;
        this.scene.switch('gameover');
      }
    }, this);
  },

  createWeapons: function() {
    this.weapons = this.physics.add.sprite(224, 8, 'weapons');
    this.weapons.setDepth(3);
    this.weapons["array"] = [
      {name: "pistols", frame: 0, rate: 200, damage: 100},
      {name: "shotgun", frame: 1, rate: 1000, damage: 35},
      {name: "uzi", frame: 2, rate: 70, damage: 50},
      {name: "grenade", frame: 3, rate: 2000, damage: 100},
    ];
    this.weapons["current"] = 0;

    this.lastShot = this.time.now;
  },

  createScore: function() {
    this.scoreText = this.add.text(1, 1, 'Kills: ' + this.score, {
      fontStyle: 'bold', fontSize: '16px', fill: 'white'
    });
    this.scoreText.setShadow(0,0,'black',3,false,true);
    this.scoreText.setDepth(3);
  },

  createAudio: function() {
    this.sounds.pistols = this.sound.add('pistolsSound', {volume: 0.05});
    this.sounds.shotgun = this.sound.add('shotgunSound', {volume: 0.05});
    this.sounds.uzi = this.sound.add('uziSound', {volume: 0.05});
    this.sounds.grenade.throw = this.sound.add('grenadeThrowSound', {volume: 0.05});
    this.sounds.grenade.explosion = this.sound.add('grenadeExplosionSound', {volume: 0.05});
  },

  createKeys: function() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on('keydown_ESC', function(){
      clearInterval(this.enemySpawnInterval);
      this.scene.pause();
      this.scene.run('pause');
    }, this);

    this.input.keyboard.on('keydown_CTRL', function(){
      this.changeWeapon();
    }, this);

    this.events.on('resume', function(){
      this.enemySpawnInterval = setInterval(function(){this.addEnemy()}.bind(this), 5000);
    }, this);
  },

  createAnims: function() {
    this.anims.create({
      key: 'impact',
      frames: this.anims.generateFrameNumbers('bullet-impact', {start:0, end:3}),
      frameRate: 12
    });

    this.anims.create({
      key: 'explode',
      frames: this.anims.generateFrameNumbers('grenade', {start:1, end:4}),
      frameRate: 12
    });
  },

  create: function () {
    this.createMap();
    this.createPlayer();
    this.createWeapons();
    this.createScore();
    this.createAudio();
    this.createKeys();
    this.createAnims();

    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    this.bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    this.bulletImpacts = this.physics.add.group({ classType: BulletImpact, runChildUpdate: true});
    this.grenades = this.physics.add.group({ classType: Grenade, runChildUpdate: true });

    this.physics.add.overlap(this.enemies, this.grenades, this.overlapsGrenade, null, this);
    this.physics.add.overlap(this.player, this.grenades, this.overlapsGrenade, null, this);
    this.physics.add.overlap(this.enemies, this.bullets, this.damageEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerIsHit, null, this);
    this.physics.add.collider(this.player, this.stuffLayer, this.takesCover, null ,this);
    this.physics.add.overlap(this.bullets, this.stuffLayer, this.explodeBullet, null, this);

    this.addEnemy();
    this.enemySpawnInterval = setInterval(function(){this.addEnemy()}.bind(this), 5000);
  },

  update: function() {
    if(this.player.isDying) {
      return;
    }
    this.player.setVelocity(0,0);
    var speed = 64;

    if(this.cursors.up.isDown && this.cursors.left.isDown) {
      this.player.setVelocity(-2*speed/3,-2*speed/3);
      this.player.setAngle(-45);
      this.player.anims.play('walk', true);
    } else if(this.cursors.up.isDown && this.cursors.right.isDown) {
      this.player.setVelocity(2*speed/3,-2*speed/3);
      this.player.setAngle(45);
      this.player.anims.play('walk', true);
    } else if(this.cursors.down.isDown && this.cursors.left.isDown) {
      this.player.setVelocity(-2*speed/3,2*speed/3);
      this.player.setAngle(-135);
      this.player.anims.play('walk', true);
    } else if(this.cursors.down.isDown && this.cursors.right.isDown) {
      this.player.setVelocity(2*speed/3,2*speed/3);
      this.player.setAngle(135);
      this.player.anims.play('walk', true);
    } else if(this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.setAngle(0);
      this.player.anims.play('walk', true);
    } else if(this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.setAngle(180);
      this.player.anims.play('walk', true);
    } else if(this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.setAngle(-90);
      this.player.anims.play('walk', true);
    } else if(this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.setAngle(90);
      this.player.anims.play('walk', true);
    }

    if(this.cursors.space.isDown) {
      this.shoot();
    }
  },

  addEnemy: function() {
    var enemy = this.enemies.get();
    if (enemy)
    {
      var pos = {x: Math.floor(Math.random()*240) + 16, y: Math.floor(Math.random()*240) + 16};
      enemy.start(this.spawnPoints[Math.floor(Math.random()*4)], this.map, this.player);
      enemy.on('enemyDies', function(){
        this.score += 1;
        this.scoreText.setText('Kills: ' + this.score);
        this.addEnemy()
      }, this);
    }
  },

  damageEnemy: function(enemy, bullet) {
    // only if both enemy and bullet are alive
    if (enemy.active === true && bullet.active === true) {
      // decrease the enemy hp with BULLET_DAMAGE
      enemy.receiveDamage(bullet.damage);

      this.explodeBullet(bullet, {canCollide: true});

      // we remove the bullet right away
      bullet.die();
    }
  },

  overlapsGrenade: function(dude, grenade) {
    if (grenade.isExploding) {
      if(dude.constructor.name == "Enemy") {
        dude.receiveDamage(grenade.damage);
      } else {
        this.playerIsHit();
      }
    }
  },

  explodeBullet: function(bullet, tile) {
    if(tile.canCollide && bullet.active === true){
      var bulletImpact = this.bulletImpacts.get();
      if (bulletImpact)
      {
        bulletImpact.play(bullet.x, bullet.y);
      }
      bullet.die();
    }
  },

  playerIsHit: function() {
    if(!this.player.isDying) {
      this.player.anims.play('die', true);
      this.player.isDying = true;
    }
  },

  takesCover: function() {
    console.log("player takes cover");
  },

  shoot: function() {
    var weapon = this.weapons.array[this.weapons.current];
    if((this.time.now - this.lastShot) > weapon.rate) {
      switch(weapon.name) {
        case "pistols":
          this.shootPistols();
          break;
        case "shotgun":
          this.shootShotgun();
          break;
        case "uzi":
          this.shootUzi();
          break;
        case "grenade":
          this.shootGrenade();
          break;
      }

      this.lastShot = this.time.now;
    }
  },

  shootPistols: function() {
    var leftBullet = this.bullets.get();
    var rightBullet = this.bullets.get();
    if (rightBullet && leftBullet)
    {
      this.sounds.pistols.play();
      this.sounds.pistols.play();
      var weapon = this.weapons.array[this.weapons.current];
      leftBullet.setDamage(weapon.damage);
      rightBullet.setDamage(weapon.damage);

      var leftCoord = {x: this.player.x, y: this.player.y};
      var rightCoord = {x: this.player.x, y: this.player.y};
      var rotation = this.player.rotation.toFixed(1);
      if(rotation == 0.0 || rotation == -3.1) {
        leftCoord.x -= 8;
        rightCoord.x += 8;
      } else if(rotation == 1.6 || rotation == -1.6) {
        leftCoord.y -= 8;
        rightCoord.y += 8;
      } else if(rotation == 0.8 || rotation == -2.4) {
        leftCoord.x -= 6;
        leftCoord.y -= 6;
        rightCoord.x += 6;
        rightCoord.y += 6;
      } else if(rotation == -0.8 || rotation == 2.4) {
        leftCoord.x += 6;
        leftCoord.y -= 6;
        rightCoord.x -= 6;
        rightCoord.y += 6;
      }

      leftBullet.fire(leftCoord.x, leftCoord.y, this.player.rotation - Math.PI/2);
      rightBullet.fire(rightCoord.x, rightCoord.y, this.player.rotation - Math.PI/2);
    }
  },

  shootUzi: function() {
    var bullet = this.bullets.get();
    if (bullet)
    {
      this.sounds.uzi.play();
      var weapon = this.weapons.array[this.weapons.current];
      bullet.setDamage(weapon.damage);
      bullet.fire(this.player.x, this.player.y, this.player.rotation - Math.PI/2);
    }
  },

  shootShotgun: function() {
    for(var i=0; i<20; i++) {
      var bullet = this.bullets.get();
      if(bullet)
      {
        this.sounds.shotgun.play();
        var weapon = this.weapons.array[this.weapons.current];
        bullet.setDamage(weapon.damage);

        var rotation = this.player.rotation - Math.PI/2
        var extraRotation = Math.random()*Math.PI/4;
        extraRotation *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
        rotation += extraRotation;
        bullet.fire(this.player.x, this.player.y, rotation);
      }
    }
  },

  shootGrenade: function() {
    var grenade = this.grenades.get();
    if (grenade)
    {
      this.sounds.grenade.throw.play();
      var weapon = this.weapons.array[this.weapons.current];
      grenade.setDamage(weapon.damage);
      grenade.drop(this.player.x, this.player.y, this.player.rotation - Math.PI/2);
    }
  },

  changeWeapon: function() {
    var index = (this.weapons.frame.name + 1) % 4;
    this.weapons.setFrame(index);
    this.weapons.current = index;
  }
});

window.Pause = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Pause ()
  {
    Phaser.Scene.call(this, { key: 'pause' });
    this.text;
  },

  create: function() {
    this.text = this.add.text(110, 110, 'PAUSE', {
      fontStyle: 'bold', fontSize: '16px', fill: 'white', backgroundColor: 'black'
    });

    this.input.keyboard.on('keydown_ESC', function(){
      this.text.setVisible(false);
      this.scene.pause();
      this.scene.resume('game');
    }, this);
  }
});

var Enemy = new Phaser.Class({

  Extends: Phaser.GameObjects.PathFollower,

  initialize:

  function Enemy (scene)
  {
    Phaser.GameObjects.PathFollower.call(this, scene, null, 0, 0, 'enemy');

    this.speed = Math.random()*30 + 10;
    this.hp = 100;
    this.player;
    this.map;
  },

  start: function(point, map, player) {
    this.setActive(true);
    this.setVisible(true);
    this.x = point.x;
    this.y = point.y;
    this.player = player;
    this.map = map;
    this.newPath();
    this.pathInterval = setInterval(function(){this.newPath()}.bind(this), 500);
  },

  newPath: function() {
    var path = this.findPathTo(this.player.x, this.player.y);
    if(path.curves.length > 0) {
      this.setPath(path);
      var distance = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
      this.startFollow({
        duration:distance * this.speed,
        rotateToPath: true,
        rotationOffset: 90
      });
    }
  },

  findPathTo: function(x, y) {

    var finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true
    });

    var grid = new PF.Grid(16, 16);
    this.scene.stuffLayer.forEachTile(function(tile){
      if(tile.canCollide) {
        grid.setWalkableAt(tile.x, tile.y, false);
      }
    }, this,0,0,16,16,{isNotEmpty: true});


    this.path = new Phaser.Curves.Path(this.x, this.y);

    var startTile = this.map.worldToTileXY(this.x, this.y);
    var endTile = this.map.worldToTileXY(x, y);
    var tilePath = finder.findPath(startTile.x, startTile.y, endTile.x, endTile.y, grid);
    tilePath.shift();
    tilePath.forEach(function(tileCoord) {
      this.path.lineTo(tileCoord[0]*16 + 8, tileCoord[1]*16 + 8);
    }.bind(this));

    return this.path;
  },

  update: function(time, delta) {
    //this.x += this.speed * delta;
    //this.y += this.speed * delta;
  },

  receiveDamage: function(damage) {
    this.hp -= damage;
    if(this.hp <= 0) {
      this.emit('enemyDies');
      clearInterval(this.pathInterval);
      this.destroy();
    }
  }
});

var Bullet = new Phaser.Class({

  Extends: Phaser.GameObjects.Image,

  initialize:

  function Bullet (scene)
  {
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');

    this.dx = 0;
    this.dy = 0;
    this.lifespan = 0;

    this.speed = Phaser.Math.GetSpeed(300, 1);
  },

  setDamage: function (damage)
  {
    this.damage = damage;
  },

  fire: function (x, y, angle)
  {
    this.setActive(true);
    this.setDepth(0);
    this.setVisible(true);

    this.setPosition(x, y);

    this.dx = Math.cos(angle);
    this.dy = Math.sin(angle);

    this.lifespan = 600;
  },

  update: function (time, delta)
  {
    this.lifespan -= delta;

    this.x += this.dx * (this.speed * delta);
    this.y += this.dy * (this.speed * delta);

    if (this.lifespan <= 0)
    {
      this.die();
    }
  },

  die: function() {
    this.destroy();
  }
});

var BulletImpact = new Phaser.Class({

  Extends: Phaser.GameObjects.Sprite,

  initialize:

  function BulletImpact (scene)
  {
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'bullet-impact');

    this.on('animationcomplete', function() {
      this.destroy();
    }, this);

  },

  play: function (x, y)
  {
    this.x = x;
    this.y = y;
    this.anims.play('impact', true);
  }
});

var Grenade = new Phaser.Class({

  Extends: Phaser.GameObjects.Sprite,

  initialize:

  function Grenade (scene)
  {
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'grenade');

    this.isExploding = false;

    this.explosionSound = scene.sounds.grenade.explosion;

    this.on('animationcomplete', function() {
      this.destroy();
    }, this);
  },

  setDamage: function (damage)
  {
    this.damage = damage;
  },

  drop: function (x, y, angle)
  {
    this.setActive(true);
    this.setDepth(0);
    this.setVisible(true);
    this.setPosition(x, y);
    setTimeout(function(){this.explode()}.bind(this), 1300);
  },

  explode: function ()
  {
    this.anims.play('explode', true);
    this.explosionSound.play();
    this.isExploding = true;
  }
});
