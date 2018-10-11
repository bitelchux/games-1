class Player extends Phaser.GameObjects.GameObject {
  constructor(scene, x, y) {
    super(scene);
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(x, y, 'player').setPipeline("Light2D");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(2);
    this.sprite.body.world.setBounds(0,0,this.scene.forest.tilemap.widthInPixels,this.scene.forest.tilemap.heightInPixels);
    this.sprite.name = "player";

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
    this.sprite.setVelocity(0,0);

    if(this.cursors.space.isDown && this.weapon) {
      this.weapon.shoot(this.sprite);
      this.turn();
    } else {
      this.turn();
      if(this.speed > 0)
        this.move();
    }

    this.helpBar.update(this.sprite.x, this.sprite.y - 20);
    this.helpSign.update(this.sprite.x, this.sprite.y - 20);
  }

  turn() {
    if(this.cursors.up.isDown && this.cursors.left.isDown) {
      this.direction = "upleft";
      this.sprite.setAngle(-135);
    } else if(this.cursors.up.isDown && this.cursors.right.isDown) {
      this.direction = "upright";
      this.sprite.setAngle(-45);
    } else if(this.cursors.down.isDown && this.cursors.left.isDown) {
      this.direction = "downleft";
      this.sprite.setAngle(135);
    } else if(this.cursors.down.isDown && this.cursors.right.isDown) {
      this.direction = "downright";
      this.sprite.setAngle(45);
    } else if(this.cursors.up.isDown) {
      this.direction = "up";
      this.sprite.setAngle(-90);
    } else if(this.cursors.down.isDown) {
      this.direction = "down";
      this.sprite.setAngle(90);
    } else if(this.cursors.left.isDown) {
      this.direction = "left";
      this.sprite.setAngle(-180);
    } else if(this.cursors.right.isDown) {
      this.direction = "right";
      this.sprite.setAngle(0);
    }
  }

  move() {
    if(this.cursors.up.isDown && this.cursors.left.isDown) {
      this.sprite.setVelocity(-2*this.speed/3,-2*this.speed/3);
      this.walk();
    } else if(this.cursors.up.isDown && this.cursors.right.isDown) {
      this.sprite.setVelocity(2*this.speed/3,-2*this.speed/3);
      this.walk();
    } else if(this.cursors.down.isDown && this.cursors.left.isDown) {
      this.sprite.setVelocity(-2*this.speed/3,2*this.speed/3);
      this.walk();
    } else if(this.cursors.down.isDown && this.cursors.right.isDown) {
      this.sprite.setVelocity(2*this.speed/3,2*this.speed/3);
      this.walk();
    } else if(this.cursors.up.isDown) {
      this.sprite.setVelocityY(-this.speed);
      this.walk();
    } else if(this.cursors.down.isDown) {
      this.sprite.setVelocityY(this.speed);
      this.walk();
    } else if(this.cursors.left.isDown) {
      this.sprite.setVelocityX(-this.speed);
      this.walk();
    } else if(this.cursors.right.isDown) {
      this.sprite.setVelocityX(this.speed);
      this.walk();
    }
  }

  walk() {
    var walkingSound = this.scene.sounds.walking;
    if(!walkingSound.isPlaying)
      walkingSound.play();

    if(this.weapon != null) {
      this.sprite.anims.play('walk-' + this.weapon.name, true);
    } else {
      this.sprite.anims.play('walk', true);
    }
  }

  interact() {
    var tile = this.scene.forest.objectsLayer.getTileAtWorldXY(this.sprite.x, this.sprite.y, undefined, undefined, 1);
    if(tile) {
      switch(tile.index) {
        case 18:
          this.speed = this.normalspeed;
          this.healthbar.gainHp(50);
          this.scene.forest.objectsLayer.removeTileAtWorldXY(this.sprite.x, this.sprite.y, undefined, undefined, undefined, 1);
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
    this.isHelping = true;
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
        this.weapon = new Pistols(this, this.scene, 200, 100);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 20, 3000);
        break;
      case Shotgun.index:
        this.weapon = new Shotgun(this, this.scene, 1000, 100);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 5, 3000);
        break;
      case Uzi.index:
        this.weapon = new Uzi(this, this.scene, 70, 100);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 40, 3000);
        break;
      case Grenade.index:
        this.weapon = new Grenade(this, this.scene, 2000, 100);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 3, 3000);
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
      this.speed = 0;
      this.helpSign.show();
      this.emit('askHelp', this);
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
