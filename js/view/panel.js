"use strict";
/**
 * Panel 0.1.3.2
 *
 * By Kevin Chang
 * + touchevents have own delegators
 *
 * TODO:
 * + Focus to know where to send key events
 * + Consider consolidating mouse and touch into pointer events
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
  this.parentComponent = null;
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
  return ((panel.x <= point.clientX && point.clientX <= panel.x + panel.width)
      && (panel.y <= point.clientY && point.clientY <= panel.y + panel.height));
}

Panel.prototype.runOnTopComponent = function(mouseEvent, eventHandler) {

  return Object.keys(this.components) // Gets keys
    .map(function(key) { return this.components[key] }, this) // Gets panel references
    .filter(function(panel) { return Panel.containsPoint(panel, mouseEvent)}) // Removes unclicked ones
    .sort(function(panel1, panel2) { return -1 * (panel1.z_index - panel2.z_index) }) // Sorts descending
    .slice(0, 1)
    .forEach(eventHandler);
}

/**
 * Given a click, delegates to its top component.
 */
Panel.prototype.clickHandler = function(event) {
  this.runOnTopComponent(event, function(component) {
    component.clickHandler({clientX : event.clientX - component.x, clientY : event.clientY - component.y});
  });
}

Panel.prototype.mousedownHandler = function(event) {
  this.runOnTopComponent(event, function(component) {
    component.mousedownHandler({clientX : event.clientX - component.x, clientY : event.clientY - component.y});
  });
}

Panel.prototype.mouseupHandler = function(event) {
  this.runOnTopComponent(event, function(component) {
    component.mouseupHandler({clientX : event.clientX - component.x, clientY : event.clientY - component.y});
  });
}

Panel.prototype.mousemoveHandler = function(event) {
  this.runOnTopComponent(event, function(component) {
    component.mousemoveHandler({clientX : event.clientX - component.x, clientY : event.clientY - component.y});
  });
}

Panel.prototype.mousewheelHandler = function(event) {
  this.runOnTopComponent(event, function(component) {
    component.mousewheelHandler({clientX : event.clientX - component.x, clientY : event.clientY - component.y, wheelDelta : event.wheelDelta });
  });
}

// TODO: Add focus
Panel.prototype.keydownHandler = function(key) {
  Object.keys(this.components) // Gets keys
    .map(function(key) { return this.components[key] }, this) // Gets panel references
    .forEach(function(panel) { panel.keydownHandler(key)} ) // Calls all the panel handlers
}

Panel.prototype.touchstartHandler = function(event) {
  this.runOnTopComponent(event, function(component) {
    component.touchstartHandler({clientX : event.clientX - component.x, clientY : event.clientY - component.y, identifier : event.identifier});
  });
}

Panel.prototype.touchmoveHandler = function(event) {
  console.log(event);
  this.runOnTopComponent(event, function(component) {
    component.touchmoveHandler({clientX : event.clientX - component.x, clientY : event.clientY - component.y, identifier : event.identifier});
  });
}

Panel.prototype.touchendHandler = function(event) {
  this.runOnTopComponent(event, function(component) {
    component.touchendHandler({clientX : event.clientX - component.x, clientY : event.clientY - component.y, identifier : event.identifier});
  });
}

/**
 * Add components
 */
Panel.prototype.addComponent = function(name, component) {
  this.components[name] = component;
  this.components[name].parent = this;
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

  var instance = this;

  this.canvas.onmousedown = function(){ return false; };

  this.canvas.addEventListener('click', function(event) {
  	instance.clickHandler(event);
  }, false);

  this.canvas.addEventListener('mousedown', function(event) {
  	instance.mousedownHandler(event);
  }, false);

  this.canvas.addEventListener('mouseup', function(event) {
  	instance.mouseupHandler(event);
  }, false);

  this.canvas.addEventListener('mousemove', function(event) {
  	instance.mousemoveHandler(event);
  }, false);

  this.canvas.addEventListener('mousewheel', function(event) {
  	instance.mousewheelHandler(event);
  }, false);

  this.canvas.addEventListener("DOMMouseScroll", function(event) {
  	instance.mousewheelHandler({clientX : event.clientX, clientY : event.clientY, wheelDelta : event.detail * -1});
  }, false);

  window.addEventListener('keydown', function(key) {
  	instance.keydownHandler(key);
  }, false);

  this.canvas.addEventListener('touchstart', function(event) {
  	event.preventDefault(); // not a click!
    for (var touchID in event.changedTouches) {
      instance.touchstartHandler(event.changedTouches[touchID]);
    }
  });

  this.canvas.addEventListener('touchmove', function(event) {
  	event.preventDefault(); // not a click!
    for (var touchID in event.changedTouches) {
      instance.touchmoveHandler(event.changedTouches[touchID]);
    }
  });

  this.canvas.addEventListener('touchend', function(event) {
  	event.preventDefault(); // not a click!
  	var touches = event.changedTouches;
    for (var touchID in event.changedTouches) {
      instance.touchendHandler(event.changedTouches[touchID]);
    }
  });
}

ViewPanel.prototype = Object.create(Panel.prototype);

/**
 * Specialized draw used to start GUI hierarcies.
 */
ViewPanel.prototype.draw = function() {
  this.setWindow(0, 0, window.innerWidth, window.innerHeight);
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  Panel.prototype.draw.call(this, this.ctx, 0, 0);
}
