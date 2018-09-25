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
    this.load.image("forest", ["assets/forest.png", "assets/forest-n.png"]);
    this.load.tilemapTiledJSON("forestTilemap", "assets/forest.json");
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 16, frameHeight: 16
    });
    this.load.spritesheet('enemy', 'assets/enemy.png', {
      frameWidth: 16, frameHeight: 16
    });
  },

  create: function () {
    this.player = new Player(this);
    this.forest = new Forest(this);
    this.lights = new Lights(this);
    this.enemies = new Enemies(this);

    this.tilemap = this.forest.tilemap;

    this.physics.add.collider(this.player.sprite, this.forest.obstaclesLayer);

    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setZoom(1);
  },

  update: function() {
    this.player.update();
    this.lights.update();
  }
});
