var config = {
  type: Phaser.AUTO,
  width: 512,
  height: 256,
  zoom: 1.3,
  pixelArt: true,
  scene: [ window.Game ],
  physics: {
    default: 'arcade'
  },
};

var game = new Phaser.Game(config);

game["names"] = ["akamaru", "anko", "asuma", "baki", "chiyo", "choji", "danzo", "deidara", "dosu", "ebisu", "gaara", "gato", "guren", "haku", "hayate", "hidan", "hinata", "hiruzen", "inari", "ino", "iruka", "itachi", "jiraya", "jirobo", "jugo", "kabuto", "kakashi", "kakuzu", "kankuro", "karin", "kiba", "kidomaru", "killerbee", "kimimaro", "kisame", "konan", "konohamaru", "kurenai", "minato", "misumi", "mizuki", "naruto", "neji", "obito", "orochimaru", "pain", "pakkun", "rin", "rocklee", "sai", "sakura", "sasori", "sasuke", "shikamaru", "shino", "shizune", "sora", "suigetsu", "tayuya", "temari", "tenten", "tobi", "tsunade", "yamato", "yoroi", "zabuza", "zaku", "zetsu"];
game["nameIndex"] = Math.floor(Math.random() * game.names.length);

String.prototype.replaceAt=function(index, replacement) {
  return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}
