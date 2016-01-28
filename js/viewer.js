var Viewer = function() {
	this.center = AstroMath.Vector.fromComponents(0, 0);
	this.scale = 1;
	this.images = getImages();
	
	this.sunResize = 4.0 / 3.0;
	this.planetResize = 4.0 / 3.0
	this.moonResize = 3.0 / 2.0;
	
	this.scalingFactor = 1.5;
	
	this.music = new Audio("assets/one_sly_move.mp3");
	this.music.play();
	
	/**
	 * This function will draw everything!
	 */
    this.draw = function() {
		
		this.drawBackground();
		
		myModel.getBodies().forEach(this.drawObject, this); 
		
		// Time to draw a tentative star.
		if (myController.mouseState == "DOWN") {
			// wait for time to be bigger than 0.25 seconds
			var t = new Date();
			t -= myController.mousedownTime;
			t /= 1000;
			if (t > 0.25) {
				var planeVector = AstroMath.screenToCoordinatePlane(myController.mousedownLocation);
				var ghostObject = Controller.createBody(planeVector, AstroMath.Vector.ZERO, t, myController.rand);
				this.drawObject(ghostObject);
			}
		} else if (myController.mouseState == "MOVE") {
			ctx.strokeStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(myController.mousedownLocation.x, myController.mousedownLocation.y);
			ctx.lineTo(myController.mouseLocation.x, myController.mouseLocation.y);
			ctx.stroke();
			var planeVector = AstroMath.screenToCoordinatePlane(myController.mousedownLocation);
			var ghostObject = Controller.createBody(planeVector, AstroMath.Vector.ZERO, myController.newBodyTime, myController.rand);
			this.drawObject(ghostObject);
		}
		
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "30px Courier New";
		ctx.fillText("High Score: " + myModel.highScore.toString(), 10, 30);
		ctx.fillText("Score: " + myModel.score.toString(), 10, 70);
		ctx.font = "10px Courier New";
		ctx.fillText("(Less eccentricity => Higher Score!)", 10, 100);
		
		// Draw the button that leads to the about page.
		ctx.fillStyle = "#888888";
		ctx.fillRect( 10, window.innerHeight - 10 - 20, 20, 20);
		ctx.strokeStyle = "#AAAAAA";
		ctx.strokeRect( 10, window.innerHeight - 10 - 20, 20, 20);
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "20px Arial";
		ctx.fillText("?", 14, window.innerHeight - 13.75); 
    }
    
    this.drawBackground = function() {
		var pictureSize = 2000 / Math.pow(this.scale, 0.2);
		for (var i = -10; i < 10; i++) {
			for (var j = -10; j < 10; j++) {
				var topLeft = AstroMath.Vector.fromComponents(i, j).scMult(pictureSize).add(myViewer.center.scMult(-0.1 / this.scale));
				
				ctx.drawImage(this.images["background"][0], topLeft.x, topLeft.y, pictureSize, pictureSize);
			}
		}
	}
	
	this.drawObject = function(myObject) {
		
		// First order of business: know where to draw.
		var positionVector = myObject.positionVector;
		var screenVector = AstroMath.coordinatePlaneToScreen(positionVector);
		
		var screenRadius = myObject.radius / this.scale;
		var objectType;
		var skinId;
		
		if (Star.prototype.isPrototypeOf(myObject)) {
			screenRadius *= this.sunResize;
			screenRadius = Math.max(screenRadius, 20);
			objectType = "star";
			var skinData = AstroMath.starColorFromRadius(myObject.radius);
			var skinId = Math.floor(skinData);
			var progressToNext = skinData - skinId;
			var val1 = 1 - progressToNext;
			var val2 = progressToNext;
			var vector = screenVector;
			
			var radius = screenRadius;
			var glowRadius = radius * 8 / 5
			
			// Draw next.
			ctx.globalAlpha = val1;
			ctx.drawImage(this.images.glow[skinId],
				vector.x - glowRadius, vector.y - glowRadius,
				2 * glowRadius, 2 * glowRadius);
				
			if (progressToNext != 0) {
				ctx.globalAlpha = val2;
				ctx.drawImage(this.images.glow[skinId + 1],
					vector.x - glowRadius, vector.y - glowRadius,
					2 * glowRadius, 2 * glowRadius);
			}
			// Draw actual.
			ctx.globalAlpha = val1;
			ctx.drawImage(this.images.star[skinId],
				vector.x - radius, vector.y - radius,
				2 * radius, 2 * radius);
			if (progressToNext != 0) {
				
				ctx.globalAlpha = val2;
				
				ctx.drawImage(this.images.star[skinId + 1],
					vector.x - radius, vector.y - radius,
					2 * radius, 2 * radius);
			}
			ctx.globalAlpha = 1;
			
		} else if (Planet.prototype.isPrototypeOf(myObject)) {
			screenRadius *= this.planetResize;
			screenRadius = Math.max(screenRadius, 5);
			objectType = "planet";
			var skinId = myObject.img;
			ctx.drawImage(this.images[objectType][skinId],
				screenVector.x - screenRadius,
				screenVector.y - screenRadius,
				2 * screenRadius, 2 * screenRadius);
		} else if (Moon.prototype.isPrototypeOf(myObject)) {
			screenRadius *= this.moonResize;
			screenRadius = Math.max(screenRadius, 2);
			objectType = "moon";
			var skinId = myObject.img;
			ctx.drawImage(this.images[objectType][skinId],
				screenVector.x - screenRadius,
				screenVector.y - screenRadius,
				2 * screenRadius, 2 * screenRadius);
		}
	}
	
	/**
	 * Adjusts viewer center and scale s.t. screenVector will stay
	 * consistent with planeVector, but scale will change by
	 * scalingFactor.
	 */
	this.zoomAt = function(screenVector, direction) {
		if (direction == "OUT") {
			if (this.scale < 10) {
				// First, we need the mouse position in coordinate
				var mouseCoordinate = AstroMath.screenToCoordinatePlane(screenVector);
				// Next, we need to measure the offset of that from the view center.
				var mouseOffset = mouseCoordinate.subtract(this.center);
				// Since we zoom out, the distance will become greater by the scaling factor.
				var scaledOffset = mouseOffset.scMult(this.scalingFactor);
				this.center = mouseCoordinate.subtract(scaledOffset);
				this.scale *= this.scalingFactor;
			}
		} else {
			// First, we need the mouse position in coordinate
			var mouseCoordinate = AstroMath.screenToCoordinatePlane(screenVector);
			// Next, we need to measure the offset of that from the view center.
			var mouseOffset = mouseCoordinate.subtract(this.center);
			// Since we zoom out, the distance will become greater by the scaling factor.
			var scaledOffset = mouseOffset.scMult(1 / this.scalingFactor);
			this.center = mouseCoordinate.subtract(scaledOffset);
			this.scale /= this.scalingFactor;
		}
	}
}


