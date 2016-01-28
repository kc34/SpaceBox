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
		for (var Idx in this.bodies) {
			this.bodies[Idx].move(dt);
			
			if (this.bodies.length > 1) {
				
				var accelVector = this.acceleration(this.bodies[Idx]);
				
				this.bodies[Idx].accelerate(accelVector, dt);
			}
			this.collisionUpdate();
		}
	}
	var score = 0;
	for (var Idx in this.bodies) {
		if (Planet.prototype.isPrototypeOf(this.bodies[Idx])) {
			var neighbor = this.neighbor(this.bodies[Idx]);
			if (neighbor != null) {
				var distance = AstroMath.distance(this.bodies[Idx].positionVector, neighbor.positionVector);
				this.bodies[Idx].periapsis = Math.min(this.bodies[Idx].periapsis, distance);
				this.bodies[Idx].apoapsis = Math.max(this.bodies[Idx].apoapsis, distance);
				var eccentricity = (this.bodies[Idx].apoapsis - this.bodies[Idx].periapsis) / (this.bodies[Idx].apoapsis + this.bodies[Idx].periapsis);
				if (this.bodies[Idx].survivalTime > 1 && eccentricity < 1) {
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
	for (var Idx = 0; Idx < this.bodies.length - 1; Idx++) {
		for (var Idx2 = Idx + 1; Idx2 < this.bodies.length; Idx2++) {
			if (Idx != Idx2) {
				var tDist = AstroMath.distance(this.bodies[Idx].getVector(), this.bodies[Idx2].getVector());
				var requiredSpace = this.bodies[Idx].radius + this.bodies[Idx2].radius;
				if (requiredSpace > tDist){
					console.log("COLLISION DETECTED", requiredSpace, tDist)
					if (Star.prototype.isPrototypeOf(this.bodies[Idx])) {
						var coor = this.bodies[Idx2].getVector();
						this.bodies.splice(Idx2, 1);
						colArray[0].push(coor);
					} 
					else if (Star.prototype.isPrototypeOf(this.bodies[Idx2])){
						var coor = this.bodies[Idx].getVector();
						this.bodies.splice(Idx, 1);
						colArray[0].push(coor);
					}
					else {
						console.log(this.bodies, Idx);
						console.log("Removing!", this.bodies[Idx]);
						var coor = this.bodies[Idx].getVector().add(this.bodies[Idx2].getVector()).scMult(0.5);
						this.bodies.splice(Idx, 1);
						this.bodies.splice(Idx2 - 1, 1);
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
		for (var Idx in orbitables) {
			var dist = AstroMath.distance(body.getVector(), orbitables[Idx].getVector());
			if (dist != 0){
				distArray.push(dist);
				neighborArray.push(orbitables[Idx]);
			}
		}
		
		var minDist = distArray[0];
		for (var i = 1; i < distArray.length; i++) {
			if (distArray[i] < minDist) {
				minDist = distArray[i];
			}
		}
		var nIdx = distArray.indexOf(minDist);
		var bestNeighbor = neighborArray[nIdx];
		return bestNeighbor;
	} else {
		return null;
	}
}

// Gets gravitational acceleration on body1 from body2.
Sector.prototype.acceleration = function(body) {
	var bestNeighbor = this.neighbor(body);
	if (bestNeighbor != null) {
		return AstroMath.getAcceleration(body, bestNeighbor);
	} else {
		return AstroMath.Vector.ZERO;
	}
}


