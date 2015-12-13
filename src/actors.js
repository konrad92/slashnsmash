/*
 * actors.js
 * 
 * Game all actors.
 * 
 * Licensed under MIT license.
 * For license details please check the LICENSE file of the project.
 * 
 * @author Konrad Nowakowski <konrad.x92@gmail.com>
 */

/**
 * Game actors objects.
 * 
 * @param {Object} Game Common public game namespace.
 * @param {Object} BBQ Engine public namespace.
 * @param {PIXI} Pixi PIXI rendering engine namespace.
 */
(function(Game, BBQ, PIXI) {
	"use strict";
	
	/**
	 * Game actors.
	 */
	Game.Actors = {};
	
	/**
	 * First stage - Evil Town.
	 */
	Game.Actors.Character = function(texture) {
		// inherited ctor
		BBQ.Actor.call(this);
		
		// calculate texture frame size
		var frameSize = {
			width: texture.width / 3,
			height: texture.height / 1
		};
		
		// initialize texture
		this.setTexture(new PIXI.Texture(texture,
			new PIXI.Rectange(0, 0, frameSize.width, frameSize.height)
		));
	};
	
	// extends from BBQ.Actor class
	BBQ.Utils.extends(Game.Actors.Character, BBQ.Actor, {
		
	});
	
	/**
	 * Preload assets.
	 */
	Game.Actors.Character.preload = function(app) {
		app.loadImages('fatguy');
	};
})(window.Game = window.Game || {}, BBQ, PIXI);
