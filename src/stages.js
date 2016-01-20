/*
 * stage.js
 * 
 * All game stages definitions stack.
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
	 * Common stage definition.
	 */
	Game.Stage = function() {
		BBQ.State.call(this);
		
		this.players = [];
	};
	
	// extends Game.Stage by BBQ.State class
	BBQ.Utils.extends(Game.Stage, BBQ.State, {
		/**
		 * Prepares game stage.
		 */
		enter: function() {
			this.background.addBackground('townsky', {
				scale: new PIXI.Point(.5, .5)
			});
			
			this.background.addBackground('road', {
				scale: new PIXI.Point(1, 1),
				offset: new PIXI.Point(0, -22),
				vtiled: false,
				htiled: true
			});
			
			var chara = new Game.Actors.Character('fatguy');
			chara.position.x = 40;
			this.actors.addChild(chara);
			this.camera.follow(chara);
			this.players.push(chara);
			
			/**
			 * Create our pet.
			 */
			
			var cat = new Game.Creatures.Cat('white-cat');
			cat.position.x = 15;
			cat.position.y = 15;
			this.actors.addChild(cat);
			
			cat.follow = chara;
				
			var spr = new BBQ.Actor(Game.app.tex('fatguy'));
			spr.position.x = 60;
			spr.position.y = 50;
			spr.anchor.x = 0.5;
			spr.anchor.y = 1;
			this.actors.addChild(spr);
		},
		
		keydown: function(e) {
			this.players.forEach(function(player) {
				player.enqueueEvent('keydown', e.key, e);
			}, this);
		},
		
		keyup: function(e) {
			this.players.forEach(function(player) {
				player.enqueueEvent('keyup', e.key, e);
			}, this);
		}
	});
	
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
