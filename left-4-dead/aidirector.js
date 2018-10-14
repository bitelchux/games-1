class AIDirector {
  constructor(scene, allies, enemies) {
    this.scene = scene;
    this.allies = allies;
    this.enemies = enemies;

    this.spawnRadiusMin = 150;
    this.spawnRadiusMax = 400;

    this.maxEnemies = 25;
    this.spawnWanderers(this.maxEnemies);

    this.emotionalIntensity = 0;
    this.relaxPeriod = false;

    //setup spawning intervals
    this.setupTank();
    this.mobInterval = false;
    this.setupMob();

    this.setupEmotionalIntensityHookups();
  }

  setupTank() {
    setInterval(function() {
      this.spawnTank();
    }.bind(this), 50000 + Math.random()*50000);
  }

  setupMob() {
    if(!this.mobInterval) {
      this.mobInterval = setInterval(function() {
        this.scene.sounds.zombiewave.play();
        setTimeout(function() {
          this.spawnMob();
        }.bind(this), 2000 + Math.random()*3000);
      }.bind(this), 20000 + Math.random()*20000);
    }
  }

  stopMob() {
    clearInterval(this.mobInterval);
    this.mobInterval = null;
  }

  setupEmotionalIntensityHookups() {
    this.allies.group.forEach(function(ally) {
      //when ally is hit
      ally.on("isHit", function(damage) {
        this.increaseEmotionalIntensity(damage/400);
      }.bind(this));
      //when ally is incapacited
      ally.on("askHelp", function(allyAsking) {
        this.increaseEmotionalIntensity(0.25);
      }.bind(this));
      //when ally is incapacited
      ally.on("die", function() {
        this.increaseEmotionalIntensity(1);
      }.bind(this));
    }.bind(this));
  }

  increaseEmotionalIntensity(nb) {
    this.emotionalIntensity += nb;
  }

  decreaseEmotionalIntensity() {
    this.emotionalIntensity -= 0.001;
  }

  update(time, delta) {
    this.pacingTime += delta;
    this.decreaseEmotionalIntensity();

    // remove wanderers leaving area
    var wanderersOutside = this.enemies.getWanderersOutside(this.allies.player, 600);
    this.enemies.removeMultiple(wanderersOutside);

    // spawn new wanderers to keep same nb of enemies
    var wanderersToSpawn = this.maxEnemies - this.enemies.count();
    if(wanderersToSpawn > 0)
      this.spawnWanderers(wanderersToSpawn);

    if(this.relaxPeriod == false) {
      // build up
      if(this.emotionalIntensity < 1) {
        this.increaseThreat();
      }
      // cross peak
      else if (this.pacingTime > 5000) {
        this.relaxPeriod = true;
        this.pacingTime = 0;
      }
    } else {
      // peak fade
      if(this.emotionalIntensity > 0) {
        this.decreaseThreat();
      }
      // resume build up
      else if (this.pacingTime < 30000) {
        this.relaxPeriod = false;
        this.pacingTime = 0;
      }
    }
  }

  increaseThreat() {
    //no threat
    if(this.emotionalIntensity == 0) {
      this.setupMob();
    }
    //small threat
    else if(this.emotionalIntensity > 0 && this.emotionalIntensity < 0.5) {
      if(!this.enemies.contains('boomer')) {
        this.spawnBoomer();
      }
    }
    //medium threat
    else if(this.emotionalIntensity > 0.5 && this.emotionalIntensity < 1) {
      if(!this.enemies.contains('hunter')) {
        this.spawnHunter();
      }
    }
    //max threat
    else if(this.emotionalIntensity == 1) {
      if(!this.enemies.contains('boomer')) {
        this.spawnBoomer();
      }
      if(!this.enemies.contains('hunter')) {
        this.spawnHunter();
      }
    }
  }

  decreaseThreat() {
    //max threat
    if(this.emotionalIntensity == 1) {
      this.stopMob();
    }
  }

  getSpawnSpots() {
    return this.scene.forest.getSpawns(this.allies.player.sprite.getCenter(), this.spawnRadiusMin, this.spawnRadiusMax);
  }

  spawnWanderers(n) {
    var spawns = this.getSpawnSpots();
    for(var i=0; i<n; i++) {
      var spawn = spawns[Math.floor(Math.random()*spawns.length)]
      this.enemies.add(new Zombie(this.scene, spawn.x, spawn.y, false));
    }
  }

  spawnZombies(n) {
    var spawns = this.getSpawnSpots();
    for(var i=0; i<n; i++) {
      var spawn = spawns[Math.floor(Math.random()*spawns.length)]
      this.enemies.add(new Zombie(this.scene, spawn.x, spawn.y, true));
    }
  }

  spawnMob() {
    for(var i=0; i<10; i++)
    {
      setTimeout(function(){
        var mobSize = Math.floor(Math.exp(i/4)) + Math.floor(Math.random()*2);
        this.spawnZombies(mobSize);
      }.bind(this), i*500);
    }
  }

  spawnHunter() {
    var playerCoord = this.scene.allies.player.sprite.getCenter();
    var spawns = this.scene.forest.getSpawns(playerCoord, 300, 400);
    var spawn = spawns[Math.floor(Math.random()*spawns.length)]
    this.enemies.add(new Hunter(this.scene, spawn.x, spawn.y));
  }

  spawnBoomer() {
    var playerCoord = this.scene.allies.player.sprite.getCenter();
    var spawns = this.scene.forest.getSpawns(playerCoord, 200, 300);
    var spawn = spawns[Math.floor(Math.random()*spawns.length)]
    this.enemies.add(new Boomer(this.scene, spawn.x, spawn.y));
  }

  spawnTank() {
    var playerCoord = this. allies.player.sprite.getCenter();
    var spawns = this.scene.forest.getSpawns(playerCoord, 600, 800);
    var spawn = spawns[Math.floor(Math.random()*spawns.length)]
    this.enemies.add(new Tank(this.scene, spawn.x, spawn.y));
  }
}
