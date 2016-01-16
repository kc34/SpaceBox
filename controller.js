"use strict"
class Controller {
    constructor() {
        this.name = "I am a controller." // Placeholder name.

    }


    static keydown_handler(key) {
        console.log(key);
    }
    
    static mousedown_handler(event) {
		var canvas_x = event.x - canvas.offsetLeft;
		var canvas_y = event.y - canvas.offsetTop;
		my_model.add(canvas_x, canvas_y);
	}
}
