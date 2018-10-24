class EndScene extends Phaser.Scene {

  preload() {
    this.load.setPath('assets/');
    this.load.image('endBkg', 'end.png');
  }

  createBackground() {
    this.add.image(384, 384, 'endBkg');
  }

  createText() {
    var textStyle = {fontStyle: 'bold', fontSize: '36px', fill: 'white'};
    var slashText = this.add.text(150, 300, 'Press Any Key To Enter Menu', textStyle);
  }

  create() {
    this.createBackground();
    this.createText();

    this.input.keyboard.on('keydown', function(){
      this.scene.remove(this);
      this.scene.add('menuScene', MenuScene, true);
    }, this);
  }
}
