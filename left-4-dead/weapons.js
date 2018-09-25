class Weapon {
  constructor(scene) {
    this.scene = scene;
  }

  // to override
  getHitZone() {}

  shoot() {
    var hitZone = this.getHitZone();

    // show hitzone
    var graphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0xaa6622 } });
    graphics.strokePoints(hitZone.points, true);

    for(var i=0; i<this.scene.enemies.group.length; i++) {
      var enemy = this.scene.enemies.group[i];
      if(hitZone.contains(enemy.sprite.x, enemy.sprite.y)) {
        enemy.isHit();
      }
    };
  }
}

class Pistol extends Weapon {
  constructor(scene) {
    super(scene);
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
}
Pistol.index = 5;

class Shotgun extends Weapon {
  constructor(scene) {
    super(scene);
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
}
Shotgun.index = 10;

class Uzi extends Weapon {
  constructor(scene) {
    super(scene);
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
}
Uzi.index = 15;

class Grenade extends Weapon {
  constructor(scene) {
    super(scene);
    this.name = "grenade";
    this.index = Grenade.index;
  }

  shoot() {
    console.log("shooting a grenade");
  }
}
Grenade.index = 20;
