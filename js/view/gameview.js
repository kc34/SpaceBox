"use strict";
var GameView = function(model) {
	this.model = model;
	Panel.call(this, 0, 0, window.innerWidth, window.innerHeight);
	this.center = Vector.fromComponents(0, 0);
	this.scale = 1;
	this.images = getImages();

	this.sunResize = 4.0 / 3.0;
	this.planetResize = 4.0 / 3.0
	this.moonResize = 3.0 / 2.0;

	this.scalingFactor = 1.1;

	this.music = new Audio("assets/one_sly_move.mp3");
	this.music.play();

	this.name = "I am a GameView." // Placeholder name.
	this.mouseState = null;
	this.mousedownTime = null;
	this.mousedownLocation = null;
	this.mouseLocation = null;
	this.lastMouseLocation = null;
	this.GROW_MOVE_STOP_DIST = 10;
	this.newBodyTime = null;
	this.rand = null;
	this.ghostObject = null;

	/**
	 * This function will draw everything!
	 */
	this.drawPanel = function() {

		this.drawBackground();

		myModel.getBodies().forEach(this.drawObject, this);

    myModel.explosions.forEach(function(obj) {
      var screenVector = this.modelToViewCoordinate(obj.positionVector);
      var explosionRadius = 50 / this.scale;
      var x = screenVector.x //
      var y = screenVector.y //
      ctx.drawImage(this.images.explosion[obj.getSkinID()], x - explosionRadius, y - explosionRadius, 2 * explosionRadius, 2 * explosionRadius);

    }, this);

		if (this.getGhostBody() != null) {
			this.drawObject(this.getGhostBody());
		}

  }

  this.drawBackground = function() {
		var pictureSize = 2000 / Math.pow(this.scale, 0.2);
		for (var i = -10; i < 10; i++) {
			for (var j = -10; j < 10; j++) {
				var topLeft = Vector.fromComponents(i, j).scMult(pictureSize).add(this.center.scMult(-0.1 / this.scale));
				ctx.drawImage(this.images["background"][0], topLeft.x, topLeft.y, pictureSize, pictureSize);
			}
		}
	}

	this.drawObject = function(myObject) {

		// First order of business: know where to draw.
		var positionVector = myObject.positionVector;
		var screenVector = this.modelToViewCoordinate(positionVector);

		var screenRadius = myObject.radius / this.scale;
		var objectType;
		var skinId;

		if (Star.prototype.isPrototypeOf(myObject)) {
			screenRadius *= this.sunResize;
			screenRadius = Math.max(screenRadius, 20);
			objectType = "star";
			var skinData = GameView.starColorFromRadius(myObject.radius);
			var skinId = Math.floor(skinData);
			var progressToNext = skinData - skinId;
			var val1 = 1 - progressToNext;
			var val2 = progressToNext;
			var vector = screenVector;

			var radius = screenRadius;
			var glowRadius = radius * 8 / 5

			// Draw next.
			ctx.globalAlpha = val1;
			ctx.drawImage(this.images.glow[skinId],
				vector.x - glowRadius, vector.y - glowRadius,
				2 * glowRadius, 2 * glowRadius);

			if (progressToNext != 0) {
				ctx.globalAlpha = val2;
				ctx.drawImage(this.images.glow[skinId + 1],
					vector.x - glowRadius, vector.y - glowRadius,
					2 * glowRadius, 2 * glowRadius);
			}
			// Draw actual.
			ctx.globalAlpha = val1;
			ctx.drawImage(this.images.star[skinId],
				vector.x - radius, vector.y - radius,
				2 * radius, 2 * radius);
			if (progressToNext != 0) {

				ctx.globalAlpha = val2;

				ctx.drawImage(this.images.star[skinId + 1],
					vector.x - radius, vector.y - radius,
					2 * radius, 2 * radius);
			}
			ctx.globalAlpha = 1;

		} else if (Planet.prototype.isPrototypeOf(myObject)) {
			screenRadius *= this.planetResize;
			screenRadius = Math.max(screenRadius, 5);
			objectType = "planet";
			var skinId = myObject.img;
			ctx.drawImage(this.images[objectType][skinId],
				screenVector.x - screenRadius,
				screenVector.y - screenRadius,
				2 * screenRadius, 2 * screenRadius);
		} else if (Moon.prototype.isPrototypeOf(myObject)) {
			screenRadius *= this.moonResize;
			screenRadius = Math.max(screenRadius, 2);
			objectType = "moon";
			var skinId = myObject.img;
			ctx.drawImage(this.images[objectType][skinId],
				screenVector.x - screenRadius,
				screenVector.y - screenRadius,
				2 * screenRadius, 2 * screenRadius);
		}
	}

	/**
	 * Adjusts GameView center and scale s.t. screenVector will stay
	 * consistent with planeVector, but scale will change by
	 * scalingFactor.
	 */
	this.zoomAt = function(screenVector, direction) {
		if (direction == "OUT") {
			if (this.scale < 10) {
				// First, we need the mouse position in coordinate
				var mouseCoordinate = this.viewToModelCoordinate(screenVector);
				// Next, we need to measure the offset of that from the view center.
				var mouseOffset = mouseCoordinate.subtract(this.center);
				// Since we zoom out, the distance will become greater by the scaling factor.
				var scaledOffset = mouseOffset.scMult(this.scalingFactor);
				this.center = mouseCoordinate.subtract(scaledOffset);
				this.scale *= this.scalingFactor;
			}
		} else {
			// First, we need the mouse position in coordinate
			var mouseCoordinate = this.viewToModelCoordinate(screenVector);
			// Next, we need to measure the offset of that from the view center.
			var mouseOffset = mouseCoordinate.subtract(this.center);
			// Since we zoom out, the distance will become greater by the scaling factor.
			var scaledOffset = mouseOffset.scMult(1 / this.scalingFactor);
			this.center = mouseCoordinate.subtract(scaledOffset);
			this.scale /= this.scalingFactor;
		}
	}

	this.keyToFunctionMap = {
		"&" : function(gameView) { gameView.scale /= 1.5; },
		"(" : function(gameView) { gameView.scale = (gameView.scale > 10) ? gameView.scale : gameView.scale * 1.5; },
		" " : function(gameView) { gameView.model.running = !(gameView.model.running); },
		"S" : function(gameView) { gameView.center.y -= gameView.scale * 100; },
		"W" : function(gameView) { gameView.center.y += gameView.scale * 100; },
		"A" : function(gameView) { gameView.center.x -= gameView.scale * 100; },
		"D" : function(gameView) { gameView.center.x += gameView.scale * 100; }
	}

	this.getGhostBody = function() {
		// Time to draw a tentative star.
		if (this.mouseState == "DOWN") {
			// wait for time to be bigger than 0.25 seconds
			var t = new Date();
			t -= this.mousedownTime;
			t /= 1000;
			if (t > 0.25) {
				var planeVector = this.viewToModelCoordinate(this.mousedownLocation);
				var ghostObject = GameView.createBody(planeVector, Vector.ZERO, t, this.rand);
				return ghostObject;
			}
		} else if (this.mouseState == "MOVE") {
			ctx.strokeStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(this.mousedownLocation.x, this.mousedownLocation.y);
			ctx.lineTo(this.mouseLocation.x, this.mouseLocation.y);
			ctx.stroke();
			var planeVector = this.viewToModelCoordinate(this.mousedownLocation);
			var ghostObject = GameView.createBody(planeVector, Vector.ZERO, this.newBodyTime, this.rand);
			return ghostObject;
		} else {
			return null;
		}
	}
}

