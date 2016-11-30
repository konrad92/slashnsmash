/*
 * creatures.js
 * 
 * Creatures. Animals
 * 
 * Licensed under MIT license.
 * For license details please check the LICENSE file of the project.
 * 
 * @author Daniel "SzAPKO" Dudzikowski <daniel.szapko@gmail.com>
 */

/**
 * Creatures and animals objects.
 * 
 * @param {Object} Game Common public game namespace.
 * @param {Object} BBQ Engine public namespace.
 * @param {PIXI} Pixi PIXI rendering engine namespace.
 */

(function(Game, BBQ, PIXI) {

	Game.Actors.Cat = BBQ.Class(function(){
	    Game.Actors.Enemy.call(this, "cat"); // obrazek cat.png
	    
	    this.frameSize = new PIXI.Rectangle(0, 0, 16, 16);
	    
	    // following player object
		this.follow = false;
		this.tick = 0;
	    
		// character basic states
		this.health = 1000;
		this.strength = {
			punch: 10,
			kick: 15
		};
		this.speed = {
			walk: 35,
			jump: 50,
			hit: -50,
			punch: 20,
			kick: 10
		};
	})
	.extends(Game.Actors.Enemy)
	.properties({
	})
	.scope({
		/**
		 * Animations frames to use.
		 */
		animations: {
			idle: {
				time: 0.5,
				frames: [3, 4, 5]
			},
			walk: {
				time: 0.5,
				frames: [0, 1, 0, 2]
			},
			hit: {
				time: 2,
				frames: [0, 1, 2, 3, 4, 5],
				next: 'idle'
			}//,
			//attack: {
			//	time: 0.7,
			//	frames: [0, 1, 0, 2]
			//},
		},
		
		updateState: function (delta) {
			if(this.state.walking) {

				// find nearest player
				var player = this.findNearestPlayer();

				// player found
				if(player !== false) {
					// clear movement state
					this.state.movement.set();
					
					// movement
					if(this.distanceTo(player) > 20) {
						this.moveTo(player);
					} else if(this.tick-- <= 0) {
						this.animation = 'idle';
						//this.tick = 5 + 10 * Math.random();
					}

					// face direction
					this.scale.x = this.position.x > player.position.x ? -1 : 1;
				}
			}
		}
	});

	Game.Actors.Cat.preload = function(app) {
	    app.loadImages('cat');
	};

})(window.Game = window.Game || {}, BBQ, PIXI);
	 