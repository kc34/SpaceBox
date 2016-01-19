var Viewer = function() {
	this.center = AstroMath.Vector.from_components(0, 0);
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
	
	this.moon_resize = 3.0 / 2.0;
	
	this.music = new Audio("one_sly_move.mp3");
	this.music.play();
		

    this.draw = function() {
		this.draw_background();
		
		var bodies = my_model.get_bodies();
		for (var obj in bodies) {
			var vector = AstroMath.coordinate_plane_to_screen(bodies[obj].get_vector());
			var radius = bodies[obj].radius / this.scale;
			if (Star.prototype.isPrototypeOf(bodies[obj])) {
				sun_color = AstroMath.sun_color_from_radius(radius * this.scale);
				radius *= this.sun_resize;
				this.draw_at(this.glow_images[sun_color], vector, radius * 8 / 5);
				this.draw_at(this.sun_images[sun_color], vector, radius);
			} else if (Planet.prototype.isPrototypeOf(bodies[obj])) {
				radius *= this.planet_resize;
				radius = Math.max(radius, 5)
				this.draw_at(this.planet_images[bodies[obj].img], vector, radius, radius);
			} else {
				radius *= this.moon_resize;
				radius = Math.max(radius, 2)
				this.draw_at(this.moon_images[bodies[obj].img], vector, radius, radius);
			}
		}
		
		// Time to draw a tentative star.
		if (my_controller.mouse_state == "DOWN") {
			// wait for time to be bigger than 0.25 seconds
			var x = my_controller.mouse_location.x;
			var y = my_controller.mouse_location.y;
			var t = new Date();
			t -= my_controller.mousedown_time;
			t /= 1000;
			if (t > 0.25) {
				this.draw_from_time(t, my_controller.mousedown_location, my_controller.rand);
			}
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
			this.draw_from_time(my_controller.new_body_time, my_controller.mousedown_location, my_controller.rand);
		}
		
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "30px Courier New";
		ctx.fillText("High Score: " + my_model.high_score.toString(), 10, 30);
		ctx.fillText("Score: " + my_model.score.toString(), 10, 70);
		
		// Draw the button that leads to the about page.
		ctx.fillStyle = "#888888";
		ctx.fillRect( 10, window.innerHeight - 10 - 20, 20, 20);
		ctx.strokeStyle = "#AAAAAA";
		ctx.strokeRect( 10, window.innerHeight - 10 - 20, 20, 20);
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "20px Arial";
		ctx.fillText("?", 14, window.innerHeight - 13.75); 
    }
    
    this.draw_background = function() {
		var picture_size = 2000 / Math.pow(this.scale, 0.2);
		for (var i = -10; i < 10; i++) {
			for (var j = -10; j < 10; j++) {
				var top_left = {};
				top_left.x = i * picture_size + my_viewer .center.x / 10;
				top_left.y = j * picture_size + my_viewer .center.y / 10;
				
				ctx.drawImage(this.base_image, top_left.x, top_left.y, picture_size, picture_size);
			}
		}
	}
	
	/**
	 * The following function will draw a picture given center and radius.
	 */
	this.draw_at = function(image, vector, radius) {
		ctx.drawImage(
			image, vector.x - radius, vector.y - radius, 2 * radius, 2 * radius);
	}
	
	this.draw_from_time = function(t, vector, r) {
		var radius = AstroMath.time_to_radius(t);
		radius /= this.scale;
		
		if (t < 1) {
			var rdm = Math.floor(r * 2);
			radius *= this.moon_resize;
			radius = Math.max(radius, 2)
			this.draw_at(this.moon_images[rdm], vector, radius);
		} else if (t > 2) {
			sun_color = AstroMath.sun_color_from_radius(radius * my_viewer .scale);
			radius *= this.sun_resize;
			this.draw_at(this.glow_images[sun_color], vector, radius * 8 / 5);
			this.draw_at(this.sun_images[sun_color], vector, radius);
		} else {
			var rdm = Math.floor(r * 5);
			radius *= this.planet_resize;
			radius = Math.max(radius, 5)
			this.draw_at(this.planet_images[rdm], vector, radius);
		}
	}
}
