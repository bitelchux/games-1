class MenuScene extends Phaser.Scene {

  preload() {
    this.load.setPath('assets/');

    this.load.image('menuBkg', 'menu/menu.png');

    this.load.image('billPhoto', 'bill/bill-photo.png');
    this.load.image('zoeyPhoto', 'zoey/zoey-photo.png');
    this.load.image('francisPhoto', 'francis/francis-photo.png');
    this.load.image('louisPhoto', 'louis/louis-photo.png');

    this.load.image("pistolsPhoto", "weapons/pistols.png");
    this.load.image("shotgunPhoto", "weapons/shotgun.png");
    this.load.image("uziPhoto", "weapons/uzi.png");
    this.load.image("riflePhoto", "weapons/rifle.png");

    this.load.atlas({
      key: 'zombie',
      textureURL: 'enemies/zombie/zombie.png',
      normalMap: 'enemies/zombie/zombie_n.png',
      atlasURL: 'enemies/zombie/zombie.json'
    });
  }

  createBackground() {
    this.add.image(384, 384, 'menuBkg');
  }

  createTexts() {
    var textStyle = {fontStyle: 'bold', fontSize: '48px', fill: '#24281F'};
    var slashText = this.add.text(150, 260, 'Choose a survivor', textStyle);
    slashText.setDepth(250);
  }

  createSurvivors() {
    this.survivors = ["bill", "zoey", "francis", "louis"];

    this.bill = this.add.image(100, 400, 'billPhoto');
    this.zoey = this.add.image(285, 400, 'zoeyPhoto');
    this.francis = this.add.image(485, 400, 'francisPhoto');
    this.louis = this.add.image(668, 400, 'louisPhoto');

    this.bill["weapon"] = this.add.image(100, 450, 'shotgunPhoto');
    this.zoey["weapon"] = this.add.image(285, 450, 'uziPhoto');
    this.francis["weapon"] = this.add.image(485, 450, 'riflePhoto');
    this.louis["weapon"] = this.add.image(668, 450, 'pistolsPhoto');
    this.bill.weapon.setScale(4);
    this.zoey.weapon.setScale(4);
    this.francis.weapon.setScale(4);
    this.louis.weapon.setScale(4);

    var textStyle = {fontStyle: 'bold', fontSize: '24px', fill: '#24281F'};
    this.bill["title"] = this.add.text(75, 480, 'Bill', textStyle);
    this.zoey["title"] = this.add.text(260, 480, 'Zoey', textStyle);
    this.francis["title"] = this.add.text(440, 480, 'Francis', textStyle);
    this.louis["title"] = this.add.text(630, 480, 'Louis', textStyle);
    this.bill.title.setDepth(480);
    this.zoey.title.setDepth(480);
    this.francis.title.setDepth(480);
    this.louis.title.setDepth(480);

    this.survivorIndex = 0;
    this.updateSurvivorSelection();
  }

  createZombies() {
    // zombie
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNames('zombie', {
        start: 1, end: 2, zeroPad: 0,
        prefix: 'zombie-walk-left-down-', suffix: '.png'
      }),
      frameRate: 6,
      yoyo: true,
      repeat: -1
    });

    var x = config.width + 16;
    var y = Math.random() * config.height;
    this.addZombie(x, y);

    this.timeout();
  }

  timeout() {
    setTimeout(function () {
      var x = config.width + 16;
      var y = Math.random() * config.height;
      this.addZombie(x, y);
      this.timeout();
    }.bind(this), 1000 + Math.floor(Math.random()*3000));
  }

  create() {
    this.createBackground();
    this.createTexts();
    this.createSurvivors();
    this.createZombies();

    this.input.keyboard.on('keydown_ENTER', function() {
      window.selectedName = this.survivors[this.survivorIndex];
      this.scene.remove(this);
      this.scene.add('gameScene', GameScene, true);
    }, this);

    this.input.keyboard.on('keydown_LEFT', function() {
      this.moveSelectionLeft();
    }, this);

    this.input.keyboard.on('keydown_RIGHT', function() {
      this.moveSelectionRight();
    }, this);
  }

  addZombie(x, y) {
    var zombie = this.physics.add.sprite(x, y, 'zombie');
    zombie.anims.play('walk');
    zombie.setVelocity(-16 + (Math.floor(Math.random()*-16*3)),0);
    zombie.setDepth(y);
    zombie.setScale(4);
  }

  updateSurvivorSelection() {
    var selectedName = this.survivors[this.survivorIndex];
    for(var i=0; i<this.survivors.length; i++) {
      var name = this.survivors[i];
      if(name == selectedName) {
        this[name].setTint(0xFFFFFF);
        this[name].weapon.setTint(0xFFFFFF);
        this[name].title.setTint(0xFFFFFF);
      } else {
        this[name].setTint(0x666666);
        this[name].weapon.setTint(0x666666);
        this[name].title.setTint(0x666666);
      }
    };
  }

  modulo(x,n) {
      return ((x%n)+n)%n;
  }

  moveSelectionRight() {
    this.survivorIndex = this.modulo((this.survivorIndex + 1), this.survivors.length);
    this.updateSurvivorSelection();
  }

  moveSelectionLeft() {
    this.survivorIndex = this.modulo((this.survivorIndex - 1), this.survivors.length);
    this.updateSurvivorSelection();
  }
}
