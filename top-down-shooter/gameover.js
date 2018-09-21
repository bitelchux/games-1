window.Gameover = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function Gameover () {
      Phaser.Scene.call(this, { key: 'gameover' });

      this.menuMusic;
      this.scoreBoard = {scores: []};
      this.textGroup;
      this.threeLetters = ["A","_","_"];
      this.allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  },

  preload: function() {
    this.getScoreboardOnline();
  },

  getScoreboardOnline: function() {
    var that = this;
    $.get("https://api.myjson.com/bins/j7ywk", function(data, textStatus, jqXHR) {
      that.scoreBoard = data;
      that.addScore(window.score);
      that.setInputs();
    });
  },

  setInputs: function() {
    this.input.keyboard.on('keydown_ESC', function(){
      location.reload();
    }, this);

    this.input.keyboard.on('keydown_ENTER', function(){
      this.save();
    }, this);

    this.input.keyboard.on('keydown_RIGHT', this.nextLetter, this);
    this.input.keyboard.on('keydown_LEFT', this.previousLetter, this);
    this.input.keyboard.on('keydown_UP', this.incrementLetter, this);
    this.input.keyboard.on('keydown_DOWN', this.decrementLetter, this);
  },

  createScoreboard: function() {
    // titles
    var titleStyle = {fontStyle: 'bold', fontSize: '24px', fill: 'white'};
    var titles = this.add.text(70, 20, 'HIGH KILLS', titleStyle);
    this.textGroup = {titles: titles, lines: []};
  },

  addScore: function(score) {
    this.threeLetters = ["A","_","_"];
    this.scoreBoard.scores.push({isMine: true, score: score, name: "A _ _"});

    this.orderScores();
    this.updateScoreboard();
  },

  orderScores: function() {
    this.scoreBoard.scores.sort(function(a,b) {
      if(a.score > b.score)
        return -1;
      if(a.score < b.score)
        return 1;
      return 0;
    });
  },

  updateScoreboard: function() {
    //destroy all lines
    this.textGroup.lines.forEach(function(line) {
      line.rank.destroy();
      line.score.destroy();
      line.name.destroy();
    });
    this.textGroup.lines = [];

    //create new lines
    var scoreStyle = {fontStyle: 'bold', fontSize: '16px'};

    var index = 1;
    this.scoreBoard.scores.slice(0,3).forEach(function(score) {

      if(score.isMine) {
        scoreStyle.fill = 'white';
      } else {
        scoreStyle.fill = 'grey';
      }

      var rankText = this.add.text(50, 40 + 30*index, index + ":", scoreStyle);
      var nameText = this.add.text(100, 40 + 30*index, score.name, scoreStyle);
      var scoreText = this.add.text(200, 40 + 30*index, score.score, scoreStyle);

      var line = {isMine: score.isMine, rank: rankText, score: scoreText, name: nameText};
      this.textGroup.lines.push(line);

      index += 1;
    }.bind(this));

    //if new score is not among first 3, show it below all scores
    var index = this.scoreBoard.scores.findIndex(function(score) {
      return score.isMine;
    });
    if(index > 2) {
      var score = this.scoreBoard.scores[index];
      var scoreStyle = {fontStyle: 'bold', fontSize: '16px', fill: 'white'};

      var rankText = this.add.text(50, 200, index + ":", scoreStyle);
      var nameText = this.add.text(100, 200, score.name, scoreStyle);``
      var scoreText = this.add.text(200, 200, score.score, scoreStyle);

      var line = {isMine: score.isMine, rank: rankText, score: scoreText, name: nameText};
      this.textGroup.lines.push(line);
    }
  },

  create: function () {
    this.createScoreboard();
  },

  save: function() {
    //save scoreBoard object
    var name = this.threeLetters[0] + " " +
    this.threeLetters[1] + " " +
    this.threeLetters[2];

    this.scoreBoard.scores.forEach(function(score) {
      if(score.isMine) {
        score.name = name;
      }
      score.isMine = false;
    });

    this.scoreBoard.scores = this.scoreBoard.scores.slice(0,3);

    $.ajax({
      url:"https://api.myjson.com/bins/j7ywk",
      type:"PUT",
      data:JSON.stringify(this.scoreBoard),
      contentType:"application/json; charset=utf-8",
      dataType:"json",
      success: function(data, textStatus, jqXHR){
        location.reload();
      }
    });
  },

  updateName: function() {
    var index = this.textGroup.lines.findIndex(function(line) {
      return line.isMine;
    });
    this.textGroup.lines[index].name.setText(
      this.threeLetters[0] + " " +
      this.threeLetters[1] + " " +
      this.threeLetters[2]
    );
  },

  nextLetter: function() {
    if(this.threeLetters[1] == '_') {
      this.threeLetters[1] = 'A';
    } else {
      this.threeLetters[2] = 'A';
    }

    this.updateName();
  },
  previousLetter: function() {
    if(this.threeLetters[2] != '_') {
      this.threeLetters[2] = '_';
    } else {
      this.threeLetters[1] = '_';
    }

    this.updateName();
  },
  incrementLetter: function() {
    var currentIndex;
    if(this.threeLetters[1] == '_') {
      currentIndex = 0;
    } else if(this.threeLetters[2] == '_') {
      currentIndex = 1;
    } else {
      currentIndex = 2;
    }

    var currentLetter = this.threeLetters[currentIndex];

    var i = this.allLetters.indexOf(currentLetter);
    if(i+1 < this.allLetters.length) {
      this.threeLetters[currentIndex] = this.allLetters[i+1];
    } else {
      this.threeLetters[currentIndex] = 'A';
    }

    this.updateName();
  },
  decrementLetter: function() {
    var currentIndex;
    if(this.threeLetters[1] == '_') {
      currentIndex = 0;
    } else if(this.threeLetters[2] == '_') {
      currentIndex = 1;
    } else {
      currentIndex = 2;
    }

    var currentLetter = this.threeLetters[currentIndex];

    var i = this.allLetters.indexOf(currentLetter);
    if(i > 0) {
      this.threeLetters[currentIndex] = this.allLetters[i-1];
    } else {
      this.threeLetters[currentIndex] = 'Z';
    }

    this.updateName();
  }
});
