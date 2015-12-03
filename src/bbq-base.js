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
			BBQ.Utils.assign(classa.prototype = {}, classb.prototype, proto);
		}
	};
})(window.BBQ = window.BBQ || {});

