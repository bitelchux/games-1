class Bullets {
  constructor(scene) {
    this.scene = scene;
    this.poolsize = 100;
    this.pool = [];
    for (var i = 0; i < this.poolsize; i++) {
      this.pool[i] = new Bullet(scene);
    }
  }

  fire(owner, x, y, rotation, damage, color) {
    var inactiveBullet = this.pool.find(function(bullet) {
      return bullet.active == false;
    });
    inactiveBullet.fire(owner, x, y, rotation, damage, color);
  }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene) {
    super(scene, 0, 0, 'bullet');
    scene.physics.world.enable(this);
    scene.add.existing(this);

    this.setActive(false);
    this.setVisible(false);

    this.scene = scene;
    this.speed = Phaser.Math.GetSpeed(300000 * window.speed, 1);
    this.lifetimeTimeout;

    this.enemiesCollider;
    this.mapCollider;
  }

  fire(owner, x, y, rotation, damage, color) {
    this.setActive(true);
    this.setVisible(true);

    window.gameplayStats[owner.name].nbBulletsFired += 1;

    this.owner = owner;
    this.x = x;
    this.y = y;
    this.damage = damage;
    this.setTint(color);
    this.body.setVelocity(Math.cos(rotation)*this.speed, Math.sin(rotation)*this.speed);

    var enemiesToCheck = this.scene.enemies.getEnemiesAround(new Phaser.Math.Vector2(x, y), 300);
    this.enemiesCollider = this.scene.physics.add.overlap(this, enemiesToCheck, this.hitEnemy, null, this);
    this.mapCollider = this.scene.physics.add.collider(this, this.scene.level.obstaclesLayer, this.die, null, this);

    this.anims.play('bullet-fired', true);

    this.lifetimeTimeout = window.setTimeout(function() {
      this.die();
    }.bind(this), 500);
    window.timeouts.push(this.lifetimeTimeout);
  }

  hitEnemy(bullet, enemy) {

    window.gameplayStats[bullet.owner.name].nbBulletsHit += 1;

    if(this.owner.name == this.scene.allies.player.name)
      this.scene.camera.shake(100, 0.001);

    enemy.isHit(bullet);
    this.die();
  }

  die() {
    this.scene.physics.world.removeCollider(this.enemiesCollider);
    this.scene.physics.world.removeCollider(this.mapCollider);

    if(this.body)
      this.body.setVelocity(0, 0);

    this.x += Math.random()*5 - Math.random()*5;
    this.y += Math.random()*5 - Math.random()*5;
    var scale = 0.5 + Math.random()*0.5;
    this.setFrame('bullet-impact.png');
    this.setScale(scale);

    this.scene.time.delayedCall(100, this.clear, [], this);
  }

  clear() {
    clearTimeout(this.lifetimeTimeout);
    this.setScale(1);
    this.setFrame('bullet-1.png');
    this.setVisible(false);
    this.setActive(false);
  }
}
