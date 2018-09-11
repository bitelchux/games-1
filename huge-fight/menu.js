window.Menu = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Menu () {
      Phaser.Scene.call(this, { key: 'menu' });
      this.menuMusic;
  },

  preload: function() {
    this.load.image('menuBkg', 'assets/menu.png');
    this.load.image('move', 'assets/move.png');
    this.load.image('keys', 'assets/keys.png');
    this.load.audio('menuMusic', 'assets/menu.wav')

    this.load.spritesheet('logo', 'assets/logo.png', {
      frameWidth: 32, frameHeight: 32
    });
  },

  createBackground: function() {
    this.add.image(256, 128, 'menuBkg');

    var move = this.add.image(460, 100, 'move');
    move.setScale(4);

    var keys = this.add.image(460, 155, 'keys');
    keys.setScale(2);

    var logo = this.add.image(256, 125, 'logo');
    logo.setScale(6);
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


    this.input.keyboard.on('keydown', function(){
      this.menuMusic.stop();
      this.scene.switch("game")
    }, this);
  }
});
