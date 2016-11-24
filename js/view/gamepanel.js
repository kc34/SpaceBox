"use strict";

/**
 * TODO: Fix keys (not very important)
 */
var GamePanel = function(model) {
	this.model = model;
	Panel.call(this, 0, 0, window.innerWidth, window.innerHeight);
  this.gameView = new GameView(this);

	this.scalingFactor = 1.1;

	this.music = new Audio("assets/one_sly_move.mp3");
	//this.music.play();

	this.name = "I am a GamePanel." // Placeholder name.
	this.mouseState = null;
	this.mousedownTime = null;
	this.mousedownLocation = null;
	this.GROW_MOVE_STOP_DIST = 10;
	this.rand = null;
	this.ghostObject = null;

  this.touchCache = [];

  /*
	this.keyToFunctionMap = {
		"&" : function(gameView) { gameView.scale /= 1.1; },
		"(" : function(gameView) { gameView.scale *= 1.1; },
		" " : function(gameView) { gameView.model.running = !(gameView.model.running); },
		"S" : function(gameView) { gameView.center.y -= gameView.scale * 100; },
		"W" : function(gameView) { gameView.center.y += gameView.scale * 100; },
		"A" : function(gameView) { gameView.center.x -= gameView.scale * 100; },
		"D" : function(gameView) { gameView.center.x += gameView.scale * 100; }
	}*/
}

GamePanel.prototype = Object.create(Panel.prototype);

GamePanel.prototype.getNewBodyTime = function() {
  if (this.mouseState == "DOWN") {
    return (new Date() - this.mousedownTime) / 1000;
  } else {
    return (this.throwTime - this.mousedownTime) / 1000;
  }
}

GamePanel.prototype.getMouseLocation = function() {
  if (this.touchCache.length > 0) {
    return Vector.fromComponents(this.touchCache[0].clientX, this.touchCache[0].clientY);
  }
  return null;
}

/*
Drawing
*/
/*
GamePanel.prototype.draw = function(ctx, offsetX, offsetY) {
  Panel.prototype.draw.call(this, ctx, 0, 0);
}*/

/**
 * This function will draw everything!
 */
GamePanel.prototype.drawPanel = function(ctx, windowX, windowY) {
  this.gameView.draw(ctx, windowX, windowY);
}


/*
Event handlers
*/

GamePanel.prototype.clickHandler = function(event) {
  // Used to be a link to the about page!
}

GamePanel.prototype.mousedownHandler = function(event) {
  this.pointerdownHandler({clientX: event.clientX, clientY: event.clientY, identifier: 0});
}

GamePanel.prototype.touchstartHandler = function(event) {
  this.pointerdownHandler({clientX: event.clientX, clientY: event.clientY, identifier: event.identifier});
}

GamePanel.prototype.pointerdownHandler = function(event) {
  this.touchCache.push(event);
  if (this.touchCache.length == 1) {
    event = new Vector({x : event.clientX, y : event.clientY});
    this.mouseState = "DOWN";
    this.mousedownTime = new Date();

    this.mousedownLocation = event;

    this.rand = Math.random();
  }
}

GamePanel.prototype.mouseupHandler = function(event) {
  this.pointerupHandler({clientX: event.clientX, clientY: event.clientY, identifier: 0});
}

GamePanel.prototype.touchendHandler = function(event) {
  this.pointerupHandler({clientX: event.clientX, clientY: event.clientY, identifier: event.identifier});
}

