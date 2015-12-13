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
	 * 
	 * @returns {undefined}
	 */
	BBQ.Actor = function() {
		// inheritance ctor
		PIXI.Sprite.apply(this, arguments);
		
		// signals set
		this.signals = [];
		
		// events set
		this.events = [];
	};
	
	// extends BBQ.Actor  by PIXI.Sprite class
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
	 * Game state manipulating class.
	 * 
	 * @returns {undefined}
	 */
	BBQ.State = function() {
		// inheritance ctor
		PIXI.Container.call(this);
		
		// create common layers
		this.actors = new PIXI.Container();
		
		// add layers by right order
		this.addChild(this.actors);
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
			
			// perform update layers
			this.children.forEach(function(layer) {
				this.performLayer(layer, 'update', delta);
			}, this);
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
