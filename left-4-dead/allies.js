class Allies {
  constructor(scene) {
    this.scene = scene;
    this.player = new Player(this.scene, 100, 200);
    this.ally1 = new Ally(this.scene, 132, 200, "ally1");
    this.ally2 = new Ally(this.scene, 30, 200, "ally2");
    this.ally3 = new Ally(this.scene, 30, 230, "ally3");

    this.group = [];
    this.group.push(this.player);
    this.group.push(this.ally1);
    this.group.push(this.ally2);
    this.group.push(this.ally3);

    this.setupColliders();
    this.setupHelpEvents();
  }

  setupColliders() {
    this.group.forEach(function(ally) {
      this.scene.physics.add.collider(ally.sprite, this.scene.forest.obstaclesLayer);
    }.bind(this));
  }

  setupHelpEvents() {
    for(var i=0; i<this.group.length; i++) {
      var ally = this.group[i];
      ally.on("askHelp", function(allyAsking) {
        for(var j=0; j<this.group.length; j++) {
          var allyHelping = this.group[j];
          if(allyAsking.sprite.name != allyHelping.sprite.name) {
            allyHelping.calledForHelp(allyAsking);
          }
        }
      }.bind(this));
    }
  }

  update(time, delta) {
    this.group.forEach(function(ally) {
      ally.update();
    });
  }

  removeAlly(ally) {
    this.group.splice(this.group.indexOf(ally), 1);
  }

  getClosestAllyTo(coord) {
    var distance = 1000;
    var chosenAlly;
    this.group.forEach(function(ally) {
      var allyCoord = ally.sprite.getCenter();
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

  getSprites() {
    var sprites = [];
    this.group.forEach(function(ally) {
      sprites.push(ally.sprite);
    });
    return sprites;
  }

  getAlly(name) {
    var chosenAlly;
    this.group.forEach(function(ally) {
      if(ally.sprite.name == name)
        chosenAlly = ally;
    });
    return chosenAlly;
  }
}
