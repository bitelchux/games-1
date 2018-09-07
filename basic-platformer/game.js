window.Game = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Game () {
      Phaser.Scene.call(this, { key: 'game' });

      this.spawnLayer;
      this.backgroundLayer;
      this.collideLayer;

      this.player;
      this.gameMusic;
      this.cursors;
      this.up;
      this.coin;

      this.score = 0;
      this.timer = 60;
      this.scoreText, this.timerText;
  },

  preload: function() {
    this.load.image("tileset", "../assets/tileset.png");
    this.load.tilemapTiledJSON("tilemap", "../assets/tilemap.json");
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 16, frameHeight: 16
    });
    this.load.image("coin", "../assets/coin.png");
    this.load.audio('gameMusic', 'assets/game.wav');
  },

  createMap: function() {
    map = this.make.tilemap({ key: "tilemap", tileWidth: 16, tileHeight: 16 });
    tileset = map.addTilesetImage("tileset");
    this.spawnLayer = map.createStaticLayer(0, tileset, 0, 0);
    this.backgroundLayer = map.createStaticLayer(1, tileset, 0, 0);
    this.collideLayer = map.createDynamicLayer(2, tileset, 0, 0);

    map.setCollisionBetween(1, 20);

    this.events.on('wake', function(){
      this.gameMusic.play();
    }, this);
  },

  createPlayer: function() {
    this.player = this.physics.add.sprite(50, 200, 'player');

    this.player.setGravityY(300);
    this.player.setCollideWorldBounds(true);
    this.player.body.onWorldBounds = true;
    this.physics.world.on("worldbounds", this.touchBound, this);

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
  },

  createAudio: function() {
    this.gameMusic = this.sound.add('gameMusic');
    this.gameMusic.loop = true;
    this.gameMusic.play();
  },

  createCursors: function() {
    this.cursors = this.input.keyboard.createCursorKeys();
  },

  createCoin: function() {
    var coords = this.getRandomCoordsForCoin();
    this.coin = this.physics.add.sprite(coords.x, coords.y, 'coin');
    this.coin.body.allowGravity = false;
  },

  getRandomCoordsForCoin: function() {
    while(true) {
      var x = Math.floor(Math.random() * (config.width/16 - 1)) + 1;
      var y = Math.floor(Math.random() * (config.height/16 - 1)) + 1;
      if(this.spawnLayer.layer.data[y][x].index != -1) {
        return {x:(x*16)+8, y:(y*16)+8};
      }
    }
  },

  createTimer: function() {
    this.timerText = this.add.text(11, 1, 'Time: ' + this.timer, {
      fontStyle: 'bold', fontSize: '20px', fill: 'black'
    });

    var that = this;
    setInterval(function() {
      that.timer -= 1;
      if(that.timer < 10) {
        if(that.timer % 2) {
          that.timerText.setFill('grey');
        } else {
          that.timerText.setFill('black');
        }
      }
      that.timerText.setText('Time: ' + that.timer);
      if(that.timer == 0) {
        that.gameover();
      }
    }, 1000);
  },

  createScore: function() {
    this.scoreText = this.add.text(401, 1, 'Score: ' + this.score, {
      align: 'right', fontStyle: 'bold', fontSize: '20px', fill: 'black'
    });
  },

  create: function () {
    this.createMap();
    this.createPlayer();
    this.createAudio();
    this.createCursors();
    this.createCoin();
    this.createTimer();
    this.createScore();

    this.physics.add.collider(this.player, this.collideLayer);
    this.physics.add.collider(this.coin, this.collideLayer);
    this.physics.add.overlap(this.player, this.coin, this.takeCoin, null, this);

    this.events.on('wake', function(){
      this.reset();
    }, this);

    this.input.keyboard.on('keydown_ESC', function(){
      this.reset();
      this.gameMusic.stop();
      this.scene.switch("menu");
    }, this);

    this.input.keyboard.on('keydown_RIGHT', function(){
      this.player.setVelocityX(100);
    }, this);
    this.input.keyboard.on('keydown_LEFT', function(){
      this.player.setVelocityX(-100);
    }, this);


    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
  },

  takeCoin: function() {
    var coords = this.getRandomCoordsForCoin();
    this.coin.x = coords.x;
    this.coin.y = coords.y;
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);
  },

  update: function() {
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
    } else {
      this.player.anims.play('idle', true);
      this.player.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.up) && this.player.body.blocked.down)
    {
      this.player.setVelocityY(-230);
    }
  },

  touchBound: function(player, touchedUp, touchedDown, touchedLeft, touchedRight) {
    if(touchedDown)
      this.gameover();
  },

  reset: function() {
    this.player.x = 50;
    this.player.y = 200;
    this.player.setVelocity(0, 0);
    this.score = 0;
    this.timer = 60;
    this.gameMusic.play();
  },

  gameover: function() {
    window.score = this.score;
    this.reset();
    this.gameMusic.stop();
    this.scene.switch("gameover");
  }
});
