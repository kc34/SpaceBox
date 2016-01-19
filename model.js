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
	this.high_score = 0;
	this.score = 0;
	this.k = 5;
}

Sector.prototype.addBody = function(position_vector, t, velocity_vector, r) { // Remind Kevin to edit values
	var x = position_vector.x;
	var y = position_vector.y;
	var vx = this.k * velocity_vector.x;
	var vy = this.k * velocity_vector.y;
	if (t > 2)
	{
		var new_body = new Star(position_vector, velocity_vector, t); // Remind Kevin to put stars.
		this.bodies.push(new_body);
		//this.stars.push(new_body)
	}
	else if (t < 1)
	{
		var new_body = new Moon(position_vector, velocity_vector, t, r);
		this.bodies.push(new_body);
	}
	else
	{
		var new_body = new Planet(position_vector, velocity_vector, t, r);
		this.bodies.push(new_body);
		//this.planets.push(new_body);
	}
}
Sector.prototype.update = function(dt) {
	if (this.running) {
		for (var idx in this.bodies) {
			this.bodies[idx].move(dt);
			
			if (this.bodies.length > 1) {
				
				var accel_vector = this.neighbor(this.bodies[idx]);
				var x_accel = accel_vector.x;
				var y_accel = accel_vector.y;
				//console.log(x_accel, y_accel)
				
				this.bodies[idx].accelerate(accel_vector, dt);
			}
			this.collision_update();
		}
	}
	var score = 0;
	for (var idx in this.bodies) {
		if (Planet.prototype.isPrototypeOf(this.bodies[idx])) {
			var velocity = this.bodies[idx].velocity_vector.norm();
			if (velocity > 100) {
				score += 10000 / Math.max(velocity, 1);
			}
		}
	}
	this.score = Math.floor(score);
	if (this.score > this.high_score) {
		this.high_score = this.score;
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
				var t_dist = AstroMath.distance(this.bodies[idx].get_vector(), this.bodies[idx2].get_vector());
				var required_space = this.bodies[idx].radius + this.bodies[idx2].radius;
				if (required_space > t_dist){
					console.log("COLLISION DETECTED", required_space, t_dist)
					if (Star.prototype.isPrototypeOf(this.bodies[idx])) {
						var coor = this.bodies[idx2].get_vector();
						this.bodies.splice(idx2, 1);
						col_array[0].push(coor);
					} 
					else if (Star.prototype.isPrototypeOf(this.bodies[idx2])){
						var coor = this.bodies[idx].get_vector();
						this.bodies.splice(idx, 1);
						col_array[0].push(coor);
					}
					else {
						console.log(this.bodies, idx);
						console.log("Removing!", this.bodies[idx]);
						var coor = this.bodies[idx].get_vector().add(this.bodies[idx2].get_vector()).sc_mult(0.5);
						this.bodies.splice(idx, 1);
						this.bodies.splice(idx2 - 1, 1);
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
		for (var idx in this.bodies) {
			if (Planet.prototype.isPrototypeOf(this.bodies[idx])) {
				orbitables.push(this.bodies[idx]);
			}
		}
	}
	else if (Planet.prototype.isPrototypeOf(body)) {
		for (var idx in this.bodies) {
			if (Star.prototype.isPrototypeOf(this.bodies[idx])) {
				orbitables.push(this.bodies[idx]);
			}
		}
	} 
	
	if (orbitables.length != 0) {
		for (var idx in orbitables) {
			var dist = AstroMath.distance(body.get_vector(), orbitables[idx].get_vector());
			if (dist != 0){
				dist_array.push(dist);
				neighbor_array.push(orbitables[idx]);
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
		return AstroMath.Vector.ZERO;
	}
}

// calculates the acceleration for body1 (body2 is unaffected by this acceleration)
Sector.prototype.acceleration = function(body1, body2) {
	var d = body2.get_vector().subtract(body1.get_vector());
	var dist = d.norm();
	if (dist == 0) {
		return [0, 0];
	}
	var magnitude = body2.mass / Math.pow(dist, 2);
	
	var cos = d.x / dist;
	var sin = d.y / dist;
	return AstroMath.Vector.from_components(magnitude*cos, magnitude*sin);
}

var AstroMath = function() {};
	
AstroMath.distance = function(vectorA, vectorB) {
	var distance = Math.pow(Math.pow(vectorA.x - vectorB.x, 2) + Math.pow(vectorA.y - vectorB.y, 2), 0.5);
	return distance;
}
	
AstroMath.coordinate_plane_to_screen = function(vector) {
	/*var new_vector = {
		x : 1 / my_viewer .scale * (vector.x + my_viewer .center.x) + window.innerWidth / 2,
		y : 1 / my_viewer .scale * (vector.y + my_viewer .center.y) + window.innerHeight / 2
	}*/
	return AstroMath.Vector.from_components(
		1 / my_viewer.scale * (vector.x + my_viewer.center.x) + window.innerWidth / 2,
		1 / my_viewer.scale * (vector.y + my_viewer.center.y) + window.innerHeight / 2
	);
}

AstroMath.screen_to_coordinate_plane = function(vector) {
	var new_vector = {
		x : my_viewer .scale * (vector.x - window.innerWidth / 2) - my_viewer .center.x,
		y : my_viewer .scale * (vector.y - window.innerHeight / 2) - my_viewer .center.y
	}
	return AstroMath.Vector.from_components(
		my_viewer .scale * (vector.x - window.innerWidth / 2) - my_viewer .center.x,
		my_viewer .scale * (vector.y - window.innerHeight / 2) - my_viewer .center.y
	);
}

AstroMath.time_to_radius = function(t) {
	if (t < 1) {
		return 2 * t + 2;
	} else if (t < 2) {
		return 10 * t;
	} else if (t < 2.5) {
		var my_iteration = (t - 2) / (2.5 - 2) * 30;
		return easeOutBack(my_iteration, 20, 105, 30);
	} else {
		return 50 * t;
	}
}

AstroMath.sun_color_from_radius = function(radius) {
	if (radius < AstroMath.time_to_radius(3.0)) {
		return 7;
	} else if (radius < AstroMath.time_to_radius(7)) {
		var big_radius = AstroMath.time_to_radius(7);
		var small_radius = AstroMath.time_to_radius(3);
		var color = Math.floor((big_radius - radius) / (big_radius - small_radius) * 7);
		return color;
	} else {
		return 0;
	}
}

AstroMath.Vector = function(vector) {
	this.x = vector.x;
	this.y = vector.y;
}

AstroMath.Vector.from_components = function(x, y) {
	return new AstroMath.Vector({x : x, y : y});
}

AstroMath.Vector.prototype.add = function(vector) {
	return AstroMath.Vector.from_components(this.x + vector.x, this.y + vector.y);
}

AstroMath.Vector.prototype.subtract = function(vector) {
	return new AstroMath.Vector.from_components(this.x - vector.x, this.y - vector.y);
}

AstroMath.Vector.prototype.sc_mult = function(scalar) {
	return new AstroMath.Vector.from_components(this.x * scalar, this.y * scalar);
}

AstroMath.Vector.prototype.norm = function() {
	return AstroMath.distance(AstroMath.Vector.ZERO, this);
}

AstroMath.Vector.ZERO = AstroMath.Vector.from_components(0, 0);
