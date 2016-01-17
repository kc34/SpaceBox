"use strict"
class View {
    constructor() {
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
		
		this.moon_images = new Array(2);
		for (var i = 0; i < 2; i++) {
			this.moon_images[i] = new Image();
			this.moon_images[i].src = 'graphics/moon_' + (i + 1).toString() + '.png';
		}
		
    }

    draw() {
		this.draw_background();
		
		var bodies = my_model.get_bodies();
		for (var obj in bodies) {
			var vector = AstroMath.coordinate_plane_to_screen(bodies[obj].get_vector());
			ctx.fillStyle = bodies[obj].color;
			var radius = bodies[obj].radius / this.scale;
			var startAngle = 0;
			var endAngle = 2 * Math.PI;
			var anticlockwise = false;
			if (Star.prototype.isPrototypeOf(bodies[obj])) {
				this.draw_at(this.glow_images[0], vector.x, vector.y, radius * 8 / 5);
				this.draw_at(this.sun_images[0], vector.x, vector.y, radius);
			} else if (Planet.prototype.isPrototypeOf(bodies[obj])) {
				ctx.drawImage(
					this.planet_images[3],
					vector.x - radius,
					vector.y - radius,
					2 * radius, 2 * radius);
			} else {
				ctx.drawImage(
					this.moon_images[0],
					vector.x - radius,
					vector.y - radius,
					2 * radius, 2 * radius);
			}
		}
		
		// Time to draw a tentative star.
		if (my_controller.mousedown == true) {
			var x = my_controller.last_mouse_location.x;
			var y = my_controller.last_mouse_location.y;
			var t = new Date();
			t -= my_controller.mousedown_time;
			t /= 1000;
			this.draw_from_time(t, x, y); 
		}
    }
    
    draw_background() {
		var picture_size = 2000 / this.scale;
		for (var i = -1; i < window.innerWidth / picture_size; i++) {
			for (var j = -1; j < window.innerHeight / picture_size; j++) {
				ctx.drawImage(this.base_image, i * picture_size + this.center.x, j * picture_size + this.center.y, picture_size, picture_size);
			}
		}
	}
	
	/**
	 * The following function will draw a picture given center and radius.
	 */
	draw_at(image, x, y, radius) {
		ctx.drawImage(
			image, x - radius, y - radius, 2 * radius, 2 * radius);
	}
	
	draw_from_time(t, x, y) {
		var radius = AstroMath.time_to_radius(t);
		
		console.log("Drawing!", x, y, t);
		if (t < 1) {
			this.draw_at(this.moon_images[0], x, y, radius);
		} else if (t > 2) {
			this.draw_at(this.glow_images[0], x, y, radius * 8 / 5);
			this.draw_at(this.sun_images[0], x, y, radius);
		} else {
			this.draw_at(this.planet_images[0], x, y, radius);
		}
	}
}

class AstroMath {
	
	static distance(x_1, y_1, x_2, y_2) {
		return Math.pow(Math.pow(x_1 - x_2, 2) + Math.pow(x_1 - x_2, 2), 0.5);
	}
	
	static coordinate_plane_to_screen(vector) {
		var new_vector = {
			x : 1 / my_view.scale * (vector.x + my_view.center.x) + window.innerWidth / 2,
			y : 1 / my_view.scale * (vector.y + my_view.center.y) + window.innerHeight / 2
		}
		return new_vector;
	}
	
	static screen_to_coordinate_plane(vector) {
		var new_vector = {
			x : ((vector.x) - ( window.innerWidth / 2 + my_view.center.x )) * my_view.scale,
			y : ((vector.y) - ( window.innerHeight / 2 + my_view.center.y )) * my_view.scale
		}
		return new_vector;
	}
	
	static time_to_radius(t) {
		if (t < 1) {
			return 2 * t + 2;
		} else if (t > 2) {
			return 100 * t + 10;
		} else {
			return 10 * t + 2;
		}
	}			
		
}
