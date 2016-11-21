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
	undoButton.mousedownHandler = function(event) {
		console.log("Undo that shit");
		console.log(myModel.bodies);
		myModel.bodies.pop();
		console.log(myModel.bodies);
	}

	this.addComponent("undoButton", undoButton);

}

View.prototype = Object.create(ViewPanel.prototype);

/*
View.prototype.mousedownHandler = function(event) {
	this.components["gamePanel"].mousedownHandler(event);
}
*/

/**
 * Given a click, delegates to all of its components.
 */
View.prototype.mousedownHandler = function(event) {

  var sortedPanels = Object.keys(this.components) // Gets keys
    .map(function(key) { return this.components[key] }, this) // Gets panel references
    .filter(function(panel) { return Panel.containsPoint(panel, event)}) // Removes unclicked ones
    .sort(function(panel1, panel2) { return -1 * (panel1.z_index - panel2.z_index) }); // Sorts descending

  if (sortedPanels.length > 0) {
    var panel = sortedPanels[0];
    panel.mousedownHandler({x : event.x - panel.x, y : event.y - panel.y})
  }
}

View.prototype.mouseupHandler = function(event) {
	this.components["gamePanel"].mouseupHandler(event);
}

View.prototype.mousemoveHandler = function(event) {
	this.components["gamePanel"].mousemoveHandler(event);
}

View.prototype.mousewheelHandler = function(event) {
	this.components["gamePanel"].mousewheelHandler(event);
}

View.prototype.keydownHandler = function(key) {
	this.components["gamePanel"].keydownHandler(key);
}
