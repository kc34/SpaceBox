"use strict"
class View {
    constructor() {
        this.name = "I am a view." // Placeholder name.
        this.center = { x : 0, y : 0 }
        this.scale = 1;
    }

    draw() {
        ctx.fillStyle = "#000000";
		ctx.fillRect( 0 , 0 , window.innerWidth , window.innerHeight );
		
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
}
