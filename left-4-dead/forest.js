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
    this.areasLayer = this.tilemap.createDynamicLayer(0, this.tileset, 0, 0);
    this.groundLayer = this.tilemap.createDynamicLayer(1, this.tileset, 0, 0).setPipeline('Light2D'); // layer index, tileset, x, y
    this.objectsLayer = this.tilemap.createDynamicLayer(2, this.tileset, 0, 0).setPipeline('Light2D'); // layer index, tileset, x, y
    this.obstaclesLayer = this.tilemap.createDynamicLayer(3, this.tileset, 0, 0).setPipeline('Light2D'); // layer index, tileset, x, y

    this.areasLayer.setVisible(false);
    this.obstaclesLayer.setCollisionBetween(1,25);
  }

  getAllSpawns() {
    var spawns = [];
    this.groundLayer.filterTiles(function(tile){
      if(tile.index == 21) {
        var point = new Phaser.Math.Vector2(tile.getCenterX(), tile.getCenterY());
        spawns.push(point);
      }
    }, this);
    return spawns;
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

  getSpawnsInArea(point) {
    var alpha = this.areaLayer.getTileAtWorldXY(point.x, point.y).alpha;
    var spawns = [];

    this.groundLayer.filterTiles(function(tile){
      var tileAlpha = this.areaLayer.getTileAt(tile.x, tile.y).alpha;
      if(tile.index == 21 && tileAlpha == alpha) {
        var point = new Phaser.Math.Vector2(tile.getCenterX(), tile.getCenterY());
        spawns.push(point);
      }
    }, this);

    return spawns;
  }

  getSpawnsBeforeArea(point) {
    var alpha = this.areaLayer.getTileAtWorldXY(point.x, point.y).alpha;
    var spawns = [];

    this.groundLayer.filterTiles(function(tile){
      var tileAlpha = this.areaLayer.getTileAt(tile.x, tile.y).alpha;
      if(tile.index == 21 && tileAlpha > alpha) {
        var point = new Phaser.Math.Vector2(tile.getCenterX(), tile.getCenterY());
        spawns.push(point);
      }
    }, this);

    return spawns;
  }

  getSpawnsAfterArea(point) {
    var alpha = this.areaLayer.getTileAtWorldXY(point.x, point.y).alpha;
    var spawns = [];

    this.groundLayer.filterTiles(function(tile){
      var tileAlpha = this.areaLayer.getTileAt(tile.x, tile.y).alpha;
      if(tile.index == 21 && tileAlpha < alpha) {
        var point = new Phaser.Math.Vector2(tile.getCenterX(), tile.getCenterY());
        spawns.push(point);
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
    if(tile && tile.index != -1) {
      return tile;
    } else {
      return null;
    }
  }

  getClosestHealthKit(point) {
    var healthkitTiles = this.objectsLayer.filterTiles(function(tile){
      return tile.index == 18;
    });

    var distanceToHealthkit = 10000;
    var chosenTile = null;
    healthkitTiles.forEach(function(tile) {
      var tileCoord = new Phaser.Math.Vector2(tile.getCenterX(), tile.getCenterY());
      var distance = tileCoord.distance(point);
      if(distance < distanceToHealthkit) {
        distanceToHealthkit = distance;
        chosenTile = tile;
      }
    }.bind(this));

    return new Phaser.Math.Vector2(chosenTile.getCenterX(), chosenTile.getCenterY());
  }
}
