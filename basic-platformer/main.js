var config = {
  type: Phaser.AUTO,
  width: 512,
  height: 256,
  zoom: 1.3,
  pixelArt: true,
  scene: [ window.Menu, window.Game, window.Gameover ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }
    }
  },
};

var game = new Phaser.Game(config);448
