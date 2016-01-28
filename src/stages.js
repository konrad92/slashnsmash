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
	 * Fatality image.
	 */
	Game.Fatality = BBQ.Class(function() {
		// call inherited ctor
		PIXI.Sprite.call(this, Game.app.tex('fatality'));
		
		// change sprite anchor to center
		this.anchor = new PIXI.Point(0.5, 0.5);
		this.timer = 100;
	})
	.extends(PIXI.Sprite)
	.scope({
		/**
		 * Center fatality image.
		 */
		updateTransform: function() {
			this.position.x = Game.app.renderer.width / 2;
			this.position.y = (Game.app.renderer.height / 2.5) - Math.abs(Math.cos((this.timer/100 + 50)*Math.PI) * 100 * Math.sin((this.timer/200)*Math.PI));
			PIXI.Sprite.prototype.updateTransform.call(this);
			
			if(this.timer > 0) {
				this.timer--;
			}
		}
	});
	
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
			
			var chara = new Game.Actors.Player('fatguy');
			chara.position.x = 60;
			this.actors.addChild(chara);
			this.camera.follow(chara);
			this.players.push(chara);
			
			var enemy = new Game.Actors.Enemy('enemyguy');
			this.actors.addChild(enemy);
			
			var spr = new BBQ.Actor(Game.app.tex('fatguy'));
			spr.position.x = 60;
			spr.position.y = 50;
			spr.anchor.x = 0.5;
			spr.anchor.y = 1;
			this.actors.addChild(spr);
			
			this.foreground.addChild(new Game.Fatality());
		},
		
		keydown: function(e) {
			this.players.forEach(function(player) {
				player.enqueueEvent('keydown', e.key, true, e);
			}, this);
		},
		
		keyup: function(e) {
			this.players.forEach(function(player) {
				player.enqueueEvent('keyup', e.key, false, e);
			}, this);
		},
		
		playerKilled: function(player) {
			var ind = this.players.indexOf(player);
			if(ind !== -1) {
				this.players.splice(ind, 1);
				console.log(this.players);
			}
			
			// fatality message
			if(this.players.length <= 0) {
				this.foreground.addChild(new Game.Fatality());
			}
		}
	});
	
	
	/**
	 * All game stages definitions.
	 */
	Game.Stages = {};
	
	/**
	 * Common preload assets.
	 */
	Game.Stages._ = {
		preload: function(app) {
			app.loadImages('fatality');
		}
	};
	
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
