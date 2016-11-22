var Explosion = function(positionVector) {
  this.positionVector = positionVector;
  this.age = 0.0;
}

Explosion.prototype.update = function(TIME_STEP) {
  this.age += TIME_STEP;
}

Explosion.prototype.getSkinID = function() {
  var timePerSkin = 1.0 / 16.0;
  var skinID = Math.floor(this.age / timePerSkin);
  return Math.min(15, skinID);
}
