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
				ctx.drawImage(
					this.glow_images[0],
					vector.x - radius * 8 / 5,
					vector.y - radius * 8 / 5,
					2 * radius * 8 / 5, 2 * radius * 8 / 5)
				ctx.drawImage(
					this.sun_images[0],
					vector.x - radius,
					vector.y - radius,
					2 * radius, 2 * radius);
			} else {
				ctx.fillStyle ="#FF0000";
				ctx.beginPath();
				ctx.arc(vector.x, vector.y, radius, startAngle, endAngle, anticlockwise);
				ctx.fill();
			}
		}
    }
    
    draw_background() {
		var picture_size = 2000 / this.scale;
		for (var i = -1; i < window.innerWidth / picture_size; i++) {
			for (var j = -1; j < window.innerHeight / picture_size; j++) {
				ctx.drawImage(this.base_image, i * picture_size + this.center.x / 2, j * picture_size + this.center.y / 2, picture_size, picture_size);
			}
		}
	}
}

class AstroMath {
	
	static distance(x_1, y_1, x_2, y_2) {
		return Math.pow(Math.pow(x_1 - x_2, 2) + Math.pow(x_1 - x_2, 2), 0.5);
	}
	
	static coordinate_plane_to_screen(vector) {
		var new_vector = {
			x : 1 / my_view.scale * vector.x + (my_view.center.x + window.innerWidth / 2),
			y : 1 / my_view.scale * vector.y + (my_view.center.y + window.innerHeight / 2)
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
}
