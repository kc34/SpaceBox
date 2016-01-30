var Controller = function() {
	
	this.name = "I am a controller." // Placeholder name.
	this.mouseState = null;
	this.mousedownTime = null;
	this.mousedownLocation = null;
	this.mouseLocation = null;
	this.lastMouseLocation = null;
	this.GROW_MOVE_STOP_DIST = 10;
	this.newBodyTime = null;
	this.rand = null;
	this.ghostObject = null;
	
	this.keyToFunctionMap = {
		"&" : function() { myViewer.scale /= 1.5; },
		"(" : function() { myViewer.scale = (myViewer.scale > 10) ? myViewer.scale : myViewer.scale * 1.5; },
		" " : function() { myModel.running = !(myModel.running); },
		"W" : function() { myViewer.center.y += myViewer.scale * 100; },
		"S" : function() { myViewer.center.y -= myViewer.scale * 100; },
		"A" : function() { myViewer.center.x -= myViewer.scale * 100; },
		"D" : function() { myViewer.center.x += myViewer.scale * 100; }
	}
    
    this.keydownHandler = function(keyEvent) {
		var keynum = window.event ? keyEvent.keyCode : keyEvent.which; // window.event = userIsIE
		var key = String.fromCharCode(keynum);
		this.keyToFunctionMap[key]();
    }
    
    this.clickHandler = function(event) {
		event = new Vector(event);
		if (event.x < 10 + 20 && event.x > 10) {
			if (event.y < window.innerHeight - 10 && event.y > window.innerHeight - 10 - 20) {
				window.location = "html/about.html";
			}
		}
	}
    
	this.mousedownHandler = function(event) {
		event = new Vector(event);
		this.mouseState = "DOWN";
		this.mousedownTime = new Date();
		
		this.mousedownLocation = event;
		this.mouseLocation = event;
		
		this.rand = Math.random();
	}
	
	this.mouseupHandler = function(event) {
		event = new Vector(event);
		if (this.mouseState == "DOWN") {
			this.newBodyTime = (new Date() - this.mousedownTime) / 1000;
			var vector = Viewer.screenToCoordinatePlane(event);
			var newBody = Controller.createBody(vector, Vector.ZERO, this.newBodyTime, this.rand);
			myModel.addBody(newBody);
		} else if (this.mouseState == "MOVE") {
			var posVector_1 = Viewer.screenToCoordinatePlane(this.mousedownLocation);
			var posVector_2 = Viewer.screenToCoordinatePlane(event);
			var deltaVector = posVector_2.subtract(posVector_1);
			var newBody = Controller.createBody(posVector_1, deltaVector, this.newBodyTime, this.rand);
			myModel.addBody(newBody);
			
		}
		this.mouseState = "UP";
		
	}
	
	this.mousemoveHandler = function(event) {
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
				var coordinateShift = Viewer.screenToCoordinatePlane(event).subtract(Viewer.screenToCoordinatePlane(this.mouseLocation))
				myViewer.center = myViewer.center.subtract(coordinateShift);
				this.mouseState = "PAN";
			}
		}
		this.mouseLocation = event;
	}
	
	this.mousewheelHandler = function(event) {
		if (event.wheelDelta > 0) {
			myViewer.zoomAt(new Vector(event), "IN");
		} else {
			myViewer.zoomAt(new Vector(event), "OUT");
		}
	}
	
	this.getGhostBody = function() {
		// Time to draw a tentative star.
		if (this.mouseState == "DOWN") {
			// wait for time to be bigger than 0.25 seconds
			var t = new Date();
			t -= this.mousedownTime;
			t /= 1000;
			if (t > 0.25) {
				var planeVector = Viewer.screenToCoordinatePlane(this.mousedownLocation);
				var ghostObject = Controller.createBody(planeVector, Vector.ZERO, t, this.rand);
				return ghostObject;
			}
		} else if (myController.mouseState == "MOVE") {
			ctx.strokeStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(this.mousedownLocation.x, this.mousedownLocation.y);
			ctx.lineTo(this.mouseLocation.x, this.mouseLocation.y);
			ctx.stroke();
			var planeVector = Viewer.screenToCoordinatePlane(this.mousedownLocation);
			var ghostObject = Controller.createBody(planeVector, Vector.ZERO, this.newBodyTime, this.rand);
			return ghostObject;
		} else {
			return null;
		}
	}
}

Controller.timeToRadius = function(t) {
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

Controller.createBody = function(positionVector, velocityVector, t, rand) { // Remind Kevin to edit values
	velocityVector = velocityVector.scMult(2);
	var radius = Controller.timeToRadius(t);
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