GameView.prototype = Object.create(Panel.prototype);

GameView.prototype.draw = function() {
  Panel.prototype.draw.call(this, ctx, 0, 0);
}

GameView.prototype.mousedownHandler = function(event) {
  event = new Vector(event);
  this.mouseState = "DOWN";
  this.mousedownTime = new Date();

  this.mousedownLocation = event;
  this.mouseLocation = event;

  this.rand = Math.random();
}

GameView.prototype.keydownHandler = function(keyEvent) {
  var keynum = window.event ? keyEvent.keyCode : keyEvent.which; // window.event = userIsIE
  var key = String.fromCharCode(keynum);
  this.keyToFunctionMap[key](this);
}

GameView.prototype.clickHandler = function(event) {
  // Used to be a link to the about page!
}

GameView.prototype.mouseupHandler = function(event) {
  event = new Vector(event);
  if (this.mouseState == "DOWN") {
    this.newBodyTime = (new Date() - this.mousedownTime) / 1000;
    var vector = this.viewToModelCoordinate(event);
    var newBody = GameView.createBody(vector, Vector.ZERO, this.newBodyTime, this.rand);
    myModel.addBody(newBody);
  } else if (this.mouseState == "MOVE") {
    var posVector_1 = this.viewToModelCoordinate(this.mousedownLocation);
    var posVector_2 = this.viewToModelCoordinate(event);
    var deltaVector = posVector_2.subtract(posVector_1);
    var newBody = GameView.createBody(posVector_1, deltaVector, this.newBodyTime, this.rand);
    myModel.addBody(newBody);

  }
  this.mouseState = "UP";

}

