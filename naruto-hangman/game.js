window.Game = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Game () {
    Phaser.Scene.call(this, { key: 'game' });

    this.gameMusic;
    this.name;
    this.hangman;
    this.face;
    this.face_small_blur;
    this.face_big_blur;
    this.text;
    this.winText;
    this.loseText;
    this.nbErrors = 0;
  },

  preload: function() {
    this.load.image('background', 'assets/background.png');
    this.load.spritesheet('hangman', 'assets/hangman.png', {
      frameWidth: 400, frameHeight: 400
    });
    this.load.audio('gameMusic', 'assets/game.wav');
  },

  createBackground: function() {
    this.add.image(256, 128, 'background');
  },

  createImage: function() {
    var name = game.names[game.nameIndex];
    var name_small_blur = name + "-small-blur";
    var name_big_blur = name + "-big-blur";
    this.load.image(name, 'assets/characters/' + name + '.png');
    this.load.image(name_small_blur, 'assets/characters/' + name_small_blur + '.png');
    this.load.image(name_big_blur, 'assets/characters/' + name_big_blur + '.png');
    this.load.start();

    this.load.on('filecomplete-image-' + name, function (key, type, data) {
      this.face = this.add.image(428, 78, name);
      this.face.visible = false;
    }.bind(this));

    this.load.on('filecomplete-image-' + name_small_blur, function (key, type, data) {
      this.face_small_blur = this.add.image(428, 78, name_small_blur);
      this.face.visible = false;
    }.bind(this));

    this.load.on('filecomplete-image-' + name_big_blur, function (key, type, data) {
      this.face_big_blur = this.add.image(428, 78, name_big_blur);
    }.bind(this));
  },

  createText: function() {
    this.name = game.names[game.nameIndex];
    var text = this.name.replace(/./g, '_');
    text = text.split('').join(' ');

    var textStyle = {align: 'center', fontStyle: 'bold', fontSize: '38px', fill: 'white'};
    this.text = this.add.text(155, 210, text, textStyle);
    this.text.x = (game.canvas.width - this.text.width)/2;

    this.winText = this.add.text(155, 5, 'You Win !', textStyle);
    this.loseText = this.add.text(155, 5, 'You Lose !', textStyle);
    this.winText.visible = false;
    this.loseText.visible = false;
  },

  createHangman: function() {
    this.hangman = this.physics.add.sprite(256, 128, 'hangman');
    this.hangman.setScale(0.5);

    this.anims.create({
      key: 'start',
      frames: this.anims.generateFrameNumbers('hangman', {start:0, end:0}),
      frameRate: 3
    });
    this.anims.create({
      key: 'head',
      frames: this.anims.generateFrameNumbers('hangman', {start:1, end:1}),
      frameRate: 3
    });
    this.anims.create({
      key: 'chest',
      frames: this.anims.generateFrameNumbers('hangman', {start:2, end:2}),
      frameRate: 3
    });
    this.anims.create({
      key: 'right-leg',
      frames: this.anims.generateFrameNumbers('hangman', {start:3, end:3}),
      frameRate: 3
    });
    this.anims.create({
      key: 'left-leg',
      frames: this.anims.generateFrameNumbers('hangman', {start:4, end:4}),
      frameRate: 3
    });
    this.anims.create({
      key: 'right-arm',
      frames: this.anims.generateFrameNumbers('hangman', {start:5, end:5}),
      frameRate: 3
    });
    this.anims.create({
      key: 'left-arm',
      frames: this.anims.generateFrameNumbers('hangman', {start:6, end:6}),
      frameRate: 3
    });

    this.hangman.anims.play('start', true);
  },

  createAudio: function() {
    this.gameMusic = this.sound.add('gameMusic');
    this.gameMusic.volume = 0.2;
    this.gameMusic.loop = true;
    this.gameMusic.play();
  },

  createInputs: function() {
    //check doubletaps
    this.input.keyboard.on('keydown', function(event){
      if(this.isLetter(event.key)) {
        if(this.name.includes(event.key)) {
          this.revealLetter(event.key);
        } else {
          this.wrongGuess();
        }
      }
    }, this);
  },

  create: function () {
    this.createBackground();
    this.createImage();
    this.createText();
    this.createHangman();
    this.createAudio();
    this.createInputs();
  },

  isLetter: function(str) {
    return str.length === 1 && str.match(/[a-z]/i);
  },

  revealLetter: function(letter) {
    var indices = [];
    for(var i=0; i<this.name.length;i++) {
        if (this.name[i] === letter) indices.push(i);
    }

    var text = this.text.text.replace(/ /g,'');
    indices.forEach(function(i) {
      text = text.replaceAt(i, letter);
    });

    text = text.split('').join(' ').toUpperCase();
    this.text.setText(text);

    if(text.indexOf('_') == -1) {
      this.win();
    }
  },

  wrongGuess: function() {
    this.nbErrors += 1;

    var currentAnim = this.hangman.anims.currentAnim.key;

    if(currentAnim == "start") {
      this.hangman.anims.play('head', true);
    } else if(currentAnim == "head") {
      this.hangman.anims.play('chest', true);
    } else if(currentAnim == "chest") {
      this.hangman.anims.play('right-leg', true);
    } else if(currentAnim == "right-leg") {
      this.hangman.anims.play('left-leg', true);
    } else if(currentAnim == "left-leg") {
      this.hangman.anims.play('right-arm', true);
      this.face_big_blur.visible = false;
      this.face_small_blur.visible = true;
      this.face.visible = false;
    } else if(currentAnim == "right-arm") {
      this.hangman.anims.play('left-arm', true);
      this.lose();
    }
  },

  lose: function() {
    this.loseText.visible = true;
    this.face_big_blur.visible = false;
    this.face_small_blur.visible = false;
    this.face.visible = true;
    setTimeout(function(){this.scene.start();}.bind(this), 2000);
  },

  win: function() {
    this.winText.visible = true;
    this.face_big_blur.visible = false;
    this.face_small_blur.visible = false;
    this.face.visible = true;
    setTimeout(function(){this.nextName()}.bind(this), 2000);
  },

  nextName: function() {
    game.names.splice(game.nameIndex, 1);
    game.nameIndex = Math.floor(Math.random() * game.names.length);
    this.scene.start();
  }
});
