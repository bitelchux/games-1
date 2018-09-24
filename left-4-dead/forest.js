class Level {
  constructor(scene) {
    this.scene = scene;
  }
}

class Forest extends Level {
  constructor(scene) {
    super(scene);
    this.scene = scene;

    this.tilemap = scene.make.tilemap({ key: "forestTilemap", tileWidth: 16, tileHeight: 16 });
    this.tileset = this.tilemap.addTilesetImage('forest');
    this.groundLayer = this.tilemap.createStaticLayer(0, this.tileset, 0, 0); // layer index, tileset, x, y
    this.objectsLayer = this.tilemap.createDynamicLayer(1, this.tileset, 0, 0); // layer index, tileset, x, y
    this.obstaclesLayer = this.tilemap.createDynamicLayer(2, this.tileset, 0, 0); // layer index, tileset, x, y

    this.obstaclesLayer.setCollisionBetween(1,25);
    this.scene.player.sprite.body.world.setBounds(0,0,80*16,80*16);
  }
}
