window.Lose = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Lose () {
    Phaser.Scene.call(this, { key: 'lose' });
    this.loseMusic;
  },

  preload: function() {
    this.load.image('loseBkg', 'assets/loseBkg.png');
    this.load.audio('loseMusic', 'assets/lose.wav')
    this.load.spritesheet('loseLogo', 'assets/loseLogo.png', {
      frameWidth: 16, frameHeight: 32
    });
  },

  createImages: function() {
    var background = this.add.image(256, 128, 'loseBkg');

    var logo = this.add.sprite(256, 125, 'loseLogo');
    logo.setScale(8);
    this.anims.create({
      key: 'logo',
      frames: this.anims.generateFrameNumbers('loseLogo', {start:0, end:1}),
      frameRate: 2,
      repeat: -1
    });
    logo.anims.play('logo', true);
  },

  createAudio: function() {
    this.loseMusic = this.sound.add('loseMusic');
    this.loseMusic.volume = .5;
    this.loseMusic.play();
  },

  createText: function() {
    var textStyle = {fontStyle: 'bold', fontSize: '38px', fill: 'grey'};
    var text = this.add.text(20, 20, 'YOU LOST', textStyle)
  },

  create: function () {
    this.scene.remove('menu');

    this.createImages();
    this.createAudio();
    this.createText();

    this.events.on('wake', function(){
      this.scene.start();
    }, this);

    this.input.keyboard.on('keydown_ESC', function(){
      this.loseMusic.stop();
      this.scene.switch("menu");
    }, this);

    this.input.keyboard.on('keydown_ENTER', function(){
      this.loseMusic.stop();
      this.scene.switch("game");
    }, this);
  }
});
