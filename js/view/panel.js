"use strict";
/**
 * Panel 0.1.1
 *
 * By Kevin Chang
 */

/**
 * Basic GUI structure. Can contain other Panels.
 *
 * Configure its draw() and clickHandler()!
 */
function Panel(x, y, width, height) {
  this.type = "PANEL";
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = "#000000"
  this.components = {};
  this.z_index = 0; // Inspired by CSS. Higher number means it will be up front.
}

/**
 * The main drawing function. Contains space for pre- and post-processing.
 */
Panel.prototype.draw = function(ctx, windowX, windowY) {

  this.preprocess(ctx, windowX, windowY);
  this.drawPanel(ctx, windowX, windowY);
  this.postprocess(ctx, windowX, windowY);

  Object.keys(this.components)
    .map(function(key) { return this.components[key] }, this)
    .sort(function(obj1, obj2) { return obj1.z_index - obj2.z_index}) // sorts-by-ascending
    .forEach(function(obj) { obj.draw(ctx, windowX + obj.x, windowY + obj.y) });


}

/**
 * Draws itself onto the given context.
 */
Panel.prototype.drawPanel = function(ctx, windowX, windowY) {
  ctx.fillStyle = this.color;
  ctx.fillRect(windowX, windowY, this.width, this.height);
}

/**
 * Useful for resizing. Defaults to no-op.
 */
Panel.prototype.preprocess = function(ctx, windowX, windowY) {};

/**
 * Useful for drawing non-panel objects. Defaults to no-op.
 */
Panel.prototype.postprocess = function(ctx, windowX, windowY) {};

/**
 * Given a point, returns whether point is on this panel.
 *
 * Example: Panel(0, 0, 2, 2):
 *  (1, 1) -> true
 *  (3, 3) -> false
 */
Panel.containsPoint = function(panel, point) {
  return ((panel.x <= point.x && point.x <= panel.x + panel.width)
      && (panel.y <= point.y && point.y <= panel.y + panel.height));
}

/**
 * Given a click, delegates to all of its components.
 */
Panel.prototype.clickHandler = function(event) {

  var sortedPanels = Object.keys(this.components) // Gets keys
    .map(function(key) { return this.components[key] }, this) // Gets panel references
    .filter(function(panel) { return Panel.containsPoint(panel, event)}) // Removes unclicked ones
    .sort(function(panel1, panel2) { return -1 * (panel1.z_index - panel2.z_index) }); // Sorts descending

  if (sortedPanels.length > 0) {
    var panel = sortedPanels[0];
    panel.clickHandler({x : event.x - panel.x, y : event.y - panel.y})
  }
}

/**
 * Add components
 */
Panel.prototype.addComponent = function(name, component) {
  this.components[name] = component;
}

/**
 * Setter function for the window size and position.
 */
Panel.prototype.setWindow = function(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

/**
 * The MainPanel is a special Panel that has access to the canvas.
 *
 * GUI hierarchies should start with a MainPanel.
 */
function ViewPanel(canvas) {
  this.canvas = canvas;
  Panel.call(this, 0, 0, this.canvas.width, this.canvas.height);

  this.canvas = canvas;
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  this.canvas.onmousedown = function(){ return false; };
  this.ctx = this.canvas.getContext("2d");
}

ViewPanel.prototype = Object.create(Panel.prototype);

/**
 * Specialized draw used to start GUI hierarcies.
 */
ViewPanel.prototype.draw = function() {
  Panel.prototype.draw.call(this, this.ctx, 0, 0);
}

/**
 * Default window setter. Sets this panel to take up all available space.
 */
ViewPanel.prototype.preprocess = function() {
  this.setWindow(0, 0, window.innerWidth, window.innerHeight);
}
/**
 * Given a click, delegates to all of its components.
 */
ViewPanel.prototype.clickHandler = function(event) {
  var canvasRect = this.canvas.getBoundingClientRect();
  Panel.prototype.clickHandler.call(this, {x: event.x - canvasRect.left, y: event.y - canvasRect.top});
}
