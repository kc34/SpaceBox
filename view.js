"use strict"
class View {
    constructor() {
        this.name = "I am a view." // Placeholder name.
    }

    static draw() {
        ctx.fillStyle = "#334D66";
		ctx.fillRect( 0 , 0 , window.innerWidth , window.innerHeight );
    }
}
