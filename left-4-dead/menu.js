window.Menu = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Menu () {
    Phaser.Scene.call(this, { key: 'menu' });
  },

  preload: function() {
    this.load.setPath('assets/');
    this.load.image('menuBkg', 'menu.png');
  },

  createBackground: function() {
    this.add.image(384, 384, 'menuBkg');
  },

  createText: function() {
    var textStyle = {fontStyle: 'bold', fontSize: '36px', fill: 'white'};
    var slashText = this.add.text(150, 300, 'Press Any Key To Start', textStyle);
  },

  create: function () {
    this.createBackground();
    this.createText();
    this.events.on('wake', function(){
      this.scene.start();
    }, this);


    this.input.keyboard.on('keydown', function(){
      this.scene.switch("game")
    }, this);
  }
});
