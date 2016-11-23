"use strict";

/**
 * TODO: Throw out layers, have a camera?
 */
var GameView = function(model) {
	this.model = model;
	Panel.call(this, 0, 0, window.innerWidth, window.innerHeight);
	this.center = Vector.fromComponents(0, 0);
  this.backgroundLayerCenter = Vector.fromComponents(0, 0);
	this.scale = 1;
  this.backgroundLayerScale = 1;
  this.explosionFrames = getExplosionFrames();
  this.backgroundImage = getBackgroundImage();

	this.scalingFactor = 1.1;

	this.music = new Audio("assets/one_sly_move.mp3");
	//this.music.play();

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
	this.drawPanel = function(ctx, windowX, windowY) {

    // Start by drawing the background (and clearing the screen!);
		this.drawBackground(ctx);

    // Draw each object.
		myModel.getBodies().forEach(function(obj) {
      obj.accept(DrawAlgo, [ctx, this]);
    }, this);

    // Draw each explosion
    myModel.explosions.forEach(function(obj) {
      var screenVector = this.modelToViewCoordinate(obj.positionVector);
      var explosionRadius = 50 / this.scale;
      GameView.drawImageAt(ctx, this.explosionFrames[obj.getSkinID()], screenVector, explosionRadius);
    }, this);

    /*
    If the mouse has been down past the panning threshold, then the user is trying
    to create a new Body. Check for this, and draw the ghost body as needed.
    */
		var t = new Date();
		t -= this.mousedownTime;
		t /= 1000;
		if (t > 0.25) {
      if (this.mouseState == "MOVE" || this.mouseState == "DOWN") {
        if (this.mouseState == "MOVE") {
    			ctx.strokeStyle = "#FFFFFF";
    			ctx.beginPath();
    			ctx.moveTo(this.mousedownLocation.x, this.mousedownLocation.y);
    			ctx.lineTo(this.mouseLocation.x, this.mouseLocation.y);
    			ctx.stroke();
  		  } else if (this.mouseState == "DOWN") {
          this.newBodyTime = t;
  			}
        var modelVector = this.viewToModelCoordinate(this.mousedownLocation);
        var ghostObject = GameView.createBody(modelVector, Vector.ZERO, this.newBodyTime, this.rand);
        ghostObject.accept(DrawAlgo, [ctx, this]);
      }
		}

  }

  this.drawBackground = function(ctx) {

    var screenVector = this.backgroundToViewCoordinate(Vector.fromComponents(0, 0));
    var pictureSize = 2000 / this.backgroundLayerScale;

    for (var i = -5; i < 6; i++) {
      for (var j = -5; j < 6; j++) {
        GameView.drawImageAt(ctx, this.backgroundImage, screenVector.add(Vector.fromComponents(i, j).scMult(pictureSize)), pictureSize / 2);
      }
    }

    ctx.fillStyle ="#FF0000";
    ctx.rect(screenVector.x, screenVector.y, 10, 10);
    ctx.fill();

    ctx.fillStyle ="#0000FF";
    var screenVector = this.modelToViewCoordinate(Vector.fromComponents(0, 0))
    ctx.rect(screenVector.x, screenVector.y, 10, 10);
    ctx.fill();
	}

	this.drawObject = function(ctx, myObject) {
    myObject.accept(DrawAlgo, [ctx, this]);
	}

	/**
	 * Adjusts GameView center and scale s.t. screenVector will stay
	 * consistent with planeVector, but scale will change by
	 * scalingFactor.
	 */
	this.zoomAt = function(screenVector, direction) {
		if (direction == "OUT") {
			// First, we need the mouse position in coordinate
			var mouseCoordinate = this.viewToModelCoordinate(screenVector);
			// Next, we need to measure the offset of that from the view center.
			var mouseOffset = mouseCoordinate.subtract(this.center);
			// Since we zoom out, the distance will become greater by the scaling factor.
			var scaledOffset = mouseOffset.scMult(this.scalingFactor);
			this.center = mouseCoordinate.subtract(scaledOffset);
			this.scale *= this.scalingFactor;

      var v1 = this.viewToBackgroundCoordinate(screenVector);
      var v2 = v1.subtract(this.backgroundLayerCenter);
      var v3 = v2.scMult(Math.pow(this.scalingFactor, 0.5));
      this.backgroundLayerCenter = v1.subtract(v3)
      this.backgroundLayerScale *= Math.pow(this.scalingFactor, 0.5);
      console.log(this.backgroundLayerScale);
		} else {
			// First, we need the mouse position in coordinate
			var mouseCoordinate = this.viewToModelCoordinate(screenVector);
			// Next, we need to measure the offset of that from the view center.
			var mouseOffset = mouseCoordinate.subtract(this.center);
			// Since we zoom out, the distance will become greater by the scaling factor.
			var scaledOffset = mouseOffset.scMult(1 / this.scalingFactor);
			this.center = mouseCoordinate.subtract(scaledOffset);
			this.scale /= this.scalingFactor;

      var v1 = this.viewToBackgroundCoordinate(screenVector);
      var v2 = v1.subtract(this.backgroundLayerCenter);
      var v3 = v2.scMult(1 / Math.pow(this.scalingFactor, 0.5));
      this.backgroundLayerCenter = v1.subtract(v3)
      this.backgroundLayerScale /= Math.pow(this.scalingFactor, 0.5);
		}

    if (this.scale > 100) {
      this.scale = 100;
    }

    if (this.scale < 0.01) {
      this.scale = 0.01;
    }
	}

	this.keyToFunctionMap = {
		"&" : function(gameView) { gameView.scale /= 1.1; },
		"(" : function(gameView) { gameView.scale *= 1.1; },
		" " : function(gameView) { gameView.model.running = !(gameView.model.running); },
		"S" : function(gameView) { gameView.center.y -= gameView.scale * 100; },
		"W" : function(gameView) { gameView.center.y += gameView.scale * 100; },
		"A" : function(gameView) { gameView.center.x -= gameView.scale * 100; },
		"D" : function(gameView) { gameView.center.x += gameView.scale * 100; }
	}
}

