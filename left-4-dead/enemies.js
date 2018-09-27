class Enemies {
  constructor(scene) {
    this.scene = scene;
    this.group = [];

    //small wave
    setInterval(function(){
      this.spawnEnemies(1);
    }.bind(this), 5000);


    //big wave
    setInterval(function(){
      this.spawnEnemies(3);
    }.bind(this), 10000);
  }

  nearbySpawnsFilter(playerCoord) {
    return function(spawn) {
      var distance = spawn.distance(playerCoord);
      return (distance > 125 && distance < 300);
    }
  }

  spawnEnemies(n) {
    var playerCoord = this.scene.player.sprite.getCenter();

    var spawns = this.scene.forest.spawns.filter(this.nearbySpawnsFilter(playerCoord));

    for(var i=0; i<n; i++) {
      spawns.forEach(function(spawn){
        this.group.push(new Enemy(this.scene, spawn.x, spawn.y));
      }, this);
    }
  }

  update(time, delta) {
    this.group.forEach(function(enemy) {
      enemy.update(time, delta);
    });
  }

  removeEnemy(enemy) {
    this.group.splice(this.group.indexOf(enemy), 1);
  }
}

class Enemy {
  constructor(scene, x, y) {
    this.scene = scene;

    this.speed = 0.035;
    this.hp = 100;

    this.sprite = scene.add.sprite(x, y, 'enemy').setPipeline("Light2D");
    this.sprite.setDepth(2)

    this.playerIsSpotted = false;
    this.path = null;
    this.pathIndex = null;
    this.target = null;

    this.startPursuit();
  }

  startPursuit() {
    var playerCoord = this.scene.player.sprite.getCenter();
    setInterval(function(){
      var playerCoord = this.scene.player.sprite.getCenter();
      this.setPathTo(playerCoord.x, playerCoord.y);
    }.bind(this), 250);
  }

  getOtherEnemies() {
    var enemies = this.scene.enemies.group.slice();
    enemies.splice(enemies.indexOf(this), 1);
    return enemies;
  }

  update(time, delta) {
    var playerCoord = this.scene.player.sprite.getCenter();
    var meCoord = this.sprite.getCenter();
    var distance = meCoord.distance(playerCoord);
    if(distance < 10) {
      this.hitsPlayer();
    }

    if(this.path && this.path.curves.length > 0) {
      var curve = this.path.curves[this.pathIndex];
      var direction = new Phaser.Math.Vector2(curve.p1.x - curve.p0.x, curve.p1.y - curve.p0.y).normalize();
      this.sprite.x += delta*direction.x*this.speed;
      this.sprite.y += delta*direction.y*this.speed;
      if(this.sprite.getCenter().distance(curve.p1) < 3) {
        this.pathIndex += 1;
        if(this.pathIndex == this.path.curves.length) {
          this.path = null;
        }
      }
    }
  }

  setPathTo(x, y) {
    var finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true
    });

    var forest = this.scene.forest;
    var map = forest.tilemap;
    var grid = new PF.Grid(map.width, map.height);
    forest.obstaclesLayer.forEachTile(function(tile){
      if(tile.canCollide) {
        var random_boolean = Math.random() < 0.1;
        grid.setWalkableAt(tile.x, tile.y, false);
      }
    }, this,0,0,map.width,map.height,{isNotEmpty: true});

    this.path = new Phaser.Curves.Path(this.sprite.x, this.sprite.y);

    var startTile = map.worldToTileXY(this.sprite.x, this.sprite.y);
    var endTile = map.worldToTileXY(x, y);

    var tilePath = finder.findPath(startTile.x, startTile.y, endTile.x, endTile.y, grid);
    tilePath.shift();
    tilePath.forEach(function(tileCoord) {
      this.path.lineTo(tileCoord[0]*16 + 8, tileCoord[1]*16 + 8);
    }.bind(this));

    this.path;
    this.pathIndex = 0;
  }

  isHit(damage) {
    if(this.hp > 0) {
      this.hp -= damage;
      if(this.hp <= 0) {
        this.sprite.destroy();
        this.scene.enemies.removeEnemy(this);
      }
    }
  }

  hitsPlayer() {
    location.href = location.href;
  }
}
