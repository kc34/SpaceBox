getImages = function() {
	var baseImage = new Image();
	baseImage.src = 'assets/space_bg.jpg';

	var sunImages = new Array(8);
	for (var i = 0; i < 8; i++) {
		sunImages[i] = new Image();
		sunImages[i].src = 'assets/bodies/star_' + i.toString() + '.png';
	}

	var glowImages = new Array(8);
	for (var i = 0; i < 8; i++) {
		glowImages[i] = new Image();
		glowImages[i].src = 'assets/bodies/glow_' + i.toString() + '.png';
	}

	var planetImages = new Array(5);
	for (var i = 0; i < 5; i++) {
		planetImages[i] = new Image();
		planetImages[i].src = 'assets/bodies/planet_' + i.toString() + '.png';
	}

	var moonImages = new Array(2);
	for (var i = 0; i < 2; i++) {
		moonImages[i] = new Image();
		moonImages[i].src = 'assets/bodies/moon_' + i.toString() + '.png';
	}

  var explosionImages = new Array(16);
  for (var i = 0; i < 16; i++) {
    explosionImages[i] = new Image();
    explosionImages[i].src = 'assets/explosion/' + i.toString() + '.png';
  }

	var images = {};

	images["background"] = [baseImage];
	images["star"] = sunImages;
	images["glow"] = glowImages;
	images["planet"] = planetImages;
	images["moon"] = moonImages;
  images["explosion"] = explosionImages;

	return images;
}
