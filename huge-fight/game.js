window.Game = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Game () {
    Phaser.Scene.call(this, { key: 'game' });

    this.backgroundLayer;
    this.collideLayer;

    this.gameMusic;
    this.dashMusic;
    this.slashMusic;
    this.bossAttackMusic;
    this.teleportMusic;

    this.cursors;
    this.up;
    this.doubleTap = {enabled: true, time: 0, key: ""};

    this.dash;
    this.player;
    this.boss;

    var that = this;
    this.bossFSM = new StateMachine({
      init: 'walk',
      transitions: [
        { name: 'seePlayer', from: 'idle', to: 'walk' },
        { name: 'nearPlayer', from: 'walk', to: 'attack' },
        { name: 'playerBehind', from: 'walk', to: 'idle' },
        { name: 'useSpecial', from: 'walk', to: 'teleport' },
        { name: 'die', from: ['idle', 'walk', 'turn', 'attack', 'teleport'], to: 'die' },
        { name: 'goto', from: '*', to: function(s) { return s } }
      ],
      methods: {
        onSeePlayer: function() { that.bossWalk() },
        onNearPlayer: function() { that.bossAttack() },
        onPlayerBehind: function() { that.bossTurn() },
        onUseSpecial: function() { that.bossTeleport() },
        onDie: function() { that.bossDie() },
        onLeaveWalk: function() { that.boss.setVelocityX(0) }
      }
    });
  },

  preload: function() {
    this.load.image("tileset", "../assets/tileset.png");
    this.load.tilemapTiledJSON("tilemap", "../assets/tilemap.json");
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 16, frameHeight: 32
    });
    this.load.spritesheet('boss', 'assets/boss.png', {
      frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet('dash', 'assets/dash.png', {
      frameWidth: 16, frameHeight: 16
    });
    this.load.audio('gameMusic', 'assets/game.wav');
    this.load.audio('dashMusic', 'assets/dash.wav');
    this.load.audio('slashMusic', 'assets/slash.wav');
    this.load.audio('bossAttackMusic', 'assets/boss-attack.wav');
    this.load.audio('teleportMusic', 'assets/teleport.wav')
  },

  createMap: function() {
    map = this.make.tilemap({ key: "tilemap", tileWidth: 16, tileHeight: 16 });
    tileset = map.addTilesetImage("tileset");
    this.backgroundLayer = map.createStaticLayer(0, tileset, 0, 0);
    this.collideLayer = map.createDynamicLayer(1, tileset, 0, 0);

    map.setCollisionBetween(1, 20);
  },

  createPlayer: function() {
    this.player = this.physics.add.sprite(100, 100, 'player');

    this.player.setDragX(1000);
    this.player.setMaxVelocity(100, 300);
    this.player.setGravityY(300);
    this.player.setCollideWorldBounds(true);

    this.player["accel"] = 500;
    this.player["isSlashing"] = false;
    this.player["canSlash"] = true;
    this.player["isDying"] = false;

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', {start:0, end:2}),
      frameRate: 3,
      repeat: -1,
      yoyo: true
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', {start:3, end:5}),
      frameRate: 8,
      repeat: -1,
      yoyo: true
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', {start:6, end:8}),
      frameRate: 8,
      repeat: -1,
      yoyo: true
    });
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player', {start:9, end:9}),
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'fall',
      frames: this.anims.generateFrameNumbers('player', {start:10, end:10}),
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'crouch',
      frames: this.anims.generateFrameNumbers('player', {start:11, end:11}),
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'slash',
      frames: this.anims.generateFrameNumbers('player', {start:12, end:14}),
      frameRate: 15
    });
    this.anims.create({
      key: 'die',
      frames: this.anims.generateFrameNumbers('player', {start:15, end:17}),
      frameRate: 6
    });

    this.player.on('animationcomplete', function(animation, frame) {
      if(animation.key == 'die') {
        setTimeout(function(){this.lose();}.bind(this), 1000);
      }
    }, this);
  },

  createDashes: function() {
    this.dash = this.physics.add.sprite(0, 0, 'dash');
    this.dash.body.allowGravity = false;
    this.dash.disableBody(false, true);

    this.anims.create({
      key: 'dash-right',
      frames: this.anims.generateFrameNumbers('dash', {start:0, end:2}),
      frameRate: 10
    });
    this.anims.create({
      key: 'dash-left',
      frames: this.anims.generateFrameNumbers('dash', {start:3, end:5}),
      frameRate: 10
    });
    this.anims.create({
      key: 'dash-up',
      frames: this.anims.generateFrameNumbers('dash', {start:6, end:8}),
      frameRate: 10
    });

    this.dash.on('animationcomplete', function(animation, frame) {
      if(animation.key.includes('dash')) {
        this.dash.disableBody(false, true);
      }
    }, this);
  },

  dashUp: function() {
    this.dash.enableBody(false, 10, 10, true, true);
    this.dash.x = this.player.x;
    this.dash.y = this.player.y + 8;
    this.dash.anims.play('dash-up', true);
    this.dashMusic.play();
  },

  dashLeft: function() {
    this.dash.enableBody(false, 10, 10, true, true);
    this.dash.x = this.player.x + 8;
    this.dash.y = this.player.y;
    this.dash.anims.play('dash-left', true);
    this.dashMusic.play();
  },

  dashRight: function() {
    this.dash.enableBody(false, 10, 10, true, true);
    this.dash.x = this.player.x - 8;
    this.dash.y = this.player.y;
    this.dash.anims.play('dash-right', true);
    this.dashMusic.play();
  },

  createBoss: function() {
    this.boss = this.physics.add.sprite(500, 100, 'boss');
    this.boss.setScale(5);
    this.boss.setGravityY(300);
    this.boss.setCollideWorldBounds(true);
    this.boss['speed'] = 10;

    this.boss["healthBar"] = this.add.graphics({
      x: this.boss.body.x,
      y: this.boss.body.y - 16 });
    this.boss.healthBar.lineStyle(1, 0xFFFFFF, 1.0);
    this.boss.healthBar.strokeRect(0, 0,
      this.boss.width * this.boss._scaleX, 4);
    this.boss.healthBar["value"] = 0;

    var that = this;
    this.boss.healthBar["setValue"] = function(value) {
      this.value = value;

      this.fillStyle(0x000000, 1.0);
      this.fillRect(0, 0,
        that.boss.width *
        that.boss._scaleX, 4);
      this.fillStyle(0xFFFFFF, 1.0);
      this.fillRect(0, 0,
        that.boss.width *
        that.boss._scaleX *
        this.value / 100, 4);
    };

    this.boss.healthBar.setValue(100);

    this.anims.create({
      key: 'boss-idle',
      frames: this.anims.generateFrameNumbers('boss', {start:0, end:2}),
      frameRate: 3,
      repeat: -1,
      yoyo: true
    });
    this.anims.create({
      key: 'boss-walk',
      frames: this.anims.generateFrameNumbers('boss', {start:3, end:5}),
      frameRate: 6,
      repeat: -1,
      yoyo: true
    });
    this.anims.create({
      key: 'boss-beforeslash',
      frames: this.anims.generateFrameNumbers('boss', {start:6, end:8}),
      frameRate: 3
    });
    this.anims.create({
      key: 'boss-slash',
      frames: this.anims.generateFrameNumbers('boss', {start:9, end:11}),
      frameRate: 24
    });
    this.anims.create({
      key: 'boss-afterslash',
      frames: this.anims.generateFrameNumbers('boss', {start:12, end:14}),
      frameRate: 2
    });
    this.anims.create({
      key: 'boss-teleport',
      frames: this.anims.generateFrameNumbers('boss', {start:15, end:17}),
      frameRate: 8
    });
    this.anims.create({
      key: 'boss-die',
      frames: this.anims.generateFrameNumbers('boss', {start:18, end:20}),
      frameRate: 3
    });

    this.boss.on('animationcomplete', function(animation, frame) {
      var key = animation.key;
      if(key == 'boss-die') {
        setTimeout(function(){this.win();}.bind(this), 1000);
      } else if(key == 'boss-teleport' && this.boss.anims.forward) {
        this.boss.x = this.player.x;
        this.boss.anims.play('boss-teleport');
        this.boss.anims.forward = false;
      } else if(key == 'boss-teleport') {
        this.bossFSM.goto('idle');
      } else if(key.includes('slash')) {
        if(key == 'boss-beforeslash') {
          this.boss.anims.play('boss-slash');
        } else if(key == 'boss-slash') {
          this.boss.anims.play('boss-afterslash');
          this.bossAttackMusic.play();
          this.cameras.main.shake();
        } else if(key == 'boss-afterslash') {
          this.bossFSM.goto('idle');
        }
      }
    }, this);

    this.bossIdle();

    setInterval(function() {
      if(this.bossFSM.is('walk') && this.boss.healthBar.value < 50) {
        this.bossFSM.useSpecial();
      }
    }.bind(this), Math.round(Math.random() * 7000) + 3000);
  },

  createAudio: function() {
    this.gameMusic = this.sound.add('gameMusic');
    this.gameMusic.volume = 0.2;
    this.gameMusic.loop = true;
    this.gameMusic.play();

    this.dashMusic = this.sound.add('dashMusic');
    this.slashMusic = this.sound.add('slashMusic');
    this.slashMusic.volume = 0.5;

    this.bossAttackMusic = this.sound.add('bossAttackMusic');
    this.teleportMusic = this.sound.add('teleportMusic');
    this.teleportMusic.volume = 0.5;
  },

  createCursors: function() {
    this.cursors = this.input.keyboard.createCursorKeys();
  },

  createInputs: function() {
    this.input.keyboard.on('keydown_ESC', function(){
      this.gameMusic.stop();
      this.scene.switch("menu");
    }, this);

    this.input.keyboard.on('keydown_SPACE', function(){
      if(this.player.canSlash && !this.player.isDying) {
        this.playerSlash();
      }
    }, this);

    this.input.keyboard.on('keydown_RIGHT', function(){
      if(!this.player.isDying)
        this.player.setAccelerationX(this.player.accel);
    }, this);
    this.input.keyboard.on('keydown_LEFT', function(){
      if(!this.player.isDying)
        this.player.setAccelerationX(-this.player.accel);
    }, this);
    //check doubletaps
    this.input.keyboard.on('keydown', function(event){
      if(this.doubleTap.enabled && this.player.body.blocked.down && !this.player.isDying) {
        var now = event.timeStamp;
        var key = event.key;
        if((key == this.doubleTap.key) && (now - this.doubleTap.time < 300)) {
          if(key.includes("Arrow")) {
            this.player.setMaxVelocity(300, 400);
            setTimeout(function(){this.player.setMaxVelocity(100, 300);}.bind(this), 250);

            this.doubleTap.enabled = false;
            setTimeout(function(){this.doubleTap.enabled = true;}.bind(this), 500);
          }

          if(key == "ArrowLeft") {
            this.dashLeft();
            this.player.setVelocityX(-300);
          } else if(key == "ArrowRight") {
            this.dashRight();
            this.player.setVelocityX(300);
          }
        } else {
          this.doubleTap.key = key;
          this.doubleTap.time = now;
        }
      }
    }, this);

    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
  },

  create: function () {
    this.createMap();
    this.createPlayer();
    this.createDashes();
    this.createBoss();
    this.createAudio();
    this.createCursors();
    this.createInputs();

    this.physics.add.collider(this.player, this.collideLayer);
    this.physics.add.collider(this.boss, this.collideLayer);

    this.events.on('wake', function(){
      this.scene.start();
    }, this);
  },

  update: function() {
    this.updatePlayer();
    this.updateBoss();
  },

  updatePlayer: function() {
    if(this.player.isSlashing || this.player.isDying) {
      return;
    }

    if(this.player.x < this.boss.x) {
      this.player.resetFlip();
    } else {
      this.player.setFlip(-1,0);
    }

    if (!this.player.body.blocked.down) {
      var velocityY = this.player.body.newVelocity.y;
      if(velocityY < 0) {
        this.player.anims.play('jump', true);
      } else {
        this.player.anims.play('fall', true);
      }
    } else if(this.cursors.right.isDown) {
      this.player.anims.play('right', true);
    } else if(this.cursors.left.isDown) {
      this.player.anims.play('left', true);
    } else if(this.cursors.down.isDown) {
      this.player.anims.play('crouch', true);
    } else {
      this.player.anims.play('idle', true);
      this.player.setAccelerationX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.up) && this.player.body.blocked.down)
    {
      this.dashUp();
      this.player.setVelocityY(-this.player.accel);
    }
  },

  updateBoss: function() {
    this.boss.healthBar.x = this.boss.body.x;
    this.boss.healthBar.y = this.boss.body.y - 16;

    if(this.bossFSM.is('idle') && Phaser.Math.Difference(this.player.x, this.boss.x) < 200) {
      this.bossFSM.seePlayer();
    }

    if(this.bossFSM.is('walk') && Phaser.Math.Difference(this.player.x, this.boss.x) < 50) {
      this.bossFSM.nearPlayer();
    }

    if(this.bossFSM.is('walk') && ((this.player.x < this.boss.x && this.boss.speed > 0)
        || (this.player.x > this.boss.x && this.boss.speed < 0))) {
      this.bossFSM.playerBehind();
    }

    if(this.boss.anims.currentAnim.key == "boss-slash") {
      if(this.playerCollidesWithBoss()) {
        this.playerDies();
      }
    }
  },

  bossIdle: function() {
    this.boss.anims.play('boss-idle', true);
  },

  bossTurn: function() {
    if(this.player.x < this.boss.x) {
      this.boss.resetFlip();
      this.boss.speed = -10;
    } else {
      this.boss.setFlip(-1,0);
      this.boss.speed = 10;
    }
  },

  bossWalk: function() {
    this.boss.anims.play('boss-walk', true);
    this.boss.setVelocityX(this.boss.speed);
  },

  bossAttack: function() {
    this.boss.anims.play('boss-beforeslash', true);
  },

  bossTeleport: function() {
    this.boss.anims.play('boss-teleport', true);
    this.teleportMusic.play();
  },

  bossIsHit: function() {
    this.boss.healthBar.setValue(this.boss.healthBar.value - 10);
    if(this.boss.healthBar.value <= 0) {
      this.bossFSM.die();
    }
  },

  bossDie: function() {
    this.boss.anims.play('boss-die', true);
  },

  getPointRelativeToBoss: function(x, y) {
    var relativePoint = {x:0, y:0};
    relativePoint.x = (x - this.boss.body.x)/this.boss._scaleX;
    relativePoint.y = (y - this.boss.body.y)/this.boss._scaleY;
    return relativePoint;
  },

  playerCollidesWithBoss: function() {
    var playerFrame = this.player.anims.currentFrame.textureFrame;
    var bossFrame = this.boss.anims.currentFrame.textureFrame;
    var playerBounds = this.player.getBounds();
    var bossBounds = this.boss.getBounds();
    var hitRect = Phaser.Geom.Rectangle.Intersection(playerBounds, bossBounds);

    if(!hitRect.isEmpty()) {
      for(var x = hitRect.x; x < hitRect.x + hitRect.width; x++) {
        for(var y = hitRect.y; y < hitRect.y + hitRect.height; y++) {
          var point = this.getPointRelativeToBoss(x, y);
          var pixelBoss = this.textures.getPixelAlpha(point.x, point.y, 'boss',bossFrame);
          if(pixelBoss == 255) {
            return true;
          };
        }
      }
    }
    return false;
  },

  playerSlash: function() {
    this.slashMusic.play();
    this.player.anims.play('slash', true);
    this.player.isSlashing = true;
    this.player.canSlash = false;

    if(this.playerCollidesWithBoss()) {
      this.bossIsHit();
    }

    setTimeout(function(){this.player.isSlashing = false;}.bind(this), 300);
    setTimeout(function(){this.player.canSlash = true;}.bind(this), 500);
  },

  playerDies: function() {
    this.player.anims.play('die', true);
    this.player.isDying = true;
  },

  win: function() {
    this.gameMusic.stop();
    this.scene.switch("win");
  },

  lose: function() {
    this.gameMusic.stop();
    this.scene.switch("lose");
  }
});
