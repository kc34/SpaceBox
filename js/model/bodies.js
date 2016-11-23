"use strict;"
var Body = function(positionVector, velocityVector, radius) {
	this.type = 'Generic space body';
	this.positionVector = positionVector;
	this.velocityVector = velocityVector;
	this.radius = radius;
}
Body.prototype.getVector = function() {
  return this.positionVector;
};
Body.prototype.move = function(dt) {
  this.positionVector = this.positionVector.add(this.velocityVector.scMult(dt));
};
Body.prototype.accelerate = function(accelVector, dt) {
  this.velocityVector = this.velocityVector.add(accelVector.scMult(dt));
}
Body.prototype.getRadius = function() {
  return this.radius;
}
Body.STAR_DENSITY = 200;
Body.PLANET_DENSITY = 500;
Body.MOON_DENSITY = 300;

var Star = function(positionVector, velocityVector, radius) {
	Body.call(this, positionVector, velocityVector, radius);
	this.type = 'Star';
	this.mass = Body.STAR_DENSITY * Math.pow(this.radius, 3);
}
Star.prototype = Object.create(Body.prototype);
Star.prototype.accept = function(visitor, args) {
  args.push(this);
  visitor.starMethod(args);
}
Star.prototype.getRadius = function() {
  return Math.pow(this.mass / Body.STAR_DENSITY, 1.0 / 3);
}
Star.prototype.eat = function(otherBody) {
  // m_1v_1 + m_2v_2 = (m_1 + m_2)v_?
  // v_? = (m_1v_1 + m_2v_2)/(m_1 + m_2)
  // v_? = v_1 * (m_1)/(m_1 + m_2) to avoid overflow.
  var newMass = this.mass + otherBody.mass;
  var newVelocity = this.velocityVector.scMult(this.mass / (this.mass + otherBody.mass)).add(otherBody.velocityVector.scMult(otherBody.mass / (this.mass + otherBody.mass)));
  this.mass = newMass;
  this.velocityVector = newVelocity;
}

var Planet = function(positionVector, velocityVector, radius, rand) {
	Body.call(this, positionVector, velocityVector, radius);
	this.type = 'Planet';
	this.mass = Body.PLANET_DENSITY * Math.pow(this.radius, 3);
	this.img = Math.floor(rand * 5);
}
Planet.prototype = Object.create(Body.prototype);
Planet.prototype.accept = function(visitor, args) {
  args.push(this);
  visitor.planetMethod(args);
}
Planet.prototype.getRadius = function() {
  return Math.pow(this.mass / Body.PLANET_DENSITY, 1.0 / 3);
}

var Moon = function(positionVector, velocityVector, radius, rand) {
	Body.call(this, positionVector, velocityVector, radius);
	this.type = 'Moon';
	this.mass = Body.MOON_DENSITY * Math.pow(this.radius, 3);
	this.img = Math.floor(rand * 2);
}
Moon.prototype = Object.create(Body.prototype);
Moon.prototype.accept = function(visitor, args) {
  args.push(this);
  visitor.moonMethod(args);
}
Moon.prototype.getRadius = function() {
  return Math.pow(this.mass / Body.MOON_DENSITY, 1.0 / 3);
}
