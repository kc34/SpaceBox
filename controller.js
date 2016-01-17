"use strict"
class Controller {
    constructor() {
        this.name = "I am a controller." // Placeholder name.
        this.mouse_state = null;
        this.mousedown_time = null;
        this.mousedown_location = null;
        this.mouse_location = null;
        this.GROW_MOVE_STOP_DIST = 2;
        this.new_body_time = null;
    }

    keydown_handler(key_event) {
		var keynum = window.event ? key_event.keyCode : key_event.which; // window.event = userIsIE
		var key = String.fromCharCode(keynum);
		if (key == "&") { // Up arrow
			my_view.scale /= 1.5;
			console.log(my_view.scale);
		} else if (key == "(") { // Down arrow
			my_view.scale *= 1.5;
			console.log(my_view.scale);
		}
		console.log(key);
    }
    
    click_handler(event) {
		// Do nothing ... for now.
	}
    
	mousedown_handler(event) {
		this.mouse_state = "DOWN";
		this.mousedown_time = new Date();
<<<<<<< HEAD
		this.rand = Math.random();
=======
		this.mousedown_location = { x: event.x, y : event.y };
		this.mouse_location = { x: event.x, y : event.y };
>>>>>>> FETCH_HEAD
	}
	
	mouseup_handler(event) {
		if (this.mouse_state == "DOWN") {
			this.new_body_time = (new Date() - this.mousedown_time) / 1000;
			var vector = AstroMath.screen_to_coordinate_plane(event);
<<<<<<< HEAD
			console.log("Star adding", vector.x, vector.y);

			my_model.addBody(vector.x, vector.y, t, 0, 0, this.rand);
		
=======
			my_model.addBody(vector.x, vector.y, this.new_body_time, 0, 0);
		} else if (this.mouse_state == "MOVE") {
			var pos_vector_1 = AstroMath.screen_to_coordinate_plane(this.mousedown_location);
			var pos_vector_2 = AstroMath.screen_to_coordinate_plane(event);
			var delta_vector = {
				x : pos_vector_2.x - pos_vector_1.x,
				y : pos_vector_2.y - pos_vector_1.y
			}
			my_model.addBody(pos_vector_1.x, pos_vector_1.y, this.new_body_time, delta_vector.x, delta_vector.y);
			
>>>>>>> FETCH_HEAD
		}
		
		this.mouse_state = "UP";
		
	}
	
	mousemove_handler(event) {
		if (this.mouse_state == "DOWN") {
			var mouse_delta = {
				x : event.x - this.mousedown_location.x,
				y : event.y - this.mousedown_location.y
			}
			var dist = AstroMath.distance(0, 0, mouse_delta.x, mouse_delta.y);
			if (dist > this.GROW_MOVE_STOP_DIST) {
				this.mouse_state = "MOVE";
				this.new_body_time = (new Date() - this.mousedown_time) / 1000;
			}
		}
		this.mouse_location = { x: event.x , y : event.y }
	}
}
