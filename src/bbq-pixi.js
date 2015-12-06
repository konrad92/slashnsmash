/* 
 * bbq-pixi.js
 * 
 * BBQ renderer extension for playground based on Pixi WebGL.
 * 
 * Licensed under MIT license.
 * For license details please check the LICENSE file of the project.
 * 
 * @author Konrad Nowakowski <konrad.x92@gmail.com>
 */

/**
 * BBQ Rendering Module.
 * 
 * @param Object BBQ Engine public namespace.
 * @param PIXI Pixi PIXI rendering engine namespace.
 */
(function(BBQ, PLAYGROUND, PIXI) {
	"use strict";
	
	// disables linear interpoltion by default
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
	
	// re-define default render options
	BBQ.Utils.assign(PIXI.DEFAULT_RENDER_OPTIONS, {
		//clearBeforeRender: false,
		autoResize: true
	});
	
	/**
	 * Extends PLAYGROUND.Application by renderer.
	 */
	BBQ.Utils.assign(PLAYGROUND.Application.prototype, {
		/**
		 * Assigns an new Pixi renderer to Prototype.Application instance.
		 * Creates WebGL one or uses fallback Canvas renderer.
		 * 
		 * @param Object options PIXI renderer options.
		 * @returns PIXI.SystemRenderer Properly detected renderer.
		 */
		createRenderer: function(options) {
			// created new renderer
			console.log('Creating PIXI renderer...');
			this.renderer = PIXI.autoDetectRenderer(
				window.innerWidth,
				window.innerHeight,
				options
			);
			
			// keep aspect ratio (if specified)
			if(typeof this.scale === 'number') {
				// bind window resize event
				window.addEventListener(
					'resize', this.keepAspect.bind(this), false
				);
				this.keepAspect(); //run-on-fly
			}
			
			// add renderer view to the DOM element
			var container = this.container || document.body;
			container.appendChild(this.renderer.view);
		},
		
		/**
		 * Keeps canvas view aspect.
		 */
		keepAspect: function() {
			console.log('Keep aspect!');
			
			// resize canvas element
			this.renderer.resize(
				window.innerWidth / this.scale,
				window.innerHeight / this.scale
			);

			// scale-up canvas element via CSS process
			var scale2d = 'scale('+this.scale+','+this.scale+')';
			this.renderer.view.style.msTransform = scale2d;
			this.renderer.view.style.webkitTransform = scale2d;
			this.renderer.view.style.MozTransform = scale2d;
			this.renderer.view.style.OTransform = scale2d;
			this.renderer.view.style.transform = scale2d;
		}
	});
})(window.BBQ = window.BBQ || {}, PLAYGROUND, PIXI);