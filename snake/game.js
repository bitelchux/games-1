window.Game = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Game () {
      Phaser.Scene.call(this, { key: 'game' });

      this.backgroundLayer;
      this.collideLayer;

      this.player;
      this.cursors;
      this.apple;
      this.music;
      this.snakeSound;
      this.bite;

      this.speed = 100;
      this.upIsDown = false;
      this.downIsDown = false;
      this.leftIsDown = false;
      this.rightIsDown = false;
      this.score = 0;
      this.scoreText;
      this.isPaused = false;
      this.dying = false;
  },

  preload: function() {
    this.load.image("tileset", "../assets/tileset.png");
    this.load.tilemapTiledJSON("tilemap", "../assets/tilemap.json");
    this.load.spritesheet('apple', 'assets/apple.png', {
      frameWidth: 16, frameHeight: 16
    });
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 32, frameHeight: 32
    });

    this.load.audio('music', 'assets/music.wav')
    this.load.audio('snake', 'assets/snake.wav')
    this.load.audio('bite', 'assets/bite.wav')
  },

  createMap: function() {
    map = this.make.tilemap({ key: "tilemap", tileWidth: 16, tileHeight: 16 });
    tileset = map.addTilesetImage("tileset");
    this.backgroundLayer = map.createStaticLayer(0, tileset, 0, 0); // layer index, tileset, x, y
    this.collideLayer = map.createDynamicLayer(1, tileset, 0, 0); // layer index, tileset, x, y

    map.setTileIndexCallback(6, this.die, this);
    map.setTileIndexCallback(7, this.die, this);

    this.events.on('wake', function(){
      this.music.play();
      this.snakeSound.play();
    }, this);
  },

  createPlayer: function() {
    this.player = this.physics.add.sprite(425, 200, 'player');

    this.player.body.allowGravity = false;
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('player', {start:0, end:2}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'die-down',
      frames: this.anims.generateFrameNumbers('player', {start:2, end:4}),
      frameRate: 3,
      repeat: 0
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', {start:5, end:7}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'die-left',
      frames: this.anims.generateFrameNumbers('player', {start:7, end:9}),
      frameRate: 3,
      repeat: 0
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', {start:10, end:12}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'die-right',
      frames: this.anims.generateFrameNumbers('player', {start:12, end:14}),
      frameRate: 3,
      repeat: 0
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('player', {start:15, end:17}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'die-up',
      frames: this.anims.generateFrameNumbers('player', {start:17, end:19}),
      frameRate: 3,
      repeat: 0
    });

    this.player.on('animationcomplete', function(animation, frame) {
      if(animation.key.includes('die')) {
        this.gameover();
      }
    }, this);

    this.player.anims.play('up', true);
    this.player.setVelocity(0,-100);
  },

  createApple: function() {
    var coords = this.getRandomCoordsForApple();
    this.apple = this.physics.add.sprite(coords.x, coords.y, 'apple');
    this.anims.create({
      key: 'live',
      frames: this.anims.generateFrameNumbers('apple', {start:0, end:2}),
      frameRate: 3,
      repeat: -1
    });
    this.apple.anims.play('live', true);
  },

  createScore: function() {
    this.scoreText = this.add.text(1, 1, 'Score: 0', {
      fontStyle: 'bold', fontSize: '20px', fill: 'black', backgroundColor: "#ffffff55"
    });
  },

  createAudio: function() {
    this.music = this.sound.add('music');
    this.music.loop = true;
    this.music.play();

    this.snakeSound = this.sound.add('snake');
    this.snakeSound.volume = .2;
    this.snakeSound.loop = true;
    this.snakeSound.play();

    this.bite = this.sound.add('bite');
    this.bite.volume= .2;
  },

  createCursors: function() {
    this.cursors = this.input.keyboard.createCursorKeys();
  },

  create: function () {
    this.createMap();
    this.createPlayer();
    this.createApple();
    this.createScore();
    this.createAudio();
    this.createCursors();

    this.physics.add.collider(this.player, this.collideLayer, this.gameover, null ,this);
    this.physics.add.overlap(this.player, this.apple, this.eatApple, null, this);

    this.events.on('wake', function(){
      this.music.play();
      this.snakeSound.play();
    }, this);

    this.input.keyboard.on('keydown_ESC', function(){
      this.reset();
      this.scene.switch("menu");
    }, this);
  },

  getRandomCoordsForApple: function() {
    var xx = Math.floor(Math.random() * (config.width/16 - 1)) + 1;
    var yy = Math.floor(Math.random() * (config.height/16 - 1)) + 1;
    if(this.collideLayer.layer.data[yy][xx].index != -1) {
      return this.getRandomCoordsForApple();
    }
    return {x:(xx*16)+8, y:(yy*16)+8};
  },

  eatApple: function() {
    var coords = this.getRandomCoordsForApple();
    this.apple.x = coords.x;
    this.apple.y = coords.y;
    this.speed += 10

    this.bite.play();

    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);
  },

  update: function() {

    if(this.cursors.up.isDown && !this.upIsDown) {
      this.upIsDown = true;
      this.player.anims.play('up', true);
      this.player.setVelocity(0,-this.speed);
    } else if(this.cursors.right.isDown && !this.rightIsDown) {
      this.rightIsDown = true;
      this.player.anims.play('right', true);
      this.player.setVelocity(this.speed,0);
    } else if(this.cursors.left.isDown && !this.leftIsDown) {
      this.leftIsDown = true;
      this.player.anims.play('left', true);
      this.player.setVelocity(-this.speed,0);
    } else if(this.cursors.down.isDown && !this.downIsDown) {
      this.downIsDown = true;
      this.player.anims.play('down', true);
      this.player.setVelocity(0,this.speed);
    }

    if (this.cursors.up.isUp) {
      this.upIsDown = false;
    }
    if (this.cursors.down.isUp) {
      this.downIsDown = false;
    }
    if (this.cursors.left.isUp) {
      this.leftIsDown = false;
    }
    if (this.cursors.right.isUp) {
      this.rightIsDown = false;
    }
  },

  die: function(sprite, tile) {
    if (this.dying) {
      return;
    }
    this.dying = true;
    this.player.setVelocity(0, 0);

    var deltaX = sprite.x - tile.pixelX;
    var deltaY = sprite.y - tile.pixelY;

    if(deltaY < -12) {
      this.player.anims.play('die-down', true);
    } else if(deltaY > 12) {
      this.player.anims.play('die-up', true);
    } else if(deltaX > 12) {
      this.player.anims.play('die-left', true);
    } else if(deltaX < -12) {
      this.player.anims.play('die-right', true);
    }
  },

  reset: function() {
    this.dying = false;
    this.player.x = 425;
    this.player.y = 200;
    this.speed = 100;
    this.player.setVelocity(0, -this.speed);
    this.player.anims.play('up', true);

    this.music.stop();
    this.snakeSound.stop();

    this.score = 0;
    this.scoreText.setText('Score: ' + this.score);
  },

  gameover: function() {
    window.score = this.score;
    this.reset();
    this.scene.switch("gameover");
  }
});
