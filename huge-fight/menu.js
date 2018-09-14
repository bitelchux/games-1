window.Menu = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Menu () {
      Phaser.Scene.call(this, { key: 'menu' });
      this.menuMusic;
  },

  preload: function() {
    this.load.image('menuBkg', 'assets/menu.png');
    this.load.image('keys', 'assets/keys.png');
    this.load.image('space', 'assets/space.png');
    this.load.audio('menuMusic', 'assets/menu.wav')

    this.load.spritesheet('logo', 'assets/logo.png', {
      frameWidth: 32, frameHeight: 32
    });
  },

  createBackground: function() {
    this.add.image(256, 128, 'menuBkg');

    var keys = this.add.image(455, 195, 'keys');
    keys.setScale(2);

    var space = this.add.image(455, 100, 'space');
    space.setScale(2);

    var logo = this.add.image(256, 125, 'logo');
    logo.setScale(6);
  },

  createAudio: function() {
    this.menuMusic = this.sound.add('menuMusic');
    this.menuMusic.loop = true;
    this.menuMusic.play();
  },

  createText: function() {
    var textStyle = {fontStyle: 'bold', fontSize: '36px', fill: 'white'};
    var slashText = this.add.text(395, 50, 'SLASH', textStyle);
    var moveText = this.add.text(410, 130, 'MOVE', textStyle);
  },

  create: function () {
    this.createBackground();
    this.createAudio();
    this.createText();
    this.events.on('wake', function(){
      this.scene.start();
    }, this);


    this.input.keyboard.on('keydown', function(){
      this.menuMusic.stop();
      this.scene.switch("game")
    }, this);
  }
});
