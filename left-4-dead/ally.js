class Ally extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, name, color) {
    super(scene, x, y, 'ally');
    scene.physics.world.enable(this);
    scene.add.existing(this);
    this.scene = scene;
    this.color = color;

    this.setPipeline("Light2D");
    this.setCollideWorldBounds(true);
    this.setDepth(2);
    this.body.world.setBounds(0,0,this.scene.forest.tilemap.widthInPixels,this.scene.forest.tilemap.heightInPixels);
    this.name = name;
    this.setTint(color);

    this.healthbar = new HealthBar(scene, false);
    this.helpBar = new HelpBar(scene);
    this.helpSign = new HelpSign(scene);

    this.movingTween = null;
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
        this.moveTo(point.x, point.y, this.interact);
      }
      // armed
      else {
        var enemies = this.scene.enemies.getEnemiesAround(this.getCenter(), 90);
        // enemies nearby
        if(enemies.length > 0) {
          this.shootWeaponAt(enemies[0].getCenter());
        }

        var healthkitCoord = this.scene.forest.getClosestHealthKit(this.getCenter());
        //health kit is close by
        if(this.healthbar.isCritical() && healthkitCoord.distance(this.getCenter()) < 200) {
          this.moveTo(healthkitCoord.x, healthkitCoord.y, this.interact);
        } else {
          // var ally = this.scene.allies.getStrongestAlly();
          var ally = this.scene.allies.player;
          var distanceWithAlly = this.getCenter().distance(ally.getCenter());

          // go near ally
          if(distanceWithAlly > 70) {
            this.goNearAlly(ally);
          }
        }
      }
    }

    this.helpSign.update(this.x, this.y - 20);
  }

  getClosestWeaponCoord() {
    var chosenDistance = 100;
    var chosenCoord = null;
    var myCoord = this.getCenter();

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

  moveTo(x, y, callback, args) {
    //stop ongoing movements
    if(this.movingTween)
      this.movingTween.stop();

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

    this.path = new Phaser.Curves.Path(this.x, this.y);

    var startTile = map.worldToTileXY(this.x, this.y);
    var endTile = map.worldToTileXY(x, y);

    var tilePath = finder.findPath(startTile.x, startTile.y, endTile.x, endTile.y, grid);
    tilePath.shift();
    tilePath.forEach(function(tileCoord) {
      this.path.lineTo(tileCoord[0]*16 + 8, tileCoord[1]*16 + 8);
    }.bind(this));

    this.pathIndex = 0;

    if(Array.isArray(this.path.curves) && this.path.curves.length){
      this.followPath(callback, args);
    }
  }

  followPath(callback, args) {
    this.state = this.states.MOVING;

    var curve = this.path.curves[this.pathIndex];
    var distance = curve.p0.distance(curve.p1);

    this.direction = "";

    //going up
    if(curve.p1.y < curve.p0.y) {
      this.direction += "up";
      this.anims.play('ally-walk-left-up', true);
    }
    //going down
    else {
      this.direction += "down";
      this.anims.play('ally-walk-left-down', true);
    }

    //going right
    if(curve.p1.x > curve.p0.x) {
      this.direction += "right";
      this.setFlipX(1);
    }
    //going left
    else {
      this.direction += "left";
      this.setFlipX(0);
    }

    var angle = Math.atan2(curve.p1.y - curve.p0.y, curve.p1.x - curve.p0.x) * 180 / Math.PI;

    this.movingTween = this.scene.tweens.add({
      targets: this,
      x: curve.p1.x,
      y: curve.p1.y,
      duration: distance / this.speed,
      callbackScope: this,
      onComplete: function() {
        this.pathIndex += 1;
        if(this.path && this.pathIndex < this.path.curves.length) {
          this.followPath(callback, args);
        } else {
          this.path = null;
          this.pathIndex = 0;
          this.state = this.states.IDLE;
          if(typeof callback === "function") {
            callback.call(this, args);
          }
        }
      }
    });
  }

  interact() {
    this.state = this.states.INTERACTING;
    var tile = this.scene.forest.getObjectAt(this.getCenter());
    if(tile) {
      this.pickObject(tile);
    }
    this.state = this.states.IDLE;
  }

  pickObject(tile) {
    switch(tile.index) {
      case 18:
        this.healthbar.gainHp(50);
        this.updateHealthRelatedCondition();
        this.scene.forest.objectsLayer.removeTileAtWorldXY(this.x, this.y, undefined, undefined, undefined, 1);
        break;
        case Pistols.index:
          this.weapon = new Pistols(this, this.scene, 100, 36);
          this.weapon.bulletBar = new BulletBar(this, this.scene, 20, 3000, false);
          break;
        case Shotgun.index:
          this.weapon = new Shotgun(this, this.scene, 1150, 24);
          this.weapon.bulletBar = new BulletBar(this, this.scene, 8, 4000, false);
          break;
        case Uzi.index:
          this.weapon = new Uzi(this, this.scene, 63, 20);
          this.weapon.bulletBar = new BulletBar(this, this.scene, 50, 3000, false);
          break;
        case Grenade.index:
          this.weapon = new Grenade(this, this.scene, 1, 400);
          this.weapon.bulletBar = new BulletBar(this, this.scene, 1, 3760, false);
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
    var tiles = this.scene.forest.getTilesAround(ally.getCenter());
    var chosenTile = tiles[Math.floor(Math.random()*tiles.length)];
    this.moveTo(chosenTile.getCenterX(), chosenTile.getCenterY());
  }

  calledForHelp(ally) {
    this.moveTo(ally.x, ally.y, this.helpAlly, ally);
  }

  helpAlly(ally) {
    this.helpBar.help();
    this.helpBar.on("helpComplete", function() {
      ally.isLifted();
    }.bind(this));
  }

  shootWeaponAt(point) {
    var rotation = Phaser.Math.Angle.Between(this.x, this.y, point.x, point.y);
    if(rotation > -Math.PI/8 && rotation < Math.PI/8) {
      this.direction = "right";
    } else if(rotation < -Math.PI/8 && rotation > -3*Math.PI/8) {
      this.direction = "upright";
    } else if(rotation < -3*Math.PI/8 && rotation > -5*Math.PI/8) {
      this.direction = "up";
    } else if(rotation < -5*Math.PI/8 && rotation > -7*Math.PI/8) {
      this.direction = "upleft";
    } else if(rotation > 7*Math.PI/8 && rotation < -7*Math.PI/8) {
      this.direction = "left";
    } else if(rotation < 7*Math.PI/8 && rotation > 5*Math.PI/8) {
      this.direction = "downleft";
    } else if(rotation < 5*Math.PI/8 && rotation > 3*Math.PI/8) {
      this.direction = "down";
    } else if(rotation < 3*Math.PI/8 && rotation > Math.PI/8) {
      this.direction = "downright";
    }

    if(this.direction.includes("up")) {
      this.anims.play('player-walk-left-up', true);
    } else {
      this.anims.play('player-walk-left-down', true);
    }

    if(this.direction.includes("left")) {
      this.setFlipX(0);
    } else {
      this.setFlipX(1);
    }

    this.weapon.shoot();
  }

  isHit(damage) {
    this.emit("isHit", damage);
    this.healthbar.loseHp(damage);
    this.updateHealthRelatedCondition();
  }

  isLifted() {
    this.healthbar.recoverSomeHp();
    this.updateHealthRelatedCondition();
  }

  updateHealthRelatedCondition() {
    if(this.healthbar.isEmpty()) {
      this.emit('die');
      this.die();
    } else if(this.healthbar.isExtra()) {
      this.emit('askHelp', this);
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
    this.destroy();
  }
}
