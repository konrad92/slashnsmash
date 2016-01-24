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
	Game.Actors.Character = function(image) {
		// inherited ctor
		BBQ.AnimatedActor.call(this);
		
		// find image by name
		if(typeof image === 'string') {
			image = Game.app.images[image];
		}
		
		// calculate texture frame size
		this.frameSize = new PIXI.Rectangle(0, 0, 16, 28);
		
		// setup shadow texture
		this.texture = Game.app.tex('shadow');
		this.anchor.x = this.anchor.y = 0.5;
		
		// add body child
		this.body = new PIXI.Sprite(Game.app.tex(image, false));
		this.body.anchor.x = 0.5;
		this.body.anchor.y = 1;
		//this.body.texture.trim.width = this.frameSize.width;
		//this.body.texture.trim.height = this.frameSize.height;
		this.body.texture.trim = this.frameSize.clone();
		this.body.texture.crop = this.frameSize.clone();
		this.addChild(this.body);
		
		// states
		this.state = {
			move: {}
		};
		
		this.velocity = new PIXI.Point();
		
		this.health = 100;
		this.healthMax = 100;
		this.damageHP = 15;
		this.isDead = false;
		
		// bind events signals
		this.bindSignal('keydown', this.keydown);
		this.bindSignal('keyup', this.keyup);
	};
	
	// extends from BBQ.Actor class
	BBQ.Utils.extends(Game.Actors.Character, BBQ.AnimatedActor, {
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
			},
			hit: {
				time: 0.5,
				frames: [0, 2, 0, 2],
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
			this.updateState(delta);
			
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
		},
		
		/**
		 * 
		 */
		updateState: function(delta) {
			if(this.animation === 'jump') {
				return;
			}
			
			var animation = 'idle';
			
			// reset velocity
			this.velocity.x = 0;
			this.velocity.y = 0;
			
			// move horizontal
			if(this.state.move.right) {
				this.velocity.x = 1;
				this.scale.x = 1;
				animation = 'walk';
			}
			else if(this.state.move.left) {
				this.velocity.x = -1;
				this.scale.x = -1;
				animation = 'walk';
			}
			
			// move vertical
			if(this.state.move.down) {
				this.velocity.y = 1;
				animation = 'walk';
			}
			else if(this.state.move.up) {
				this.velocity.y = -1;
				animation = 'walk';
			}
			
			// play animation
			this.play(animation);
		},
		
		/**
		 * Distance from the players.
		 */
		
		distance: function() {
			var xx1 = Math.pow(((parseFloat(this.position.x)) - (parseFloat(this.inter.position.x))), 2);
			var yy1 = Math.pow(((parseFloat(this.position.y)) - (parseFloat(this.inter.position.y))), 2);
			var result = (Math.sqrt(xx1 + yy1)); 
			
			return result;
		},
			
		damage: function(pkt) {
			if(this.inter.health > 0) {
				this.inter.health -= pkt;		
				console.log("HP STWORKA: " + this.inter.health + "/" + this.inter.healthMax);
			}
		},
		
		collisionObj: function() {
			if(this.distance() < 10) {
				animation = 'hit';	
				
				//this.delay('1000');
				//setTimeout(this.damage('10'), 1000);
				this.damage(this.damageHP);
			}
		},
		
		keydown: function(key, e) {
			// movement keys
			if(key === 'right') {
				this.state.move.right = true;
			}
			else if(key === 'left') {
				this.state.move.left = true;
			}
			else if(key === 'down') {
				this.state.move.down = true;
			}
			else if(key === 'up') {
				this.state.move.up = true;
			}
			
			if(key === 'c') {
				this.play('jump');
			}
			
			// hit
			if(key === 'i') {
				//this.weapon.velocity.x = 1;
				//this.weapon.scale.x = -1;
				//this.weapon.distanceFromPlayer();
				this.collisionObj();
				
			}
		},
		
		keyup: function(key, e) {
			// movement keys
			if(key === 'right') {
				this.state.move.right = false;
			}
			else if(key === 'left') {
				this.state.move.left = false;
			}
			else if(key === 'down') {
				this.state.move.down = false;
			}
			else if(key === 'up') {
				this.state.move.up = false;
			}
			
			// hit
			if(key === 'i') {
				//this.weapon.scale.x = 1;
			}
		}
	});
	
	/**
	 * Preload assets.
	 */
	Game.Actors.Character.preload = function(app) {
		app.loadImages('shadow', 'fatguy');
	};
})(window.Game = window.Game || {}, BBQ, PIXI);
