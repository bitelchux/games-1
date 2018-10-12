class AIDirector {
  constructor(scene, allies, enemies) {
    this.scene = scene;
    this.allies = allies;
    this.enemies = enemies;
    this.startIntervalsAndTimeouts();
  }

  startIntervalsAndTimeouts() {
    //small wave
    var smallWaveInterval = setInterval(function(){
      this.spawnWaves(2, 5, 500);
    }.bind(this), 5000);

    //big wave
    var bigWaveInterval = setInterval(function(){
      this.scene.sounds.zombiewave.play();
      this.spawnWaves(3, 30, 2000);
    }.bind(this), 60000);

    //boomer
    var boomerInterval = setInterval(function(){
      this.spawnBoomer();
    }.bind(this), 30000)

    //hunter
    var hunterInterval = setInterval(function(){
      this.spawnHunter();
    }.bind(this), 50000)

    //tank
    setTimeout(function(){
      this.spawnTank();
      clearInterval(smallWaveInterval);
      clearInterval(bigWaveInterval);
      clearInterval(boomerInterval);
      clearInterval(hunterInterval);
    }.bind(this), 80000);
    // }.bind(this), 0);
  }

  spawnWaves(nbWaves, nbEnemiesPerWave, delayBetweenWaves) {
    for(var i=0; i<nbWaves; i++) {
      setTimeout(function(){
        this.spawnZombies(nbEnemiesPerWave);
      }.bind(this),delayBetweenWaves * i);
    }
  }

  spawnZombies(n) {
    var playerCoord = this.scene.allies.player.sprite.getCenter();
    var spawns = this.scene.forest.getSpawns(playerCoord, 125, 300);
    for(var i=0; i<n; i++) {
      var spawn = spawns[Math.floor(Math.random()*spawns.length)]
      this.group.push(new Zombie(this.scene, spawn.x, spawn.y));
    }
  }

  spawnHunter() {
    var playerCoord = this.scene.allies.player.sprite.getCenter();
    var spawns = this.scene.forest.getSpawns(playerCoord, 300, 400);
    var spawn = spawns[Math.floor(Math.random()*spawns.length)]
    this.group.push(new Hunter(this.scene, spawn.x, spawn.y));
  }

  spawnBoomer() {
    var playerCoord = this.scene.allies.player.sprite.getCenter();
    var spawns = this.scene.forest.getSpawns(playerCoord, 200, 300);
    var spawn = spawns[Math.floor(Math.random()*spawns.length)]
    this.group.push(new Boomer(this.scene, spawn.x, spawn.y));
  }

  spawnTank() {
    var playerCoord = this. allies.player.sprite.getCenter();
    var spawns = this.scene.forest.getSpawns(playerCoord, 600, 800);
    var spawn = spawns[Math.floor(Math.random()*spawns.length)]
    this.group.push(new Tank(this.scene, spawn.x, spawn.y));
  }

  update(time, delta) {
  }
}