GameView.prototype.mousemoveHandler = function(event) {
  event = new Vector(event);
  var timeSinceMouseDown = (new Date() - this.mousedownTime) / 1000;

  if (this.mouseState == "DOWN" || this.mouseState == "PAN") {
    var mouseDelta = event.subtract(this.mousedownLocation);
    var dist = mouseDelta.norm();
    if (timeSinceMouseDown > 0.25 && this.mouseState != "PAN") {
      if (dist > this.GROW_MOVE_STOP_DIST) {
        this.mouseState = "MOVE";
        this.newBodyTime = (new Date() - this.mousedownTime) / 1000;
      }
    } else if (this.mouseState == "PAN" || (timeSinceMouseDown <= 0.25 && dist > this.GROW_MOVE_STOP_DIST)) {
      var coordinateShift = this.viewToModelCoordinate(event).subtract(this.viewToModelCoordinate(this.mouseLocation))
      this.center = this.center.subtract(coordinateShift);
      this.mouseState = "PAN";
    }
  }
  this.mouseLocation = event;
}

GameView.prototype.mousewheelHandler = function(event) {
  if (event.wheelDelta > 0) {
    this.zoomAt(Vector.fromComponents(event.clientX, event.clientY), "IN");
  } else {
    this.zoomAt(Vector.fromComponents(event.clientX, event.clientY), "OUT");
  }
}

GameView.prototype.modelToViewCoordinate = function(planeVector) {
	/**
	 * ScreenVec = (PlaneVec - ViewCenter) / Scale + ScreenCenter
	 */
	var windowCenter = Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var screenVector = planeVector.subtract(this.center).scMult(1 / this.scale).add(windowCenter);
	return screenVector;
}

GameView.prototype.viewToModelCoordinate = function(screenVector) {
	/**
	 * PlaneVec = (ScreenVec - ScreenCenter) * Scale + ViewCenter
	 */
	var windowCenter = Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var planeVector = screenVector.subtract(windowCenter).scMult(this.scale).add(this.center);
	return planeVector;
}

GameView.starColorFromRadius = function(radius) {
	if (radius < GameView.timeToRadius(2.5)) {
		return 7;
	} else if (radius < GameView.timeToRadius(15)) {
		var bigRadius = GameView.timeToRadius(15);
		var smallRadius = GameView.timeToRadius(2.5);
		var color = (bigRadius - radius) / (bigRadius - smallRadius) * 7;
		return color;
	} else {
		return 0;
	}
}

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
	if (t > 2)
	{
		var newBody = new Star(positionVector, velocityVector, radius); // Remind Kevin to put stars.
	}
	else if (t < 1)
	{
		var newBody = new Moon(positionVector, velocityVector, radius, rand);
	}
	else
	{
		var newBody = new Planet(positionVector, velocityVector, radius, rand);
	}
	return newBody;
}
