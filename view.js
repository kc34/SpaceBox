"use strict"
class View {
    constructor() {
        this.name = "I am a view." // Placeholder name.
        this.center = { x : 0, y : 0 }
        this.scale = 1;
    }

    draw() {
		this.draw_background();
		
		var bodies = my_model.get_bodies();
		for (var obj in bodies) {
			var x = (my_view.center.x + window.innerWidth / 2 + bodies[obj].x / this.scale);
			var y = (my_view.center.y + window.innerHeight / 2 + bodies[obj].y / this.scale);
			ctx.fillStyle = bodies[obj].color;
			var radius = bodies[obj].radius / this.scale;
			var startAngle = 0;
			var endAngle = 2 * Math.PI;
			var anticlockwise = false;
			ctx.beginPath();
			ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
			ctx.fill();
		}
    }
    
    draw_background() {
		var base_image = new Image();
		base_image.src = 'space_bg.jpg';
		var picture_size = 2000 / this.scale;
		for (var i = 0; i < window.innerWidth / picture_size; i++) {
			for (var j = 0; j < window.innerHeight / picture_size; j++) {
				ctx.drawImage(base_image, i * picture_size, j * picture_size, picture_size, picture_size);
			}
		}
	}
}
