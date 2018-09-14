window.Win = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Win () {
    Phaser.Scene.call(this, { key: 'win' });
    this.winMusic;
    this.textGroup;
  },

  preload: function() {
    this.load.image('winBkg', 'assets/winBkg.png');
    this.load.audio('winMusic', 'assets/win.wav')
    this.load.spritesheet('winLogo', 'assets/winLogo.png', {
      frameWidth: 16, frameHeight: 32
    });
  },

  createImages: function() {
    var background = this.add.image(256, 128, 'winBkg');

    var logo = this.add.sprite(256, 125, 'winLogo');
    logo.setScale(6);
    this.anims.create({
      key: 'winAnim',
      frames: this.anims.generateFrameNumbers('winLogo', {start:0, end:1}),
      frameRate: 2,
      repeat: -1
    });
    logo.anims.play('winAnim', true);
  },

  createAudio: function() {
    this.winMusic = this.sound.add('winMusic');
    this.winMusic.volume = .5;
    this.winMusic.play();
  },

  createText: function() {
    var textStyle = {fontStyle: 'bold', fontSize: '38px', fill: 'grey'};
    var text = this.add.text(20, 20, 'YOU WON', textStyle)
  },

  create: function () {
    this.createImages();
    this.createAudio();
    this.createText();

    this.events.on('wake', function(){
      this.scene.start();
    }, this);

    this.input.keyboard.on('keydown_ESC', function(){
      this.winMusic.stop();
      this.scene.switch("menu");
    }, this);

    this.input.keyboard.on('keydown_ENTER', function(){
      this.winMusic.stop();
      this.scene.switch("game");
    }, this);
  }
});
