"use strict"

var Body = function(x, y, t, vx, vy) {
	this.type = 'Generic space body';
	this.x_position = x;
	this.y_position = y;
	this.x_velocity = vx;
	this.y_velocity = vy;
	this.get_vector = function() {
		return {
			x : this.x_position,
			y : this.y_position
		}
	};
	this.move = function(dt) {
		this.x_position += this.x_velocity * dt;
		this.y_position += this.y_velocity * dt;
	};
	this.accelerate = function(accel_x, accel_y,dt) {
		this.x_velocity += accel_x * dt;
		this.y_velocity += accel_y * dt;
	}
}



var Star = function(x, y, t, vx, vy) {
	Body.call(this, x, y, t, 0, 0);
	this.type = 'Star';
	this.radius = 100 * t + 10; // Multipied all radius by ten
	this.mass = 100 * Math.pow(this.radius, 3);
}

var Planet = function(x, y, t, vx, vy) {
	Body.call(this, x, y, t, vx, vy);
	this.type = 'Planet';
	this.radius = 10 * t + 5;
	this.mass = 5 * Math.pow(this.radius,3);
}

var Moon = function(x, y, t, vx, vy) {
	Body.call(this, x, y, t, vx, vy);
	this.type = 'Moon';
	this.radius = 2 * t + 2;
	this.mass = 2 * Math.pow(this.radius,3);
}
