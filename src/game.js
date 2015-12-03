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

(function(window) {
	"use strict";
	
	/**
	 * Disable linear interpolation.
	 * Use nearest neightbor instead.
	 */
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
	
	/**
	 * App entry point.
	 */
	var app = {
		renderer: PIXI.autoDetectRenderer(800, 600, {
			backgroundColor : 0x1099bb
		}),
		stage: new PIXI.Container(),
		mainloop: function() {
			window.requestAnimationFrame(this.mainloop.bind(this));
			
			// update canvas scale
			this.renderer.resize(window.innerWidth / 4, window.innerHeight / 4);
			this.renderer.render(this.stage);
		},
		start: function() {
			this.img = PIXI.Texture.fromImage('assets/images/fatguy.png');
			this.stage.addChild(new PIXI.Sprite(this.img));
			
			this.renderer.autoResize = true;
			document.body.appendChild(this.renderer.view);
			this.mainloop();
		}
	};
	
	/**
	 * Run app.
	 */
	app.start();
})(window);
