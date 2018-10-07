class Ally {
  constructor(scene, x, y, name) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(x, y, 'ally').setPipeline("Light2D");
    this.sprite.setDepth(2);
    this.sprite.name = name;

    this.healthbar = new HealthBar(scene, 100, false);

    this.path = null;
    this.pathIndex = null;
    this.target = null;

    this.hp = 100;
    this.speed = 0.035;
    this.weapon = null;

    var that = this;
    this.fsm = new StateMachine({
      init: 'unweaponed',
      transitions: [
        { name: 'pickWeapon', from: 'unweaponed', to: 'weaponed' },
        { name: 'goNearPlayer', from: ['*'], to: 'near' },
        { name: 'wait', from: ['near'], to: 'idle' },
        { name: 'goto', from: '*', to: function(s) { return s } }
      ],
      methods: {
        onPickWeapon: function() { that.pickWeapon() },
        onGoNearPlayer: function() { that.goNearPlayer() },
        onWait: function() { that.wait() }
      }
    });

    this.start();
  }

  start() {
    var chosenDistance = 100;
    var chosenTile = null;
    var myCoord = this.sprite.getCenter();

    var weaponTiles = this.scene.forest.getWeapons();
    weaponTiles.forEach(function(tile){
      var tileCoord = new Phaser.Math.Vector2(tile.getCenterX(), tile.getCenterY());
      var distance = myCoord.distance(tileCoord);
      if(distance < chosenDistance) {
        chosenTile = tile;
        chosenDistance = distance;
      }
    });
    this.moveTo(chosenTile.getCenterX(), chosenTile.getCenterY());
  }

  moveTo(x, y) {
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

  followPath(delta) {
    this.sprite.anims.play('ally-walk', true);

    var curve = this.path.curves[this.pathIndex];
    var direction = new Phaser.Math.Vector2(curve.p1.x - curve.p0.x, curve.p1.y - curve.p0.y).normalize();
    var angle = Math.atan2(curve.p1.y - curve.p0.y, curve.p1.x - curve.p0.x) * 180 / Math.PI;
    this.sprite.x += delta*direction.x*this.speed;
    this.sprite.y += delta*direction.y*this.speed;
    this.sprite.setAngle(angle);

    if(this.sprite.getCenter().distance(curve.p1) < 2) {
      this.pathIndex += 1;
      if(this.pathIndex == this.path.curves.length) {
        this.atEndOfPath();
      }
    }
  }

  atEndOfPath() {
    this.path = null;

    if(this.fsm.is('unweaponed')) {
      this.fsm.pickWeapon();
      this.fsm.goNearPlayer();
    } else if(this.fsm.is('near')) {
      this.fsm.wait();
    }
  }

  wait() {}

  pickWeapon() {
    var tile = this.scene.forest.objectsLayer.getTileAtWorldXY(this.sprite.getCenter().x, this.sprite.getCenter().y);
    switch(tile.index) {
      case Pistols.index:
        this.weapon = new Pistols(this.scene, 200, 100);
        this.weapon.bulletBar = new BulletBar(this.scene, 20, 3000, false);
        break;
      case Shotgun.index:
        this.weapon = new Shotgun(this.scene, 1000, 100);
        this.weapon.bulletBar = new BulletBar(this.scene, 5, 3000, false);
        break;
      case Uzi.index:
        this.weapon = new Uzi(this.scene, 70, 100);
        this.weapon.bulletBar = new BulletBar(this.scene, 40, 3000, false);
        break;
      case Grenade.index:
        this.weapon = new Grenade(this.scene, 2000, 100);
        this.weapon.bulletBar = new BulletBar(this.scene, 3, 3000, false);
        break;
    }

    this.weapon.bulletBar.on("reload", function() {
      this.weapon.isReloading = true;
    }.bind(this));
    this.weapon.bulletBar.on("reloadFinished", function() {
      this.weapon.isReloading = false;
    }.bind(this));
  }

  goNearPlayer() {
    var tilesAroundPlayer = this.scene.forest.getTilesAroundPlayer();
    var chosenTile = tilesAroundPlayer[Math.floor(Math.random()*tilesAroundPlayer.length)];
    this.moveTo(chosenTile.getCenterX(), chosenTile.getCenterY());

  }

  shootWeaponAt(point) {
    this.sprite.rotateToward(point);
    this.weapon.shoot(this.sprite);
  }

  update(time, delta) {

    var enemies = this.scene.enemies.getEnemiesAround(this.sprite.getCenter(), 100);
    if(enemies.length > 0) {
      this.shootWeaponAt(enemies[0].sprite.getCenter());
    }

    if(this.path && this.path.curves.length > 0) {
      this.followPath(delta);
    }

    if(this.fsm.is('idle') || this.fsm.is('near')) {
      var myCoord = this.sprite.getCenter();
      var playerCoord = this.scene.allies.player.sprite.getCenter();
      if(myCoord.distance(playerCoord) > 60) {
        this.fsm.goNearPlayer();
      }
    }
  }

  isHit(damage) {
    this.healthbar.loseHp(damage);
    if(this.healthbar.isTwoThird()){
      this.speed = this.halfspeed;
    }
    if(this.healthbar.isOneThird()){
      this.speed = 0;
    }
    if(this.healthbar.isEmpty()) {
      this.die();
    }
  }

  die() {
    this.sprite.destroy();
  }
}
