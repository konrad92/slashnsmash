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
		this.hitBbox = new PIXI.Rectangle(0, 0, 4, 10);
		
		// character basic states
		this.health = 100;
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
			},
			kick: { // attack animation
				time: .4,
				frames: [9,10,11,11,11],
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
			
			// jump/hit/kick animation height
			if(this.animation === 'jump') {
				this.body.y = -Math.sin((this.frameTick/2) * Math.PI) * 16;
			}
			else if(this.animation === 'hit') {
				this.body.y = -Math.sin((this.frameTick) * Math.PI) * 8;
			}
			else if(this.animation === 'kick') {
				this.body.y = -Math.sin((this.frameTick/5) * Math.PI) * 8;
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
			this.state.attacking = this.animation === 'punch' || this.animation === 'kick';
			
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
			
			// attacking collision informer
			if(this.state.attacking && this.frameTick > 2) {
				var actor = this.getActorHitCollision(this.scale.x*2, 0);
				if(actor !== false) {
					actor.emitSignal('hit', this);
				}
			}
			
			// update position
			var speed = this.getCurrentSpeed();
			this.position.x += this.velocity.x * speed * delta;
			this.position.y = Math.min(70, Math.max(0,
				this.position.y + this.velocity.y * speed * delta
			));
		},
		
		/**
		 * Returns world bounding box.
		 * 
		 * @returns {PIXI.Rectangle}
		 */
		getWorldBBox: function(x, y) {
			var _cx = this.bbox.width / 2,
				_cy = this.bbox.height / 2;
			
			return new PIXI.Rectangle(
				this.position.x - _cx + this.bbox.x + (x || 0),
				this.position.y - _cy + this.bbox.y + (y || 0),
				this.bbox.width,
				this.bbox.height
			);
		},
		
		/**
		 * Returns world bounding box.
		 * 
		 * @returns {PIXI.Rectangle}
		 */
		getWorldHitBBox: function(x, y) {
			var _cx = this.hitBbox.width / 2,
				_cy = this.hitBbox.height / 2;
			
			return new PIXI.Rectangle(
				this.position.x - _cx + this.hitBbox.x + (x || 0),
				this.position.y - _cy + this.hitBbox.y + (y || 0),
				this.hitBbox.width,
				this.hitBbox.height
			);
		},
		
		/**
		 * Returns collision with actor.
		 * 
		 * @param {Number} x Shift aabb.x coord by given value.
		 * @param {Number} y Shift aabb.y coord by given value.
		 * @returns {BBQ.Actor|Boolean} Collided actor or FALSE.
		 */
		getActorHitCollision: function(x, y) {
			var _bbox = this.getWorldHitBBox(x, y),
				actors = Game.app.state.actors.children,
				actor;
			
			for(var aind in actors) {
				actor = actors[aind];
				if(actor === this) {
					continue;
				}
				if(typeof actor.bbox !== 'undefined') {
					if(actor.getWorldBBox().intersects(_bbox)) {
						return actor;
					}
				}
			}
			
			return false;
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
		
		// input events holder
		this.input = {};
		
		// input keymapping
		this.keymap = {
			right: 'right',
			left: 'left',
			up: 'up',
			down: 'down',
			
			punch: 'p',
			kick: 'o',
			jump: 'l'
		};
		
		// bind events signals
		this.bindSignal('keydown', this.onKeyEvent);
		this.bindSignal('keyup', this.onKeyEvent);
		
		// binds common signals
		this.bindSignal('hit', this.onHit);
		this.bindSignal('destroy', this.onDestroy);
	})
	.extends(Game.Actors.Character)
	.scope({
		/**
		 * Update player movement state.
		 */
		updateState: function (delta) {
			// clear movement state
			this.state.movement.set();
			
			// handle on-ground state
			if(this.state.walking) {
				// handle attacking inputs
				if(this.input.attack) {
					this.play(this.input.attack);
				}
				// handle jumping input
				else if(this.input.jump) {
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
			if (key === this.keymap.right) {
				this.input.right = down;
			} else if (key === this.keymap.left) {
				this.input.left = down;
			} else if (key === this.keymap.down) {
				this.input.down = down;
			} else if (key === this.keymap.up) {
				this.input.up = down;
			}

			if (key === this.keymap.punch && down) {
				this.input.attack = 'punch';
			}
			else if (key === this.keymap.kick && down) {
				this.input.attack = 'kick';
			}
			
			if (key === this.keymap.jump && down) {
				this.input.jump = true;
			}
		},
		
		/**
		 * Handle an hit signal.
		 * 
		 * @param {BBQ.Actor} other
		 */
		onHit: function(other) {
			if(! this.state.hitted && ! this.state.jumping) {
				this.scale.x = -other.scale.x;
				this.health -= other.strength[other.animation] || 10;
				this.play('hit');
				
				if(this.health < 0) {
					Game.app.state.playerKilled(this);
					this.destroy();
				}
			}
		},
		
		/**
		 * On-destroy event handler.
		 */
		onDestroy: function() {
			Game.app.state.camera.unfollow(this);
		}
	});
	
	// Preload assets
	Game.Actors.Player.preload = function(app) {
		app.loadImages('fatguy', 'indicator');
	};
	
	/**
	 * Player with touch-screen useability.
	 */
	Game.Actors.PlayerTouchScreen = BBQ.Class(function() {
		Game.Actors.Player.apply(this, arguments);
		
		// touch event holder
		this.touch = {};
		
		// bind touch-screen events
		this.bindSignal('touchstart', this.onTouchStart);
		this.bindSignal('touchmove', this.onTouchMove);
		this.bindSignal('touchend', this.onTouchEnd);
	})
	.extends(Game.Actors.Player)
	.scope({
		/**
		 * On-touch informations handler.
		 * Simulates common input events.
		 */
		onTouchStart: function(id, x, y) {
			var _scrhw = Game.app.renderer.width / 2,
				_scrhh = Game.app.renderer.height / 2;
			
			// movement
			if(x < _scrhw) {
				if(!this.touch.move) {
					this.touch.move = {
						id: id,
						x: x,
						y: y
					};
				}
				
				// create indicator
				this.indicator = new PIXI.Sprite(Game.app.tex('indicator'));
				this.indicator.anchor = new PIXI.Point(0.5, 0.5);
				this.indicator.position.x = x;
				this.indicator.position.y = y;
				
				Game.app.state.foreground.addChild(this.indicator);
			}
			// jump & attack
			else {
				if(y < _scrhh) {
					this.input.jump = true;					
				}
				else if(x < _scrhw + _scrhw / 2) {
					this.input.attack = 'kick';
				}
				else {
					this.input.attack = 'punch';
				}
			}
		},
		
		/**
		 * On-touch informations handler.
		 * Simulates common input events.
		 */
		onTouchMove: function(id, x, y) {
			if(this.touch.move && this.touch.move.id === id) {
				this.input.right = x - this.touch.move.x > 10;
				this.input.left  = x - this.touch.move.x < -10;
				this.input.down  = y - this.touch.move.y > 10;
				this.input.up    = y - this.touch.move.y < -10;
			}
		},
		
		/**
		 * On-touch informations handler.
		 * Simulates common input events.
		 */
		onTouchEnd: function(id, x, y) {
			if(this.touch.move && this.touch.move.id === id) {
				this.touch.move = false;
				this.input.right = false;
				this.input.left  = false;
				this.input.down  = false;
				this.input.up    = false;
				
				// remove indicator
				if(this.indicator) {
					Game.app.state.foreground.removeChild(this.indicator);
					this.indicator = false;
				}
			}
		}
	});
	
	
	/**
	 * Enemy actor.
	 */
	Game.Actors.Enemy = BBQ.Class(function() {
		// inherite ctor call
		Game.Actors.Character.apply(this, arguments);
		
		// bind additional signals
		this.bindSignal('hit', this.onHit);
		
		// following player object
		this.follow = false;
		this.tick = 0;
		
		// enemy basic states
		this.health = 50;
		this.speed = {
			walk: 25,
			jump: 40,
			hit: -50,
			punch: 20,
			kick: 10
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
					else if(this.tick-- <= 0) {
						this.play(Math.random() < 0.75 ? 'punch' : 'kick');
						this.tick = 5 + 10 * Math.random();
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
				currentDistance = 100;
			
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
			
			// player were killed
			if(this.follow && this.follow.killed) {
				this.follow = false;
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
		},
		
		/**
		 * Handle an hit signal.
		 * 
		 * @param {BBQ.Actor} other
		 */
		onHit: function(other) {
			if(! this.state.hitted) {
				this.scale.x = -other.scale.x;
				this.health -= other.strength[other.animation] || 10;
				this.play('hit');
				
				if(this.health <= 0) {
					this.destroy();
				}
			}
		}
	});
	
	// Preload assets
	Game.Actors.Enemy.preload = function(app) {
		app.loadImages('enemyguy');
	};
})(window.Game = window.Game || {}, BBQ, PIXI);
