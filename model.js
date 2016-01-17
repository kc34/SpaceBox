"use strict"
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
	this.planets = [];
	this.stars = [] 
}

Sector.prototype.addBody = function(x, y, t, vx, vy) { // Remind Kevin to edit values
	if (t > 2)
	{
		var new_body = new Star(x, y, t, vx, vy); // Remind Kevin to put stars.
		this.bodies.push(new_body);
		this.stars.push(new_body)
	}
	else if (t < 1)
	{
		var new_body = new Moon(x, y, t, vx, vy);
		this.bodies.push(new_body);
		this.planets.push(new_body);
	}
	else
	{
		var new_body = new Planet(x, y, t, vx, vy);
		this.bodies.push(new_body);
	}
}
Sector.prototype.update = function(dt) {
	for (var idx in this.bodies) {
		this.bodies[idx].move(dt);
		var x_accel = 0;
		var y_accel = 0
		
		if (this.bodies.length > 1) {
		
			
			
			/*
			for (var idx2 in this.bodies) {
				var accel_vector = this.acceleration(this.bodies[idx], this.bodies[idx2]);
				x_accel += accel_vector[0];
				y_accel += accel_vector[1];
			}
			*/
			
			var accel_vector = this.neighbor(this.bodies[idx]);
			x_accel += accel_vector[0];
			y_accel += accel_vector[1];
			
			this.bodies[idx].accelerate(x_accel, y_accel, dt);
		}
		this.collision_update();
	}
}
Sector.prototype.get_bodies = function() {
	return this.bodies;
}

Sector.prototype.collision_update = function(){
	var col_array = [[],[]]; // collision
	for (var idx = 0; idx < this.bodies.length - 1; idx++) {
		for (var idx2 = idx + 1; idx2 < this.bodies.length; idx2++) {
			if (idx != idx2) {
				var x1 = this.bodies[idx].x_position;
				var x2 = this.bodies[idx2].x_position;
				var y1 = this.bodies[idx].y_position;
				var y2 = this.bodies[idx2].y_position; // Remind Kevin to add index.
				var x_dist = (x1-x2);
				var y_dist = (y1-y2);
				var t_dist = AstroMath.distance(x_dist, y_dist, 0, 0); // ** doesn't work i guess.
				if ((this.bodies[idx].radius + this.bodies[idx2].radius) > t_dist){
					console.log("COLLISION DETECTED", this.bodies[idx].radius + this.bodies[idx2].radius, t_dist)
					if (Star.prototype.isPrototypeOf(this.bodies[idx])) {
						this.bodies.splice(idx2, 1);
						var coor = (x2,y2);
						col_array[0].push(coor);
					} 
					else if (Star.prototype.isPrototypeOf(this.bodies[idx2])){
						this.bodies.splice(idx, 1);
						var coor = (x1,y1);
						col_array[0].push(coor);
					}
					else {
						console.log(this.bodies, idx);
						console.log("Removing!", this.bodies[idx]);
						this.bodies.splice(idx, 1);
						this.bodies.splice(idx2 - 1, 1);
						var x_coor = (x1+x2)/2;
						var y_coor = (y1+y2)/2;
						var coor = (x_coor,y_coor);
						col_array[1].push(coor);
					}
				}
			}
		}
	}
	return col_array;
}


	
Sector.prototype.neighbor = function(body) {
	
	var dist_array = [];
	var neighbor_array = [];
	
	var orbitables = [];
	
	if (Moon.prototype.isPrototypeOf(body)) {
		var orbitables = this.stars.concat(this.planets);
	}
	else if (Planet.prototype.isPrototypeOf(body)) {
		var orbitables = this.stars;
	} 
	
	if (orbitables.length != 0) {
		for (var idx in orbitables) {
			var dist = AstroMath.distance(body.x_position, orbitables[idx].x_position, body.y_position, orbitables[idx].y_position);
			if (dist != 0){
				dist_array.push(dist);
				neighbor_array.push(this.bodies[idx]);
			}
		}
		
		var min_dist = dist_array[0];
		for (var i = 1; i < dist_array.length; i++) {
			if (dist_array[i] < min_dist) {
				min_dist = dist_array[i];
			}
		}
		var n_idx = dist_array.indexOf(min_dist);
		var best_neighbor = neighbor_array[n_idx];
		return this.acceleration(body, best_neighbor);
	} else {
		return [0, 0];
	}
}

// calculates the acceleration for body1 (body2 is unaffected by this acceleration)
Sector.prototype.acceleration = function(body1, body2) {
	
	var dx = body2.x_position - body1.x_position;
	var dy = body2.y_position - body1.y_position;
	var dist = AstroMath.distance(0, 0, dx, dy);
	if (dist == 0) {
		return [0, 0];
	}
	var magnitude = body2.mass / Math.pow(dist, 2);
	// console.log(magnitude);
	
	var cos = dx / dist;
	var sin = dy / dist;
	return [magnitude*cos, magnitude*sin]
}
