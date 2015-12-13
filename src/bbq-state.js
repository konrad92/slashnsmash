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
	 * State camera manipulation class.
	 */
	BBQ.Camera = function(x, y) {
		// inherited ctor call
		PIXI.Container.apply(this);
		
		// setup position
		this.position.x = x || 0;
		this.position.y = y || 0;
	};
	
	// extends BBQ.Camera by PIXI.Container class
	BBQ.Utils.extends(BBQ.Camera, PIXI.Container, {
		/**
		 * Camera follows given actors set.
		 */
		followed: [],
		
		/**
		 * Determines centered camera.
		 */
		centered: true,
		
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
		update: function(delta, app) {
			if(this.followed.length > 0) {
				// get positions of all actors
				var _x = 0, _y = 0;
				for(var i in this.followed) {
					var actor = this.followed[i];
					_x -= actor.position.x;
					// uncomment to enable Y following axis
					//_y -= actor.position.y;
				}
				
				// calculate centered position of actors
				this.position.x = _x / this.followed.length;
				this.position.y = _y / this.followed.length;
				
				// center camera position
				if(this.centered) {
					this.position.x += app.renderer.width / 2;
					this.position.y += app.renderer.height / 2;
				}
			}
		}
	});
	
	/**
	 * Game state manipulating class.
	 */
	BBQ.State = function() {
		// inheritance ctor
		PIXI.Container.call(this);
		
		// camera instance
		this.camera = new BBQ.Camera();
		
		// the background objects container
		this.background = new PIXI.Container();
		
		// create common actors layer
		this.actors = new PIXI.Container();
		
		// the foreground objects container
		this.foreground = new PIXI.Container();
		
		// add layers by right order
		this.camera.addChild(this.background);
		this.camera.addChild(this.actors);
		
		this.addChild(this.camera);
		this.addChild(this.foreground);
	};
	
	// extends BBQ.Stage by PIXI.Container class
	BBQ.Utils.extends(BBQ.State, PIXI.Container, {
		/**
		 * Common ctor.
		 */
		constructor: BBQ.State,
		
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
			this.camera.update(delta, this.app);
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
