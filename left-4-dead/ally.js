class Ally {
  constructor(scene, x, y, name) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(x, y, 'ally').setPipeline("Light2D");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(2);
    this.sprite.body.world.setBounds(0,0,this.scene.forest.tilemap.widthInPixels,this.scene.forest.tilemap.heightInPixels);
    this.sprite.name = name;

    this.healthbar = new HealthBar(scene, false);
    this.helpBar = new HelpBar(scene);
    this.helpSign = new HelpSign(scene);

    this.path = null;
    this.pathIndex = null;
    this.target = null;

    this.normalspeed = 0.035;
    this.halfspeed = 0.017;
    this.speed = this.normalspeed;
    this.weapon = null;

    this.states = {
      IDLE: 0,
      MOVING: 1,
      INTERACTING: 2,
      DOWN: 3
    }

    this.state = this.states.IDLE;
  }

  update() {
    if(this.state == this.states.IDLE) {
      // unarmed
      if(this.weapon == null) {
        var point = this.getClosestWeaponCoord();
        // on top of weapon
        if(this.sprite.getCenter().equals(point)) {
          this.interact();
        }
        // move to weapon
        else {
          this.moveTo(point.x, point.y);
        }
      }
      // armed
      else {
        var enemies = this.scene.enemies.getEnemiesAround(this.sprite.getCenter(), 100);
        // enemies nearby
        if(enemies.length > 0) {
          this.shootWeaponAt(enemies[0].sprite.getCenter());
        }

        // var ally = this.scene.allies.getStrongestAlly();
        var ally = this.scene.allies.player;
        var distanceWithAlly = this.sprite.getCenter().distance(ally.sprite.getCenter());

        // go near strongest ally
        if(distanceWithAlly > 70){
          this.goNearAlly(ally);
        }
      }
    }

    this.helpSign.update(this.sprite.x, this.sprite.y - 20);
  }

  getClosestWeaponCoord() {
    var chosenDistance = 100;
    var chosenCoord = null;
    var myCoord = this.sprite.getCenter();

    var weaponTiles = this.scene.forest.getWeapons();
    weaponTiles.forEach(function(tile){
      var tileCoord = new Phaser.Math.Vector2(tile.getCenterX(), tile.getCenterY());
      var distance = myCoord.distance(tileCoord);
      if(distance < chosenDistance) {
        chosenDistance = distance;
        chosenCoord = tileCoord;
      }
    });

    return chosenCoord;
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

    this.pathIndex = 0;

    if(Array.isArray(this.path.curves) && this.path.curves.length){
      this.followPath();
    }
  }

  followPath() {
    this.state = this.states.MOVING;

    this.sprite.anims.play('ally-walk', true);
    var curve = this.path.curves[this.pathIndex];
    var distance = curve.p0.distance(curve.p1);
    var angle = Math.atan2(curve.p1.y - curve.p0.y, curve.p1.x - curve.p0.x) * 180 / Math.PI;
    this.sprite.setAngle(angle);
    this.scene.tweens.add({
      targets: this.sprite,
      x: curve.p1.x,
      y: curve.p1.y,
      duration: distance / this.speed,
      callbackScope: this,
      onComplete: function() {
        this.pathIndex += 1;
        if(this.pathIndex < this.path.curves.length) {
          this.followPath();
        } else {
          this.path = null;
          this.pathIndex = 0;
          this.state = this.states.IDLE;
        }
      }
    });
  }

  interact() {
    this.state = this.states.INTERACTING;
    var tile = this.scene.forest.getObjectAt(this.sprite.getCenter());
    if(tile) {
      this.pickObject(tile);
    }
    this.state = this.states.IDLE;
  }

  pickObject(tile) {
    switch(tile.index) {
      case Pistols.index:
        this.weapon = new Pistols(this, this.scene, 200, 100);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 20, 3000, false);
        break;
      case Shotgun.index:
        this.weapon = new Shotgun(this, this.scene, 1000, 100);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 5, 3000, false);
        break;
      case Uzi.index:
        this.weapon = new Uzi(this, this.scene, 70, 100);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 40, 3000, false);
        break;
      case Grenade.index:
        this.weapon = new Grenade(this, this.scene, 2000, 100);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 3, 3000, false);
        break;
    }

    this.weapon.bulletBar.on("reload", function() {
      this.weapon.isReloading = true;
    }.bind(this));
    this.weapon.bulletBar.on("reloadFinished", function() {
      this.weapon.isReloading = false;
    }.bind(this));
  }

  goNearAlly(ally) {
    var tiles = this.scene.forest.getTilesAround(ally.sprite.getCenter());
    var chosenTile = tiles[Math.floor(Math.random()*tiles.length)];
    this.moveTo(chosenTile.getCenterX(), chosenTile.getCenterY());
  }

  helpAlly() {
    this.speed = 0;

    var chosenAlly;
    this.scene.allies.group.forEach(function(ally) {
      if(ally != this && this.sprite.getCenter().distance(ally.sprite.getCenter()) < 10
          && ally.isDown()) {
            chosenAlly = ally;
      }
    }.bind(this));

    if(chosenAlly) {
      this.helpBar.help();
      this.helpBar.on("helpComplete", function() {
        chosenAlly.isLifted();
        this.updateHealthRelatedCondition();
        this.fsm.wait();
      }.bind(this));
    }
  }

  shootWeaponAt(point) {
    this.sprite.rotateToward(point);
    this.weapon.shoot(this.sprite);
  }

  isHit(damage) {
    this.healthbar.loseHp(damage);
    this.updateHealthRelatedCondition();
  }

  isLifted() {
    this.healthbar.recoverSomeHp();
    this.updateHealthRelatedCondition();
  }

  updateHealthRelatedCondition() {
    if(this.healthbar.isEmpty()) {
      this.die();
    } else if(this.healthbar.isExtra()) {
      this.state = this.states.DOWN;
      this.speed = 0;
      this.helpSign.show();
    } else if(this.healthbar.isCritical()){
      this.state = this.states.IDLE;
      this.speed = this.halfspeed;
      this.helpSign.hide();
    } else if(this.healthbar.isNotCritical()){
      this.state = this.states.IDLE;
      this.speed = this.normalspeed;
      this.helpSign.hide();
    }
  }

  isDown() {
    return this.healthbar.isExtra();
  }

  die() {
    this.sprite.destroy();
  }
}
