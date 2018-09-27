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
    this.load.setPath('assets/');
    this.load.image("forest", ["forest.png", "forest_n.png"]);
    this.load.tilemapTiledJSON("forestTilemap", "forest.json");
    this.load.atlas({
      key: 'player',
      textureURL: 'player/player.png',
      normalMap: 'player/player_n.png',
      atlasURL: 'player/player.json'
    });
    this.load.atlas({
      key: 'enemy',
      textureURL: 'enemy/enemy.png',
      normalMap: 'enemy/enemy_n.png',
      atlasURL: 'enemy/enemy.json'
    });
    this.load.atlas({
      key: 'impact',
      textureURL: 'impact/impact.png',
      normalMap: 'impact/impact_n.png',
      atlasURL: 'impact/impact.json'
    });
    this.load.spritesheet('grenade', 'grenade.png', {
      frameWidth: 64, frameHeight: 64
    });
  },

  createAnims: function() {
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNames('player', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'player-walk-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'walk-pistol',
      frames: this.anims.generateFrameNames('player', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'player-walk-pistol-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'walk-shotgun',
      frames: this.anims.generateFrameNames('player', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'player-walk-shotgun-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'walk-uzi',
      frames: this.anims.generateFrameNames('player', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'player-walk-uzi-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'walk-grenade',
      frames: this.anims.generateFrameNames('player', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'player-walk-grenade-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'die',
      frames: this.anims.generateFrameNames('player', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'player-die-', suffix: '.png'
      }),
      frameRate: 12,
    });

    this.anims.create({
      key: 'impact-anim',
      frames: this.anims.generateFrameNames('impact', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'impact-', suffix: '.png'
      }),
      frameRate: 12
    });

    this.anims.create({
      key: 'enemy-walk',
      frames: this.anims.generateFrameNames('enemy', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'enemy-walk-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });

    this.anims.create({
      key: 'grenade-explosion',
      frames: this.anims.generateFrameNumbers('grenade', {start:0, end:3}),
      frameRate: 6
    });
  },

  create: function () {
    this.createAnims();
    this.player = new Player(this);
    this.enemies = new Enemies(this);
    this.forest = new Forest(this);
    this.myLights = new Lights(this);

    this.tilemap = this.forest.tilemap;

    this.physics.add.collider(this.player.sprite, this.forest.obstaclesLayer);
    this.physics.add.overlap(this.player.sprite, this.forest.spawnsAndTriggersLayer);

    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setZoom(1);
  },

  update: function(time, delta) {
    this.player.update();
    this.myLights.update();
    this.enemies.update(time, delta);
  }
});
