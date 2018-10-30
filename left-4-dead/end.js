class EndScene extends Phaser.Scene {

  preload() {
    this.load.setPath('assets/');
    this.load.image('endBkg', 'end/end.png');
  }

  createBackground() {
    this.bkg = this.add.image(384, 384, 'endBkg');
    this.bkg.setScrollFactor(0);
  }

  createStats() {
    var titleStyle = {fontStyle: 'bold', fontSize: '36px', fill: 'white'};
    var subtitleStyle = {fontStyle: 'bold', fontSize: '26px', fill: 'white'};
    this.textStyle = {fontStyle: 'bold', fontSize: '18px', fill: 'white'};
    this.playerStyle = {fontStyle: 'bold', fontSize: '18px', fill: '#CB904D'};

    var title = this.add.text(0, 125, 'Gameplay Stats', titleStyle);
    title.setX(384 - title.width/2);

    var totalTime = Math.floor((Date.now() - window.gameplayStats.startGameTime) / 1000);
    var totalText = this.add.text(0, 175, 'Total time: ' + totalTime, this.textStyle);
    totalText.setX(384 - totalText.width/2);

    // player stats
    this.addSortedStats(250, "Number of times incapacited", "nbTimesIncapacited", false);
    this.addSortedStats(350, "First aid kits used", "nbFirstAidKitsUsed", false);
    this.addSortedStats(450, "Boomers killed", "nbBoomersKilled");
    this.addSortedStats(550, "Hunters killed", "nbHuntersKilled");
    this.addSortedStats(650, "Smokers killed", "nbSmokersKilled");
    this.addSortedStats(750, "Common infected killed", "nbZombiesKilled");
    this.addSortedStats(850, "Took the least amount of damage", "nbDamageTaken", false);
    this.addSortedStats(950, "Healed the most teammates", "nbRevivedTeammate");

    // var playerAccuracy = Math.floor(100 * window.gameplayStats.player.nbBulletsHit / window.gameplayStats.player.nbBulletsFired);
    // this.add.text(150, 440, 'Overall accuracy: ' + playerAccuracy + "%", playerStyle);

    // all zombies killed
    var nbZombiesKilled = window.gameplayStats.bill.nbZombiesKilled +
      window.gameplayStats.bill.nbBoomersKilled +
      window.gameplayStats.bill.nbHuntersKilled +
      window.gameplayStats.bill.nbSmokersKilled;
    nbZombiesKilled += window.gameplayStats.zoey.nbZombiesKilled +
        window.gameplayStats.zoey.nbBoomersKilled +
        window.gameplayStats.zoey.nbHuntersKilled +
        window.gameplayStats.zoey.nbSmokersKilled;
    nbZombiesKilled += window.gameplayStats.louis.nbZombiesKilled +
        window.gameplayStats.louis.nbBoomersKilled +
        window.gameplayStats.louis.nbHuntersKilled +
        window.gameplayStats.louis.nbSmokersKilled;
    nbZombiesKilled += window.gameplayStats.francis.nbZombiesKilled +
        window.gameplayStats.francis.nbBoomersKilled +
        window.gameplayStats.francis.nbHuntersKilled +
        window.gameplayStats.francis.nbSmokersKilled;


    this.totalKills = this.add.text(0, 1250, nbZombiesKilled + ' zombies were harmed in the making of this film.', this.textStyle);
    this.totalKills.setX(384 - this.totalKills.width/2);
  }

  addSortedStats(topLeft, statText, statName, desc = true) {
    var billStat = window.gameplayStats.bill;
    var zoeyStat = window.gameplayStats.zoey;
    var francisStat = window.gameplayStats.francis;
    var louisStat = window.gameplayStats.louis;

    var stats = [billStat, zoeyStat, francisStat, louisStat];
    stats.sort(function(a, b)
    {
      return desc ? b[statName]-a[statName] : a[statName]-b[statName];
    }.bind(this));

    var title = this.add.text(150, topLeft, statText, style);
    title.setX(384 - title.width);

    for(var i=0; i<stats.length; i++) {
      var style = stats[i].isPlayer ? this.playerStyle : this.textStyle;
      this.add.text(384 + 16 , topLeft + i*20, stats[i][statName] + " " + stats[i].name, style);
    }
  }

  create() {
    this.createBackground();
    this.createStats();

    this.input.keyboard.on('keydown', function() {
      this.backToMenu();
    }, this);
  }

  update() {
    this.cameras.main.scrollY += 0.5;
    if(this.cameras.main.scrollY > 100)
      this.bkg.alpha -= 0.005;

    if(this.cameras.main.scrollY > this.totalKills.y + 48) {
      this.backToMenu();
    }
  }

  backToMenu() {
    this.scene.remove(this);
    this.scene.add('menuScene', MenuScene, true);
  }
}
