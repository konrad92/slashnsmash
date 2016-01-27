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
 * @param {Object} BBQ Engine public namespace.
 * @param {PIXI} Pixi PIXI rendering engine namespace.
 */
(function(BBQ, PLAYGROUND, PIXI) {
	"use strict";
	
	// disables linear interpoltion by default
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
	
	// re-define default renderer options
	BBQ.Utils.assign(PIXI.DEFAULT_RENDER_OPTIONS, {
		//clearBeforeRender: false,
		autoResize: true
	});
	
	// hides <hello pixi>
	PIXI.utils._saidHello = true;
	
	/**
	 * Stores old usable methods.
	 */
	var _super = {
		getAssetEntry: PLAYGROUND.Application.prototype.getAssetEntry
	};
	
	/**
	 * Extends PLAYGROUND.Application by renderer.
	 */
	BBQ.Utils.assign(PLAYGROUND.Application.prototype, {
		/**
		 * Assigns an new Pixi renderer to Prototype.Application instance.
		 * Creates WebGL one or uses fallback Canvas renderer.
		 * 
		 * @param {Object} options PIXI renderer options.
		 * @returns {PIXI.SystemRenderer} Properly detected renderer.
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
			// change scale size
			if(window.innerWidth < 768) {
				this.scale = 2;
			}
			else {
				this.scale = 3;
			}
			
			// resize canvas element
			this.renderer.resize(
				window.innerWidth / this.scale,
				window.innerHeight / this.scale
			);

			// scale-up canvas element via CSS transform property
			var scale2d = 'scale('+this.scale+','+this.scale+')';
			this.renderer.view.style.msTransform = scale2d;
			this.renderer.view.style.webkitTransform = scale2d;
			this.renderer.view.style.MozTransform = scale2d;
			this.renderer.view.style.OTransform = scale2d;
			this.renderer.view.style.transform = scale2d;
		},
		
		/**
		 * Creates texture from image.
		 * Uses shared texture instance by default.
		 * 
		 * @param {Image|String} image Image JS instance or image name.
		 * @param {Boolean} shared Use shared (cached) texture instance.
		 * @returns {PIXI.Texture} Pixi texture instance.
		 */
		tex: function(image, shared) {
			var imageInst = image;
			if(typeof image === 'string') {
				imageInst = this.images[image];
			}
			if(!(imageInst instanceof Image)) {
				console.error('Image \'' + image + '\' not recognized', imageInst);
				return null;
			}
			// create shared texture
			if(typeof shared === 'undefined' || shared === true) {
				return PIXI.Texture.fromImage(imageInst.src);
			}
			// create new texture *with shared base texture
			return new PIXI.Texture(
				PIXI.BaseTexture.fromImage(imageInst.src)
			);
		},
		
		/**
		 * Allows images loading from external servers.
		 * Requires allowed Cross-Origin Resource Sharing policy to work.
		 * 
		 * @param {String} path URL or relative asset path.
		 * @param {String} folder Assets storing folder.
		 * @param {String} defaultExtension Default asset extension.
		 * @returns {Object} Asset entry object.
		 */
		getAssetEntry: function(path, folder, defaultExtension) {
			// check if asset is from external server
			if(/^http(|s):\/\/.+/i.test(path)) {
				var key = path.split('/').pop().split('.')[0],
					ext = path.split('.').pop();
				
				return {
					key: key,
					url: path,
					path: path,
					ext: ext
				};
			}
			
			// use old method
			return _super.getAssetEntry.apply(this, arguments);
		}
	});
	
	/**
	 * Adds additional functionality into PIXI.Point class.
	 */
	BBQ.Utils.assign(PIXI.Point.prototype, {
		/**
		 * Override vector values.
		 * @returns {PIXI.Point} Chaining *this* instance.
		 */
		set: function(x, y) {
			this.x = x || 0;
			this.y = y || 0;
			return this;
		},
		
		/**
		 * Multiplies vector by a scalar.
		 * 
		 * @param {Number} scalar
		 * @returns {PIXI.Point} Chaining *this* instance.
		 */
		mul: function(scalar) {
			this.x = (this.x * scalar) || 0;
			this.y = (this.y * scalar) || 0;
			return this;
		},
		
		/**
		 * Divides vector by a scalar.
		 * 
		 * @param {Number} scalar
		 * @returns {PIXI.Point} Chaining *this* instance.
		 */
		div: function(scalar) {
			this.x = (this.x / scalar) || 0;
			this.y = (this.y / scalar) || 0;
			return this;
		},
		
		/**
		 * Calculates length of the vector.
		 * 
		 * @returns {Number} Vector length.
		 */
		length: function() {
			return Math.sqrt(
				this.x * this.x +
				this.y * this.y
			);
		},
		
		/**
		 * Normalizes vector.
		 * Makes normalization on itself.
		 * 
		 * @returns {PIXI.Point} Chaining *this* instance.
		 */
		normalize: function() {
			return this.div(this.length());
		}
	});
})(window.BBQ = window.BBQ || {}, PLAYGROUND, PIXI);