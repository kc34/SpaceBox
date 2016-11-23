/**
 * TODO: Is using the Visitor pattern overkill?
 */
var DrawAlgo = {
  SPRITES : getImages(),
  STAR_RESIZE : 4.0 / 3.0,
  PLANET_RESIZE : 4.0 / 3.0,
  MOON_RESIZE : 3.0 / 2.0,
}

DrawAlgo.starMethod = function(args) {
  var ctx = args[0];
  var view = args[1];
  var myObject = args[2];

  var positionVector = myObject.positionVector;
  var viewVector = view.modelToViewCoordinate(positionVector);

  var viewRadius = myObject.radius / view.scale * DrawAlgo.STAR_RESIZE;
	var skinData = DrawAlgo.starColorFromRadius(myObject.radius);
	var skinId = Math.floor(skinData);
	var progressToNext = skinData - skinId;
	var val1 = 1 - progressToNext;
	var val2 = progressToNext;
	var vector = viewVector;

	var radius = viewRadius;
	var glowRadius = radius * 8 / 5
	// Draw actual.
	ctx.globalAlpha = val1;
  GameView.drawImageAt(ctx, DrawAlgo.SPRITES.star[skinId], vector, radius);
	if (progressToNext != 0) {

		ctx.globalAlpha = val2;
    GameView.drawImageAt(ctx, DrawAlgo.SPRITES.star[skinId + 1], vector, radius);
  }

	// Draw next.
	ctx.globalAlpha = val1;
  GameView.drawImageAt(ctx, DrawAlgo.SPRITES.glow[skinId], vector, glowRadius);

	if (progressToNext != 0) {
		ctx.globalAlpha = val2;
    GameView.drawImageAt(ctx, DrawAlgo.SPRITES.glow[skinId + 1], vector, glowRadius);
	}
  
	ctx.globalAlpha = 1;
}

DrawAlgo.planetMethod = function(args) {
  var ctx = args[0];
  var view = args[1];
  var myObject = args[2];

  var positionVector = myObject.positionVector;
  var viewVector = view.modelToViewCoordinate(positionVector);

  var viewRadius = myObject.radius / view.scale * DrawAlgo.PLANET_RESIZE;
	var skinId = myObject.img;
  GameView.drawImageAt(ctx, DrawAlgo.SPRITES.planet[skinId], viewVector, viewRadius);
}

DrawAlgo.moonMethod = function(args) {
  var ctx = args[0];
  var view = args[1];
  var myObject = args[2];

  var viewVector = view.modelToViewCoordinate(myObject.positionVector);
  var viewRadius = (myObject.radius / view.scale) * DrawAlgo.MOON_RESIZE;
	var skinId = myObject.img;
  GameView.drawImageAt(ctx, DrawAlgo.SPRITES.moon[skinId], viewVector, viewRadius);
}

DrawAlgo.starColorFromRadius = function(radius) {
	if (radius < GameView.timeToRadius(2.5)) {
		return 7;
	} else if (radius < GameView.timeToRadius(15)) {
		var bigRadius = GameView.timeToRadius(15);
		var smallRadius = GameView.timeToRadius(2.5);
		var color = (bigRadius - radius) / (bigRadius - smallRadius) * 7;
		return color;
	} else {
		return 0;
	}
}
