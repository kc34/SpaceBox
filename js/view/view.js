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
	var aboutButton = new Panel(10, window.innerHeight - 30, 20, 20);
	aboutButton.color = "#888888";
	aboutButton.borderColor = "#AAAAAA";
	aboutButton.postprocess = function(ctx, offsetX, offsetY) {
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "20px Arial"
		ctx.fillText("?", 4 + offsetX, 16.25 + offsetY);
	}
	aboutButton.clickHandler = function(event) {
		window.location = "html/about.html";
	};

	this.addComponent("aboutButton", aboutButton);

	var undoButton = new Panel(40, window.innerHeight - 30, 20, 20);
	undoButton.color = "#FF0000";
	undoButton.clickHandler = function(event) {
		myModel.bodies.pop();
	}

	this.addComponent("undoButton", undoButton);

}

View.prototype = Object.create(ViewPanel.prototype);

/**
 * Given a click, delegates to all of its components.
 */
