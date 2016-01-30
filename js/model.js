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
	this.running = true;
	this.highScore = 0;
	this.score = 0;
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
			this.collisionUpdate();
		}
	}
	var score = 0;
	for (var idx in this.bodies) {
		if (Planet.prototype.isPrototypeOf(this.bodies[idx])) {
			var neighbor = this.neighbor(this.bodies[idx]);
			if (neighbor != null) {
				var distance = Vector.distance(this.bodies[idx].positionVector, neighbor.positionVector);
				this.bodies[idx].periapsis = Math.min(this.bodies[idx].periapsis, distance);
				this.bodies[idx].apoapsis = Math.max(this.bodies[idx].apoapsis, distance);
				var eccentricity = (this.bodies[idx].apoapsis - this.bodies[idx].periapsis) / (this.bodies[idx].apoapsis + this.bodies[idx].periapsis);
				if (this.bodies[idx].survivalTime > 1 && eccentricity < 1) {
					score += 100 * (1 - eccentricity);
				}
			}
		}
	}
	this.score = Math.floor(score);
	if (this.score > this.highScore) {
		this.highScore = this.score;
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
				if (requiredSpace > tDist){
					console.log("COLLISION DETECTED", requiredSpace, tDist)
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
						console.log(this.bodies, idx);
						console.log("Removing!", this.bodies[idx]);
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
	var bestNeighbor = this.neighbor(body);
	if (bestNeighbor != null) {
		return Sector.getAcceleration(body, bestNeighbor);
	} else {
		return Vector.ZERO;
	}
}

Sector.getAcceleration = function(body_1, body_2) {
	var d = body_2.getVector().subtract(body_1.getVector());
	var dist = d.norm();
	
	if (dist == 0) {
		return [0, 0];
	}
	var gravity = 1 / 5;
	var magnitude = gravity * body_2.mass / Math.pow(dist, 2);
	
	return d.scMult(1 / dist).scMult(magnitude);
}


