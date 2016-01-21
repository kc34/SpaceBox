var Body = function(position_vector, velocity_vector, t) {
	this.type = 'Generic space body';
	this.position_vector = position_vector;
	this.radius = AstroMath.time_to_radius(t);
	this.velocity_vector = velocity_vector;
	this.survival_time = 0;
	this.periapsis = Math.pow(10, 10);
	this.apoapsis = Math.pow(10, -10);
	this.get_vector = function() {
		return this.position_vector;
	};
	this.move = function(dt) {
		this.survival_time += dt;
		this.position_vector = this.position_vector.add(this.velocity_vector.sc_mult(dt));
	};
	this.accelerate = function(accel_vector, dt) {
		this.velocity_vector = this.velocity_vector.add(accel_vector.sc_mult(dt));
	}
}
Body.STAR_DENSITY = 200;
Body.PLANET_DENSITY = 500;
Body.MOON_DENSITY = 300;

var Star = function(position_vector, velocity_vector, t) {
	Body.call(this, position_vector, AstroMath.Vector.ZERO, t);
	this.type = 'Star';
	this.mass = Body.STAR_DENSITY * Math.pow(this.radius, 3);
}

var Planet = function(position_vector, velocity_vector, t, r) {
	Body.call(this, position_vector, velocity_vector, t);
	this.type = 'Planet';
	this.mass = Body.PLANET_DENSITY * Math.pow(this.radius, 3);
	this.img = Math.floor(r * 5);
}

var Moon = function(position_vector, velocity_vector, t, r) {
	Body.call(this, position_vector, velocity_vector, t);
	this.type = 'Moon';
	this.mass = Body.MOON_DENSITY * Math.pow(this.radius,3);
	this.img = Math.floor(r * 2);
}