GamePanel.prototype.pointerupHandler = function(event) {
  if (this.touchCache.length == 1) {
    var vectorEvent = new Vector({x : event.clientX, y : event.clientY});
    if (this.mouseState == "DOWN") {
      var vector = this.gameView.viewToModelCoordinate(vectorEvent);
      var newBody = GameView.createBody(vector, Vector.ZERO, this.getNewBodyTime(), this.rand);
      myModel.addBody(newBody);
    } else if (this.mouseState == "MOVE") {
      var posVector_1 = this.gameView.viewToModelCoordinate(this.mousedownLocation);
      var posVector_2 = this.gameView.viewToModelCoordinate(vectorEvent);
      var deltaVector = posVector_2.subtract(posVector_1);
      var newBody = GameView.createBody(posVector_1, deltaVector, this.getNewBodyTime(), this.rand);
      myModel.addBody(newBody);
    }
    this.mouseState = "UP";
  }
  this.touchCache = this.touchCache.filter(function(touchEvent) {
    return touchEvent.identifier != event.identifier
  }, this);
  // Just to double-check
  if (this.touchCache.length == 0) {
    this.mouseState = "UP";
  }
}

GamePanel.prototype.mousemoveHandler = function(event) {
  this.pointermoveHandler({clientX: event.clientX, clientY: event.clientY, identifier: 0});
}

GamePanel.prototype.mousewheelHandler = function(event) {
  if (event.wheelDelta > 0) {
    this.gameView.zoomAt(Vector.fromComponents(event.clientX, event.clientY), 1 / this.scalingFactor);
  } else {
    this.gameView.zoomAt(Vector.fromComponents(event.clientX, event.clientY), this.scalingFactor);
  }
}


GamePanel.prototype.keydownHandler = function(keyEvent) {
  /*
  var keynum = window.event ? keyEvent.keyCode : keyEvent.which; // window.event = userIsIE
  var key = String.fromCharCode(keynum);
  this.keyToFunctionMap[key](this);*/
}

GamePanel.prototype.pointermoveHandler = function(event) {
  if (this.touchCache.length == 1) {
    var identifier = event.identifier;
    if (identifier == 0) {
      var vectorEvent = new Vector({x : event.clientX, y : event.clientY});
      var timeSinceMouseDown = (new Date() - this.mousedownTime) / 1000;

      if (this.mouseState == "DOWN" || this.mouseState == "PAN") {
        var mouseDelta = vectorEvent.subtract(this.mousedownLocation);
        var dist = mouseDelta.norm();
        if (timeSinceMouseDown > 0.25 && this.mouseState != "PAN") {
          if (dist > this.GROW_MOVE_STOP_DIST) {
            this.mouseState = "MOVE";
            this.throwTime = new Date();
          }
        } else if (this.mouseState == "PAN" || (timeSinceMouseDown <= 0.25 && dist > this.GROW_MOVE_STOP_DIST)) {
          var coordinateShift = vectorEvent.subtract(this.getMouseLocation()).scMult(this.gameView.getScale());
          this.gameView.pan(coordinateShift);
          this.mouseState = "PAN";
        }
      }
      this.touchCache[0] = event;
    }
  } else if (this.touchCache.length > 1) {
    // Cancel any panning or body creation.
    this.mouseState = "ZOOM";
    var identifier = event.identifier;
    var oldVec0 = Vector.fromComponents(this.touchCache[0].clientX, this.touchCache[0].clientY);
    var oldVec1 = Vector.fromComponents(this.touchCache[1].clientX, this.touchCache[1].clientY);
    var oldDist = Vector.distance(oldVec0, oldVec1);
    if (identifier == 0) {
      var newVec0 = Vector.fromComponents(event.clientX, event.clientY);
      var newDist = Vector.distance(newVec0, oldVec1);
      this.gameView.zoomAt(oldVec1, 1 / (newDist / oldDist));
      this.touchCache[0] = event;
    } else if (identifier == 1) {
      var newVec1 = Vector.fromComponents(event.clientX, event.clientY);
      var newDist = Vector.distance(oldVec0, newVec1);
      this.gameView.zoomAt(oldVec0, 1 / (newDist / oldDist));
      this.touchCache[1] = event;
    }

  }

}

GamePanel.prototype.touchmoveHandler = function(event) {
  this.pointermoveHandler(event);
}

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
