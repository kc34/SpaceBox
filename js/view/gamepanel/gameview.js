

var GameView = function(controller) {
  this.camera = {position: Vector.fromComponents(0, 0), z: window.innerWidth / 2}
  this.FOV = 90;
  this.backgroundZ = 10000;

  this.explosionFrames = getExplosionFrames();
  this.backgroundImage = getBackgroundImage();

  this.controller = controller;
}

/*
Getters and Setters
*/

GameView.prototype.getScale = function() {
  return this.camera.z / (window.innerWidth / 2);
}

GameView.prototype.setScale = function(value) {
  this.camera.z = value * (window.innerWidth / 2);
}

GameView.prototype.getCenter = function() {
  return this.camera.position;
}

GameView.prototype.setCenter = function(value) {
  this.camera.position = value;
}

GameView.prototype.getBackgroundCenter = function() {
  return this.camera.position;
}

GameView.prototype.getBackgroundScale = function() {
  return (this.camera.z + this.backgroundZ) / (window.innerWidth / 2);
}

GameView.prototype.getZScale = function(z) {
  return (z + this.camera.z) / (window.innerWidth / 2);
}

/*
Semi-getters and Setters
*/

GameView.prototype.pan = function(deltaVector) {
  this.setCenter(this.getCenter().subtract(deltaVector));
}

/**
 * Adjusts GamePanel center and scale s.t. screenVector will stay
 * consistent with planeVector, but scale will change by
 * scalingFactor.
 */
GameView.prototype.zoomAt = function(screenVector, zoom) {
  if (this.camera.z * zoom < 10)
    return;
  if (this.camera.z * zoom > 25000)
    return;
  var mouseCoordinate = this.viewToModelCoordinate(screenVector);
  var mouseOffset = mouseCoordinate.subtract(this.getCenter());
  var scaledOffset = mouseOffset.scMult(zoom);
  this.setCenter(mouseCoordinate.subtract(scaledOffset));
  this.setScale(this.getScale() * zoom);
}

/*
drawing functions
*/


GameView.prototype.draw = function(ctx, windowX, windowY) {
  // Start by drawing the background (and clearing the screen!);
	this.drawBackground(ctx);

  // Draw each object.
	myModel.getBodies().forEach(function(obj) {
    obj.accept(DrawAlgo, [ctx, this]);
  }, this);

  // Draw each explosion
  myModel.explosions.forEach(function(obj) {
    var screenVector = this.modelToViewCoordinate(obj.positionVector);
    var explosionRadius = 50 / this.getScale();
    GameView.drawImageAt(ctx, this.explosionFrames[obj.getSkinID()], screenVector, explosionRadius);
  }, this);

  /*
  If the mouse has been down past the panning threshold, then the user is trying
  to create a new Body. Check for this, and draw the ghost body as needed.
  */
	var t = new Date();
	t -= this.controller.mousedownTime;
	t /= 1000;
	if (t > 0.25) {
    if (this.controller.mouseState == "MOVE" || this.controller.mouseState == "DOWN") {
      if (this.controller.mouseState == "MOVE") {
  			ctx.strokeStyle = "#FFFFFF";
  			ctx.beginPath();
  			ctx.moveTo(this.controller.mousedownLocation.x, this.controller.mousedownLocation.y);
  			ctx.lineTo(this.controller.getMouseLocation().x, this.controller.getMouseLocation().y);
  			ctx.stroke();
		  } else if (this.controller.mouseState == "DOWN") {
        this.controller.newBodyTime = t;
			}
      var modelVector = this.viewToModelCoordinate(this.controller.mousedownLocation);
      var ghostObject = GameView.createBody(modelVector, Vector.ZERO, this.controller.getNewBodyTime(), this.controller.rand);
      ghostObject.accept(DrawAlgo, [ctx, this]);
    }
	}
}

GameView.prototype.drawBackground = function(ctx) {

  ctx.globalAlpha = 1;

  var pictureSize = 20000 / this.getZScale(this.backgroundZ);
  var screenVector = this.zToViewCoordinate(this.backgroundZ, Vector.fromComponents(0, 0));

  for (var i = -10; i < 11; i++) {
    for (var j = -10; j < 11; j++) {
      GameView.drawImageAt(ctx, this.backgroundImage, screenVector.add(Vector.fromComponents(i, j).scMult(pictureSize)), pictureSize / 2);
    }
  }

  ctx.globalAlpha = 0.6;

  var pictureSize = 10000 / this.getZScale(this.backgroundZ / 2);
  var screenVector = this.zToViewCoordinate(this.backgroundZ / 2, Vector.fromComponents(pictureSize / 4, pictureSize / 10));

  for (var i = -10; i < 11; i++) {
    for (var j = -10; j < 11; j++) {
      GameView.drawImageAt(ctx, this.backgroundImage, screenVector.add(Vector.fromComponents(i, j).scMult(pictureSize)), pictureSize / 2);
    }
  }
  ctx.globalAlpha = 1;
}

/*
Helper functions to scale things
*/

GameView.prototype.modelToViewCoordinate = function(modelVector) {
	/**
	 * ScreenVec = (PlaneVec - ViewCenter) / Scale + ScreenCenter
	 */
	var viewCenter = Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var viewVector = modelVector.subtract(this.getCenter()).scMult(1 / this.getScale()).add(viewCenter);
	return viewVector;
}

GameView.prototype.viewToModelCoordinate = function(viewVector) {
	/**
	 * PlaneVec = (ScreenVec - ScreenCenter) * Scale + ViewCenter
	 */
	var viewCenter = Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var modelVector = viewVector.subtract(viewCenter).scMult(this.getScale()).add(this.getCenter());
	return modelVector;
}

GameView.prototype.zToViewCoordinate = function(z, backgroundVector) {
	/**
	 * ScreenVec = (PlaneVec - ViewCenter) / Scale + ScreenCenter
	 */
	var viewCenter = Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var viewVector = backgroundVector.subtract(this.getBackgroundCenter()).scMult(1 / this.getZScale(z)).add(viewCenter);
	return viewVector;
}

/*
Static functions
*/

GameView.timeToRadius = function(t) {
	if (t < 1) {
		return 2 * t + 2;
	} else if (t < 2) {
		return 10 * t;
	} else if (t < 2.5) {
		var myIteration = (t - 2) / (2.5 - 2) * 30;
		return easeOutBack(myIteration, 20, 105, 30);
	} else {
		return 50 * t;
	}
}

GameView.createBody = function(positionVector, velocityVector, t, rand) { // Remind Kevin to edit values
	velocityVector = velocityVector.scMult(2);
	var radius = GameView.timeToRadius(t);
	if (t > 2) {
		var newBody = new Star(positionVector, velocityVector, radius); // Remind Kevin to put stars.
	} else if (t < 1) {
		var newBody = new Moon(positionVector, velocityVector, radius, rand);
	} else {
		var newBody = new Planet(positionVector, velocityVector, radius, rand);
	}
	return newBody;
}

GameView.drawImageAt = function(ctx, image, viewPosition, viewRadius) {
  ctx.drawImage(
    image,
    viewPosition.x - viewRadius,
    viewPosition.y - viewRadius,
    2 * viewRadius,
    2 * viewRadius);
}
