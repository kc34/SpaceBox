"use strict"
class Controller {
    constructor() {
        this.name = "I am a controller." // Placeholder name.
		this.mousedown = false;
		this.mouse_down_location = null;
		this.last_mouse_location = null;
		this.last_mouse_time = null;
		this.mousedown_time = null;
		this.MOUSE_TRAVEL_THRESHOLD = 10;
		this.START_THROW_THRESHOLD = 2;
		this.END_THROW_THRESHOLD = 50;
		this.start_throw_time = null
		this.fixed_t = -1;
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
		this.mousedown = true
		this.mouse_down_location = { x : event.x, y : event.y };
		this.last_mouse_location = { x : event.x, y : event.y };
		this.mouse_travelled = 0;
		this.mousedown_time = new Date();

	}
	
	mouseup_handler(event) {
		
		var t = new Date();
		t -= this.mousedown_time;
		t /= 1000.0;
		
		console.log(this.MOUSE_TRAVEL_THRESHOLD);
		
		if (this.mousedown == true) {
			var vector = AstroMath.screen_to_coordinate_plane(event);
			console.log("Star adding", vector.x, vector.y);
			
			if (this.fixed_t == -1) {

				my_model.addBody(vector.x, vector.y, t, 0, 0);
			
			} else {
				
				my_model.addBody(vector.x, vector.y, this.fixed_t, 0, 0);
				this.fixed_t = -1;
				
			}
		
		}
		
		console.log("Mouse travel:", this.mouse_travelled);
		console.log("Mousedown time:", t);
		
		this.mousedown = false;
		this.mousedown_location = null;
		this.mouse_travelled = null;
		
		
	}
	
	mousemove_handler(event) {
		if (this.mousedown == true) {
			var mouse_delta = {
				x : event.x - this.last_mouse_location.x,
				y : event.y - this.last_mouse_location.y
			}
			var dist = Math.pow(
				Math.pow(this.last_mouse_location.x - this.mouse_down_location.x, 2) +
				Math.pow(this.last_mouse_location.y - this.mouse_down_location.y, 2), 0.5);
			
			if (dist > this.START_THROW_THRESHOLD && this.fixed_t == -1) {
				this.start_throw_time = new Date();
				this.fixed_t = this.start_throw_time - this.mousedown_time;
				this.fixed_t /= 1000;
			}
			
			if (dist > this.END_THROW_THRESHOLD) {
				var end_throw_time = new Date();
				var delta_time = (end_throw_time - this.start_throw_time) / 1000.0;
				console.log("DELTA TIME", delta_time);
				var delta_distance = this.END_THROW_THRESHOLD - this.START_THROW_THRESHOLD;
				console.log("Throw ended");
				this.mousedown = false;
				var dx = this.last_mouse_location.x - this.mouse_down_location.x;
				var dy = this.last_mouse_location.y - this.mouse_down_location.y;
				var vx = dx / dist * delta_distance / delta_time;
				var vy = dy / dist * delta_distance / delta_time;
				console.log(this.start_throw_time, end_throw_time, delta_time , dist);
				
				var vector = AstroMath.screen_to_coordinate_plane(event);
				console.log("Star adding", vector.x, vector.y);
				
				my_model.addBody(vector.x, vector.y, this.fixed_t, vx, vy);
				this.fixed_t = -1;
			}
			console.log(dist);
			
			this.last_mouse_location.x = event.x;
			this.last_mouse_location.y = event.y;
		}
		
	}
}
