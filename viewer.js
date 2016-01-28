var Viewer = function() {
	this.center = AstroMath.Vector.from_components(0, 0);
	this.scale = 1;
	this.images = get_images();
	
	this.sun_resize = 4.0 / 3.0;
	this.planet_resize = 4.0 / 3.0
	this.moon_resize = 3.0 / 2.0;
	
	this.scaling_factor = 1.5;
	
	this.music = new Audio("one_sly_move.mp3");
	this.music.play();
	
	/**
	 * This function will draw everything!
	 */
    this.draw = function() {
		
		this.draw_background();
		
		/*
		 * The following is equivalent to:
		 * 
		 *  var bodies = my_model.get_bodies();
		 *	for (var id in bodies) {
		 *		this.draw_object(bodies[id]);
		 * 	}
		 */
		
		my_model.get_bodies().map(this.draw_object, this); 
		
		// Time to draw a tentative star.
		if (my_controller.mouse_state == "DOWN") {
			// wait for time to be bigger than 0.25 seconds
			var t = new Date();
			t -= my_controller.mousedown_time;
			t /= 1000;
			if (t > 0.25) {
				var plane_vector = AstroMath.screen_to_coordinate_plane(my_controller.mousedown_location);
				var ghost_object = Controller.createBody(plane_vector, AstroMath.Vector.ZERO, t, my_controller.rand);
				this.draw_object(ghost_object);
			}
		} else if (my_controller.mouse_state == "MOVE") {
			ctx.strokeStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(my_controller.mousedown_location.x, my_controller.mousedown_location.y);
			ctx.lineTo(my_controller.mouse_location.x, my_controller.mouse_location.y);
			ctx.stroke();
			var plane_vector = AstroMath.screen_to_coordinate_plane(my_controller.mousedown_location);
			var ghost_object = Controller.createBody(plane_vector, AstroMath.Vector.ZERO, my_controller.new_body_time, my_controller.rand);
			this.draw_object(ghost_object);
		}
		
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "30px Courier New";
		ctx.fillText("High Score: " + my_model.high_score.toString(), 10, 30);
		ctx.fillText("Score: " + my_model.score.toString(), 10, 70);
		ctx.font = "10px Courier New";
		ctx.fillText("(Less eccentricity => Higher Score!)", 10, 100);
		
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
				var top_left = AstroMath.Vector.from_components(i, j).sc_mult(picture_size).add(my_viewer.center.sc_mult(-0.1 / this.scale));
				
				ctx.drawImage(this.images["background"][0], top_left.x, top_left.y, picture_size, picture_size);
			}
		}
	}
	
	this.draw_object = function(my_object) {
		
		// First order of business: know where to draw.
		var position_vector = my_object.position_vector;
		var screen_vector = AstroMath.coordinate_plane_to_screen(position_vector);
		
		var screen_radius = my_object.radius / this.scale;
		var object_type;
		var skin_id;
		
		if (Star.prototype.isPrototypeOf(my_object)) {
			screen_radius *= this.sun_resize;
			screen_radius = Math.max(screen_radius, 20);
			object_type = "star";
			var skin_data = AstroMath.star_color_from_radius(my_object.radius);
			var skin_id = Math.floor(skin_data);
			var progress_to_next = skin_data - skin_id;
			var val1 = 1 - progress_to_next;
			var val2 = progress_to_next;
			var vector = screen_vector;
			
			var radius = screen_radius;
			var glow_radius = radius * 8 / 5
			
			// Draw next.
			ctx.globalAlpha = val1;
			ctx.drawImage(this.images.glow[skin_id],
				vector.x - glow_radius, vector.y - glow_radius,
				2 * glow_radius, 2 * glow_radius);
				
			if (progress_to_next != 0) {
				ctx.globalAlpha = val2;
				ctx.drawImage(this.images.glow[skin_id + 1],
					vector.x - glow_radius, vector.y - glow_radius,
					2 * glow_radius, 2 * glow_radius);
			}
			// Draw actual.
			ctx.globalAlpha = val1;
			ctx.drawImage(this.images.star[skin_id],
				vector.x - radius, vector.y - radius,
				2 * radius, 2 * radius);
			if (progress_to_next != 0) {
				
				ctx.globalAlpha = val2;
				
				ctx.drawImage(this.images.star[skin_id + 1],
					vector.x - radius, vector.y - radius,
					2 * radius, 2 * radius);
			}
			ctx.globalAlpha = 1;
			
		} else if (Planet.prototype.isPrototypeOf(my_object)) {
			screen_radius *= this.planet_resize;
			screen_radius = Math.max(screen_radius, 5);
			object_type = "planet";
			var skin_id = my_object.img;
			ctx.drawImage(this.images[object_type][skin_id],
				screen_vector.x - screen_radius,
				screen_vector.y - screen_radius,
				2 * screen_radius, 2 * screen_radius);
		} else if (Moon.prototype.isPrototypeOf(my_object)) {
			screen_radius *= this.moon_resize;
			screen_radius = Math.max(screen_radius, 2);
			object_type = "moon";
			var skin_id = my_object.img;
			ctx.drawImage(this.images[object_type][skin_id],
				screen_vector.x - screen_radius,
				screen_vector.y - screen_radius,
				2 * screen_radius, 2 * screen_radius);
		}
	}
	
	/**
	 * Adjusts viewer center and scale s.t. screen_vector will stay
	 * consistent with plane_vector, but scale will change by
	 * scaling_factor.
	 */
	this.zoom_at = function(screen_vector, direction) {
		if (direction == "OUT") {
			if (this.scale < 10) {
				// First, we need the mouse position in coordinate
				var mouse_coordinate = AstroMath.screen_to_coordinate_plane(screen_vector);
				// Next, we need to measure the offset of that from the view center.
				var mouse_offset = mouse_coordinate.subtract(this.center);
				// Since we zoom out, the distance will become greater by the scaling factor.
				var scaled_offset = mouse_offset.sc_mult(this.scaling_factor);
				this.center = mouse_coordinate.subtract(scaled_offset);
				this.scale *= this.scaling_factor;
			}
		} else {
			// First, we need the mouse position in coordinate
			var mouse_coordinate = AstroMath.screen_to_coordinate_plane(screen_vector);
			// Next, we need to measure the offset of that from the view center.
			var mouse_offset = mouse_coordinate.subtract(this.center);
			// Since we zoom out, the distance will become greater by the scaling factor.
			var scaled_offset = mouse_offset.sc_mult(1 / this.scaling_factor);
			this.center = mouse_coordinate.subtract(scaled_offset);
			this.scale /= this.scaling_factor;
		}
	}
}

get_images = function() {
	var base_image = new Image();
	base_image.src = 'graphics/space_bg.jpg';
	
	var sun_images = new Array(8);
	for (var i = 0; i < 8; i++) {
		sun_images[i] = new Image();
		sun_images[i].src = 'graphics/star_' + (i + 1).toString() + '.png';
	}
	
	var glow_images = new Array(8);
	for (var i = 0; i < 8; i++) {
		glow_images[i] = new Image();
		glow_images[i].src = 'graphics/glow_' + (i + 1).toString() + '.png';
	}
	
	var planet_images = new Array(5);
	for (var i = 0; i < 5; i++) {
		planet_images[i] = new Image();
		planet_images[i].src = 'graphics/planet_' + (i + 1).toString() + '.png';
	}
	
	var moon_images = new Array(2);
	for (var i = 0; i < 2; i++) {
		moon_images[i] = new Image();
		moon_images[i].src = 'graphics/moon_' + (i + 1).toString() + '.png';
	}
	
	var images = {};
	
	images["background"] = [base_image];
	images["star"] = sun_images;
	images["glow"] = glow_images;
	images["planet"] = planet_images;
	images["moon"] = moon_images;
	
	return images;
}
