window.Menu = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Menu () {
      Phaser.Scene.call(this, { key: 'menu' });

      this.cursors;
      this.menuMusic;
  },

  preload: function() {
    this.load.image('menuBkg', 'assets/menu.png');
    this.load.image('start', 'assets/start.png');
    this.load.image('enter', 'assets/enter.png');
    this.load.image('move', 'assets/move.png');
    this.load.image('keys', 'assets/keys.png');
    this.load.audio('menuMusic', 'assets/menu.wav')

    this.load.spritesheet('logo', 'assets/logo.png', {
      frameWidth: 32, frameHeight: 32
    });
  },

  createBackground: function() {
    this.add.image(256, 128, 'menuBkg');


    var start = this.add.image(460, 75, 'start');
    start.setScale(4);

    var enter = this.add.image(460, 105, 'enter');
    enter.setScale(2);

    var move = this.add.image(460, 155, 'move');
    move.setScale(4);

    var keys = this.add.image(460, 191, 'keys');
    keys.setScale(2);

    var logo = this.add.sprite(256, 125, 'logo');
    logo.setScale(8);
    this.anims.create({
      key: 'logo',
      frames: this.anims.generateFrameNumbers('logo', {start:0, end:2}),
      frameRate: 5,
      repeat: -1,
      repeatDelay: 1000
    });

    setTimeout(function() {
      logo.anims.play('logo', true);
    }, 1000);
  },

  createAudio: function() {
    this.menuMusic = this.sound.add('menuMusic');
    this.menuMusic.loop = true;
    this.menuMusic.play();
  },

  create: function () {
    this.createBackground();
    this.createAudio();
    this.events.on('wake', function(){
      this.menuMusic.play();
    }, this);


    this.input.keyboard.on('keydown_ENTER', function(){
      this.menuMusic.stop();
      this.scene.switch("game")
    }, this);
  }
});
