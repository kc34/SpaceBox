"use strict";
var Vector = function(vector) {
	this.x = vector.x;
	this.y = vector.y;
}

Vector.fromComponents = function(x, y) {
	return new Vector({x : x, y : y});
}

Vector.prototype.add = function(vector) {
	return Vector.fromComponents(this.x + vector.x, this.y + vector.y);
}

Vector.prototype.subtract = function(vector) {
	return new Vector.fromComponents(this.x - vector.x, this.y - vector.y);
}

Vector.prototype.scMult = function(scalar) {
	return new Vector.fromComponents(this.x * scalar, this.y * scalar);
}

Vector.distance = function(vectorA, vectorB) {
	var distance = Math.pow(Math.pow(vectorA.x - vectorB.x, 2) + Math.pow(vectorA.y - vectorB.y, 2), 0.5);
	return distance;
}

Vector.prototype.norm = function() {
	return Vector.distance(Vector.ZERO, this);
}

Vector.ZERO = Vector.fromComponents(0, 0);
