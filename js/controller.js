
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
		event = new AstroMath.Vector(event);
		if (event.x < 10 + 20 && event.x > 10) {
			if (event.y < window.innerHeight - 10 && event.y > window.innerHeight - 10 - 20) {
				window.location = "html/about.html";
			}
		}
	}
    
	this.mousedownHandler = function(event) {
		event = new AstroMath.Vector(event);
		this.mouseState = "DOWN";
		this.mousedownTime = new Date();
		
		this.mousedownLocation = event;
		this.mouseLocation = event;
		
		this.rand = Math.random();
	}
	
	this.mouseupHandler = function(event) {
		event = new AstroMath.Vector(event);
		if (this.mouseState == "DOWN") {
			this.newBodyTime = (new Date() - this.mousedownTime) / 1000;
			var vector = AstroMath.screenToCoordinatePlane(event);
			var newBody = Controller.createBody(vector, AstroMath.Vector.ZERO, this.newBodyTime, this.rand);
			myModel.addBody(newBody);
		} else if (this.mouseState == "MOVE") {
			var posVector_1 = AstroMath.screenToCoordinatePlane(this.mousedownLocation);
			var posVector_2 = AstroMath.screenToCoordinatePlane(event);
			var deltaVector = posVector_2.subtract(posVector_1);
			var newBody = Controller.createBody(posVector_1, deltaVector, this.newBodyTime, this.rand);
			myModel.addBody(newBody);
			
		}
		this.mouseState = "UP";
		
	}
	
	this.mousemoveHandler = function(event) {
		event = new AstroMath.Vector(event);
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
				var coordinateShift = AstroMath.screenToCoordinatePlane(event).subtract(AstroMath.screenToCoordinatePlane(this.mouseLocation))
				myViewer.center = myViewer.center.subtract(coordinateShift);
				this.mouseState = "PAN";
			}
		}
		this.mouseLocation = event;
	}
	
	this.mousewheelHandler = function(event) {
		if (event.wheelDelta > 0) {
			myViewer.zoomAt(new AstroMath.Vector(event), "IN");
		} else {
			myViewer.zoomAt(new AstroMath.Vector(event), "OUT");
		}
	}
}

Controller.createBody = function(positionVector, velocityVector, t, r) { // Remind Kevin to edit values
	velocityVector = velocityVector.scMult(2);
	if (t > 2)
	{
		var newBody = new Star(positionVector, velocityVector, t); // Remind Kevin to put stars.
	}
	else if (t < 1)
	{
		var newBody = new Moon(positionVector, velocityVector, t, r);
	}
	else
	{
		var newBody = new Planet(positionVector, velocityVector, t, r);
	}
	return newBody;
}
