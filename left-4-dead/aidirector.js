class AIDirector {
  constructor(scene, allies, enemies) {
    this.scene = scene;
    this.allies = allies;
    this.enemies = enemies;

    this.spawnRadiusMin = 200;
    this.spawnRadiusMax = 400;

    this.maxEnemies = 100;
    this.spawnWanderers(this.maxEnemies);

    this.emotionalIntensity = 0;
    this.relaxPeriod = false;

    //special timeouts
    this.boomerConfig = { time: 0, timeout: 20000 };
    this.hunterConfig = { time: 0, timeout: 30000 };
    this.smokerConfig = { time: 0, timeout: 40000 };

    //setup spawning intervals
    this.setupTank();
    this.mobInterval = false;
    this.setupMob();

    this.setupEmotionalIntensityHookups();

    // this.enemies.add(new Boomer(this.scene, 200, 200));
  }

  setupTank() {
    var i = window.setInterval(function() {
      this.spawnTank();
    }.bind(this), 80000 + Math.random()*80000);
    window.intervals.push(i);
  }

  setupMob() {
    if(!this.mobInterval) {
      this.mobInterval = window.setInterval(function() {
        this.spawnMob();
      }.bind(this), 40000 + Math.random()*40000);
      window.intervals.push(this.mobInterval);
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
        this.increaseEmotionalIntensity(damage/300);
      }.bind(this));
      //when ally is incapacited
      ally.on("askHelp", function(allyAsking) {
        this.increaseEmotionalIntensity(0.4);
      }.bind(this));
      //when ally is incapacited
      ally.on("die", function() {
        this.increaseEmotionalIntensity(1);
      }.bind(this));
    }.bind(this));
  }

  increaseEmotionalIntensity(nb) {
    this.emotionalIntensity += nb;
    if(this.emotionalIntensity > 1)
      this.emotionalIntensity = 1;
  }

  decreaseEmotionalIntensity() {
    this.emotionalIntensity -= 0.005;
    if(this.emotionalIntensity < 0)
      this.emotionalIntensity = 0;
  }

  update(time, delta) {
    this.time = time;
    this.pacingTime += delta;

    if(this.relaxPeriod == false) {
      // build up
      if(this.emotionalIntensity < 1) {
        this.increaseThreat();
      }
      // cross peak
      else {
        this.relaxPeriod = true;
      }
    } else {
      // peak fade
      if(this.emotionalIntensity > 0) {
        this.decreaseThreat();
      }
      // resume build up
      else {
        this.relaxPeriod = false;
      }
    }
  }

  increaseThreat() {
    //no threat
    if(this.emotionalIntensity == 0) {
      this.setupMob();
    }
    //small threat
    else if(this.emotionalIntensity > 0 && this.emotionalIntensity < 0.25) {
      var boomerTimeDiff = this.time - this.boomerConfig.time;
      if(boomerTimeDiff > this.boomerConfig.timeout) {
        this.spawnBoomer();
      }
    }
    //medium threat
    else if(this.emotionalIntensity > 0.25 && this.emotionalIntensity < 0.5) {
      var hunterTimeDiff = this.time - this.hunterConfig.time;
      if(hunterTimeDiff > this.hunterConfig.timeout) {
        this.spawnHunter();
      }
    }
    //big threat
    else if(this.emotionalIntensity > 0.5 && this.emotionalIntensity < 1) {
      var smokerTimeDiff = this.time - this.smokerConfig.time;
      if(smokerTimeDiff > this.smokerConfig.timeout) {
        this.spawnSmoker();
      }
    }
    //max threat
    else if(this.emotionalIntensity == 1) {
      this.spawnMob();
      this.spawnHunter();
      this.spawnSmoker();
    }
  }

  decreaseThreat() {
    //max threat
    if(this.emotionalIntensity == 1) {
      this.stopMob();
    }
    this.decreaseEmotionalIntensity();
  }

  getSpawnSpots() {
    return this.scene.level.getSpawns(this.allies.player.getCenter(), this.spawnRadiusMin, this.spawnRadiusMax);
  }

  spawnWanderers(n) {
    var spawns = this.scene.level.getAllSpawns();
    for(var i=0; i<n; i++) {
      var spawn = spawns[Math.floor(Math.random()*spawns.length)]
      this.enemies.add(new Zombie(this.scene, spawn.x, spawn.y, false));
    }
  }

  spawnZombies(n) {
    var spawns = this.getSpawnSpots();
    for(var i=0; i<n; i++) {
      var spawn = spawns[Math.floor(Math.random()*spawns.length)]
      this.enemies.spawnZombie(spawn.x, spawn.y);
    }
  }

  spawnMob() {
    this.scene.sounds.zombiewave.play();
    var t = window.setTimeout(function() {
      for(var i=0; i<10; i++)
      {
        var t = window.setTimeout(function(){
          var mobSize = Math.floor(Math.exp(i/6)) + Math.floor(Math.random()*2);
          this.spawnZombies(mobSize);
        }.bind(this), i*500);
        window.timeouts.push(t);
      }
    }.bind(this), 2000 + Math.random()*3000);
    window.timeouts.push(t);
  }

  spawnBoomer() {
    this.boomerConfig.time = this.time;
    var playerCoord = this.scene.allies.player.getCenter();
    var spawns = this.scene.level.getSpawns(playerCoord, 200, 300);
    var spawn = spawns[Math.floor(Math.random()*spawns.length)];
    this.enemies.add(new Boomer(this.scene, spawn.x, spawn.y));
  }

  spawnHunter() {
    this.hunterConfig.time = this.time;
    var playerCoord = this.scene.allies.player.getCenter();
    var spawns = this.scene.level.getSpawns(playerCoord, 300, 400);
    var spawn = spawns[Math.floor(Math.random()*spawns.length)];
    this.enemies.add(new Hunter(this.scene, spawn.x, spawn.y));
  }

  spawnSmoker() {
    this.smokerConfig.time = this.time;
    var playerCoord = this.scene.allies.player.getCenter();
    var spawns = this.scene.level.getSpawns(playerCoord, 300, 400);
    var spawn = spawns[Math.floor(Math.random()*spawns.length)];
    this.enemies.add(new Smoker(this.scene, spawn.x, spawn.y));
  }

  spawnTank() {
    var playerCoord = this. allies.player.getCenter();
    var spawns = this.scene.level.getSpawns(playerCoord, 300, 400);
    var spawn = spawns[Math.floor(Math.random()*spawns.length)];
    this.enemies.add(new Tank(this.scene, spawn.x, spawn.y));
  }
}
