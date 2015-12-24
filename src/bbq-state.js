/* 
 * bbq-stage.js
 * 
 * BBQ gameplay state machine states.
 * 
 * Licensed under MIT license.
 * For license details please check the LICENSE file of the project.
 * 
 * @author Konrad Nowakowski <konrad.x92@gmail.com>
 */

/**
 * Common gameplay state module.
 * 
 * @param {Object} BBQ Engine public namespace.
 * @param {PIXI} Pixi PIXI rendering engine namespace.
 */
(function(BBQ, PIXI) {
	"use strict";
	
	/**
	 * Creates actor instance.
	 */
	BBQ.Actor = function() {
		// inheritance ctor
		PIXI.Sprite.apply(this, arguments);
		
		// signals set
		this.signals = [];
		
		// events set
		this.events = [];
	};
	
	// extends BBQ.Actor by PIXI.Sprite class
	BBQ.Utils.extends(BBQ.Actor, PIXI.Sprite, {
		/**
		 * Common ctor.
		 */
		constructor: BBQ.Actor,
		
		/**
		 * Emits actor's defined signal.
		 * Allows optional arguments applying for signal call.
		 * Example:
		 *	actor.emit('damage', 10);
		 * 
		 * Signals call's *this* context is the actor instance.
		 * 
		 * @param {String} signal Signal name to emit.
		 * @returns {BBQ.Actor} Chaining *this* instance.
		 */
		emitSignal: function(signal) {
			var signalFunc = this.signals[signal];
			if(typeof signalFunc === 'function') {
				var slicedArguments = Array.prototype.slice.call(arguments, 1);
				signalFunc.apply(this, slicedArguments);
			}
			return this;
		},
		
		/**
		 * Binds signal callback.
		 * 
		 * @param {String} signal Signal name to bind.
		 * @param {Function} callback Signal callback to call.
		 * @returns {BBQ.Actor} Chaining *this* instance.
		 */
		bindSignal: function(signal, callback) {
			this.signals[signal] = callback;
			return this;
		},
		
		/**
		 * Unbinds signal callback.
		 * 
		 * @param {String} signal Signal name to unbind.
		 * @returns {BBQ.Actor} Chaining *this* instance.
		 */
		unbindSignal: function(signal) {
			delete this.signals[signal];
			return this;
		},
		
		/**
		 * Enqueues event into events array.
		 * 
		 * @param {Object} event Event object.
		 * @returns {BBQ.Actor} Chaining *this* instance.
		 */
		enqueueEvent: function(event) {
			Array.prototype.push.apply(this.events, arguments);
			return this;
		},
		
		/**
		 * Dequeues event from events array.
		 * 
		 * @returns {Object} Shifted (removed) element from end.
		 */
		dequeueEvent: function() {
			return this.events.pop();
		}
	});
	
	/**
	 * Basic camera for rendering from centered axis.
	 */
	BBQ.Camera = function(renderer) {
		// inherited ctor call
		PIXI.Container.call(this);
		
		// renderer setup
		this.renderer = renderer;
	};
	
	// extends BBQ.CenteredContainer
	BBQ.Utils.extends(BBQ.Camera, PIXI.Container, {
		/**
		 * Pre-render update transform.
		 */
		updateTransform: function() {
			var _cx = this.renderer.width / 2,
				_cy = this.renderer.height / 2;
			
			// center camera position
			this.position.x += _cx;
			this.position.y += _cy;
			
			// update transforms
			PIXI.Container.prototype.updateTransform.call(this);
			
			// re-position centered camera
			this.position.x -= _cx;
			this.position.y -= _cy;
		}
	});
	
	/**
	 * State camera manipulation class.
	 */
	BBQ.FollowCamera = function(renderer, x, y) {
		// inherited ctor call
		BBQ.Camera.call(this, renderer);
		
		// setup position
		this.position.x = x || 0;
		this.position.y = y || 0;
	};
	
	// extends BBQ.Camera by BBQ.Camera class
	BBQ.Utils.extends(BBQ.FollowCamera, BBQ.Camera, {
		/**
		 * Camera follows given actors set.
		 */
		followed: [],
		
		/**
		 * Add actor to follow set.
		 * 
		 * @param {BBQ.Actor} actor Actor unique instance to add.
		 */
		follow: function(actor) {
			if(this.followed.indexOf(actor) === -1) {
				this.followed.push(actor);
			}
		},
		
		/**
		 * Remove actor from follow set.
		 * 
		 * @param {BBQ.Actor} actor Actor instance to remove.
		 */
		unfollow: function(actor) {
			var index = this.followed.indexOf(actor);
			if(index !== -1) {
				this.followed = this.followed.splice(
					index, 1
				);
			}
		},
		
		/**
		 * Update camera position.
		 */
		update: function(delta) {
			// follow actors
			if(this.followed.length > 0) {
				// get positions of all actors
				var _x = 0;
				for(var i in this.followed) {
					var actor = this.followed[i];
					_x -= actor.position.x;
				}
				
				// calculate centered position of actors
				this.position.x = _x / this.followed.length;
			}
		}
	});
	
	/**
	 * Allows make parallax backgrounds.
	 */
	BBQ.ParallaxBackground = function(camera) {
		// inherited ctor call
		PIXI.Container.call(this);
		
		// store assigned camera
		this.camera = camera;
	};
	
	// extends BBQ.ParallaxBackground by PIXI.Container
	BBQ.Utils.extends(BBQ.ParallaxBackground, PIXI.Container, {
		addBackground: function(texture, parallax, offset) {
			var bg = new PIXI.extras.TilingSprite(
				texture,
				this.camera.renderer.width,
				this.camera.renderer.height
			);
			bg.parallaxScale = parallax || new PIXI.Point();
			bg.parallaxOffset = offset || new PIXI.Point();
			this.addChild(bg);
		},
		
		updateTransform: function(delta) {
			var camera = this.camera;
			this.children.forEach(function(bg) {
				// resize bg
				bg.width = camera.renderer.width;
				bg.height = camera.renderer.height;
				
				// center-up parallax background
				bg.tilePosition.x = bg.width / 2 - bg.texture.width / 2;
				bg.tilePosition.y = bg.height / 2 - bg.texture.height / 2;
				
				// apply bg offsets
				bg.tilePosition.x += bg.parallaxOffset.x;
				bg.tilePosition.y += bg.parallaxOffset.y;
				
				// apply parallax offsets
				bg.tilePosition.x += camera.x * bg.parallaxScale.x;
				bg.tilePosition.y += camera.y * bg.parallaxScale.y;
			});
		}
	});
	
	/**
	 * Game state manipulating class.
	 */
	BBQ.State = function() {
		// inheritance ctor
		PIXI.Container.call(this);
	};
	
	// extends BBQ.State by PIXI.Container class
	BBQ.Utils.extends(BBQ.State, PIXI.Container, {
		/**
		 * Common ctor.
		 */
		constructor: BBQ.State,
		
		/**
		 * Prepares state scene before first use.
		 */
		create: function() {
			// camera instance
			this.camera = new BBQ.FollowCamera(this.app.renderer);

			// the background objects container
			this.background = new BBQ.ParallaxBackground(this.camera);

			// create common actors layer
			this.actors = new PIXI.Container();
			this.camera.addChild(this.actors);

			// the foreground objects container
			this.foreground = new PIXI.Container();

			// add layers by right order
			this.addChild(this.background);
			this.addChild(this.camera);
			this.addChild(this.foreground);
		},
		
		/**
		 * Updates frame of stage layers.
		 * 
		 * @param {Float} delta Stage update time to apply.
		 */
		step: function(delta) {
			// sort actors depth
			this.actors.children.sort(this.sortActorsFunc);
			
			// perform update actors layers
			this.performLayer(this.actors, 'update', delta, this.app);
			
			// update camera
			this.camera.update(delta);
		},
		
		/**
		 * Renders stage onto screen.
		 */
		render: function() {
			// renders stage gameplay
			this.app.renderer.render(this);
		},
		
		/**
		 * Performs action for single layer actors.
		 * Allows optional arguments applying for action call.
		 * 
		 * @param {PIXI.Container} layer Actors layer container.
		 * @returns {BBQ.Stage} Chaining *this* instance.
		 */
		performLayer: function(layer, action) {
			var slicedArguments = Array.prototype.slice.call(arguments, 2);
			layer.children.forEach(function(actor) {
				var actorFunc = actor[action];
				if(typeof actorFunc === 'function') {
					actorFunc.apply(actor, slicedArguments);
				}
			}, this);
			return this;
		},
		
		/**
		 * General actors sorting function.
		 * Sorts actors depth by Y position property.
		 * 
		 * @param {BBQ.Actor} actor1 Left actor.
		 * @param {BBQ.Actor} actor2 Right actor.
		 * @returns {Number} Comparsion result.
		 */
		sortActorsFunc: function(actor1, actor2) {
			if(actor1.position.y < actor2.position.y) {
				return -1;
			}
			else if(actor1.position.y > actor2.position.y) {
				return 1;
			}
			else {
				return 0;
			}
		}
	});
})(window.BBQ = window.BBQ || {}, PIXI);
