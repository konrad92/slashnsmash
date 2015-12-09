/* 
 * bbq-console.js
 * 
 * BBQ module for extend console.log by customized on-screen logger.
 * 
 * Licensed under MIT license.
 * For license details please check the LICENSE file of the project.
 * 
 * @author Konrad Nowakowski <konrad.x92@gmail.com>
 */

/**
 * BBQ Console Module.
 * 
 * @param Object BBQ Engine public namespace.
 */
(function(BBQ) {
	"use strict";
	
	/**
	 * BBQ on-screen console manager.
	 */
	BBQ.console = (function() {
		// creates status elements
		var subinfo = [
			BBQ.DOM(document.createElement('span'))
				.css({marginRight: '8px'})
				.context,
			BBQ.DOM(document.createElement('span'))
				.text('---')
				.context
		];
		
		// creates common infobar
		var infobar = BBQ.DOM(document.createElement('div'))
			.append(subinfo[0], subinfo[1])
			.context;
		
		// creates logs container
		var logs = BBQ.DOM(document.createElement('ul'))
			.context;
		
		// creates container element and appends to body
		var container = BBQ.DOM(document.createElement('div'))
			.id('game-logger')
			.css({display: 'none'})
			.append(infobar, logs)
			.done(document.body);
		
		// public scope
		return {
			/**
			 * Shows console container when document's ready.
			 */
			showOnReady: true,
			
			/**
			 * Changes static status content.
			 * 
			 * @param {String} content New content.
			 * @return {Object} Chaining *this* instance.
			 */
			status: function(content) {
				subinfo[0].textContent = content;
				return this;
			},
			
			/**
			 * Changes dynamic status content.
			 * 
			 * @param {String} content New content.
			 * @return {Object} Chaining *this* instance.
			 */
			fps: function(content) {
				subinfo[1].textContent = content;
				return this;
			},
			
			/**
			 * Creates new entry into logs container.
			 * 
			 * @param {String} content
			 * @returns {HTMLElement} Added log entry.
			 */
			log: function(content) {
				// remove element from top
				if(logs.childNodes.length > 5) {
					logs.removeChild(logs.childNodes[0]);
				}

				// appends logs element
				return BBQ.DOM(document.createElement('li'))
					.text(content).done(logs);
			},
		
			/**
			 * Shows console container.
			 * 
			 * @return {Object} Chaining *this* instance.
			 */
			show: function() {
				container.style.display = 'block';
				return this;
			},

			/**
			 * Hides console container.
			 * 
			 * @return {Object} Chaining *this* instance.
			 */
			hide: function() {
				container.style.display = 'none';
				return this;
			},

			/**
			 * Toggles console visibility.
			 * 
			 * @return {Object} Chaining *this* instance.
			 */
			toggle: function() {
				return container.style.display === 'none' ?
					this.show() : this.hide();
			}
		};
	})();
	
	/**
	 * Adds DOM content on-load listener.
	 */
	document.addEventListener("DOMContentLoaded", function(event) {
		if(BBQ.console.showOnReady) {
			BBQ.console.show();
		}
	}, false);
	
	/**
	 * Makes console instance if not already exists.
	 */
	if(!window.console) {
		window.console = {
			log: function() {},
			info: function() {},
			warn: function() {},
			error: function() {}
		};
	}
	
	/**
	 * Stores old Console functionality.
	 */
	var _super = {
		log: console.log,
		info: console.info,
		warn: console.warn,
		error: console.error
	};
	
	/**
	 * Extends native Console functionality.
	 */
	BBQ.Utils.assign(console, {
		/**
		 * Logs new value into both consoles - native and on-screen.
		 * 
		 * @param {Mixed} value Any value toString-able.
		 * @returns {HTMLElement} On-screen console entry element.
		 */
		log: function(value) {
			// call super method
			_super.log.apply(this, arguments);

			// append logs to out console
			return BBQ.console.log(arguments[0].toString());
		},
		
		/**
		 * Logs new value into both consoles - native and on-screen.
		 * 
		 * @param {Mixed} value Any value toString-able.
		 * @returns {HTMLElement} On-screen console entry element.
		 */
		info: function(value) {
			this.log.apply(this, arguments).style.color = '#c0c0ff';
		},
		
		/**
		 * Logs new value into both consoles - native and on-screen.
		 * 
		 * @param {Mixed} value Any value toString-able.
		 * @returns {HTMLElement} On-screen console entry element.
		 */
		warn: function(value) {
			this.log.apply(this, arguments).style.color = '#ffff80';
		},
		
		/**
		 * Logs new value into both consoles - native and on-screen.
		 * 
		 * @param {Mixed} value Any value toString-able.
		 * @returns {HTMLElement} On-screen console entry element.
		 */
		error: function(value) {
			this.log.apply(this, arguments).style.color = '#f03030';
		}
	});
})(window.BBQ = window.BBQ || {});
