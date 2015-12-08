/*
 * game.js
 * 
 * Entry point of the Slash 'n' Smash game.
 * 
 * Licensed under MIT license.
 * For license details please check the LICENSE file of the project.
 * 
 * @author Konrad Nowakowski <konrad.x92@gmail.com>
 */

(function(window) {
	"use strict";
	
	/**
	 * Overrides Playground's common loading screen.
	 * Uses PIXI renderer to render the loading state.
	 */
	PLAYGROUND.LoadingScreen = {
		/**
		 * VHS-tape logo image asset encoded as PNG in base64.
		 */
		logoRaw: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAYCAYAAABKtPtEAAAA+0lEQVRYw+1X0Q3FIAgsjQs4gCu4/xyu4ACO0PdFYmzLQyw1Vvmmyh3HSWFjhnPu2AaJGCNwc+Fr4GtJMNwDrbXDgE8psXP3bfJYBHxN/rX1Tq8AI/kohACcVwI7UeZzwnt/UIZWujzmq3sAFzwFTFosda+E5OYRkIAPIQAWWxJRS8wT+4nRmCuUp7X21CUEye0YnqW1jO1a4Km5vpMtRUrNettdAVz/yEmRzvBwi9CVCeajMcQz2AK+V6dfUwBlVtjpvNtIyD9itEywSQExRrgq7K5Yicwp4E8Yo3lTxpryl3oIaB7eM7hkr9/hRcAiYO5gu/JIRljz2vwANueFK1RCNCwAAAAASUVORK5CYII=',
		
		/**
		 * Creates loader scene.
		 */
		create: function() {
			// create Pixi logo sprite
			this.logo = new PIXI.Sprite(PIXI.Texture.fromImage(this.logoRaw));
			this.logo.anchor = new PIXI.Point(0.5, 1);
			
			// create loader progress bar
			this.progressBar = new PIXI.Graphics();
			this.progressBar.position = new PIXI.Point(0, 8);
			this.logo.addChild(this.progressBar);
		},
		
		/**
		 * Prepares loader state.
		 */
		enter: function() {
			// change background colour
			this.app.renderer.backgroundColor = 0x101010;
			
			// reset progress value
			this.progress = 0;
		},
		
		/**
		 * Loading scene done. Quitting.
		 */
		leave: function() {
			
		},
		
		/**
		 * Process the loader progress.
		 * 
		 * @param Number delta Delta time between last frame.
		 */
		step: function(delta) {
			// progress status
			this.progress += Math.abs(this.app.loader.progress - this.progress);
			
			// keep centered position
			this.logo.position = new PIXI.Point(
				this.app.renderer.width / 2,
				this.app.renderer.height / 2
			);
		},
		
		/**
		 * Renders loader state.
		 */
		render: function() {
			// update progress bar
			var g = this.progressBar,
				c = this.progress;
			
			g.clear();
			g.lineStyle(0);
			g.beginFill(0xFFFFFF, 1);
			g.drawRect(-32, -2, 64 * c, 4);
			g.endFill();
			
			g.beginFill(0xFFFFFF, 1);
			g.drawRect(-34, -2, 1, 4);
			g.endFill();
			
			g.beginFill(0xFFFFFF, 1);
			g.drawRect(33, -2, 1, 4);
			g.endFill();
			
			// render loader stage
			this.app.renderer.render(this.logo);
		}
	};
	
	/**
	 * Game on-screen logger functionality provider.
	 * 
	 * @param {PLAYGROUND.Application} app Playground application instance.
	 */
	function GameLogger(app) {
		// store assigned application instance
		this.app = app;
		
		// creates status elements
		this.subinfo = [
			BBQ.DOM(document.createElement('span'))
				.css({marginRight: '8px'})
				.context,
			BBQ.DOM(document.createElement('span')).context
		];
		
		// creates common infobar
		this.infobar = BBQ.DOM(document.createElement('div'))
			.append(this.subinfo[0], this.subinfo[1])
			.context;
		
		// creates logs container
		this.logs = BBQ.DOM(document.createElement('ul'))
			.context;
		
		// creates container element and appends to body
		this.container = BBQ.DOM(document.createElement('div'))
			.id('game-logger')
			.append(this.infobar, this.logs)
			.done(document.body);
	}
	
	// GameLogger class prototype
	GameLogger.prototype = {
		/**
		 * Common ctor.
		 */
		constructor: GameLogger,
		
		/**
		 * Static status content.
		 */
		status: function(content) {
			this.subinfo[0].textContent = content;
		},
		
		/**
		 * Dynamic info content.
		 */
		fps: function(content) {
			this.subinfo[1].textContent = content;
		},
		
		/**
		 * Appends new log row.
		 * 
		 * @param {String} content
		 * @returns {GameLogger} Chaining *this* instance.
		 */
		log: function(content) {
			// remove element from top
			if(this.logs.childNodes.length > 5) {
				this.logs.removeChild(this.logs.childNodes[0]);
			}
			
			// appends logs element
			BBQ.DOM(document.createElement('li'))
				.text(content).appendTo(this.logs);
		}
	};
	
	/**
	 * Game application instance.
	 * 
	 * @type PLAYGROUND.Application
	 */
	var app = playground({
		/**
		 * Common assets paths.
		 */
		paths: {
			base: 'assets/',
			images: 'images/',
			sounds: 'sounds/',
			atlases: 'atlases/'
		},
		
		/**
		 * Canvas viewport scale-up.
		 */
		scale: 3,
		
		/**
		 * FPS counter.
		 */
		fps: 0,
		
		/**
		 * Application creation event.
		 */
		create: function() {
			// create logging element
			this.logger = new GameLogger(this);
			
			// create Pixi properly renderer
			this.createRenderer();
			this.root = new PIXI.Container();
			
			// creates info-board
			this.logger.status(
				this.renderer instanceof PIXI.WebGLRenderer ?
					'WebGL' : 'Canvas'
			);
		
			// load game common images
			this.logger.log('Loading images...');
			this.loadImage('fatguy');
		},
		
		/**
		 * Assets loader ready event.
		 */
		ready: function() {
			this.logger.log('Done.');
			
			// create sprite
			for(var i = 0; i < 2000; i++) {
				var spr = new PIXI.Sprite(this.tex('fatguy'));
				spr.anchor = new PIXI.Point(0.5, 0.5);
				spr.position = new PIXI.Point(
					Math.random() * this.renderer.width,
					Math.random() * this.renderer.height
				);
				this.root.addChild(spr);
			}
		},
		
		/**
		 * Renders scene frame.
		 */
		render: function() {
			this.renderer.render(this.root);
			
			// update dynamic status
			this.logger.fps('OPS: ' + this.ops);
		},
		
		/**
		 * Handles viewport resize event.
		 */
		resize: function() {
		}
	});
})(window);
