
var Controller = function() { 
	this.name = "I am a controller." // Placeholder name.
	this.mouse_state = null;
	this.mousedown_time = null;
	this.mousedown_location = null;
	this.mouse_location = null;
	this.last_mouse_location = null;
	this.GROW_MOVE_STOP_DIST = 2;
	this.new_body_time = null;
	this.rand = null;

    this.keydown_handler = function(key_event) {
		var keynum = window.event ? key_event.keyCode : key_event.which; // window.event = userIsIE
		var key = String.fromCharCode(keynum);
		if (key == "&") { // Up arrow
			my_view.scale /= 1.5;
			console.log(my_view.scale);
		} else if (key == "(") { // Down arrow
			if (my_view.scale < 3) { 
				my_view.scale *= 1.5;
			}
			console.log(my_view.scale);
		} else if (key == " ") {
			my_model.running = !(my_model.running);
			console.log("Banana phone!");
		} else if (key == "W") {
			my_view.center.y += my_view.scale * 100;
		} else if (key == "S") {
			my_view.center.y -= my_view.scale * 100;
		} else if (key == "A") {
			my_view.center.x += my_view.scale * 100;
		} else if (key == "D") {
			my_view.center.x -= my_view.scale * 100;
		}
		console.log(key);
    }
    
    this.click_handler = function(event) {
		// Do nothing ... for now.
	}
    
	this.mousedown_handler = function(event) {
		this.mouse_state = "DOWN";
		this.mousedown_time = new Date();
<<<<<<< Updated upstream
		
		this.mousedown_location = { x: event.x, y : event.y };
		this.mouse_location = { x: event.x, y : event.y };
		
		this.rand = Math.random();
=======
		this.rand = Math.random();
		this.mousedown_location = { x: event.x, y : event.y };
		this.mouse_location = { x: event.x, y : event.y };
>>>>>>> Stashed changes
	}
	
	this.mouseup_handler = function(event) {
		if (this.mouse_state == "DOWN") {
			this.new_body_time = (new Date() - this.mousedown_time) / 1000;
			var vector = AstroMath.screen_to_coordinate_plane(event);
<<<<<<< Updated upstream
			my_model.addBody(vector.x, vector.y, this.new_body_time, 0, 0, this.rand);
=======
			console.log("Star adding", vector.x, vector.y);

			my_model.addBody(vector.x, vector.y, t, 0, 0, this.rand);
		
			my_model.addBody(vector.x, vector.y, this.new_body_time, 0, 0);
>>>>>>> Stashed changes
		} else if (this.mouse_state == "MOVE") {
			var pos_vector_1 = AstroMath.screen_to_coordinate_plane(this.mousedown_location);
			var pos_vector_2 = AstroMath.screen_to_coordinate_plane(event);
			var delta_vector = {
				x : pos_vector_2.x - pos_vector_1.x,
				y : pos_vector_2.y - pos_vector_1.y
			}
			my_model.addBody(pos_vector_1.x, pos_vector_1.y, this.new_body_time, delta_vector.x, delta_vector.y, this.rand);
			
		}
		
		this.mouse_state = "UP";
		
	}
	
	this.mousemove_handler = function(event) {
		var time_since_mouse_down = (new Date() - this.mousedown_time) / 1000;
		
		if (this.mouse_state == "DOWN" || this.mouse_state == "PAN") {
			var mouse_delta = {
				x : event.x - this.mousedown_location.x,
				y : event.y - this.mousedown_location.y
			}
			if (time_since_mouse_down > 0.25 && this.mouse_state != "PAN") {
				var dist = AstroMath.distance(0, 0, mouse_delta.x, mouse_delta.y);
				if (dist > this.GROW_MOVE_STOP_DIST) {
					this.mouse_state = "MOVE";
					this.new_body_time = (new Date() - this.mousedown_time) / 1000;
				}
			} else if (this.mouse_state == "PAN" || time_since_mouse_down <= 0.25) {
				my_view.center.x += (event.x - this.mouse_location.x) * my_view.scale;
				my_view.center.y += (event.y - this.mouse_location.y) * my_view.scale;
				this.mouse_state = "PAN";
			}
		}
		this.mouse_location = { x: event.x , y : event.y }
	}
}
