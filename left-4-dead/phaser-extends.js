Phaser.GameObjects.Sprite.prototype['rotateToward'] = function(point) {
  var rotation = Phaser.Math.Angle.Between(this.x, this.y, point.x, point.y);
  this.setRotation(rotation);
}
