class Safe {
  constructor(scene) {
    this.scene = scene;

    this.tilemap = scene.make.tilemap({ key: "safeTilemap", tileWidth: 16, tileHeight: 16 });
    this.safeTileset = this.tilemap.addTilesetImage('safe');
    this.weaponsTileset = this.tilemap.addTilesetImage('weapons');
    this.groundLayer = this.tilemap.createStaticLayer(0, this.safeTileset, 0, 0); // layer index, tileset, x, y
    this.weaponsLayer = this.tilemap.createDynamicLayer(1, this.weaponsTileset, 0, 0); // layer index, tileset, x, y

    this.groundLayer.setCollision(12);
    this.groundLayer.setTileIndexCallback(14, scene.loadForest, scene);
  }

  destroy() {
    this.tilemap.destroy();
  }

}