GameView.prototype = Object.create(Panel.prototype);

GameView.prototype.draw = function(ctx, offsetX, offsetY) {
  Panel.prototype.draw.call(this, ctx, 0, 0);
}

GameView.prototype.pan = function(deltaVector) {
  this.center = this.center.subtract(deltaVector);
}

GameView.prototype.mousedownHandler = function(event) {
  event = new Vector({x : event.clientX, y : event.clientY});
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
  event = new Vector({x : event.clientX, y : event.clientY});
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
  event = new Vector({x : event.clientX, y : event.clientY});
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
      // var coordinateShift = this.viewToModelCoordinate(event).subtract(this.viewToModelCoordinate(this.mouseLocation))
      //
      var coordinateShift = event.subtract(this.mouseLocation).scMult(this.scale);
      this.pan(coordinateShift);
      // this.center = this.center.subtract(coordinateShift);

      var v1 = this.viewToBackgroundCoordinate(event).subtract(this.viewToBackgroundCoordinate(this.mouseLocation))
      this.backgroundLayerCenter = this.backgroundLayerCenter.subtract(v1.scMult(0.5));
      this.mouseState = "PAN";

      console.log(this.backgroundLayerCenter)
      console.log(this.center)
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

GameView.prototype.modelToViewCoordinate = function(modelVector) {
	/**
	 * ScreenVec = (PlaneVec - ViewCenter) / Scale + ScreenCenter
	 */
	var viewCenter = Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var viewVector = modelVector.subtract(this.center).scMult(1 / this.scale).add(viewCenter);
	return viewVector;
}

GameView.prototype.viewToModelCoordinate = function(viewVector) {
	/**
	 * PlaneVec = (ScreenVec - ScreenCenter) * Scale + ViewCenter
	 */
	var viewCenter = Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var modelVector = viewVector.subtract(viewCenter).scMult(this.scale).add(this.center);
	return modelVector;
}

GameView.prototype.backgroundToViewCoordinate = function(backgroundVector) {
	/**
	 * ScreenVec = (PlaneVec - ViewCenter) / Scale + ScreenCenter
	 */
	var viewCenter = Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var viewVector = backgroundVector.subtract(this.backgroundLayerCenter).scMult(1 / this.backgroundLayerScale).add(viewCenter);
	return viewVector;
}

GameView.prototype.viewToBackgroundCoordinate = function(viewVector) {
	/**
	 * PlaneVec = (ScreenVec - ScreenCenter) * Scale + ViewCenter
	 */
	var viewCenter = Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var backgroundVector = viewVector.subtract(viewCenter).scMult(this.backgroundLayerScale).add(this.backgroundLayerCenter);
	return backgroundVector;
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
