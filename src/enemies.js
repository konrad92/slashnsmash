/*
 * enemies.js
 * 
 * Enemies
 * 
 * Licensed under MIT license.
 * For license details please check the LICENSE file of the project.
 * 
 * @author Daniel "SzAPKO" Dudzikowski <daniel.szapko@gmail.com>
 */

/**
 * Enemies objects.
 * 
 * @param {Object} Game Common public game namespace.
 * @param {Object} BBQ Engine public namespace.
 * @param {PIXI} Pixi PIXI rendering engine namespace.
 */

(function(Game, BBQ, PIXI) {
	"use strict";
	
	/**
	 * Enemies.
	 */
	Game.Enemies = {};
	
	/**
	 * First stage - Evil Town.
	 */
	Game.Enemies.Enemy = function(image) {
		// inherited ctor
		BBQ.AnimatedActor.call(this);
		
		// find image by name
		if(typeof image === 'string') {
			image = Game.app.images[image];
		}
		
		// calculate texture frame size
		this.frameSize = new PIXI.Rectangle(0, 0, 16, 16);
		
		// setup shadow texture
		this.texture = Game.app.tex('shadow');
		this.anchor.x = this.anchor.y = 0.5;
		
		// add body child
		this.body = new PIXI.Sprite(Game.app.tex(image, false));
		this.body.anchor.x = 0.5;
		this.body.anchor.y = 1;
		this.body.texture.trim = this.frameSize.clone();
		this.body.texture.crop = this.frameSize.clone();
		this.addChild(this.body);
		
		// states
		this.state = {
			move: {}
		};
		
		this.health = 50;
		this.healthMax = 50;
		this.damageHP = 5;
		
		this.velocity = new PIXI.Point();
	};
	
	// extends from BBQ.Enemies class
	BBQ.Utils.extends(Game.Enemies.Enemy, BBQ.AnimatedActor, {
		/**
		 * Animation frames to use.
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
			attack: {
				time: 0.5,
				frames: [6, 7, 8]
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
			
			// update state
			this.updateState(delta);
			
			// update physics
			this.position.x += this.velocity.x * 22 * delta;
			this.position.y = Math.min(70, Math.max(0,
				this.position.y + this.velocity.y * 22 * delta
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
		
		delay: function(ms) {
			var date	= new Date();
			var curDate = null;
		 
			do {
				curDate = new Date();
			} while(curDate-date < ms);
		},
		
		damage: function(pkt) {
			this.delay('100');
			if(this.follow.health > 0) {
				this.follow.health -= pkt;		
				this.follow.position.x += 10;
				this.follow.position.y += 10;
				
				this.position.x -= 10;
				this.position.y += 10;
				console.log("HP: " + this.follow.health + "/" + this.follow.healthMax);
			}
		},
		
		/**
		 * 
		 */
		updateState: function(delta) {
			
			var animation = 'idle';
			
			animation = 'walk';
			if((this.position.x - this.follow.position.x) < 70) {
				if(this.position.y > this.follow.position.y) {
					this.velocity.y = -1;
					this.scale.x = -1;
					
					if(this.position.x > this.follow.position.x) {
						this.velocity.x = -1;
					} else {
						this.velocity.x = 1;
						this.scale.x = 1;
					}
				} else {
					this.velocity.y = 1;
					this.scale.x = -1;
					
					if(this.position.x > this.follow.position.x) {
						this.velocity.x = -1;
					} else {
						this.velocity.x = 1;
						this.scale.x = 1;
					}
				}
			} else {
				if(this.position.x > this.follow.position.x) {
					this.velocity.x = -1;
					this.scale.x = -1;
				} else {
					this.velocity.x = 1;
					this.scale.x = 1;
				}
			}
			
			if(Math.abs(this.position.x - this.follow.position.x) <= 15 && Math.abs(this.position.y - this.follow.position.y) <= 25) {
				this.velocity.x = 0;
				animation = 'attack';	
				
				//this.delay('1000');
				//setTimeout(this.damage('10'), 1000);
				this.damage(this.damageHP);
				
				if(this.position.y > this.follow.position.y) {
					this.velocity.y = -1;
				} else {
					this.velocity.y = 1;
				}
			}
			
			// play animation
			this.play(animation);
		}
	});
	
	/**
	 * Preload assets.
	 */
	Game.Enemies.Enemy.preload = function(app) {
		app.loadImages('shadow', 'red-cat');
	};
})(window.Game = window.Game || {}, BBQ, PIXI);