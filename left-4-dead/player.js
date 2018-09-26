class Player {
  constructor(scene) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(128, 128, 'player');//.setPipeline("Light2D");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(2);
    this.direction = "up";

    this.scene.anims.create({
      key: 'walk',
      frames: this.scene.anims.generateFrameNumbers('player', {start:0, end:2}),
      frameRate: 12,
      yoyo: true
    });
    this.scene.anims.create({
      key: 'walk-pistol',
      frames: this.scene.anims.generateFrameNumbers('player', {start:3, end:5}),
      frameRate: 12,
      yoyo: true
    });
    this.scene.anims.create({
      key: 'walk-shotgun',
      frames: this.scene.anims.generateFrameNumbers('player', {start:6, end:8}),
      frameRate: 12,
      yoyo: true
    });
    this.scene.anims.create({
      key: 'walk-uzi',
      frames: this.scene.anims.generateFrameNumbers('player', {start:9, end:11}),
      frameRate: 12,
      yoyo: true
    });
    this.scene.anims.create({
      key: 'walk-grenade',
      frames: this.scene.anims.generateFrameNumbers('player', {start:12, end:14}),
      frameRate: 12,
      yoyo: true
    });
    this.scene.anims.create({
      key: 'die',
      frames: this.scene.anims.generateFrameNumbers('player', {start:15, end:17}),
      frameRate: 12
    });

    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.speed = 32;

    this.scene.input.keyboard.on('keydown_CTRL', function(){
      this.interact();
    }, this);

    this.weapon == null;
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
      this.sprite.setAngle(-45);
      this.walk();
    } else if(this.cursors.up.isDown && this.cursors.right.isDown) {
      this.direction = "upright";
      this.sprite.setVelocity(2*this.speed/3,-2*this.speed/3);
      this.sprite.setAngle(45);
      this.walk();
    } else if(this.cursors.down.isDown && this.cursors.left.isDown) {
      this.direction = "downleft";
      this.sprite.setVelocity(-2*this.speed/3,2*this.speed/3);
      this.sprite.setAngle(-135);
      this.walk();
    } else if(this.cursors.down.isDown && this.cursors.right.isDown) {
      this.direction = "downright";
      this.sprite.setVelocity(2*this.speed/3,2*this.speed/3);
      this.sprite.setAngle(135);
      this.walk();
    } else if(this.cursors.up.isDown) {
      this.direction = "up";
      this.sprite.setVelocityY(-this.speed);
      this.sprite.setAngle(0);
      this.walk();
    } else if(this.cursors.down.isDown) {
      this.direction = "down";
      this.sprite.setVelocityY(this.speed);
      this.sprite.setAngle(180);
      this.walk();
    } else if(this.cursors.left.isDown) {
      this.direction = "left";
      this.sprite.setVelocityX(-this.speed);
      this.sprite.setAngle(-90);
      this.walk();
    } else if(this.cursors.right.isDown) {
      this.direction = "right";
      this.sprite.setVelocityX(this.speed);
      this.sprite.setAngle(90);
      this.walk();
    }
  }

  walk() {
    if(this.weapon != null) {
      this.sprite.anims.play('walk-' + this.weapon.name, true);
    } else {
      this.sprite.anims.play('walk', true);
    }
  }

  interact() {
    var tile = this.scene.tilemap.getTileAtWorldXY(this.sprite.x, this.sprite.y, undefined, undefined, 1);
    if(tile) {
      var weapon = this.weapon;
      this.pick_weapon(tile);
      if(weapon != null) {
        this.drop_weapon(weapon);
      }
    }
  }

  pick_weapon(tile) {
    switch(tile.index) {
      case Pistol.index:
        this.weapon = new Pistol(this.scene, 200, 100);
        break;
      case Shotgun.index:
        this.weapon = new Shotgun(this.scene, 1000, 35);
        break;
      case Uzi.index:
        this.weapon = new Uzi(this.scene, 70, 50);
        break;
      case Grenade.index:
        this.weapon = new Grenade(this.scene, 2000, 100);
        break;
    }
    this.scene.tilemap.removeTileAtWorldXY(this.sprite.x, this.sprite.y, undefined, undefined, undefined, 1);
  }

  drop_weapon(weapon) {
    this.scene.tilemap.putTileAtWorldXY(weapon.index, this.sprite.x, this.sprite.y, undefined, undefined, 1);
  }

  shoot() {
    if(this.cursors.space.isDown && this.weapon) {
      this.weapon.shoot();
    }
  }
}
