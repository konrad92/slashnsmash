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
			chara.position.x = 60;
			chara.position.y = 60;
			this.actors.addChild(chara);
			this.camera.follow(chara);
			this.players.push(chara);
			
			/**
			 * Create our pet.
			 */
			
			var cat = new Game.Creatures.Cat('white-cat');
			cat.position.x = 240;
			cat.position.y = 25;
			this.actors.addChild(cat);
			
			cat.follow = chara;
			chara.weapon = cat;
			
			/**
			 * Create enemies.
			 */
			
			var enemy1 = new Game.Enemies.Enemy('red-cat');
			enemy1.position.x = 300;
			enemy1.position.y = 15;
			this.actors.addChild(enemy1);
			
			enemy1.follow = chara;
			
			var enemy2 = new Game.Enemies.Enemy('red-cat');
			enemy2.position.x = 500;
			enemy2.position.y = 35;
			this.actors.addChild(enemy2);
			
			enemy2.follow = chara;
			
			var enemy3 = new Game.Enemies.Enemy('red-cat');
			enemy3.position.x = 800;
			enemy3.position.y = 15;
			this.actors.addChild(enemy3);
			
			enemy3.follow = chara;
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
