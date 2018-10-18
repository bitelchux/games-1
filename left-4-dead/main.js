var config = {
  type: Phaser.AUTO,
  width: 384*2,
  height: 384*2,
  pixelArt: true,
  scene: [ window.Game, window.Pause ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

var game = new Phaser.Game(config);
