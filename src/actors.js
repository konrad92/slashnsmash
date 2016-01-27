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
	Game.Actors.Character = BBQ.Class(function(image) {
		// inherited ctor
		BBQ.AnimatedActor.call(this);
		
		// find image by name
		if(typeof image === 'string') {
			image = Game.app.images[image];
		}
		
		// setup shadow texture
		this.texture = Game.app.tex('shadow');
		this.anchor.x = this.anchor.y = 0.5;
		
		// add body child
		this.body = new PIXI.Sprite(Game.app.tex(image, false));
		this.body.anchor.x = 0.5;
		this.body.anchor.y = 1;
		//this.body.texture.trim.width = this.frameSize.width;
		//this.body.texture.trim.height = this.frameSize.height;
		//this.body.texture.trim = this.frameSize.clone();
		//this.body.texture.crop = this.frameSize.clone();
		this.addChild(this.body);
		
		// calculate texture frame size
		this.frameSize = new PIXI.Rectangle(0, 0, 16, 28);
		
		// states
		this.state = {
			movement: new PIXI.Point()
		};
		
		// movement velocity
		this.velocity = new PIXI.Point();
		
		// collision bounding box
		this.bbox = new PIXI.Rectangle(0, 0, 16, 8);
		
		// character basic states
		this.health = 100;
		this.speed = {
			walk: 35,
			jump: 50,
			hit: -50,
			punch: 20
		};
	})
	.extends(BBQ.AnimatedActor)
	.properties({
		/**
		 * Frame size as PIXI.Rectangle
		 */
		frameSize: {
			get: function() {
				return this.body.texture.crop;
			},
			set: function(value) {
				this.body.texture.trim = value.clone();
				this.body.texture.crop = value.clone();
			}
		}
	})
	.scope({
		/**
		 * Animations frames to use.
		 */
		animations: {
			idle: {
				time: 1,
				frames: [0]
			},
			walk: {
				time: 0.42,
				frames: [0, 1, 0, 2]
			},
			jump: {
				time: .5,
				frames: [3, 4],
				next: 'idle'
			},
			hit: {
				time: .35,
				frames: [5],
				next: 'idle'
			},
			punch: { // attack animation
				time: .3,
				frames: [6,7,8,8,8],
				next: 'idle'
			}
		},
		
		/**
		 * Update character states.
		 */
		update: function(delta) {
			// inherited super method call
			BBQ.AnimatedActor.prototype.update.call(this, delta);
			
			// update animation frame
			this.updateAnimFrame();
			
			// is jump/hit animation
			if(this.animation === 'jump' || this.animation === 'hit') {
				this.body.y = -Math.sin((this.frameTick/2) * Math.PI) * 16;
			}
			
			// update state
			if(typeof this.updateState === 'function') {
				this.updateState(delta); // exec only if exists				
			}
			
			// update physics
			this.updatePhysics(delta);
		},
		
		/**
		 * Updates animation frame by texture cropping.
		 */
		updateAnimFrame: function() {
			// crop texture by frame index
			this.body.texture.crop.x = Math.floor(this.frameIndex % 3) * this.frameSize.width;
			this.body.texture.crop.y = Math.floor(this.frameIndex / 3) *this.frameSize.height;
			this.body.texture._updateUvs();
		},
		
		/**
		 * Updates character physic.
		 * 
		 * @returns {undefined}
		 */
		updatePhysics: function(delta) {
			this.state.walking = this.animation === 'idle' || this.animation === 'walk';
			this.state.jumping = this.animation === 'jump';
			this.state.hitted = this.animation === 'hit';
			this.state.attacking = this.animation === 'punch';
			
			// free movement (unlocked)
			if(this.state.walking) {
				this.velocity = this.state.movement.clone().normalize();
				
				// play animation
				if(this.velocity.x || this.velocity.y) {
					this.play('walk');
				}
				else {
					this.play('idle');
				}
			}
			
			// attacking or hitted movement
			if(this.state.attacking || this.state.hitted) {
				this.velocity.set(this.scale.x, 0).normalize();
			}
			
			// update position
			var speed = this.getCurrentSpeed();
			this.position.x += this.velocity.x * speed * delta;
			this.position.y = Math.min(70, Math.max(0,
				this.position.y + this.velocity.y * speed * delta
			));
		},
		
		/**
		 * Calculates current character speed by actual animation.
		 * Different speed are each states i.e. ground/air speed.
		 * 
		 * @returns {Number} Speed
		 */
		getCurrentSpeed: function() {
			return this.speed[this.animation] || 0;
		}
	})
	.final();
	
	// Preload assets
	Game.Actors.Character.preload = function(app) {
		app.loadImages('shadow');
	};
	
	
	/**
	 * Player actor.
	 */
	Game.Actors.Player = BBQ.Class(function() {
		// inherite ctor call
		Game.Actors.Character.apply(this, arguments);
		
		// events holder
		this.input = {};
		
		// bind events signals
		this.bindSignal('keydown', this.onKeyEvent);
		this.bindSignal('keyup', this.onKeyEvent);
	})
	.extends(Game.Actors.Character)
	.scope({
		/**
		 * Update player movement state.
		 */
		updateState: function (delta) {
			// clear movement state
			this.state.movement.set();
			
			// handle attacking inputs
			if(this.input.attack && this.state.walking) {
				this.play(this.input.attack);
			}
			// handle jumping input
			else if(this.input.jump && this.state.walking) {
				this.play('jump');
			}
			else {
				// handle inputs for horizontal movement
				if(this.input.right) {
					this.state.movement.x = 1;
					this.scale.x = 1;
				}
				else if(this.input.left) {
					this.state.movement.x = -1;
					this.scale.x = -1;
				}
				
				// handle inputs for vertical movement
				if(this.input.down) {
					this.state.movement.y = 1;
				}
				else if(this.input.up) {
					this.state.movement.y = -1;
				}
			}
			
			// clear states
			this.input.attack = false;
			this.input.jump = false;
		},
		
		/**
		 * Handle keyboard event.
		 * 
		 * @param {type} e
		 * @param {type} down
		 * @returns {undefined}
		 */
		onKeyEvent: function(key, down) {
			// movement keys
			if (key === 'right') {
				this.input.right = down;
			} else if (key === 'left') {
				this.input.left = down;
			} else if (key === 'down') {
				this.input.down = down;
			} else if (key === 'up') {
				this.input.up = down;
			}

			if (key === 'x' && down) {
				this.input.attack = 'punch';
			}
			
			if (key === 'c' && down) {
				this.input.jump = true;
			}
		}
	});
	
	// Preload assets
	Game.Actors.Player.preload = function(app) {
		app.loadImages('fatguy');
	};
	
	
	/**
	 * Enemy actor.
	 */
	Game.Actors.Enemy = BBQ.Class(function() {
		// inherite ctor call
		Game.Actors.Character.apply(this, arguments);
		
		// following player object
		this.follow = false;
		
		// enemy basic states
		this.health = 50;
		this.speed = {
			walk: 25,
			jump: 40,
			punch: 20
		};
	})
	.extends(Game.Actors.Character)
	.scope({
		/**
		 * Update enemy movement state.
		 */
		updateState: function (delta) {
			if(this.state.walking) {
				// find nearest player
				var player = this.findNearestPlayer();

				// player found
				if(player !== false) {
					// clear movement state
					this.state.movement.set();
					
					// movement
					if(this.distanceTo(player) > 10) {
						this.moveTo(player);
					}

					// face direction
					this.scale.x = this.position.x > player.position.x ? -1 : 1;
				}
			}
		},
		
		/**
		 * Returns nearest player.
		 * 
		 * @returns {BBQ.Actor|Boolean} Nearest player or FALSE.
		 */
		findNearestPlayer: function() {
			var players = Game.app.state.players,
				currentDistance;
			
			// reset following state
			//this.follow = false;
			
			// find nearest player
			for(var pind in players) {
				var player = players[pind],
					playerDistance = this.distanceTo(player);
				if(playerDistance < 60) { // min 30 pixels
					if(this.follow === false || playerDistance < currentDistance) {
						currentDistance = playerDistance;
						this.follow = player;
					}
				}
			}
			
			return this.follow;
		},
		
		/**
		 * Calculates distance to given actor.
		 * 
		 * @param {BBQ.Actor} actor Other actor.
		 * @returns {Number} Distance between actors.
		 */
		distanceTo: function(actor) {
			var x = actor.position.x - this.position.x,
				y = actor.position.y - this.position.y;
			
			// algorytm pytagolasa sqrt(x^2 + y^2)
			return Math.sqrt(
				x*x + y*y
			);
		},
		
		/**
		 * Moves enemy towards given actor.
		 * Changes only velocity vector, does not work immediately.
		 * 
		 * @param {BBQ.Actor} actor Target actor.
		 * @param {Number} speed Movement speed.
		 */
		moveTo: function(actor, speed) {
			var distance = this.distanceTo(actor);
			
			// normalizuj wektor ia porusz 'do'
			// (mnozac przez wektor normalnej actor.pos - this.pos)
			this.state.movement.x = (actor.position.x - this.position.x)/distance;
			this.state.movement.y = (actor.position.y - this.position.y)/distance;
		}
	});
	
	// Preload assets
	Game.Actors.Enemy.preload = function(app) {
		app.loadImages('enemyguy');
	};
})(window.Game = window.Game || {}, BBQ, PIXI);
