class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, color) {
    super(scene, x, y, 'player');
    scene.physics.world.enable(this);
    scene.add.existing(this);
    this.scene = scene;
    this.color = color;

    this.setPipeline("Light2D");
    this.setCollideWorldBounds(true);
    this.setDepth(2);
    this.body.world.setBounds(0,0,this.scene.forest.tilemap.widthInPixels,this.scene.forest.tilemap.heightInPixels);
    this.name = "player";
    this.setTint(color);

    this.healthbar = new HealthBar(scene);
    this.helpBar = new HelpBar(scene);
    this.helpSign = new HelpSign(scene);

    this.direction = "up";

    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.normalspeed = 32;
    this.halfspeed = 16;
    this.speed = this.normalspeed;

    this.scene.input.keyboard.on('keydown_CTRL', function(){
      this.interact();
    }, this);

    this.weapon == null;
    this.isHelping = false;
  }

  update() {
    this.setVelocity(0,0);

    if(this.cursors.space.isDown && this.weapon) {
      this.weapon.shoot();
      this.turn();
    } else {
      this.turn();
      if(this.speed > 0)
        this.move();
    }

    this.helpBar.update(this.x, this.y - 20);
    this.helpSign.update(this.x, this.y - 20);
  }

  turn() {
    if(this.cursors.up.isDown && this.cursors.left.isDown) {
      this.direction = "upleft";
      this.setAngle(-135);
    } else if(this.cursors.up.isDown && this.cursors.right.isDown) {
      this.direction = "upright";
      this.setAngle(-45);
    } else if(this.cursors.down.isDown && this.cursors.left.isDown) {
      this.direction = "downleft";
      this.setAngle(135);
    } else if(this.cursors.down.isDown && this.cursors.right.isDown) {
      this.direction = "downright";
      this.setAngle(45);
    } else if(this.cursors.up.isDown) {
      this.direction = "up";
      this.setAngle(-90);
    } else if(this.cursors.down.isDown) {
      this.direction = "down";
      this.setAngle(90);
    } else if(this.cursors.left.isDown) {
      this.direction = "left";
      this.setAngle(-180);
    } else if(this.cursors.right.isDown) {
      this.direction = "right";
      this.setAngle(0);
    }
  }

  move() {
    if(this.cursors.up.isDown && this.cursors.left.isDown) {
      this.setVelocity(-2*this.speed/3,-2*this.speed/3);
      this.walk();
    } else if(this.cursors.up.isDown && this.cursors.right.isDown) {
      this.setVelocity(2*this.speed/3,-2*this.speed/3);
      this.walk();
    } else if(this.cursors.down.isDown && this.cursors.left.isDown) {
      this.setVelocity(-2*this.speed/3,2*this.speed/3);
      this.walk();
    } else if(this.cursors.down.isDown && this.cursors.right.isDown) {
      this.setVelocity(2*this.speed/3,2*this.speed/3);
      this.walk();
    } else if(this.cursors.up.isDown) {
      this.setVelocityY(-this.speed);
      this.walk();
    } else if(this.cursors.down.isDown) {
      this.setVelocityY(this.speed);
      this.walk();
    } else if(this.cursors.left.isDown) {
      this.setVelocityX(-this.speed);
      this.walk();
    } else if(this.cursors.right.isDown) {
      this.setVelocityX(this.speed);
      this.walk();
    }
  }

  walk() {
    var walkingSound = this.scene.sounds.walking;
    if(!walkingSound.isPlaying)
      walkingSound.play();

    if(this.weapon != null) {
      this.anims.play('walk-' + this.weapon.name, true);
    } else {
      this.anims.play('walk', true);
    }
  }

  interact() {
    var tile = this.scene.forest.objectsLayer.getTileAtWorldXY(this.x, this.y, undefined, undefined, 1);
    if(tile) {
      switch(tile.index) {
        case 18:
          this.healthbar.gainHp(50);
          this.updateHealthRelatedCondition();
          this.scene.forest.objectsLayer.removeTileAtWorldXY(this.x, this.y, undefined, undefined, undefined, 1);
          break;
        default:
          var weapon = this.weapon;
          this.pick_weapon(tile);
      }
    } else if(!this.isHelping) {
      this.helpAlly();
    }
  }

  helpAlly() {
    var chosenAlly;
    this.scene.allies.group.forEach(function(ally) {
      if(ally != this && this.getCenter().distance(ally.getCenter()) < 10
          && ally.isDown()) {
            chosenAlly = ally;
      }
    }.bind(this));

    if(chosenAlly) {
      this.isHelping = true;
      this.speed = 0;

      this.helpBar.help();
      this.helpBar.on("helpComplete", function() {
        chosenAlly.isLifted();
        this.isHelping = false;
        this.updateHealthRelatedCondition();
      }.bind(this));
    }
  }

  pick_weapon(tile) {
    if(this.weapon)
      this.weapon.bulletBar.kill();

    switch(tile.index) {
      case Pistols.index:
        this.weapon = new Pistols(this, this.scene, 100, 36);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 20, 3000);
        break;
      case Shotgun.index:
        this.weapon = new Shotgun(this, this.scene, 1150, 24);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 8, 4000);
        break;
      case Uzi.index:
        this.weapon = new Uzi(this, this.scene, 63, 20);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 50, 3000);
        break;
      case Grenade.index:
        this.weapon = new Grenade(this, this.scene, 1, 400);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 1, 3760);
        break;
    }

    this.weapon.bulletBar.on("reload", function() {
      this.weapon.isReloading = true;
    }.bind(this));
    this.weapon.bulletBar.on("reloadFinished", function() {
      this.weapon.isReloading = false;
    }.bind(this));
  }

  calledForHelp(ally) {
    //nothing to do here
  }

  isHit(damage) {
    this.emit('isHit', damage);
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
      this.speed = 0;
      this.helpSign.show();
    } else if(this.healthbar.isCritical()){
      this.speed = this.halfspeed;
      this.helpSign.hide();
    } else if(this.healthbar.isNotCritical()){
      this.speed = this.normalspeed;
      this.helpSign.hide();
    }
  }

  isDown() {
    return this.healthbar.isExtra();
  }

  die() {
    location.href = location.href;
  }
}
