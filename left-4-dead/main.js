var config = {
  type: Phaser.AUTO,
  width: 384*2,
  height: 384*2,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

var game = new Phaser.Game(config);
game.scene.add('menuScene', MenuScene, true);

window.timeouts = [];
window.intervals = [];
window.speed = 1.8;
