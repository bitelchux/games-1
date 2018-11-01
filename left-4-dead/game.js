class GameScene extends Phaser.Scene {

  preload() {
    this.load.setPath('assets/');

    // images
    this.load.image("bulletshell", ["bullet.png", "bullet_n.png"]);
    this.load.image("reload", ["reload.png", "reload_n.png"]);
    this.load.image("help", ["help.png", "help_n.png"]);

    //levels
    this.load.image("level", ["levels/level.png", "levels/level_n.png"]);
    this.load.tilemapTiledJSON("levelTilemap", "levels/level.json");

    // weapons
    this.load.image("pistols", ["weapons/pistols.png", "weapons/pistols_n.png"]);
    this.load.image("shotgun", ["weapons/shotgun.png", "weapons/shotgun_n.png"]);
    this.load.image("uzi", ["weapons/uzi.png", "weapons/uzi_n.png"]);
    this.load.image("rifle", ["weapons/rifle.png", "weapons/rifle_n.png"]);

    this.load.atlas({
      key: 'bullet',
      textureURL: 'bullet/bullet.png',
      normalMap: 'bullet/bullet_n.png',
      atlasURL: 'bullet/bullet.json'
    });
    this.load.atlas({
      key: 'bill',
      textureURL: 'bill/bill.png',
      normalMap: 'bill/bill_n.png',
      atlasURL: 'bill/bill.json'
    });
    this.load.atlas({
      key: 'louis',
      textureURL: 'louis/louis.png',
      normalMap: 'louis/louis_n.png',
      atlasURL: 'louis/louis.json'
    });
    this.load.atlas({
      key: 'zoey',
      textureURL: 'zoey/zoey.png',
      normalMap: 'zoey/zoey_n.png',
      atlasURL: 'zoey/zoey.json'
    });
    this.load.atlas({
      key: 'francis',
      textureURL: 'francis/francis.png',
      normalMap: 'francis/francis_n.png',
      atlasURL: 'francis/francis.json'
    });
    this.load.atlas({
      key: 'zombie',
      textureURL: 'enemies/zombie/zombie.png',
      normalMap: 'enemies/zombie/zombie_n.png',
      atlasURL: 'enemies/zombie/zombie.json'
    });
    this.load.atlas({
      key: 'boomer',
      textureURL: 'enemies/boomer/boomer.png',
      normalMap: 'enemies/boomer/boomer_n.png',
      atlasURL: 'enemies/boomer/boomer.json'
    });
    this.load.atlas({
      key: 'hunter',
      textureURL: 'enemies/hunter/hunter.png',
      normalMap: 'enemies/hunter/hunter_n.png',
      atlasURL: 'enemies/hunter/hunter.json'
    });
    this.load.atlas({
      key: 'smoker',
      textureURL: 'enemies/smoker/smoker.png',
      normalMap: 'enemies/smoker/smoker_n.png',
      atlasURL: 'enemies/smoker/smoker.json'
    });
    this.load.atlas({
      key: 'tank',
      textureURL: 'enemies/tank/tank.png',
      normalMap: 'enemies/tank/tank_n.png',
      atlasURL: 'enemies/tank/tank.json'
    });
    this.load.atlas({
      key: 'impact',
      textureURL: 'impact/impact.png',
      normalMap: 'impact/impact_n.png',
      atlasURL: 'impact/impact.json'
    });
    this.load.atlas({
      key: 'rock',
      textureURL: 'rock/rock.png',
      normalMap: 'rock/rock_n.png',
      atlasURL: 'rock/rock.json'
    });
    this.load.spritesheet('grenade', 'grenade.png', {
      frameWidth: 64, frameHeight: 64
    });
    this.load.spritesheet('healthbar', 'healthbar.png', {
      frameWidth: 64, frameHeight: 16
    });
    this.load.spritesheet('helpsign', 'helpsign.png', {
      frameWidth: 16, frameHeight: 16
    });

    // sounds
    this.load.audio('musicSound', 'audio/music.wav');

    // weapons
    this.load.audio('pistolsSound', 'audio/pistols.wav');
    this.load.audio('shotgunSound', 'audio/shotgun.wav');
    this.load.audio('uziSound', 'audio/uzi.wav');
    this.load.audio('rifleSound', 'audio/rifle.wav');
    this.load.audio('grenadeSound', 'audio/grenade.wav');

    //reloading
    this.load.audio('reloadingSound', 'audio/reloading.wav');

    //walking
    this.load.audio('walkingSound', 'audio/walking.wav');

    //zombie
    this.load.audio('zombie1Sound', 'audio/zombie/zombie-1.wav',{instances: 10});
    this.load.audio('zombie2Sound', 'audio/zombie/zombie-2.wav');
    this.load.audio('zombie3Sound', 'audio/zombie/zombie-3.wav');
    this.load.audio('zombie4Sound', 'audio/zombie/zombie-4.wav');
    this.load.audio('zombie5Sound', 'audio/zombie/zombie-5.wav');
    this.load.audio('zombie6Sound', 'audio/zombie/zombie-6.wav');
    this.load.audio('zombie7Sound', 'audio/zombie/zombie-7.wav');
    this.load.audio('zombie8Sound', 'audio/zombie/zombie-8.wav');
    this.load.audio('zombie9Sound', 'audio/zombie/zombie-9.wav');
    this.load.audio('zombiefast1Sound', 'audio/zombie/zombie-fast-1.wav');
    this.load.audio('zombiefast2Sound', 'audio/zombie/zombie-fast-2.wav');
    this.load.audio('zombiefast3Sound', 'audio/zombie/zombie-fast-3.wav');
    this.load.audio('zombiefast4Sound', 'audio/zombie/zombie-fast-4.wav');
    this.load.audio('zombiefast5Sound', 'audio/zombie/zombie-fast-5.wav');
    this.load.audio('zombiewaveSound', 'audio/zombie/zombie-wave.wav');

    //boomer
    this.load.audio('boomermusicSound', 'audio/boomer/boomer-music.wav');
    this.load.audio('boomerexplodeSound', 'audio/boomer/boomer-explode.wav');
    this.load.audio('boomercrySound', 'audio/boomer/boomer-cry.wav');
    this.load.audio('boomerattack1Sound', 'audio/boomer/boomer-attack-1.wav');
    this.load.audio('boomerattack2Sound', 'audio/boomer/boomer-attack-2.wav');
    this.load.audio('boomerattack3Sound', 'audio/boomer/boomer-attack-3.wav');

    //hunter
    this.load.audio('huntermusicSound', 'audio/hunter/hunter-music.wav');
    this.load.audio('hunterjumpSound', 'audio/hunter/hunter-jump.wav');
    this.load.audio('huntercrySound', 'audio/hunter/hunter-cry.wav');
    this.load.audio('hunterattack1Sound', 'audio/hunter/hunter-attack-1.wav');
    this.load.audio('hunterattack2Sound', 'audio/hunter/hunter-attack-2.wav');
    this.load.audio('hunterattack3Sound', 'audio/hunter/hunter-attack-3.wav');

    //smoker
    this.load.audio('smokermusicSound', 'audio/smoker/smoker-music.wav');
    this.load.audio('smokerdragSound', 'audio/smoker/smoker-drag.wav');
    this.load.audio('smokercrySound', 'audio/smoker/smoker-cry.wav');
    this.load.audio('smokerattack1Sound', 'audio/smoker/smoker-attack-1.wav');
    this.load.audio('smokerattack2Sound', 'audio/smoker/smoker-attack-2.wav');
    this.load.audio('smokerattack3Sound', 'audio/smoker/smoker-attack-3.wav');

    //tank
    this.load.audio('tankmusicSound', 'audio/tank/tank-music.wav');
    this.load.audio('tankwalkSound', 'audio/tank/tank-walk.wav');
    this.load.audio('tankattack1Sound', 'audio/tank/tank-attack-1.wav');
    this.load.audio('tankattack2Sound', 'audio/tank/tank-attack-2.wav');
    this.load.audio('tankattack3Sound', 'audio/tank/tank-attack-3.wav');
    this.load.audio('tankpickrockSound', 'audio/tank/tank-pick-rock.wav');
    this.load.audio('tankthrowSound', 'audio/tank/tank-throw.wav');
    this.load.audio('tankrockexplodeSound', 'audio/tank/tank-rock-explode.wav');
  }

  createAnims() {
    // bullet
    this.anims.create({
      key: 'bullet-fired',
      frames: this.anims.generateFrameNames('bullet', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'bullet-', suffix: '.png'
      }),
      frameRate: 24
    });

    // bill
    this.anims.create({
      key: 'bill-walk-left-down',
      frames: this.anims.generateFrameNames('bill', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'bill-walk-left-down-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });
    this.anims.create({
      key: 'bill-walk-left-up',
      frames: this.anims.generateFrameNames('bill', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'bill-walk-left-up-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });

    // louis
    this.anims.create({
      key: 'louis-walk-left-down',
      frames: this.anims.generateFrameNames('louis', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'louis-walk-left-down-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });
    this.anims.create({
      key: 'louis-walk-left-up',
      frames: this.anims.generateFrameNames('louis', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'louis-walk-left-up-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });

    // zoey
    this.anims.create({
      key: 'zoey-walk-left-down',
      frames: this.anims.generateFrameNames('zoey', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'zoey-walk-left-down-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });
    this.anims.create({
      key: 'zoey-walk-left-up',
      frames: this.anims.generateFrameNames('zoey', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'zoey-walk-left-up-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });

    // francis
    this.anims.create({
      key: 'francis-walk-left-down',
      frames: this.anims.generateFrameNames('francis', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'francis-walk-left-down-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });
    this.anims.create({
      key: 'francis-walk-left-up',
      frames: this.anims.generateFrameNames('francis', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'francis-walk-left-up-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });

    // impact
    this.anims.create({
      key: 'impact-anim',
      frames: this.anims.generateFrameNames('impact', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'impact-', suffix: '.png'
      }),
      frameRate: 12
    });

    // rock
    this.anims.create({
      key: 'rock-anim',
      frames: this.anims.generateFrameNames('rock', {
        start: 1, end: 5, zeroPad: 0,
        prefix: 'rock-', suffix: '.png'
      }),
      frameRate: 6
    });

    // zombie
    this.anims.create({
      key: 'zombie-walk-left-down',
      frames: this.anims.generateFrameNames('zombie', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'zombie-walk-left-down-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });
    this.anims.create({
      key: 'zombie-walk-left-up',
      frames: this.anims.generateFrameNames('zombie', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'zombie-walk-left-up-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });

    // boomer
    this.anims.create({
      key: 'boomer-walk-left-down',
      frames: this.anims.generateFrameNames('boomer', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'boomer-walk-left-down-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });
    this.anims.create({
      key: 'boomer-walk-left-up',
      frames: this.anims.generateFrameNames('boomer', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'boomer-walk-left-up-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });
    this.anims.create({
      key: 'boomer-explode',
      frames: this.anims.generateFrameNames('boomer', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'boomer-explode-', suffix: '.png'
      }),
      frameRate: 4
    });

    // hunter
    this.anims.create({
      key: 'hunter-walk-left-down',
      frames: this.anims.generateFrameNames('hunter', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'hunter-walk-left-down-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });
    this.anims.create({
      key: 'hunter-walk-left-up',
      frames: this.anims.generateFrameNames('hunter', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'hunter-walk-left-up-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });

    // smoker
    this.anims.create({
      key: 'smoker-walk-left-down',
      frames: this.anims.generateFrameNames('smoker', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'smoker-walk-left-down-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });
    this.anims.create({
      key: 'smoker-walk-left-up',
      frames: this.anims.generateFrameNames('smoker', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'smoker-walk-left-up-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });

    // tank
    this.anims.create({
      key: 'tank-walk-left-down',
      frames: this.anims.generateFrameNames('tank', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'tank-walk-left-down-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });
    this.anims.create({
      key: 'tank-walk-left-up',
      frames: this.anims.generateFrameNames('tank', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'tank-walk-left-up-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true
    });

    //grenade
    this.anims.create({
      key: 'grenade-explosion',
      frames: this.anims.generateFrameNumbers('grenade', {start:0, end:3}),
      frameRate: 6
    });

    //help sign
    this.anims.create({
      key: 'helpsign-anim',
      frames: this.anims.generateFrameNumbers('helpsign', {start:0, end:3}),
      frameRate: 6,
      yoyo: true,
      repeat: -1
    });
  }

  createAudio() {
    this.sounds = {};

    //background music
    this.sounds["music"] = this.sound.add('musicSound', {volume: 0.5, loop: true});

    //weapons
    this.sounds["pistols"] = this.sound.add('pistolsSound');
    this.sounds["shotgun"] = this.sound.add('shotgunSound');
    this.sounds["uzi"] = this.sound.add('uziSound');
    this.sounds["rifle"] = this.sound.add('rifleSound');
    this.sounds["grenade"] = this.sound.add('grenadeSound');

    //reloading
    this.sounds["reloading"] = this.sound.add('reloadingSound');

    //walking
    this.sounds["walking"] = this.sound.add('walkingSound');

    //zombie
    this.sounds["zombie"] = [];
    for(var i=0; i<9; i++){
      this.sounds.zombie[i] = this.sound.add('zombie'+ (i+1) +'Sound');
    }
    this.sounds["zombiefast"] = [];
    for(var i=0; i<5; i++){
      this.sounds.zombiefast[i] = this.sound.add('zombiefast'+ (i+1) +'Sound');
    }
    this.sounds["zombiewave"] = this.sound.add('zombiewaveSound');

    //boomer
    this.sounds["boomermusic"] = this.sound.add('boomermusicSound');
    this.sounds["boomerexplode"] = this.sound.add('boomerexplodeSound');
    this.sounds["boomercry"] = this.sound.add('boomercrySound');
    this.sounds["boomerattack"] = [];
    for(var i=0; i<3; i++){
      this.sounds.boomerattack[i] = this.sound.add('boomerattack'+ (i+1) +'Sound');
    }

    //hunter
    this.sounds["huntermusic"] = this.sound.add('huntermusicSound');
    this.sounds["hunterjump"] = this.sound.add('hunterjumpSound', {volume: 0.5});
    this.sounds["huntercry"] = this.sound.add('huntercrySound');
    this.sounds["hunterattack"] = [];
    for(var i=0; i<3; i++){
      this.sounds.hunterattack[i] = this.sound.add('hunterattack'+ (i+1) +'Sound');
    }

    //smoker
    this.sounds["smokermusic"] = this.sound.add('smokermusicSound');
    this.sounds["smokerdrag"] = this.sound.add('smokerdragSound');
    this.sounds["smokercry"] = this.sound.add('smokercrySound');
    this.sounds["smokerattack"] = [];
    for(var i=0; i<3; i++){
      this.sounds.smokerattack[i] = this.sound.add('smokerattack'+ (i+1) +'Sound');
    }

    //tank
    this.sounds["tankmusic"] = this.sound.add('tankmusicSound');
    this.sounds["tankwalk"] = this.sound.add('tankwalkSound');
    this.sounds["tankattack"] = [];
    for(var i=0; i<3; i++){
      this.sounds.tankattack[i] = this.sound.add('tankattack'+ (i+1) +'Sound');
    }
    this.sounds["tankpickrock"] = this.sound.add('tankpickrockSound');
    this.sounds["tankthrow"] = this.sound.add('tankthrowSound');
    this.sounds["tankrockexplode"] = this.sound.add('tankrockexplodeSound');

    // change music function
    this.sounds["changeMusic"] = function(newMusic) {
      this.sounds.music.pause();
      this.sounds[newMusic].play();

      this.sounds[newMusic].on('ended', function(music){
        this.sounds.music.resume();
      }, this);
      this.sounds[newMusic].on('stop', function(music){
        this.sounds.music.resume();
      }, this);
    }.bind(this);
  }

  create() {
    this.createAnims();
    this.createAudio();
    this.createStats();

    this.sounds.music.play();

    this.myLights = new Lights(this);
    this.level = new Level(this);
    this.allies = new Allies(this);
    this.enemies = new Enemies(this);
    this.bullets = new Bullets(this);
    this.aidirector = new AIDirector(this, this.allies, this.enemies);

    this.camera = this.cameras.main;
    this.camera.startFollow(this.allies.player, true, 0.02);
    this.camera.setZoom(3);

    this.isBeingRemoved = false;

    this.input.keyboard.on('keydown_ESC', function(){
      this.isBeingRemoved = true;
      this.scene.remove(this);
      this.scene.add('menuScene', MenuScene, true);;
    }, this);

    this.input.keyboard.on('keydown_ENTER', function(){
      this.isBeingRemoved = true;
      this.scene.remove(this);
      this.scene.add('endScene', EndScene, true);;
    }, this);
  }

  createStats() {
    window.gameplayStats = {
      startGameTime: Date.now(),
      bill: {
        name: 'bill',
        isPlayer: false,
        nbTimesIncapacited: 0,
        nbFirstAidKitsUsed: 0,
        nbZombiesKilled: 0,
        nbBoomersKilled: 0,
        nbHuntersKilled: 0,
        nbSmokersKilled: 0,
        nbDamageTaken: 0,
        nbRevivedTeammate: 0,
        nbBulletsFired: 0,
        nbBulletsHit: 0
      },
      louis: {
        name: 'louis',
        isPlayer: false,
        nbTimesIncapacited: 0,
        nbFirstAidKitsUsed: 0,
        nbZombiesKilled: 0,
        nbBoomersKilled: 0,
        nbHuntersKilled: 0,
        nbSmokersKilled: 0,
        nbDamageTaken: 0,
        nbRevivedTeammate: 0,
        nbBulletsShot: 0,
        nbBulletsHit: 0
      },
      zoey: {
        name: 'zoey',
        isPlayer: false,
        nbTimesIncapacited: 0,
        nbFirstAidKitsUsed: 0,
        nbZombiesKilled: 0,
        nbBoomersKilled: 0,
        nbHuntersKilled: 0,
        nbSmokersKilled: 0,
        nbDamageTaken: 0,
        nbRevivedTeammate: 0,
        nbBulletsShot: 0,
        nbBulletsHit: 0
      },
      francis: {
        name: 'francis',
        isPlayer: false,
        nbTimesIncapacited: 0,
        nbFirstAidKitsUsed: 0,
        nbZombiesKilled: 0,
        nbBoomersKilled: 0,
        nbHuntersKilled: 0,
        nbSmokersKilled: 0,
        nbDamageTaken: 0,
        nbRevivedTeammate: 0,
        nbBulletsShot: 0,
        nbBulletsHit: 0
      },
    };

  }

  update(time, delta) {
    if(!this.isBeingRemoved) {
      this.allies.update();
      this.aidirector.update(time, delta);
      this.myLights.update();
    }
  }

  end() {
    this.allies.clear();
    this.enemies.clear();

    // clear all timeouts
    window.timeouts.forEach(function(t){
      window.clearTimeout(t);
    });

    // clear all intervals
    window.intervals.forEach(function(i){
      window.clearInterval(i);
    });

    this.sounds.music.stop();
    this.isBeingRemoved = true;

    this.scene.remove(this);
    if(!this.scene.get('endScene')) {
      this.scene.add('endScene', EndScene, true);
    }
  }
}
