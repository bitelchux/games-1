class Allies {
  constructor(scene) {
    this.scene = scene;
    this.player = new Player(this.scene, 100, 200, 0xff00ff);
    this.ally1 = new Ally(this.scene, 132, 200, "ally1", 0xffff00);
    this.ally2 = new Ally(this.scene, 30, 200, "ally2", 0x0000ff);
    this.ally3 = new Ally(this.scene, 30, 230, "ally3", 0x00ff00);

    this.group = [];
    this.group.push(this.player);
    this.group.push(this.ally1);
    this.group.push(this.ally2);
    this.group.push(this.ally3);

    this.setupLights();
    this.setupColliders();
    this.setupHelpEvents();
  }

  setupLights() {
    this.group.forEach(function(ally) {
      this.scene.myLights.addLight(ally);
    }.bind(this));
  }

  setupColliders() {
    this.group.forEach(function(ally) {
      this.scene.physics.add.collider(ally, this.scene.forest.obstaclesLayer);
    }.bind(this));
  }

  setupHelpEvents() {
    for(var i=0; i<this.group.length; i++) {
      var ally = this.group[i];
      ally.on("askHelp", function(allyAsking) {
        for(var j=0; j<this.group.length; j++) {
          var allyHelping = this.group[j];
          if(allyAsking.name != allyHelping.name) {
            allyHelping.calledForHelp(allyAsking);
          }
        }
      }.bind(this));
    }
  }

  update() {
    this.group.forEach(function(ally) {
      ally.update();
    });
  }

  removeAlly(ally) {
    this.group.splice(this.group.indexOf(ally), 1);
  }

  getClosestAllyTo(coord) {
    var distance = 100000;
    var chosenAlly;
    this.group.forEach(function(ally) {
      var allyCoord = ally.getCenter();
      var allyDistance = allyCoord.distance(coord);
      if(allyDistance < distance) {
        distance = allyDistance;
        chosenAlly = ally;
      }
    })
    return chosenAlly;
  }

  getWeakestAlly() {
    var totalhp = 401;
    var chosenAlly;
    this.group.forEach(function(ally) {
      var totalhpAlly = ally.healthbar.hp + ally.healthbar.extrahp;
      if(totalhpAlly < totalhp) {
        totalhp = totalhpAlly;
        chosenAlly = ally;
      }
    })
    return chosenAlly;
  }

  getStrongestAlly() {
    var totalhp = 0;
    var chosenAlly;
    this.group.forEach(function(ally) {
      var totalhpAlly = ally.healthbar.hp + ally.healthbar.extrahp;
      if(totalhpAlly > totalhp) {
        totalhp = totalhpAlly;
        chosenAlly = ally;
      }
    })
    return chosenAlly;
  }

  getAlly(name) {
    var chosenAlly;
    this.group.forEach(function(ally) {
      if(ally.name == name)
        chosenAlly = ally;
    });
    return chosenAlly;
  }

  getAlliesAround(point, radius) {
    var allies = [];
    var circle = new Phaser.Geom.Circle(point.x, point.y, radius);
    this.group.forEach(function(ally) {
      if(circle.contains(ally.x, ally.y)) {
        allies.push(ally);
      }
    });
    return allies;
  }
}
