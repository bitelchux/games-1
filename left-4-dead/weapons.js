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

  shoot() {
    if((this.scene.time.now - this.lastShotTime) > this.rate) {

      this.lastShotTime = this.scene.time.now;

      var hitZone = this.getHitZone();

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

class Pistol extends Weapon {
  constructor(scene, rate, damage) {
    super(scene, rate, damage);
    this.name = "pistol";
    this.index = Pistol.index;
  }

  getHitZone() {
    var hitZone;
    var x = this.scene.player.sprite.x;
    var y = this.scene.player.sprite.y;
    var w = 16*3;
    var h = 16*10;

    switch(this.scene.player.direction) {
      case "up":
        var downLeft = new Phaser.Geom.Point(x-w/2,y);
        var downRight = new Phaser.Geom.Point(x+w/2,y);
        var topLeft = new Phaser.Geom.Point(x-w/2, y-h);
        var topRight = new Phaser.Geom.Point(x+w/2, y-h);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "down":
        var topLeft = new Phaser.Geom.Point(x-w/2, y);
        var topRight = new Phaser.Geom.Point(x+w/2, y);
        var downLeft = new Phaser.Geom.Point(x-w/2,y+h);
        var downRight = new Phaser.Geom.Point(x+w/2,y+h);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "left":
        var topLeft = new Phaser.Geom.Point(x-h, y-w/2);
        var topRight = new Phaser.Geom.Point(x-h, y+w/2);
        var downLeft = new Phaser.Geom.Point(x,y-w/2);
        var downRight = new Phaser.Geom.Point(x,y+w/2);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "right":
        var topLeft = new Phaser.Geom.Point(x, y-w/2);
        var topRight = new Phaser.Geom.Point(x, y+w/2);
        var downLeft = new Phaser.Geom.Point(x+h,y-w/2);
        var downRight = new Phaser.Geom.Point(x+h,y+w/2);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "upleft":
        var downLeft = new Phaser.Geom.Point(x-w/3,y+w/3);
        var downRight = new Phaser.Geom.Point(x+w/3,y-w/3);
        var topLeft = new Phaser.Geom.Point(x-h*2/3-w/3, y-h*2/3+w/3);
        var topRight = new Phaser.Geom.Point(x-h*2/3+w/3, y-h*2/3-w/3);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "upright":
        var downLeft = new Phaser.Geom.Point(x-w/3,y-w/3);
        var downRight = new Phaser.Geom.Point(x+w/3,y+w/3);
        var topLeft = new Phaser.Geom.Point(x+h*2/3-w/3, y-h*2/3-w/3);
        var topRight = new Phaser.Geom.Point(x+h*2/3+w/3, y-h*2/3+w/3);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "downleft":
        var downLeft = new Phaser.Geom.Point(x-h*2/3-w/3, y+h*2/3-w/3);
        var downRight = new Phaser.Geom.Point(x-h*2/3+w/3, y+h*2/3+w/3);
        var topLeft = new Phaser.Geom.Point(x-w/3,y-w/3);
        var topRight = new Phaser.Geom.Point(x+w/3,y+w/3);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "downright":
        var downLeft = new Phaser.Geom.Point(x+h*2/3-w/3, y+h*2/3+w/3);
        var downRight = new Phaser.Geom.Point(x+h*2/3+w/3, y+h*2/3-w/3);
        var topLeft = new Phaser.Geom.Point(x-w/3,y+w/3);
        var topRight = new Phaser.Geom.Point(x+w/3,y-w/3);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
    }

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
Pistol.index = 5;

class Shotgun extends Weapon {
  constructor(scene, rate, damage) {
    super(scene, rate, damage);
    this.name = "shotgun";
    this.index = Shotgun.index;
  }

  getHitZone() {
    var hitZone;
    var x = this.scene.player.sprite.x;
    var y = this.scene.player.sprite.y;
    var origin = new Phaser.Geom.Point(x,y);
    var w = 16*8;
    var h = 16*10;

    switch(this.scene.player.direction) {
      case "up":
        var left = new Phaser.Geom.Point(x-w/2,y-h);
        var right = new Phaser.Geom.Point(x+w/2,y-h);
        hitZone = new Phaser.Geom.Polygon([origin, left, right]);
        break;
      case "down":
        var left = new Phaser.Geom.Point(x+w/2,y+h);
        var right = new Phaser.Geom.Point(x-w/2,y+h);
        hitZone = new Phaser.Geom.Polygon([origin, left, right]);
        break;
      case "left":
        var left = new Phaser.Geom.Point(x-h,y+w/2);
        var right = new Phaser.Geom.Point(x-h,y-w/2);
        hitZone = new Phaser.Geom.Polygon([origin, left, right]);
        break;
      case "right":
        var left = new Phaser.Geom.Point(x+h,y-w/2);
        var right = new Phaser.Geom.Point(x+h,y+w/2);
        hitZone = new Phaser.Geom.Polygon([origin, left, right]);
        break;
      case "upleft":
        var left = new Phaser.Geom.Point(x-h,y-w/2);
        var right = new Phaser.Geom.Point(x-w/2,y-h);
        hitZone = new Phaser.Geom.Polygon([origin, left, right]);
        break;
      case "upright":
        var left = new Phaser.Geom.Point(x+w/2,y-h);
        var right = new Phaser.Geom.Point(x+h,y-w/2);
        hitZone = new Phaser.Geom.Polygon([origin, left, right]);
        break;
      case "downleft":
        var left = new Phaser.Geom.Point(x-h,y+w/2);
        var right = new Phaser.Geom.Point(x-w/2,y+h);
        hitZone = new Phaser.Geom.Polygon([origin, left, right]);
        break;
      case "downright":
        var left = new Phaser.Geom.Point(x+h,y+w/2);
        var right = new Phaser.Geom.Point(x+w/2,y+h);
        hitZone = new Phaser.Geom.Polygon([origin, left, right]);
        break;
    }

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

  getHitZone() {
    var hitZone;
    var x = this.scene.player.sprite.x;
    var y = this.scene.player.sprite.y;
    var w = 16*2;
    var h = 16*10;

    switch(this.scene.player.direction) {
      case "up":
        var downLeft = new Phaser.Geom.Point(x-w/2,y);
        var downRight = new Phaser.Geom.Point(x+w/2,y);
        var topLeft = new Phaser.Geom.Point(x-w/2, y-h);
        var topRight = new Phaser.Geom.Point(x+w/2, y-h);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "down":
        var topLeft = new Phaser.Geom.Point(x-w/2, y);
        var topRight = new Phaser.Geom.Point(x+w/2, y);
        var downLeft = new Phaser.Geom.Point(x-w/2,y+h);
        var downRight = new Phaser.Geom.Point(x+w/2,y+h);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "left":
        var topLeft = new Phaser.Geom.Point(x-h, y-w/2);
        var topRight = new Phaser.Geom.Point(x-h, y+w/2);
        var downLeft = new Phaser.Geom.Point(x,y-w/2);
        var downRight = new Phaser.Geom.Point(x,y+w/2);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "right":
        var topLeft = new Phaser.Geom.Point(x, y-w/2);
        var topRight = new Phaser.Geom.Point(x, y+w/2);
        var downLeft = new Phaser.Geom.Point(x+h,y-w/2);
        var downRight = new Phaser.Geom.Point(x+h,y+w/2);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "upleft":
        var downLeft = new Phaser.Geom.Point(x-w/3,y+w/3);
        var downRight = new Phaser.Geom.Point(x+w/3,y-w/3);
        var topLeft = new Phaser.Geom.Point(x-h*2/3-w/3, y-h*2/3+w/3);
        var topRight = new Phaser.Geom.Point(x-h*2/3+w/3, y-h*2/3-w/3);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "upright":
        var downLeft = new Phaser.Geom.Point(x-w/3,y-w/3);
        var downRight = new Phaser.Geom.Point(x+w/3,y+w/3);
        var topLeft = new Phaser.Geom.Point(x+h*2/3-w/3, y-h*2/3-w/3);
        var topRight = new Phaser.Geom.Point(x+h*2/3+w/3, y-h*2/3+w/3);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "downleft":
        var downLeft = new Phaser.Geom.Point(x-h*2/3-w/3, y+h*2/3-w/3);
        var downRight = new Phaser.Geom.Point(x-h*2/3+w/3, y+h*2/3+w/3);
        var topLeft = new Phaser.Geom.Point(x-w/3,y-w/3);
        var topRight = new Phaser.Geom.Point(x+w/3,y+w/3);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
      case "downright":
        var downLeft = new Phaser.Geom.Point(x+h*2/3-w/3, y+h*2/3+w/3);
        var downRight = new Phaser.Geom.Point(x+h*2/3+w/3, y+h*2/3-w/3);
        var topLeft = new Phaser.Geom.Point(x-w/3,y+w/3);
        var topRight = new Phaser.Geom.Point(x+w/3,y-w/3);
        hitZone = new Phaser.Geom.Polygon([downLeft, topLeft, topRight, downRight]);
        break;
    }

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

  getHitZone() {
    var hitZone;
    var x = this.scene.player.sprite.x;
    var y = this.scene.player.sprite.y;
    var h = 16*10
    var r = 16*3;

    switch(this.scene.player.direction) {
      case "up":
        hitZone = new Phaser.Geom.Circle(x, y-h, r);
        break;
      case "down":
        hitZone = new Phaser.Geom.Circle(x, y+h, r);
        break;
      case "left":
        hitZone = new Phaser.Geom.Circle(x-h, y, r);
        break;
      case "right":
        hitZone = new Phaser.Geom.Circle(x+h, y, r);
        break;
      case "upleft":
        hitZone = new Phaser.Geom.Circle(x-h*2/3, y-h*2/3, r);
        break;
      case "upright":
        hitZone = new Phaser.Geom.Circle(x+h*2/3, y-h*2/3, r);
        break;
      case "downleft":
        hitZone = new Phaser.Geom.Circle(x-h*2/3, y+h*2/3, r);
        break;
      case "downright":
        hitZone = new Phaser.Geom.Circle(x+h*2/3, y+h*2/3, r);
        break;
    }

    return hitZone;
  }

  showImpacts(hitZone) {
    this.sprite = this.scene.physics.add.sprite(hitZone.x, hitZone.y, 'grenade');
    this.sprite.setDepth(3);

    if(!this.scene.anims.anims.has('grenade-explosion')) {
      this.scene.anims.create({
        key: 'grenade-explosion',
        frames: this.scene.anims.generateFrameNumbers('grenade', {start:0, end:3}),
        frameRate: 6
      });
    }

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

    this.sprite = scene.physics.add.sprite(x, y, 'impact');
    this.sprite.setDepth(3);

    if(!this.scene.anims.anims.has('impact-anim')) {
      this.scene.anims.create({
        key: 'impact-anim',
        frames: this.scene.anims.generateFrameNumbers('impact', {start:0, end:2}),
        frameRate: 12
      });
    }

    this.sprite.on('animationcomplete', function(animation) {
      if(animation.key == "impact-anim") {
          this.sprite.destroy();
      }
    }, this);

    this.sprite.anims.play('impact-anim', true);
  }
}
