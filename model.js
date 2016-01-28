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

Sector.prototype.addBody = function(new_body) {
	this.bodies.push(new_body);
}
Sector.prototype.update = function(dt) {
	if (this.running) {
		for (var idx in this.bodies) {
			//var neighbor = this.neighbor(this.bodies[idx]);
			//if (neighbor != null) {
			//	this.bodies[idx].position_vector = this.bodies[idx].position_vector.add(neighbor.velocity_vector.sc_mult(dt));
			//}
			this.bodies[idx].move(dt);
			
			if (this.bodies.length > 1) {
				
				var accel_vector = this.acceleration(this.bodies[idx]);
				
				this.bodies[idx].accelerate(accel_vector, dt);
			}
			this.collision_update();
		}
	}
	var score = 0;
	for (var idx in this.bodies) {
		if (Planet.prototype.isPrototypeOf(this.bodies[idx])) {
			var neighbor = this.neighbor(this.bodies[idx]);
			if (neighbor != null) {
				var distance = AstroMath.distance(this.bodies[idx].position_vector, neighbor.position_vector);
				this.bodies[idx].periapsis = Math.min(this.bodies[idx].periapsis, distance);
				this.bodies[idx].apoapsis = Math.max(this.bodies[idx].apoapsis, distance);
				var eccentricity = (this.bodies[idx].apoapsis - this.bodies[idx].periapsis) / (this.bodies[idx].apoapsis + this.bodies[idx].periapsis);
				if (this.bodies[idx].survival_time > 1 && eccentricity < 1) {
					score += 100 * (1 - eccentricity);
				}
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
			if (Planet.prototype.isPrototypeOf(this.bodies[idx]) || Star.prototype.isPrototypeOf(this.bodies[idx])) {
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
		return best_neighbor;
	} else {
		return null;
	}
}

// Gets gravitational acceleration on body1 from body2.
Sector.prototype.acceleration = function(body) {
	var best_neighbor = this.neighbor(body);
	if (best_neighbor != null) {
		return AstroMath.get_acceleration(body, best_neighbor);
	} else {
		return AstroMath.Vector.ZERO;
	}
}

var AstroMath = function() {};
	
AstroMath.distance = function(vectorA, vectorB) {
	var distance = Math.pow(Math.pow(vectorA.x - vectorB.x, 2) + Math.pow(vectorA.y - vectorB.y, 2), 0.5);
	return distance;
}

AstroMath.get_acceleration = function(body_1, body_2) {
	var d = body_2.get_vector().subtract(body_1.get_vector());
	var dist = d.norm();
	
	if (dist == 0) {
		return [0, 0];
	}
	var gravity = 1;
	var magnitude = gravity * body_2.mass / Math.pow(dist, 2);
	
	return d.sc_mult(1 / dist).sc_mult(magnitude);
}
	
AstroMath.coordinate_plane_to_screen = function(plane_vector) {
	/**
	 * ScreenVec = (PlaneVec - ViewCenter) / Scale + ScreenCenter
	 */
	var window_center = AstroMath.Vector.from_components(window.innerWidth / 2, window.innerHeight / 2);
	var screen_vector = plane_vector.subtract(my_viewer.center).sc_mult(1 / my_viewer.scale).add(window_center);
	return screen_vector;
}

AstroMath.screen_to_coordinate_plane = function(screen_vector) {
	/**
	 * PlaneVec = (ScreenVec - ScreenCenter) * Scale + ViewCenter
	 */
	var window_center = AstroMath.Vector.from_components(window.innerWidth / 2, window.innerHeight / 2);
	var plane_vector = screen_vector.subtract(window_center).sc_mult(my_viewer.scale).add(my_viewer.center);
	return plane_vector;
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

AstroMath.star_color_from_radius = function(radius) {
	if (radius < AstroMath.time_to_radius(2.5)) {
		return 7;
	} else if (radius < AstroMath.time_to_radius(15)) {
		var big_radius = AstroMath.time_to_radius(15);
		var small_radius = AstroMath.time_to_radius(2.5);
		var color = (big_radius - radius) / (big_radius - small_radius) * 7;
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
