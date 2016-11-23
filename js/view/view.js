/**
 * Panel notes:
 * - want more handlers
 * - reference to parent would be very good.
 */
var View = function(model) {
	this.model = model;
	ViewPanel.call(this, document.getElementById("myCanvas"));

	var gamePanel = new GameView(model);
	gamePanel.z_index = -1;
	this.addComponent("gamePanel", gamePanel);

	// Draw the button that leads to the about page.
	var aboutButton = new Panel(20, window.innerHeight - 60, 40, 40);
	aboutButton.color = "#888888";
	aboutButton.borderColor = "#AAAAAA";
	aboutButton.postprocess = function(ctx, offsetX, offsetY) {
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "40px Arial"
		ctx.fillText("?", 8 + offsetX, 32.5 + offsetY);
	}
	aboutButton.clickHandler = function(event) {
		window.location = "html/about.html";
	};
  aboutButton.touchstartHandler = function(event) {
    this.clickHandler(event);
  }

	this.addComponent("aboutButton", aboutButton);

	var undoButton = new Panel(80, window.innerHeight - 60, 40, 40);
	undoButton.color = "#888888";
	undoButton.postprocess = function(ctx, offsetX, offsetY) {
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "40px Arial"
		ctx.fillText("<", 8 + offsetX, 32.5 + offsetY);
	}
	undoButton.clickHandler = function(event) {
		myModel.bodies.pop();
	}
  undoButton.touchstartHandler = function(event) {
    this.clickHandler(event);
  }

	this.addComponent("undoButton", undoButton);

  var pauseButton = new Panel(140, window.innerHeight - 60, 40, 40);
  pauseButton.color = "#888888";
  pauseButton.postprocess = function(ctx, offsetX, offsetY) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "35px Arial"
    ctx.fillText("||", 11 + offsetX, 29 + offsetY);
  }
  pauseButton.clickHandler = function(event) {
    if (myModel.running) {
      myModel.running = false;
      this.color = "#FF0000";
    } else {
      myModel.running = true;
      this.color = "#888888"
    }
  }
  undoButton.touchstartHandler = function(event) {
    this.clickHandler(event);
  }

  this.addComponent("pauseButton", pauseButton);

}

View.prototype = Object.create(ViewPanel.prototype);

/**
 * Given a click, delegates to all of its components.
 */
