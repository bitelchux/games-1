window.Game = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Game () {
    Phaser.Scene.call(this, { key: 'game' });
    this.safe;
    this.player;
    this.tilemap;
    this.sounds = {};
  },

  preload: function() {
    this.load.setPath('assets/');

    // images
    this.load.image("forest", ["forest.png", "forest_n.png"]);
    this.load.tilemapTiledJSON("forestTilemap", "forest.json");
    this.load.atlas({
      key: 'player',
      textureURL: 'player/player.png',
      normalMap: 'player/player_n.png',
      atlasURL: 'player/player.json'
    });
    this.load.atlas({
      key: 'ally',
      textureURL: 'ally/ally.png',
      normalMap: 'ally/ally_n.png',
      atlasURL: 'ally/ally.json'
    });
    this.load.atlas({
      key: 'zombie',
      textureURL: 'enemies/zombie/zombie.png',
      normalMap: 'enemies/zombie/zombie_n.png',
      atlasURL: 'enemies/zombie/zombie.json'
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

    // sounds
    // weapons
    this.load.audio('pistolsSound', 'audio/pistols.wav');
    this.load.audio('shotgunSound', 'audio/shotgun.wav');
    this.load.audio('uziSound', 'audio/uzi.wav');
    this.load.audio('grenadeSound', 'audio/grenade.wav');

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

    //zombie
    this.load.audio('tankmusicSound', 'audio/tank/tank-music.wav');
    this.load.audio('tankwalkSound', 'audio/tank/tank-walk.wav');
    this.load.audio('tankattack1Sound', 'audio/tank/tank-attack-1.wav');
    this.load.audio('tankattack2Sound', 'audio/tank/tank-attack-2.wav');
    this.load.audio('tankattack3Sound', 'audio/tank/tank-attack-3.wav');
    this.load.audio('tankpickrockSound', 'audio/tank/tank-pick-rock.wav');
    this.load.audio('tankthrowSound', 'audio/tank/tank-throw.wav');
    this.load.audio('tankrockexplodeSound', 'audio/tank/tank-rock-explode.wav');
  },

  createAnims: function() {
    // player
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNames('player', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'player-walk-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'walk-pistols',
      frames: this.anims.generateFrameNames('player', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'player-walk-pistols-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'walk-shotgun',
      frames: this.anims.generateFrameNames('player', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'player-walk-shotgun-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'walk-uzi',
      frames: this.anims.generateFrameNames('player', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'player-walk-uzi-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'walk-grenade',
      frames: this.anims.generateFrameNames('player', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'player-walk-grenade-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'die',
      frames: this.anims.generateFrameNames('player', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'player-die-', suffix: '.png'
      }),
      frameRate: 12,
    });

    // ally
    this.anims.create({
      key: 'ally-walk',
      frames: this.anims.generateFrameNames('ally', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'ally-walk-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'ally-walk-pistols',
      frames: this.anims.generateFrameNames('ally', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'ally-walk-pistols-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'ally-walk-shotgun',
      frames: this.anims.generateFrameNames('ally', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'ally-walk-shotgun-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'ally-walk-uzi',
      frames: this.anims.generateFrameNames('ally', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'ally-walk-uzi-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'ally-walk-grenade',
      frames: this.anims.generateFrameNames('ally', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'ally-walk-grenade-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });
    this.anims.create({
      key: 'ally-die',
      frames: this.anims.generateFrameNames('ally', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'ally-die-', suffix: '.png'
      }),
      frameRate: 12,
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
      key: 'zombie-walk',
      frames: this.anims.generateFrameNames('zombie', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'zombie-walk-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });

    // tank
    this.anims.create({
      key: 'tank-walk',
      frames: this.anims.generateFrameNames('tank', {
        start: 1, end: 3, zeroPad: 0,
        prefix: 'tank-walk-', suffix: '.png'
      }),
      frameRate: 12,
      yoyo: true
    });

    //grenade
    this.anims.create({
      key: 'grenade-explosion',
      frames: this.anims.generateFrameNumbers('grenade', {start:0, end:3}),
      frameRate: 6
    });
  },

  createAudio: function() {
    //weapons
    this.sounds["pistols"] = this.sound.add('pistolsSound');
    this.sounds["shotgun"] = this.sound.add('shotgunSound');
    this.sounds["uzi"] = this.sound.add('uziSound');
    this.sounds["grenade"] = this.sound.add('grenadeSound');

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

    //tank
    this.sounds["tank"] = this.sound.add('tankwalkSound');
    this.sounds["tankmusic"] = this.sound.add('tankmusicSound');
    this.sounds["tankattack"] = [];
    for(var i=0; i<3; i++){
      this.sounds.tankattack[i] = this.sound.add('tankattack'+ (i+1) +'Sound');
    }
    this.sounds["tankpickrock"] = this.sound.add('tankpickrockSound');
    this.sounds["tankthrow"] = this.sound.add('tankthrowSound');
    this.sounds["tankrockexplode"] = this.sound.add('tankrockexplodeSound');

    // fade out function
    var that = this;
    this.sounds["fadeOut"] = function(sound, speed) {
      var sound = that.sounds[sound];
      var soundInterval = setInterval(function(){
        var volume = sound.volume - 0.1;
        if(volume < 0) {
          sound.stop();
          clearInterval(soundInterval);
          sound.setVolume(1);
        } else {
          sound.setVolume(volume);
        }
      }, speed);
    };
  },

  create: function () {
    this.createAnims();
    this.createAudio();
    this.player = new Player(this);
    this.enemies = new Enemies(this);
    this.forest = new Forest(this);
    this.healthbar = new HealthBar(this);
    this.myLights = new Lights(this);

    this.ally = new Ally(this);

    this.physics.add.collider(this.player.sprite, this.forest.obstaclesLayer);

    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setZoom(1);
  },

  update: function(time, delta) {
    this.player.update();
    this.ally.update(time, delta);
    this.enemies.update(time, delta);
    this.myLights.update();
  }
});
