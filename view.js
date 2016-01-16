"use strict"
class View {
    constructor() {
        this.name = "I am a view." // Placeholder name.
        this.center = { x : 0, y : 0 }
        this.scale = 1;
    }

    draw() {
		this.draw_background();
		
		ctx.fillStyle = "#FFFF00";
		for (var obj in my_model.box) {
			var x = (my_view.center.x + window.innerWidth / 2 + my_model.box[obj].x / this.scale);
			var y = (my_view.center.y + window.innerHeight / 2 + my_model.box[obj].y / this.scale);
			var radius = 10 / this.scale;
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
		console.log(base_image);
		var picture_size = 2000 / this.scale;
		for (var i = 0; i < window.innerWidth / picture_size; i++) {
			for (var j = 0; j < window.innerHeight / picture_size; j++) {
				ctx.drawImage(base_image, i * picture_size, j * picture_size, picture_size, picture_size);
			}
		}
	}
}
