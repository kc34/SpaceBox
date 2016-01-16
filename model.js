"use strict"
/**
 * Hey guys! I'm going to write kind of a template here that you guys
 * can fill out however you like. If you want to change function names
 * or given variable names, let me know and I will update the other
 * files to reflect the changes!
 */
 
/**
 * The Model is a container for a set of bodies. You'll be able to 
 * manipulate them through here!
 */
 
class Model {
    constructor() {
        this.name = "I am a box." // Placeholder name.
        this.box = [];
    }

    update(dt) {
        console.log("This model has been updated by " + dt.toString() + " seconds.");
    }
    
    add(x, y) {
		var new_obj = new Object();
		new_obj.x = x;
		new_obj.y = y;
		console.log("A mouse click has been registered at", x, y);
		this.box.push(new_obj);
		console.log(this.box);
	}
}
