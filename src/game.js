/*
 * game.js
 * 
 * Entry point of the Slash 'n' Smash game.
 * 
 * Licensed under MIT.
 * For license details please check the LICENSE file of the project.
 * 
 * @author Konrad Nowakowski <konrad.x92@gmail.com>
 */

(function() {
	"use strict";
	
	var app = playground({
		smoothing: false,
		scale: 4,
		paths: {
			base: 'assets/',
			images: 'images/',
			sounds: 'sounds/',
			atlases: 'atlases/'
		},
		create: function() {
			this.loadImage("fatguy");
		},
		render: function() {
			this.layer
				.clear('#204070')
				.drawImage(this.images.fatguy, 0, 0);
		},
		resize: function() {
			this.scale = 1 + Math.max(1, parseInt(window.innerWidth / 300));
		}
	});
})();
