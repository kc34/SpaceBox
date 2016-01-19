
var Controller = function() { 
	this.name = "I am a controller." // Placeholder name.
	this.mouse_state = null;
	this.mousedown_time = null;
	this.mousedown_location = null;
	this.mouse_location = null;
	this.last_mouse_location = null;
	this.GROW_MOVE_STOP_DIST = 10;
	this.new_body_time = null;
	this.rand = null;

    this.keydown_handler = function(key_event) {
		var keynum = window.event ? key_event.keyCode : key_event.which; // window.event = userIsIE
		var key = String.fromCharCode(keynum);
		if (key == "&") { // Up arrow
			my_viewer.scale /= 1.5;
			console.log(my_viewer.scale);
		} else if (key == "(") { // Down arrow
			if (my_viewer.scale < 10) { 
				my_viewer.scale *= 1.5;
			}
			console.log(my_viewer.scale);
		} else if (key == " ") {
			my_model.running = !(my_model.running);
			console.log("Banana phone!");
		} else if (key == "W") {
			my_viewer.center.y += my_viewer.scale * 100;
		} else if (key == "S") {
			my_viewer.center.y -= my_viewer.scale * 100;
		} else if (key == "A") {
			my_viewer.center.x += my_viewer.scale * 100;
		} else if (key == "D") {
			my_viewer.center.x -= my_viewer.scale * 100;
		}
		console.log(key);
    }
    
    this.click_handler = function(event) {
		if (event.x < 10 + 20 && event.x > 10) {
			if (event.y < window.innerHeight - 10 && event.y > window.innerHeight - 10 - 20) {
				window.location = "about.html";
			}
		}
	}
    
	this.mousedown_handler = function(event) {
		this.mouse_state = "DOWN";
		this.mousedown_time = new Date();
		
		this.mousedown_location = event;
		this.mouse_location = event;
		
		this.rand = Math.random();
	}
	
	this.mouseup_handler = function(event) {
		if (this.mouse_state == "DOWN") {
			this.new_body_time = (new Date() - this.mousedown_time) / 1000;
			var vector = AstroMath.screen_to_coordinate_plane(event);
			my_model.addBody(vector, this.new_body_time, AstroMath.Vector.ZERO, this.rand);
		} else if (this.mouse_state == "MOVE") {
			var pos_vector_1 = AstroMath.screen_to_coordinate_plane(this.mousedown_location);
			var pos_vector_2 = AstroMath.screen_to_coordinate_plane(event);
			var delta_vector = pos_vector_2.subtract(pos_vector_1);
			my_model.addBody(pos_vector_1, this.new_body_time, delta_vector, this.rand);
			
		}
		
		this.mouse_state = "UP";
		
	}
	
	this.mousemove_handler = function(event) {
		var time_since_mouse_down = (new Date() - this.mousedown_time) / 1000;
		
		if (this.mouse_state == "DOWN" || this.mouse_state == "PAN") {
			var mouse_delta = event.subtract(this.mousedown_location);
			var dist = mouse_delta.norm();
			if (time_since_mouse_down > 0.25 && this.mouse_state != "PAN") {
				if (dist > this.GROW_MOVE_STOP_DIST) {
					this.mouse_state = "MOVE";
					this.new_body_time = (new Date() - this.mousedown_time) / 1000;
				}
			} else if (this.mouse_state == "PAN" || (time_since_mouse_down <= 0.25 && dist > this.GROW_MOVE_STOP_DIST)) {
				my_viewer.center = my_viewer.center.add(event.subtract(this.mouse_location).sc_mult(my_viewer.scale));
				this.mouse_state = "PAN";
			}
		}
		this.mouse_location = event;
	}
}
