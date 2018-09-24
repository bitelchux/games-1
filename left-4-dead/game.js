window.Game = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Game () {
    Phaser.Scene.call(this, { key: 'game' });
    this.safe;
    this.player;
    this.tilemap;
  },

  preload: function() {
    this.load.image("forest", "assets/forest.png");
    this.load.tilemapTiledJSON("forestTilemap", "assets/forest.json");
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 16, frameHeight: 16
    });
  },

  create: function () {
    this.player = new Player(this);
    this.forest = new Forest(this);
    this.flashlight = new FlashLight(this);

    this.tilemap = this.forest.tilemap;

    this.physics.add.collider(this.player.sprite, this.forest.obstaclesLayer);

    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setZoom(1);

  },

  update: function() {
    this.player.update();
  }
});
