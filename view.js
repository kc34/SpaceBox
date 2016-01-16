"use strict"
class View {
    constructor() {
        this.name = "I am a view." // Placeholder name.
    }

    static draw() {
        ctx.fillStyle = "#000000";
		ctx.fillRect( 0 , 0 , window.innerWidth , window.innerHeight );
		
		ctx.fillStyle = "#FFFF00";
		for (var obj in my_model.box) {
			var x = my_model.box[obj].x;
			var y = my_model.box[obj].y;
			var radius = 5;
			var startAngle = 0;
			var endAngle = 2 * Math.PI;
			var anticlockwise = false;
			ctx.beginPath();
			ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
			ctx.fill();
		}
    }
}
