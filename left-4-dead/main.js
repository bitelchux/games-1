var config = {
  type: Phaser.AUTO,
  width: 384,
  height: 384,
  zoom: 1,
  pixelArt: true,
  scene: [ window.Game, window.Pause ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
};

var game = new Phaser.Game(config);
