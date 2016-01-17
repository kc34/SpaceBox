var Body = function(x, y, vx, vy) {
  this.type = 'Generic space body';
  this.x_position = x;
  this.y_position = y;
  this.x_velocity = vx;
  this.y_velocity = vy;
}

Body.prototype.move = function(dt) {
  this.x_position += this.x_velocity * dt;
  this.y_position += this.y_velocity * dt;
}

Body.prototype.accelerate = function(accel_x, accel_y,dt) {
  this.x_velocity += accel_x*dt;
  this.y_velocity += accel_y*dt;
}

var Star = function(x, y, t) {
  this.type = 'Star';
  this.radius = 100*t;
  this.mass = 100*Math.pow(this.radius,3);
}

var Planet = function(x, y, t, vx, vy) {
  this.type = 'Planet';
  this.radius = 5*t;
  this.mass = 5*Math.pow(this.radius,3);
}

var Moon = function(x, y, t, vx, vy) {
  this.type = 'Moon';
  this.radius = 2*t;
  this.mass = 2*Math.pow(this.radius,3);
}

Star.prototype = new Body();
Planet.prototype = new Body();
Moon.prototype = new Body();