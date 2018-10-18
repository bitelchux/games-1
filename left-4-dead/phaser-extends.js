Phaser.GameObjects.Sprite.prototype['rotateToward'] = function(point) {
  var rotation = Phaser.Math.Angle.Between(this.x, this.y, point.x, point.y);
  this.setRotation(rotation);
}

Phaser.Sound.WebAudioSound.prototype["playInSpace"] = function(scene, point) {
  var radius = 500;
  var playerCoord = scene.allies.player.getCenter();
  var distance = Phaser.Math.Distance.Between(playerCoord.x, playerCoord.y, point.x, point.y);
  var volume = 1 - distance/radius;
  if(volume < 0)
    volume = 0;
  this.setVolume(volume);
  this.play();
}
