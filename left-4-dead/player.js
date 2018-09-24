class Player {
  constructor(scene) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(128, 128, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(2);

    this.scene.anims.create({
      key: 'walk',
      frames: this.scene.anims.generateFrameNumbers('player', {start:0, end:2}),
      frameRate: 12,
      yoyo: true
    });
    this.scene.anims.create({
      key: 'die',
      frames: this.scene.anims.generateFrameNumbers('player', {start:4, end:6}),
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
  }

  move() {
    this.sprite.setVelocity(0,0);

    if(this.cursors.up.isDown && this.cursors.left.isDown) {
      this.sprite.setVelocity(-2*this.speed/3,-2*this.speed/3);
      this.sprite.setAngle(-45);
      this.sprite.anims.play('walk', true);
    } else if(this.cursors.up.isDown && this.cursors.right.isDown) {
      this.sprite.setVelocity(2*this.speed/3,-2*this.speed/3);
      this.sprite.setAngle(45);
      this.sprite.anims.play('walk', true);
    } else if(this.cursors.down.isDown && this.cursors.left.isDown) {
      this.sprite.setVelocity(-2*this.speed/3,2*this.speed/3);
      this.sprite.setAngle(-135);
      this.sprite.anims.play('walk', true);
    } else if(this.cursors.down.isDown && this.cursors.right.isDown) {
      this.sprite.setVelocity(2*this.speed/3,2*this.speed/3);
      this.sprite.setAngle(135);
      this.sprite.anims.play('walk', true);
    } else if(this.cursors.up.isDown) {
      this.sprite.setVelocityY(-this.speed);
      this.sprite.setAngle(0);
      this.sprite.anims.play('walk', true);
    } else if(this.cursors.down.isDown) {
      this.sprite.setVelocityY(this.speed);
      this.sprite.setAngle(180);
      this.sprite.anims.play('walk', true);
    } else if(this.cursors.left.isDown) {
      this.sprite.setVelocityX(-this.speed);
      this.sprite.setAngle(-90);
      this.sprite.anims.play('walk', true);
    } else if(this.cursors.right.isDown) {
      this.sprite.setVelocityX(this.speed);
      this.sprite.setAngle(90);
      this.sprite.anims.play('walk', true);
    }
  }

  interact() {
    console.log(this.scene.tilemap.getLayer("objectsLayer"));
    var tile = this.scene.tilemap.getTileAtWorldXY(this.sprite.x, this.sprite.y, false, this.scene.cameras.main, this.scene.tilemap.getLayer("objectsLayer"));
    if(tile) {
      var weapon = this.weapon;
      this.pick_weapon(tile);
      if(weapon != null) {
        this.drop_weapon(weapon);
      }
    }
  }

  pick_weapon(tile) {
    console.log(tile);
    switch(tile.index) {
      case Pistol.index:
        this.weapon = new Pistol(this);
        break;
      case Shotgun.index:
        this.weapon = new Shotgun(this);
        break;
      case Uzi.index:
        this.weapon = new Uzi(this);
        break;
      case Grenade.index:
        this.weapon = new Grenade(this);
        break;
    }
    this.scene.tilemap.removeTileAtWorldXY(this.sprite.x, this.sprite.y);
  }

  drop_weapon(weapon) {
    this.scene.tilemap.putTileAtWorldXY(weapon.index, this.sprite.x, this.sprite.y);
  }
}
