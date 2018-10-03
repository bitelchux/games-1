class Weapon {
  constructor(scene, rate, damage) {
    this.scene = scene;
    this.rate = rate;
    this.damage = damage;
    this.lastShotTime = scene.time.now;
  }

  // to override
  getHitZone() {}
  showImpacts(hitZone) {}

  shoot(sprite) {
    if((this.scene.time.now - this.lastShotTime) > this.rate) {
      this.lastShotTime = this.scene.time.now;
      this.scene.sounds[this.constructor.name.toLowerCase()].play();

      var hitZone = this.getHitZone(sprite);
      var rotatedPoints = [];
      hitZone.points.forEach(function(point) {
        rotatedPoints.push(Phaser.Math.RotateAround(point, sprite.x, sprite.y, sprite.rotation));
      }.bind(this));

      hitZone.setTo(rotatedPoints);

      // show hitzone
      /*var graphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0xaa6622 } });
      if(hitZone.constructor.name == "Circle") {
        graphics.strokeCircleShape(hitZone)
      } else {
        graphics.strokePoints(hitZone.points, true);
      }*/

      // show random bullet impacts inside hitZone
      this.showImpacts(hitZone);

      for(var i=0; i<this.scene.enemies.group.length; i++) {
        var enemy = this.scene.enemies.group[i];
        if(hitZone.contains(enemy.sprite.x, enemy.sprite.y)) {
          enemy.isHit(this.damage);
        }
      };
    }
  }
}

class Pistols extends Weapon {
  constructor(scene, rate, damage) {
    super(scene, rate, damage);
    this.name = "pistols";
    this.index = Pistols.index;
  }

  getHitZone(sprite) {
    var hitZone;
    var x = sprite.x;
    var y = sprite.y;
    var w = 16*3;
    var h = 16*10;

    var downLeft = new Phaser.Geom.Point(x-2,y+w/2);
    var topLeft = new Phaser.Geom.Point(x-2, y-w/2);
    var topRight = new Phaser.Geom.Point(x+h, y-w/2);
    var downRight = new Phaser.Geom.Point(x+h,y+w/2);
    hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);

    return hitZone;
  }

  showImpacts(hitZone) {
    var rect = Phaser.Geom.Polygon.GetAABB(hitZone);
    var p1 = rect.getRandomPoint()
    var p2 = rect.getRandomPoint()
    new Impact(this.scene, p1.x, p1.y);
    new Impact(this.scene, p2.x, p2.y);
  }
}
Pistols.index = 5;

class Shotgun extends Weapon {
  constructor(scene, rate, damage) {
    super(scene, rate, damage);
    this.name = "shotgun";
    this.index = Shotgun.index;
  }

  getHitZone(sprite) {
    var hitZone;
    var x = sprite.x;
    var y = sprite.y;
    var origin = new Phaser.Geom.Point(x-2,y);
    var w = 16*8;
    var h = 16*10;

    var top = new Phaser.Geom.Point(x+h,y-w/2);
    var down = new Phaser.Geom.Point(x+h,y+w/2);
    hitZone = new Phaser.Geom.Polygon([origin, top, down]);

    return hitZone;
  }

  showImpacts(hitZone) {
    var triangle = new Phaser.Geom.Triangle(hitZone.points[0].x, hitZone.points[0].y,
      hitZone.points[1].x, hitZone.points[1].y, hitZone.points[2].x, hitZone.points[2].y);

    for(var i=0; i<5; i++) {
      var point = triangle.getRandomPoint()
      var impact = new Impact(this.scene, point.x, point.y);
    }
  }
}
Shotgun.index = 10;

class Uzi extends Weapon {
  constructor(scene, rate, damage) {
    super(scene, rate, damage);
    this.name = "uzi";
    this.index = Uzi.index;
  }

  getHitZone(sprite) {
    var hitZone;
    var x = sprite.x;
    var y = sprite.y;
    var w = 16*2;
    var h = 16*10;

    var downLeft = new Phaser.Geom.Point(x-2,y+w/2);
    var topLeft = new Phaser.Geom.Point(x-2, y-w/2);
    var topRight = new Phaser.Geom.Point(x+h, y-w/2);
    var downRight = new Phaser.Geom.Point(x+h,y+w/2);
    hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);

    return hitZone;
  }

  showImpacts(hitZone) {
    var rect = Phaser.Geom.Polygon.GetAABB(hitZone);
    var point = rect.getRandomPoint()
    var impact = new Impact(this.scene, point.x, point.y);
  }
}
Uzi.index = 15;

class Grenade extends Weapon {
  constructor(scene, rate, damage) {
    super(scene, rate, damage);
    this.name = "grenade";
    this.index = Grenade.index;
  }

  getHitZone(sprite) {
    var hitZone;
    var x = sprite.x;
    var y = sprite.y;
    var w = 16*4;
    var h = 16*10

    var downLeft = new Phaser.Geom.Point(x-w/2+h,y+w/2);
    var topLeft = new Phaser.Geom.Point(x-w/2+h, y-w/2);
    var topRight = new Phaser.Geom.Point(x+w/2+h, y-w/2);
    var downRight = new Phaser.Geom.Point(x+w/2+h,y+w/2);
    hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);

    return hitZone;
  }

  showImpacts(hitZone) {
    this.sprite = this.scene.physics.add.sprite(hitZone.x, hitZone.y, 'grenade');
    this.sprite.setDepth(3);
    this.scene.myLights.addTempLight(hitZone.x, hitZone.y, 75, 0xffffff, .5, 500)

    this.sprite.on('animationcomplete', function(animation) {
      if(animation.key == "grenade-explosion") {
          this.sprite.destroy();
      }
    }, this);

    this.sprite.anims.play('grenade-explosion', true);
  }
}
Grenade.index = 20;

class Impact {
  constructor(scene, x, y) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(x, y, 'impact').setPipeline("Light2D");
    this.sprite.setDepth(3);

    this.sprite.on('animationcomplete', function(animation) {
      if(animation.key == "impact-anim") {
          this.sprite.destroy();
      }
    }, this);

    this.sprite.anims.play('impact-anim', true);
  }
}
