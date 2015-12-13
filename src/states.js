/*
 * states.js
 * 
 * States definitions stack.
 * 
 * Licensed under MIT license.
 * For license details please check the LICENSE file of the project.
 * 
 * @author Konrad Nowakowski <konrad.x92@gmail.com>
 */

/**
 * Game stages definitions.
 * 
 * @param {Object} Game Common public game namespace.
 * @param {Object} BBQ Engine public namespace.
 * @param {PIXI} Pixi PIXI rendering engine namespace.
 */
(function(Game, BBQ, PIXI) {
	"use strict";
	
	/**
	 * All game stages definitions.
	 */
	Game.Stages = {};
	
	/**
	 * First stage - Evil Town.
	 */
	Game.Stages.town = {
		/**
		 * Common game preload function.
		 */
		preload: function(app) {
			app.loadImages('road', 'townsky');
		},
		
		/**
		 * Stage appearance perfs.
		 */
		appearance: {
			ground: 'road',
			parallax: [
				{ texture: 'townsky', vscale: 1, hscale: 1 }
			]
		},
		
		/**
		 * Gameplay sections.
		 */
		sections: [
			{
				waves: [
					['SkinHead','SkinHead','SkinHead']
				]
			}
		],
		
		/**
		 * After-win next stage.
		 */
		next: 'pub'
	};
})(window.Game = window.Game || {}, BBQ, PIXI);
