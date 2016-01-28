var AstroMath = function() {};
	
AstroMath.distance = function(vectorA, vectorB) {
	var distance = Math.pow(Math.pow(vectorA.x - vectorB.x, 2) + Math.pow(vectorA.y - vectorB.y, 2), 0.5);
	return distance;
}

AstroMath.getAcceleration = function(body_1, body_2) {
	var d = body_2.getVector().subtract(body_1.getVector());
	var dist = d.norm();
	
	if (dist == 0) {
		return [0, 0];
	}
	var gravity = 1;
	var magnitude = gravity * body_2.mass / Math.pow(dist, 2);
	
	return d.scMult(1 / dist).scMult(magnitude);
}
	
AstroMath.coordinatePlaneToScreen = function(planeVector) {
	/**
	 * ScreenVec = (PlaneVec - ViewCenter) / Scale + ScreenCenter
	 */
	var windowCenter = AstroMath.Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var screenVector = planeVector.subtract(myViewer.center).scMult(1 / myViewer.scale).add(windowCenter);
	return screenVector;
}

AstroMath.screenToCoordinatePlane = function(screenVector) {
	/**
	 * PlaneVec = (ScreenVec - ScreenCenter) * Scale + ViewCenter
	 */
	var windowCenter = AstroMath.Vector.fromComponents(window.innerWidth / 2, window.innerHeight / 2);
	var planeVector = screenVector.subtract(windowCenter).scMult(myViewer.scale).add(myViewer.center);
	return planeVector;
}

AstroMath.timeToRadius = function(t) {
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

AstroMath.starColorFromRadius = function(radius) {
	if (radius < AstroMath.timeToRadius(2.5)) {
		return 7;
	} else if (radius < AstroMath.timeToRadius(15)) {
		var bigRadius = AstroMath.timeToRadius(15);
		var smallRadius = AstroMath.timeToRadius(2.5);
		var color = (bigRadius - radius) / (bigRadius - smallRadius) * 7;
		return color;
	} else {
		return 0;
	}
}

AstroMath.Vector = function(vector) {
	this.x = vector.x;
	this.y = vector.y;
}

AstroMath.Vector.fromComponents = function(x, y) {
	return new AstroMath.Vector({x : x, y : y});
}

AstroMath.Vector.prototype.add = function(vector) {
	return AstroMath.Vector.fromComponents(this.x + vector.x, this.y + vector.y);
}

AstroMath.Vector.prototype.subtract = function(vector) {
	return new AstroMath.Vector.fromComponents(this.x - vector.x, this.y - vector.y);
}

AstroMath.Vector.prototype.scMult = function(scalar) {
	return new AstroMath.Vector.fromComponents(this.x * scalar, this.y * scalar);
}

AstroMath.Vector.prototype.norm = function() {
	return AstroMath.distance(AstroMath.Vector.ZERO, this);
}

AstroMath.Vector.ZERO = AstroMath.Vector.fromComponents(0, 0);
