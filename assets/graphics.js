get_images = function() {
	var base_image = new Image();
	base_image.src = 'assets/space_bg.jpg';
	
	var sun_images = new Array(8);
	for (var i = 0; i < 8; i++) {
		sun_images[i] = new Image();
		sun_images[i].src = 'assets/bodies/star_' + i.toString() + '.png';
	}
	
	var glow_images = new Array(8);
	for (var i = 0; i < 8; i++) {
		glow_images[i] = new Image();
		glow_images[i].src = 'assets/bodies/glow_' + i.toString() + '.png';
	}
	
	var planet_images = new Array(5);
	for (var i = 0; i < 5; i++) {
		planet_images[i] = new Image();
		planet_images[i].src = 'assets/bodies/planet_' + i.toString() + '.png';
	}
	
	var moon_images = new Array(2);
	for (var i = 0; i < 2; i++) {
		moon_images[i] = new Image();
		moon_images[i].src = 'assets/bodies/moon_' + i.toString() + '.png';
	}
	
	var images = {};
	
	images["background"] = [base_image];
	images["star"] = sun_images;
	images["glow"] = glow_images;
	images["planet"] = planet_images;
	images["moon"] = moon_images;
	
	return images;
}
