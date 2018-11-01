class Level {
  constructor(scene) {
    this.scene = scene;
    this.tilemap = scene.make.tilemap({ key: "levelTilemap", tileWidth: 16, tileHeight: 16 });
    this.tileset = this.tilemap.addTilesetImage('level');
    this.groundLayer = this.tilemap.createDynamicLayer(0, this.tileset, 0, 0).setPipeline('Light2D');
    this.objectsLayer = this.tilemap.createDynamicLayer(1, this.tileset, 0, 0).setPipeline('Light2D');
    this.obstaclesLayer = this.tilemap.createDynamicLayer(2, this.tileset, 0, 0).setPipeline('Light2D');
    this.triggersLayer = this.tilemap.createDynamicLayer(3, this.tileset, 0, 0);

    this.triggersLayer.setVisible(false);
    this.obstaclesLayer.setCollisionBetween(1,400);

    this.setupLights();
  }

  setupLights() {
    this.groundLayer.forEachTile(function(tile) {
      if(tile.index == 42)
        this.scene.myLights.addLight(tile.getCenterX(), tile.getCenterY())
    }.bind(this));
  }

  getAllSpawns() {
    var spawns = [];
    this.groundLayer.filterTiles(function(tile){
      if(tile.index != 81) {
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
      if(tile.index != 81) {
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
      return tile.index == 101;
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

  getCoordBeforeObstacleFromAtoB(a, b) {
    var line = new Phaser.Geom.Line(a.x, a.y, b.x, b.y);
    var obstacles = this.obstaclesLayer.getTilesWithinShape(line, {isNotEmpty: true});
    if(obstacles && obstacles.length > 0) {
      var points = line.getPoints(0, 16);
      var firstObstacle;
      var distance = 10000;
      obstacles.forEach(function(obstacle) {
        var obstacleCoord = new Phaser.Math.Vector2(obstacle.getCenterX(), obstacle.getCenterY());
        var obstacleDistance = obstacleCoord.distance(a);

        if(obstacleDistance < distance) {
          distance  = obstacleDistance;
          firstObstacle = obstacle;
        }
      }.bind(this));

      var firstObstacleCoord = new Phaser.Math.Vector2(firstObstacle.getCenterX(), firstObstacle.getCenterY());
      for(var i=0; i< points.length; i++) {
        if(firstObstacleCoord.distance(new Phaser.Math.Vector2(points[i].x, points[i].y)) < 24) {
          return points[i];
        }
      }
    } else {
      // no obstacles
      return b;
    }
  }
}
