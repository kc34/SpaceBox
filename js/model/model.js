"use strict";
/**
 * Hey guys! I'm going to write kind of a template here that you guys
 * can fill out however you like. If you want to change function names
 * or given variable names, let me know and I will update the other
 * files to reflect the changes!
 */

/**
 * The Model is a container for a set of bodies. You'll be able to
 * manipulate them through here!
 */

var Sector = function(){
	this.bodies = [];
  this.explosions = [];
	this.running = true;
	this.k = 5;
}

Sector.prototype.addBody = function(newBody) {
	this.bodies.push(newBody);
}
Sector.prototype.update = function(dt) {
	if (this.running) {
		for (var idx in this.bodies) {
			this.bodies[idx].move(dt);

			if (this.bodies.length > 1) {

				var accelVector = this.acceleration(this.bodies[idx]);

				this.bodies[idx].accelerate(accelVector, dt);
			}
		}

    var collisionCoordinates = this.collisionUpdate();
    for (idx in collisionCoordinates[0]) {
      this.explosions.push(new Explosion(collisionCoordinates[0][idx]));
    }
    for (idx in collisionCoordinates[1]) {
      this.explosions.push(new Explosion(collisionCoordinates[1][idx]));
    }

    this.collisionUpdate();

    for (var idx in this.explosions) {
      this.explosions[idx].update(dt);
      if (this.explosions[idx].age > 1) {
        this.explosions.splice(idx, 1);
      }
    }
	}
}
Sector.prototype.getBodies = function() {
	return this.bodies;
}

Sector.prototype.collisionUpdate = function(){
	var colArray = [[],[]]; // collision
	for (var idx = 0; idx < this.bodies.length - 1; idx++) {
		for (var idx2 = idx + 1; idx2 < this.bodies.length; idx2++) {
			if (idx != idx2) {
				var tDist = Vector.distance(this.bodies[idx].getVector(), this.bodies[idx2].getVector());
				var requiredSpace = this.bodies[idx].radius + this.bodies[idx2].radius;
				if (requiredSpace > tDist) {
					if (Star.prototype.isPrototypeOf(this.bodies[idx])) {
						var coor = this.bodies[idx2].getVector();
						this.bodies.splice(idx2, 1);
						colArray[0].push(coor);
					}
					else if (Star.prototype.isPrototypeOf(this.bodies[idx2])){
						var coor = this.bodies[idx].getVector();
						this.bodies.splice(idx, 1);
						colArray[0].push(coor);
					}
					else {
						var coor = this.bodies[idx].getVector().add(this.bodies[idx2].getVector()).scMult(0.5);
						this.bodies.splice(idx, 1);
						this.bodies.splice(idx2 - 1, 1);
						colArray[1].push(coor);
					}
				}
			}
		}
	}
	return colArray;
}

Sector.prototype.neighbor = function(body) {

	var distArray = [];
	var neighborArray = [];

	var orbitables = [];

	if (Moon.prototype.isPrototypeOf(body)) {
		orbitables = this.bodies.filter(function(body) {
			return (Planet.prototype.isPrototypeOf(body) ||
				Star.prototype.isPrototypeOf(body));
		});
	}
	else if (Planet.prototype.isPrototypeOf(body)) {
		orbitables = this.bodies.filter(function(body) {
			return Star.prototype.isPrototypeOf(body);
		});
	}

	if (orbitables.length != 0) {
		for (var idx in orbitables) {
			var dist = Vector.distance(body.getVector(), orbitables[idx].getVector());
			if (dist != 0){
				distArray.push(dist);
				neighborArray.push(orbitables[idx]);
			}
		}

		var minDist = distArray[0];
		for (var i = 1; i < distArray.length; i++) {
			if (distArray[i] < minDist) {
				minDist = distArray[i];
			}
		}
		var nidx = distArray.indexOf(minDist);
		var bestNeighbor = neighborArray[nidx];
		return bestNeighbor;
	} else {
		return null;
	}
}

// Gets gravitational acceleration on body1 from body2.
Sector.prototype.acceleration = function(body) {
  /*
  var bestNeighbor = this.neighbor(body);
	if (bestNeighbor != null) {
		return Sector.getAcceleration(body, bestNeighbor);
	} else {
		return Vector.ZERO;
	}
  */
  var accelerationVector = Vector.ZERO;
  for (var idx in this.bodies) {
    if (body != this.bodies[idx]) {
      accelerationVector = accelerationVector.add(Sector.getAcceleration(body, this.bodies[idx]));
    }
  }
  return accelerationVector;
}

Sector.getAcceleration = function(body_1, body_2) {
	var d = body_2.getVector().subtract(body_1.getVector());
	var dist = d.norm();

	if (dist == 0) {
		return Vector.ZERO;
	}
	var gravity = 1 / 5;
	var magnitude = gravity * body_2.mass / Math.pow(dist, 2);

	return d.scMult(1 / dist).scMult(magnitude);
}
