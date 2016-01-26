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
			move: {}
		};
		
		this.velocity = new PIXI.Point();
		
		// character basic states
		this.health = 100;
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
		 * Animation frames to use.
		 */
		animations: {
			idle: {
				time: 1,
				frames: [0]
			},
			walk: {
				time: 0.5,
				frames: [0, 1, 0, 2]
			},
			jump: {
				time: .5,
				frames: [2],
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
			
			// is jump animation
			if(this.animation === 'jump') {
				this.body.y = -Math.sin(this.frameTick * Math.PI) * 16;
			}
			
			// update state
			if(typeof this.updateState === 'function') {
				this.updateState(delta); // exec only if exists				
			}
			
			// update physics
			this.position.x += this.velocity.x * 25 * delta;
			this.position.y = Math.min(70, Math.max(0,
				this.position.y + this.velocity.y * 25 * delta
			));
		},
		
		/**
		 * Updates animation frame by texture cropping.
		 */
		updateAnimFrame: function() {
			// crop texture by frame index
			this.body.texture.crop.x = Math.floor(this.frameIndex % 3) * this.frameSize.width;
			this.body.texture.crop.y = Math.floor(this.frameIndex / 3) *this.frameSize.height;
			this.body.texture._updateUvs();
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
		
		// bind events signals
		this.bindSignal('keyEvent', this.keyEvent);
	})
	.extends(Game.Actors.Character)
	.scope({
		/**
		 * Animations recreated.
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
				frames: [2],
				next: 'idle'
			}
		},
		
		/**
		 * Update player movement state.
		 */
		updateState: function (delta) {
			var animation = 'idle',
				isJumping = this.animation === 'jump',
				isOnGround = ! isJumping;

			// on-ground movement
			if(isOnGround) {
				// reset velocity
				this.velocity.x = this.velocity.y = 0;

				// move horizontal
				if (this.state.move.right) {
					this.velocity.x = 1;
					this.scale.x = 1;
					animation = 'walk';
				} else if (this.state.move.left) {
					this.velocity.x = -1;
					this.scale.x = -1;
					animation = 'walk';
				}

				// move vertical
				if (this.state.move.down) {
					this.velocity.y = 1;
					animation = 'walk';
				} else if (this.state.move.up) {
					this.velocity.y = -1;
					animation = 'walk';
				}

				// play animation
				this.play(animation);
			}
			
			// normalize velocity vector
			var length = Math.sqrt(
				this.velocity.x * this.velocity.x +
				this.velocity.y * this.velocity.y
			);
		
			var speed = isOnGround ? 1.5 : 1.8;
			this.velocity.x = ((this.velocity.x/length) * speed) || 0;
			this.velocity.y = ((this.velocity.y/length) * speed) || 0;
		},
		
		/**
		 * Handle keyboard event.
		 * 
		 * @param {type} e
		 * @param {type} down
		 * @returns {undefined}
		 */
		keyEvent: function(key, down) {
			// movement keys
			if (key === 'right') {
				this.state.move.right = down;
			} else if (key === 'left') {
				this.state.move.left = down;
			} else if (key === 'down') {
				this.state.move.down = down;
			} else if (key === 'up') {
				this.state.move.up = down;
			}

			if (key === 'c' && down) {
				this.play('jump');
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
	})
	.extends(Game.Actors.Character)
	.scope({
		/**
		 * Update enemy movement state.
		 */
		updateState: function (delta) {
			if (this.animation === 'jump') {
				return;
			}

			var animation = 'idle';

			// reset velocity
			this.velocity.x = this.velocity.y = 0;

			// find nearest player
			var player = this.findNearestPlayer();

			// player found
			if(player !== false) {
				// movement
				if(this.distanceTo(player) > 10) {
					this.moveTo(player, 1);
					animation = 'walk';
				}
				
				// face direction
				this.scale.x = this.position.x > player.position.x ? -1 : 1;
			}

			// play animation
			this.play(animation);
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
			this.follow = false;
			
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
			// normalizuj wektor
			var distance = this.distanceTo(actor),
				normx = (actor.position.x - this.position.x)/distance,
				normy = (actor.position.y - this.position.y)/distance;
			
			// porusz 'do' (mnozac przez wektor normalnej actor.pos - this.pos)
			this.velocity.x += normx * speed;
			this.velocity.y += normy * speed;
		}
	});
	
	// Preload assets
	Game.Actors.Enemy.preload = function(app) {
		app.loadImages('enemyguy');
	};
})(window.Game = window.Game || {}, BBQ, PIXI);
