class MenuScene extends Phaser.Scene {

  preload() {
    this.load.setPath('assets/');
    this.load.image('menuBkg', 'menu.png');
  }

  createBackground() {
    this.add.image(384, 384, 'menuBkg');
  }

  createText() {
    var textStyle = {fontStyle: 'bold', fontSize: '36px', fill: 'white'};
    var slashText = this.add.text(150, 300, 'Press Any Key To Start', textStyle);
  }

  create() {
    this.createBackground();
    this.createText();

    this.input.keyboard.on('keydown', function() {
      this.scene.remove(this);
      this.scene.add('gameScene', GameScene, true);
    }, this);
  }
}
