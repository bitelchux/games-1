class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(x, y, 'player').setPipeline("Light2D");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(2);
    this.sprite.body.world.setBounds(0,0,this.scene.forest.tilemap.widthInPixels,this.scene.forest.tilemap.heightInPixels);
    this.sprite.name = "player";
    this.healthbar = new HealthBar(scene, 100);

    this.direction = "up";

    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.normalspeed = 32;
    this.halfspeed = 16;
    this.speed = this.normalspeed;

    this.scene.input.keyboard.on('keydown_CTRL', function(){
      this.interact();
    }, this);

    this.weapon == null;
    this.isInjured = false;
  }

  update() {
    this.move();
    this.shoot();
  }

  move() {
    this.sprite.setVelocity(0,0);

    if(this.cursors.up.isDown && this.cursors.left.isDown) {
      this.direction = "upleft";
      this.sprite.setVelocity(-2*this.speed/3,-2*this.speed/3);
      this.sprite.setAngle(-135);
      this.walk();
    } else if(this.cursors.up.isDown && this.cursors.right.isDown) {
      this.direction = "upright";
      this.sprite.setVelocity(2*this.speed/3,-2*this.speed/3);
      this.sprite.setAngle(-45);
      this.walk();
    } else if(this.cursors.down.isDown && this.cursors.left.isDown) {
      this.direction = "downleft";
      this.sprite.setVelocity(-2*this.speed/3,2*this.speed/3);
      this.sprite.setAngle(135);
      this.walk();
    } else if(this.cursors.down.isDown && this.cursors.right.isDown) {
      this.direction = "downright";
      this.sprite.setVelocity(2*this.speed/3,2*this.speed/3);
      this.sprite.setAngle(45);
      this.walk();
    } else if(this.cursors.up.isDown) {
      this.direction = "up";
      this.sprite.setVelocityY(-this.speed);
      this.sprite.setAngle(-90);
      this.walk();
    } else if(this.cursors.down.isDown) {
      this.direction = "down";
      this.sprite.setVelocityY(this.speed);
      this.sprite.setAngle(90);
      this.walk();
    } else if(this.cursors.left.isDown) {
      this.direction = "left";
      this.sprite.setVelocityX(-this.speed);
      this.sprite.setAngle(-180);
      this.walk();
    } else if(this.cursors.right.isDown) {
      this.direction = "right";
      this.sprite.setVelocityX(this.speed);
      this.sprite.setAngle(0);
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
    }
  }

  pick_weapon(tile) {
    if(this.weapon)
      this.weapon.bulletBar.kill();

    switch(tile.index) {
      case Pistols.index:
        this.weapon = new Pistols(this.scene, 200, 100);
        this.weapon.bulletBar = new BulletBar(this.scene, 20, 3000);
        break;
      case Shotgun.index:
        this.weapon = new Shotgun(this.scene, 1000, 100);
        this.weapon.bulletBar = new BulletBar(this.scene, 5, 3000);
        break;
      case Uzi.index:
        this.weapon = new Uzi(this.scene, 70, 100);
        this.weapon.bulletBar = new BulletBar(this.scene, 40, 3000);
        break;
      case Grenade.index:
        this.weapon = new Grenade(this.scene, 2000, 100);
        this.weapon.bulletBar = new BulletBar(this.scene, 3, 3000);
        break;
    }

    this.weapon.bulletBar.on("reload", function() {
      this.weapon.isReloading = true;
    }.bind(this));
    this.weapon.bulletBar.on("reloadFinished", function() {
      this.weapon.isReloading = false;
    }.bind(this));
  }

  shoot() {
    if(this.cursors.space.isDown && this.weapon) {
      this.weapon.shoot(this.sprite);
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
      location.href = location.href;
    }
  }
}
