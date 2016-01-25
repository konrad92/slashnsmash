/* 
 * bbq-base.js
 * 
 * BBQ engine core functionality.
 * 
 * Licensed under MIT license.
 * For license details please check the LICENSE file of the project.
 * 
 * @author Konrad Nowakowski <konrad.x92@gmail.com>
 */

/**
 * BBQ Core Module.
 * 
 * @param {Object} BBQ Engine public namespace.
 */
(function(BBQ) {
	"use strict";
	
	/**
	 * Useful common utilities.
	 */
	BBQ.Utils = {
		/**
		 * Assigns two or more objects into target one.
		 * 
		 * @param {Object} target
		 * @param {Object} ...source
		 * @returns {Object} Returns target chaining instance.
		 */
		assign: Object.assign || function(target, source) {
			for(var i = 1, len = arguments.length, prop; i < len; i++) {
				source = arguments[i];
				for(prop in source) {
					target[prop] = source[prop];
				}
			}
		},

		/**
		 * Extends classes between prototypes.
		 * Automates constructor reassign.
		 * 
		 * @deprecated Functionality deprecated, checkout for BBQ.Class instead
		 * @param {Function} classa Class to prepare.
		 * @param {Function} classb Extends from this class.
		 * @param {Object} proto Prototype new assigns.
		 */
		extends: function(classa, classb, proto) {
			BBQ.Utils.assign(
				classa.prototype = Object.create(classb.prototype), {
					constructor: classa
				},
				proto
			);
		},
		
		/**
		 * Enables/disables fullscreen feature.
		 * 
		 * @param {Boolean} enable Enable fullscreen.
		 */
		fullscreen: function(enable) {
			// request fullscreen
			if(enable) {
				var body = document.body,
					requestFullscreen = body.requestFullScreen ||
										body.webkitRequestFullScreen ||
										body.mozRequestFullScreen ||
										body.msRequestFullScreen;
				
				// invoke request
				if(requestFullscreen) {
					requestFullscreen.call(body);
				}
			}
			// close fullscreen
			else {
				var body = document.body,
					closeFullscreen = body.closeFullScreen ||
									  body.webkitCloseFullScreen ||
									  body.mozCloseFullScreen ||
									  body.msCloseFullScreen;
				
				// invoke request
				if(closeFullscreen) {
					closeFullscreen.call(body);
				}
			}
		}
	};
	
	/**
	 * Class builder utility.
	 * Simple usage:
	 * MyClass = Class(function() {
	 *     // this is my constructor
	 *     this.foo = 1;
	 * })
	 * .extends(ExtendedClass)
	 * .propeties({
	 *     // this is my own class property
	 *     fooprop: {
	 *         get: function() {
	 *             return 123;
	 *         }
	 *     }
	 * })
	 * .scope({
	 *     // this is my class body
	 *     bar: function() {
	 *         return this.foo++;
	 *     },
	 *     peek: function() {
	 *         return this.foo;
	 *     }
	 * });
	 * 
	 * @return {Function} Class builder.
	 */
	window.Class = BBQ.Class = function(ctor) {
		if(typeof ctor.type === 'undefined') {
			// store class type
			ctor.type = ctor;
			
			// redefine class prototype
			ctor.prototype = {
				constructor: ctor
			};
		}
		
		/**
		 * Allows extending class by another one.
		 * Supports single inheritance.
		 * Inheritance removes old prototype values.
		 * 
		 * @param {Function} extended Class to extend.
		 * @return {Function} Chaining *this* class builder.
		 */
		ctor.extends = function(extended) {
			if(typeof extended !== 'function') {
				console.error('Extending class by non-class object is unallowed');
				return this;
			}
			
			// create class inheritance
			this.type.prototype = Object.create(extended.prototype);
			this.type.prototype.constructor = this.type;
			return this;
		};
		
		/**
		 * Define properties for class.
		 * 
		 * @param {Object} props Properties specified object.
		 * @return {Function} Chaining *this* class builder.
		 */
		ctor.properties = function(props) {
			Object.defineProperties(this.type.prototype, props);
			return this;
		};
		
		/**
		 * Apply scope body to the class prototype.
		 * 
		 * @param {Object} scope Scope object to apply as class prototype.
		 * @return {Function} Chaining *this* class builder.
		 */
		ctor.scope = function(scope) {
			BBQ.Utils.assign(this.type.prototype, scope);
			return this;
		};
		
		/**
		 * Make class final.
		 * Disables class builder functionality.
		 * 
		 * @return {Function} Chaining *this* without class builder.
		 */
		ctor.final = function() {
			delete this.type.scope;
			delete this.type.properties;
			delete this.type.extends;
			delete this.type.type;
			return this;
		};
		
		// returns class builder
		return ctor;
	};
	
	/**
	 * Creates DOM modifier.
	 * 
	 * @param {HTMLElement} element Single DOM element.
	 * @returns {BBQ.DOM.Element} Element BBQ modifier.
	 */
	BBQ.DOM = function(element) {
		return new BBQ.DOM.Element(element);
	};
	
	/**
	 * DOM element modifier utility class.
	 * 
	 * @param {HTMLElement} context
	 */
	BBQ.DOM.Element = function(context) {
		this.context = context;
	};
	
	// BBQ.DOM.Element class prototype
	BBQ.DOM.Element.prototype = {
		/**
		 * Common ctor.
		 */
		constructor: BBQ.DOM,
		
		/**
		 * Binds event to the assigned element.
		 * 
		 * @param {String} type 
		 * @param {Function} callback
		 * @return {BBQ.DOM.Element} Chaining *this* instance.
		 */
		on: function(type, callback) {
			if(this.context.addEventListener) {
				this.context.addEventListener.apply(this.context, arguments);
			}
			else {
				// oups, function not recorgnized
				console.error('No event binding functionality found!');
			}
			
			return this;
		},
		
		/**
		 * Assigns given CSS properties to HTML element.
		 * 
		 * @param {Object} props CSS properties.
		 * @return {BBQ.DOM.Element} Chaining *this* instance.
		 */
		css: function(props) {
			BBQ.Utils.assign(this.context.style, props);
			return this;
		},
		
		/**
		 * Appends HTML element into *this*.
		 * 
		 * @param {HTMLElement} node HTML element to append.
		 * @return {BBQ.DOM.Element} Chaining *this* instance.
		 */
		append: function(node) {
			for(var i in arguments) {
				node = arguments[i]; // re-assign
				this.context.appendChild(
					node instanceof BBQ.DOM.Element ?
						node.context : node
				);
			}
			return this;
		},
		
		/**
		 * Appends *this* element into specified element as target.
		 * 
		 * @param {HTMLElement} target Target HTML element.
		 * @return {BBQ.DOM.Element} Chaining *this* instance.
		 */
		appendTo: function(target) {
			if(target instanceof BBQ.DOM.Element) {
				target.context.appendChild(this.context);
			}
			else {
				target.appendChild(this.context);
			}
			return this;
		},
		
		/**
		 * Changes *this* element id attribute value.
		 * 
		 * @param {String} idName Element new id value.
		 * @return {BBQ.DOM.Element} Chaining *this* instance.
		 */
		id: function(idName) {
			this.context.id = idName;
			return this;
		},
		
		/**
		 * Changes *this* element class attribute value.
		 * 
		 * @param {String} className Element new class name.
		 * @return {BBQ.DOM.Element} Chaining *this* instance.
		 */
		class: function(className) {
			this.context.className = className;
			return this;
		},
		
		/**
		 * Changes *this* element's text content.
		 * 
		 * @param {String} content HTML entries as string.
		 * @return {BBQ.DOM.Element} Chaining *this* instance.
		 */
		text: function(content) {
			this.context.textContent = content;
			return this;
		},
		
		/**
		 * Changes *this* element's content.
		 * 
		 * @param {String} content HTML entries as string.
		 * @return {BBQ.DOM.Element} Chaining *this* instance.
		 */
		html: function(content) {
			this.context.innerHTML = content;
			return this;
		},
		
		/**
		 * Appends element into given target (if specified), and returns
		 * DOM raw *this* HTML element.
		 * 
		 * @param {HTMLElement|BBQ.DOM.Element} target Target HTML element.
		 * @return {HTMLElement} Raw HTML element.
		 */
		done: function(target) {
			if(typeof target !== 'undefined') {
				this.appendTo(target);
			}
			return this.context;
		}
	};
})(window.BBQ = window.BBQ || {});

