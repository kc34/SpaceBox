"use strict"
class Controller {
    constructor() {
        this.name = "I am a controller." // Placeholder name.
		this.mousedown = false;
		this.last_mouse_location = null;
		this.last_mouse_time = null;
		this.mousedown_time = null;
		this.MOUSE_TRAVEL_THRESHOLD = 10;
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
		this.mousedown = true;
		this.last_mouse_location = { x : event.x, y : event.y }
		this.mouse_travelled = 0;
		this.mousedown_time = new Date();

	}
	
	mouseup_handler(event) {
		this.mousedown = false;
		this.mousedown_location = null;
		
		var t = new Date();
		t -= this.mousedown_time;
		t /= 1000.0;
		
		console.log(this.MOUSE_TRAVEL_THRESHOLD);
		
		if (this.mouse_travelled < this.MOUSE_TRAVEL_THRESHOLD) {
			console.log("Star adding");
			var vector = AstroMath.screen_to_coordinate_plane(event);

			my_model.addBody(vector.x, vector.y, t, 10, -10);
		
		}
		
		console.log("Mouse travel:", this.mouse_travelled);
		console.log("Mousedown time:", t);
		this.mouse_travelled = null;
	}
	
	mousemove_handler(event) {
		if (this.mousedown == true) {
			var mouse_delta = {
				x : event.x - this.last_mouse_location.x,
				y : event.y - this.last_mouse_location.y
			}
			this.mouse_travelled += Math.abs(mouse_delta.x) + Math.abs(mouse_delta.y);
			this.last_mouse_location.x = event.x;
			this.last_mouse_location.y = event.y;
			my_view.center.x += mouse_delta.x * my_view.scale;
			my_view.center.y += mouse_delta.y * my_view.scale;
		}
		
	}
}
