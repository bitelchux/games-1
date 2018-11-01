class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, name, weaponName, color) {
    super(scene, x, y, name);
    scene.physics.world.enable(this);
    scene.add.existing(this);
    this.scene = scene;
    this.color = color

    window.gameplayStats[name].isPlayer = true;

    this.setPipeline("Light2D");
    this.setCollideWorldBounds(true);
    this.setDepth(2);
    this.body.world.setBounds(0,0,this.scene.level.tilemap.widthInPixels,this.scene.level.tilemap.heightInPixels);
    this.name = name;
    this.setFrame(name + '-walk-left-down-1.png');

    this.healthbar = new HealthBar(this, scene);
    this.helpBar = new HelpBar(scene);
    this.helpSign = new HelpSign(scene);

    this.direction = "up";

    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.normalspeed = 32 * window.speed;
    this.halfspeed = 16 * window.speed;
    this.speed = this.normalspeed;

    this.scene.input.keyboard.on('keydown_CTRL', function(){
      this.interact();
    }, this);

    switch(weaponName) {
      case "pistols":
        this.weapon = new Pistols(this);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 20, 3000);
        break;
      case "shotgun":
        this.weapon = new Shotgun(this);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 8, 4000);
        break;
      case "uzi":
        this.weapon = new Uzi(this);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 50, 3000);
        break;
      case "rifle":
        this.weapon = new Rifle(this);
        this.weapon.bulletBar = new BulletBar(this, this.scene, 15, 4000);
        break;
    }

    this.weapon.bulletBar.on("reload", function() {
      this.weapon.isReloading = true;
    }.bind(this));
    this.weapon.bulletBar.on("reloadFinished", function() {
      this.weapon.isReloading = false;
    }.bind(this));


    this.isHelping = false;
  }

  update() {
    this.setVelocity(0,0);

    if(this.cursors.space.isDown) {
      this.weapon.shoot();
      this.turn();

      if(this.direction.includes("up")) {
        this.setFrame(this.name + '-walk-left-up-1.png');
      } else {
        this.setFrame(this.name + '-walk-left-down-1.png');
      }

      if(this.direction.includes("left")) {
        this.setFlipX(0);
      } else {
        this.setFlipX(1);
      }
    } else {
      this.turn();
      if(this.speed > 0)
        this.move();
    }

    this.helpBar.update(this.x, this.y - 20);
    this.helpSign.update(this.x, this.y - 20);
    this.weapon.update();
  }

  turn() {
    if(this.cursors.up.isDown && this.cursors.left.isDown) {
      this.direction = "upleft";
    } else if(this.cursors.up.isDown && this.cursors.right.isDown) {
      this.direction = "upright";
    } else if(this.cursors.down.isDown && this.cursors.left.isDown) {
      this.direction = "downleft";
    } else if(this.cursors.down.isDown && this.cursors.right.isDown) {
      this.direction = "downright";
    } else if(this.cursors.up.isDown) {
      this.direction = "up";
    } else if(this.cursors.down.isDown) {
      this.direction = "down";
    } else if(this.cursors.left.isDown) {
      this.direction = "left";
    } else if(this.cursors.right.isDown) {
      this.direction = "right";
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

    if(this.direction.includes("up")) {
      this.anims.play(this.name + '-walk-left-up', true);
    } else {
      this.anims.play(this.name + '-walk-left-down', true);
    }

    if(this.direction.includes("left")) {
      this.setFlipX(0);
    } else {
      this.setFlipX(1);
    }
  }

  interact() {
    var tile = this.scene.level.objectsLayer.getTileAtWorldXY(this.x, this.y, undefined, undefined, 1);
    if(tile && tile.index == 101) {
      window.gameplayStats[this.name].nbFirstAidKitsUsed += 1;
      this.healthbar.gainHp(50);
      this.updateHealthRelatedCondition();
      this.scene.level.objectsLayer.removeTileAtWorldXY(this.x, this.y, undefined, undefined, undefined, 1);
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
        window.gameplayStats[this.name].nbRevivedTeammate += 1;
        chosenAlly.isLifted();
        this.isHelping = false;
        this.updateHealthRelatedCondition();
      }.bind(this));
    }
  }

  calledForHelp(ally) {
    //nothing to do here
  }

  isHit(damage) {
    window.gameplayStats[this.name].nbDamageTaken += 1;
    this.emit('isHit', damage);
    this.healthbar.loseHp(damage);
    this.updateHealthRelatedCondition();
  }

  isLifted() {
    this.setFrame(this.name + '-walk-left-down-1.png');
    this.healthbar.recoverSomeHp();
    this.updateHealthRelatedCondition();
  }

  updateHealthRelatedCondition() {
    if(this.healthbar.isEmpty()) {
      this.emit('die');
      this.die();
    } else if(this.healthbar.isExtra()) {
      window.gameplayStats[this.name].nbTimesIncapacited += 1;
      this.emit('askHelp', this);
      this.setFrame(this.name + '-down.png');
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
