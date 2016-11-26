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
