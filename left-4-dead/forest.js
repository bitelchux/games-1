class Level {
  constructor(scene) {
    this.scene = scene;
    this.spawns = [];
  }
}

class Forest extends Level {
  constructor(scene) {
    super(scene);

    this.tilemap = scene.make.tilemap({ key: "forestTilemap", tileWidth: 16, tileHeight: 16 });
    this.tileset = this.tilemap.addTilesetImage('forest');
    this.groundLayer = this.tilemap.createDynamicLayer(0, this.tileset, 0, 0).setPipeline('Light2D'); // layer index, tileset, x, y
    this.objectsLayer = this.tilemap.createDynamicLayer(1, this.tileset, 0, 0).setPipeline('Light2D'); // layer index, tileset, x, y
    this.obstaclesLayer = this.tilemap.createDynamicLayer(2, this.tileset, 0, 0).setPipeline('Light2D'); // layer index, tileset, x, y
    this.spawnsAndTriggersLayer = this.tilemap.createDynamicLayer(3, this.tileset, 0, 0); // layer index, tileset, x, y
    this.spawnsAndTriggersLayer.setVisible(false);

    this.obstaclesLayer.setCollisionBetween(1,25);
    this.scene.player.sprite.body.world.setBounds(0,0,this.tilemap.widthInPixels,this.tilemap.heightInPixels);

    this.getSpawns();
  }

  getSpawns() {
    this.spawnsAndTriggersLayer.filterTiles(function(tile){
      switch(tile.index) {
        case 25:
          var point = new Phaser.Math.Vector2(tile.getCenterX(), tile.getCenterY());
          this.spawns.push(point);
          break;
      }
    }, this);
  }
}
