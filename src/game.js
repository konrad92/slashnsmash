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
		 * @param {Number} delta Delta time between last frame.
		 */
		step: function(delta) {
			// progress status
			this.progress += Math.abs(this.app.loader.progress - this.progress);
			
			// keep centered position
			this.logo.position = new PIXI.Point(
				Math.floor(this.app.renderer.width / 2),
				Math.floor(this.app.renderer.height / 2)
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
		 * Performance detector.
		 */
		performance: {
			ticks: 0,
			frame: 0,
			fps: 0
		},
		
		/**
		 * Application creation event.
		 */
		create: function() {
			// create Pixi properly renderer
			this.createRenderer();
			this.root = new PIXI.Container();
			
			// creates info-board
			BBQ.console.status(
				this.renderer instanceof PIXI.WebGLRenderer ?
					'WebGL' : 'Canvas'
			);
		
			// load game common images
			console.log('Loading images...');
			this.loadImage('fatguy');
		},
		
		/**
		 * Assets loader ready event.
		 */
		ready: function() {
			console.log('Images loading done.', this.images);
			
			// create sprite
			for(var i = 0; i < 2000; i++) {
				var spr = new PIXI.Sprite(this.tex('fatguy'));
				spr.anchor = new PIXI.Point(0.5, 0.5);
				spr.position = new PIXI.Point(
					Math.random() * this.renderer.width,
					Math.random() * this.renderer.height
				);
				spr.timer = Math.random()*Math.PI*2;
				this.root.addChild(spr);
			}
		},
		
		/**
		 * Move sprites.
		 */
		step: function(delta) {
			for(var i in this.root.children) {
				var child = this.root.children[i];
				child.position.x += Math.cos(child.timer);
				child.position.y += Math.sin(child.timer);
				child.timer += delta;
			}
		},
		
		/**
		 * Renders scene frame.
		 */
		render: function(delta) {
			this.renderer.render(this.root);
			
			// update ticks and FPS
			this.performance.frame++;
			this.performance.ticks += delta;
			if(this.performance.ticks >= 1) {
				// update FPS status
				this.performance.fps = this.performance.frame;
				BBQ.console.fps('FPS: ' + this.performance.fps);
				
				// reset counters
				this.performance.ticks = 0;
				this.performance.frame = 0;
			}
		},
		
		/**
		 * Handles viewport resize event.
		 */
		resize: function() {
		},
		
		/**
		 * Handle key input.
		 */
		keydown: function(event) {
			if(event.key === 'f1') {
				BBQ.console.toggle();
				return false;
			}
		},
		
		/**
		 * Handle pointer (mouse/touch) event.
		 */
		pointerdown: function(event) {
			BBQ.Utils.fullscreen(true);
		}
	});
})(window);
