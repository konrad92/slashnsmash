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
 * @param Object BBQ Engine public namespace.
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
		 * @param Object target
		 * @param Object ...source
		 * @returns Object Returns target chaining instance.
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
		 * 
		 * @param Function classa Class to prepare.
		 * @param Function classb Extends from this class.
		 * @param Object proto Prototype new assigns.
		 */
		extends: function(classa, classb, proto) {
			BBQ.Utils.assign(
				classa.prototype = Object.create(classb.prototype),
				proto
			);
		}
	};
	
	/**
	 * Creates DOM modifier.
	 * 
	 * @param HTMLElement element Single DOM element.
	 * @returns BBQ.DOM.Element Element BBQ modifier.
	 */
	BBQ.DOM = function(element) {
		return new BBQ.DOM.Element(element);
	};
	
	/**
	 * DOM element modifier utility class.
	 * 
	 * @param HTMLElement context
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
		 * @param String type 
		 * @param {type} callback
		 * @returns {undefined}
		 */
		on: function(type, callback) {
			if(this.context.addEventListener) {
				this.context.addEventListener(type, callback, false);
			}
			else if(this.context.attachEvent) {
				this.context.attachEvent('on' + type, callback);
			}
			else {
				// oups, function not recorgnized
				console.error('No event binding functionality!');
			}
			
			return this;
		},
		
		/**
		 * Assigns given CSS properties to HTML element.
		 * 
		 * @param Object props CSS properties.
		 * @return BBQ.DOM.Element Chaining BBQ.DOM.Element instance.
		 */
		css: function(props) {
			BBQ.Utils.assign(this.context.style, props);
			return this;
		},
		
		/**
		 * Appends *this* element into target.
		 * 
		 * @param HTMLElement target Target HTML element.
		 * @return BBQ.DOM.Element Chaining BBQ.DOM.Element instance.
		 */
		appendTo: function(target) {
			target.appendChild(this.context);
			return this;
		},
		
		/**
		 * Change *this* element's content.
		 * 
		 * @param String content HTML entries as string.
		 * @return BBQ.DOM.Element Chaining BBQ.DOM.Element instance.
		 */
		html: function(content) {
			this.context.innerHTML = content;
			return this;
		}
	};
})(window.BBQ = window.BBQ || {});

