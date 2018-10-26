class MenuScene extends Phaser.Scene {

  preload() {
    this.load.setPath('assets/');

    this.load.image('menuBkg', 'menu/menu.png');

    this.load.atlas({
      key: 'zombie',
      textureURL: 'enemies/zombie/zombie.png',
      normalMap: 'enemies/zombie/zombie_n.png',
      atlasURL: 'enemies/zombie/zombie.json'
    });
  }

  createBackground() {
    this.add.image(384, 384, 'menuBkg');
  }

  createTexts() {
    var textStyle = {fontStyle: 'bold', fontSize: '36px', fill: 'white'};
    var slashText = this.add.text(150, 300, 'Press Any Key To Start', textStyle);
    slashText.setDepth(300);
  }

  createZombies() {
    // zombie
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNames('zombie', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'zombie-walk-left-down-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true,
      repeat: -1
    });

    this.timeout();
  }

  timeout() {
    setTimeout(function () {
      var x = config.width + 16;
      var y = Math.random() * config.height;
      this.addZombie(x, y);
      this.timeout();
    }.bind(this), 1000 + Math.floor(Math.random()*3000));
  }

  create() {
    this.createBackground();
    this.createTexts();
    this.createZombies();

    this.input.keyboard.on('keydown', function() {
      this.scene.remove(this);
      this.scene.add('gameScene', GameScene, true);
    }, this);
  }

  addZombie(x, y) {
    var zombie = this.physics.add.sprite(x, y, 'zombie');
    zombie.anims.play('walk');
    zombie.setVelocity(-16 + (Math.floor(Math.random()*-16*3)),0);
    zombie.setDepth(y);
    zombie.setScale(4);
  }
}
