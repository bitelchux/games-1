var config = {
  type: Phaser.AUTO,
  width: 256,
  height: 256,
  zoom: 1.5,
  pixelArt: false,
  scene: [ window.Game, window.Pause, window.Gameover ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
};

var game = new Phaser.Game(config);
