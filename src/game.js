/*
 * game.js
 * 
 * Entry point of the Slash 'n' Smash game.
 * 
 * Licensed under MIT license.
 * For license details please check the LICENSE file of the project.
 * 
 * @author Konrad Nowakowski <konrad.x92@gmail.com>
 */

(function() {
	"use strict";
		
	// make vhs tape as loader icon
	var vhsTape = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAYCAMAAAB9agt2AAAACVBMVEUAAAAdHR0uLi7jKkv9AAAAAXRSTlMAQObYZgAAAHJJREFUeAHt08EKgDAMA9A0///RHjZJFBltZeDBgLf2CbFCiXzwlIiXQjCfjwKsZBugr3GbIdX+AtD+AEgHJKyAMIA4HwGRA+bLSQFADtCQDw6vDGi1C4wi2AYINAErcSZfot8By3fAC+BxYOO/8APo7R/1xwXL3YSqTQAAAABJRU5ErkJggg==';
	PLAYGROUND.LoadingScreen.logoRaw = vhsTape;
	
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
		ready: function() {
			// this.setState(...)
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
