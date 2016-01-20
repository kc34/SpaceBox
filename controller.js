
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
	
	this.key_to_function_map = {
		"&" : function() { my_viewer.scale /= 1.5; },
		"(" : function() { my_viewer.scale = (my_viewer.scale > 10) ? my_viewer.scale : my_viewer.scale * 1.5; },
		" " : function() { my_model.running = !(my_model.running); },
		"W" : function() { my_viewer.center.y += my_viewer.scale * 100; },
		"S" : function() { my_viewer.center.y -= my_viewer.scale * 100; },
		"A" : function() { my_viewer.center.x -= my_viewer.scale * 100; },
		"D" : function() { my_viewer.center.x += my_viewer.scale * 100; }
	}
    
    this.keydown_handler = function(key_event) {
		var keynum = window.event ? key_event.keyCode : key_event.which; // window.event = userIsIE
		var key = String.fromCharCode(keynum);
		this.key_to_function_map[key]();
    }
    
    this.click_handler = function(event) {
		event = new AstroMath.Vector(event);
		if (event.x < 10 + 20 && event.x > 10) {
			if (event.y < window.innerHeight - 10 && event.y > window.innerHeight - 10 - 20) {
				window.location = "about.html";
			}
		}
	}
    
	this.mousedown_handler = function(event) {
		event = new AstroMath.Vector(event);
		this.mouse_state = "DOWN";
		this.mousedown_time = new Date();
		
		this.mousedown_location = event;
		this.mouse_location = event;
		
		this.rand = Math.random();
	}
	
	this.mouseup_handler = function(event) {
		event = new AstroMath.Vector(event);
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
		event = new AstroMath.Vector(event);
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
				var coordinate_shift = AstroMath.screen_to_coordinate_plane(event).subtract(AstroMath.screen_to_coordinate_plane(this.mouse_location))
				console.log(coordinate_shift);
				//my_viewer.center = my_viewer.center.add(event.subtract(this.mouse_location).sc_mult(my_viewer.scale));
				my_viewer.center = my_viewer.center.subtract(coordinate_shift);
				this.mouse_state = "PAN";
			}
		}
		this.mouse_location = event;
	}
	
	this.mousewheel_handler = function(event) {
		if (event.wheelDelta > 0) {
			my_viewer.zoom_at(new AstroMath.Vector(event), "IN");
		} else {
			my_viewer.zoom_at(new AstroMath.Vector(event), "OUT");
		}
	}
}
