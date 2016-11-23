"use strict;"
var Body = function(positionVector, velocityVector, radius) {
	this.type = 'Generic space body';
	this.positionVector = positionVector;
	this.velocityVector = velocityVector;
	this.radius = radius;
	this.survivalTime = 0;
	this.periapsis = Math.pow(10, 10);
	this.apoapsis = Math.pow(10, -10);
	this.getVector = function() {
		return this.positionVector;
	};
	this.move = function(dt) {
		this.survivalTime += dt;
		this.positionVector = this.positionVector.add(this.velocityVector.scMult(dt));
	};
	this.accelerate = function(accelVector, dt) {
		this.velocityVector = this.velocityVector.add(accelVector.scMult(dt));
	}
}
Body.STAR_DENSITY = 200;
Body.PLANET_DENSITY = 500;
Body.MOON_DENSITY = 300;

var Star = function(positionVector, velocityVector, t) {
	Body.call(this, positionVector, Vector.ZERO, t);
	this.type = 'Star';
	this.mass = Body.STAR_DENSITY * Math.pow(this.radius, 3);
}
Star.prototype.accept = function(visitor, args) {
  args.push(this);
  visitor.starMethod(args);
}

var Planet = function(positionVector, velocityVector, t, r) {
	Body.call(this, positionVector, velocityVector, t);
	this.type = 'Planet';
	this.mass = Body.PLANET_DENSITY * Math.pow(this.radius, 3);
	this.img = Math.floor(r * 5);
}
Planet.prototype.accept = function(visitor, args) {
  args.push(this);
  visitor.planetMethod(args);
}

var Moon = function(positionVector, velocityVector, t, r) {
	Body.call(this, positionVector, velocityVector, t);
	this.type = 'Moon';
	this.mass = Body.MOON_DENSITY * Math.pow(this.radius,3);
	this.img = Math.floor(r * 2);
}
Moon.prototype.accept = function(visitor, args) {
  args.push(this);
  visitor.moonMethod(args);
}
