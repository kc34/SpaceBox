var View = function() {
	this.name = "I am a view." // Placeholder name.
	this.center = { x : 0, y : 0 }
	this.scale = 1;
	this.base_image = new Image();
	this.base_image.src = 'graphics/space_bg.jpg';
	
	this.sun_images = new Array(8);
	for (var i = 0; i < 8; i++) {
		this.sun_images[i] = new Image();
		this.sun_images[i].src = 'graphics/star_' + (i + 1).toString() + '.png';
	}
	
	this.sun_resize = 4.0 / 3.0;
	
	this.glow_images = new Array(8);
	for (var i = 0; i < 8; i++) {
		this.glow_images[i] = new Image();
		this.glow_images[i].src = 'graphics/glow_' + (i + 1).toString() + '.png';
	}
	
	this.planet_images = new Array(5);
	for (var i = 0; i < 5; i++) {
		this.planet_images[i] = new Image();
		this.planet_images[i].src = 'graphics/planet_' + (i + 1).toString() + '.png';
	}
	
	this.planet_resize = 4.0 / 3.0
	
	this.moon_images = new Array(2);
	for (var i = 0; i < 2; i++) {
		this.moon_images[i] = new Image();
		this.moon_images[i].src = 'graphics/moon_' + (i + 1).toString() + '.png';
	}
	
	this.moon_resize = 3.0 / 2.0
		

    this.draw = function() {
		this.draw_background();
		
		var bodies = my_model.get_bodies();
		for (var obj in bodies) {
			var vector = AstroMath.coordinate_plane_to_screen(bodies[obj].get_vector());
			var radius = bodies[obj].radius / this.scale;
			if (Star.prototype.isPrototypeOf(bodies[obj])) {
				sun_color = AstroMath.sun_color_from_radius(radius * this.scale);
				radius *= this.sun_resize;
				radius = Math.max(radius, 10)
				this.draw_at(this.glow_images[sun_color], vector.x, vector.y, radius * 8 / 5);
				this.draw_at(this.sun_images[sun_color], vector.x, vector.y, radius);
			} else if (Planet.prototype.isPrototypeOf(bodies[obj])) {
				radius *= this.planet_resize;
				radius = Math.max(radius, 10)
				this.draw_at(this.planet_images[bodies[obj].img], vector.x, vector.y, radius, radius);
			} else {
				radius *= this.moon_resize;
				radius = Math.max(radius, 2)
				this.draw_at(this.moon_images[bodies[obj].img], vector.x, vector.y, radius, radius);
			}
		}
		
		// Time to draw a tentative star.
		if (my_controller.mouse_state == "DOWN") {
			var x = my_controller.mouse_location.x;
			var y = my_controller.mouse_location.y;
			var t = new Date();
			t -= my_controller.mousedown_time;
			t /= 1000;
			this.draw_from_time(t, x, y, my_controller.rand);
		} else if (my_controller.mouse_state == "MOVE") {
			var x = my_controller.mousedown_location.x;
			var y = my_controller.mousedown_location.y;
			var new_x = my_controller.mouse_location.x;
			var new_y = my_controller.mouse_location.y;
			ctx.strokeStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(new_x, new_y);
			ctx.stroke();
			this.draw_from_time(my_controller.new_body_time, x, y, my_controller.rand);
		}
    }
    
    this.draw_background = function() {
		var picture_size = 2000 / this.scale;
		for (var i = -10; i < 10; i++) {
			for (var j = -10; j < 10; j++) {
				var top_left_x = i * picture_size + my_view.center.x / 10;
				var top_left_y = j * picture_size + my_view.center.y / 10;
				
				ctx.drawImage(this.base_image, top_left_x, top_left_y, picture_size, picture_size);
			}
		}
	}
	
	/**
	 * The following function will draw a picture given center and radius.
	 */
	this.draw_at = function(image, x, y, radius) {
		ctx.drawImage(
			image, x - radius, y - radius, 2 * radius, 2 * radius);
	}
	
	this.draw_from_time = function(t, x, y, r) {
		var radius = AstroMath.time_to_radius(t);
		radius /= this.scale;
		
		if (t < 1) {
			var rdm = Math.floor(r * 2);
			radius *= this.moon_resize;
			this.draw_at(this.moon_images[rdm], x, y, radius);
		} else if (t > 2) {
			sun_color = AstroMath.sun_color_from_radius(radius * my_view.scale);
			radius *= this.sun_resize;
			this.draw_at(this.glow_images[sun_color], x, y, radius * 8 / 5);
			this.draw_at(this.sun_images[sun_color], x, y, radius);
		} else {
			var rdm = Math.floor(r * 5);
			radius *= this.planet_resize;
			this.draw_at(this.planet_images[rdm], x, y, radius);
		}
	}
}

var AstroMath = function() {}
	
AstroMath.distance = function(x_1, y_1, x_2, y_2) {
	var distance = Math.pow(Math.pow(x_1 - x_2, 2) + Math.pow(y_1 - y_2, 2), 0.5);
	return distance;
}
	
AstroMath.coordinate_plane_to_screen = function(vector) {
	var new_vector = {
		x : 1 / my_view.scale * (vector.x + my_view.center.x) + window.innerWidth / 2,
		y : 1 / my_view.scale * (vector.y + my_view.center.y) + window.innerHeight / 2
	}
	return new_vector;
}

AstroMath.screen_to_coordinate_plane = function(vector) {
	var new_vector = {
		x : my_view.scale * (vector.x - window.innerWidth / 2) - my_view.center.x,
		y : my_view.scale * (vector.y - window.innerHeight / 2) - my_view.center.y
	}
	return new_vector;
}

AstroMath.time_to_radius = function(t) {
	if (t < 1) {
		return 2 * t + 2;
	} else if (t < 2) {
		return 10 * t;
	} else if (t < 2.5) {
		var my_iteration = Math.round((t - 2) / (2.5 - 2) * 30);
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
		console.log(color);
		return color;
	} else {
		return 0;
	}
}
