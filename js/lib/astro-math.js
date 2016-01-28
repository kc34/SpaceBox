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
