class Level {
  constructor(scene) {
    this.scene = scene;
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

    this.obstaclesLayer.setCollisionBetween(1,25);
  }

  getSpawns(playerCoord, minRange, maxRange) {
    var spawns = [];
    var minCircle = new Phaser.Geom.Circle(playerCoord.x, playerCoord.y, minRange);
    var maxCircle = new Phaser.Geom.Circle(playerCoord.x, playerCoord.y, maxRange);
    this.groundLayer.filterTiles(function(tile){
      if(tile.index == 21) {
        var tileCoord = new Phaser.Math.Vector2(tile.getCenterX(), tile.getCenterY());
        var insideMinCircle = minCircle.contains(tileCoord.x, tileCoord.y);
        var insideMaxCircle = maxCircle.contains(tileCoord.x, tileCoord.y);
        if(insideMaxCircle && !insideMinCircle) {
          var point = new Phaser.Math.Vector2(tile.getCenterX(), tile.getCenterY());
          spawns.push(point);
        }
      }
    }, this);
    return spawns;
  }

  getWeapons() {
    var weapons = [];
    this.objectsLayer.filterTiles(function(tile){
      if(tile.index == 5 || tile.index == 10 || tile.index == 15 || tile.index == 20) {
        weapons.push(tile);
      }
    }, this);
    return weapons;
  }

  getTilesAround(coord) {
    var rect = new Phaser.Geom.Rectangle(coord.x-16*2, coord.y-16*2, 16*5, 16*5);
    var tiles = this.groundLayer.getTilesWithinWorldXY(rect.x, rect.y, rect.width, rect.height);
    tiles.splice(12, 1);
    return tiles;
  }

  getObjectAt(point) {
    var tile = this.objectsLayer.getTileAtWorldXY(point.x, point.y);
    if(tile.index != -1) {
      return tile;
    } else {
      return null;
    }
  }
}
