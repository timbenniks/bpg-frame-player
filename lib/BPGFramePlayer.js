(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("BPGFramePlayer", [], factory);
	else if(typeof exports === 'object')
		exports["BPGFramePlayer"] = factory();
	else
		root["BPGFramePlayer"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * BPG Frame Player class
	 * @class BPGFramePlayer
	 */
	
	var BPGFramePlayer = function () {
	
	  /**
	   * @typedef BPGFramePlayerOptions
	   * @type Object
	   * @property {object} node Dom node to append player to.
	   * @property {int} width Width of player
	   * @property {int} height Height of player
	   * @property {boolean} loop Loop frames?
	   * @property {boolean} autoplay Autoplay sequence?
	   * @property {string} url URL to the BPH file
	   * @property {string} workerUrl Where to load the webworker from
	   */
	
	  /**
	   * BPGFramePlayer constructor.
	   * @param {BPGFramePlayerOptions} options The default options of the frame player
	   * @constructs BPGFramePlayer
	   */
	
	  function BPGFramePlayer(options) {
	    var _this = this;
	
	    _classCallCheck(this, BPGFramePlayer);
	
	    var noop = function noop() {};
	
	    var defaultOptions = {
	      node: document.querySelector('.bpg-frame-player'),
	      width: 600,
	      height: 300,
	      loop: true,
	      autoplay: true,
	      debug: false,
	      workerUrl: '../lib/bpgdecoder.js',
	      onFrameUpdate: noop,
	      onComplete: noop,
	      onLoaded: noop
	    };
	
	    this.options = Object.assign(defaultOptions, options);
	
	    this.playing = this.options.autoplay;
	    this.frameIndex = 0;
	    this.workerId = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
	
	    if (!this.options.url) {
	      throw new Error('A BPG url is needed.');
	    }
	
	    if (!window.Worker) {
	      throw new Error('Cannot decode BPG files without web workers. See: http://caniuse.com/#feat=webworkers');
	    }
	
	    this.createCanvas();
	
	    this.load(function (arrayBuffer) {
	      _this.setupWorker(arrayBuffer, function (bpgDecodedData) {
	        _this.onLoaded(bpgDecodedData);
	      });
	    });
	  }
	
	  _createClass(BPGFramePlayer, [{
	    key: 'createCanvas',
	    value: function createCanvas() {
	      this.bpgCanvas = document.createElement('canvas');
	      this.bpgCanvas.width = this.options.width;
	      this.bpgCanvas.height = this.options.height;
	      this.bpgCanvas.classList.add('bpg-frame-player');
	
	      this.options.node.appendChild(this.bpgCanvas);
	      this.ctx = this.bpgCanvas.getContext('2d');
	    }
	  }, {
	    key: 'load',
	    value: function load(callback) {
	      var _this2 = this;
	
	      var request = new XMLHttpRequest();
	
	      this.options.node.classList.add('bpg-frame-player-loading');
	
	      request.open('get', this.options.url, true);
	      request.responseType = 'arraybuffer';
	      request.onload = function (event) {
	        _this2.log('Requested: ' + _this2.options.url);
	        callback(request.response);
	      };
	      request.send();
	    }
	  }, {
	    key: 'setupWorker',
	    value: function setupWorker(bpgData, callback) {
	      var _this3 = this;
	
	      var worker = new Worker(this.options.workerUrl);
	
	      worker.addEventListener('message', function (e) {
	        if (e.data.type === 'log') {
	          _this3.log('Decoding BPG: ' + e.data.message);
	        }
	
	        if (e.data.type === 'res') {
	          worker.terminate();
	          _this3.log('Decoded BPG: ' + _this3.options.url);
	          callback(e.data);
	        }
	      });
	
	      worker.postMessage({ type: 'image', img: bpgData, meta: this.workerId });
	    }
	  }, {
	    key: 'onLoaded',
	    value: function onLoaded(bpgDecodedData) {
	      var _this4 = this;
	
	      this.frames = bpgDecodedData.frames;
	      this.options.node.classList.remove('bpg-frame-player-loading');
	
	      // start sequence based on duration between first and second frame
	      setTimeout(function () {
	        requestAnimationFrame(_this4.renderFrame.bind(_this4));
	      }, this.frames[0].duration);
	
	      // render first frame
	      this.draw(0);
	      this.options.onLoaded(this.frames);
	    }
	  }, {
	    key: 'log',
	    value: function log(msg) {
	      if (this.options.debug) {
	        console.log(msg);
	      }
	    }
	  }, {
	    key: 'goToFrame',
	    value: function goToFrame(frame) {
	      this.frameIndex = Math.min(Math.max(frame, 0), this.frames.length - 1);
	      this.draw(this.frameIndex);
	    }
	  }, {
	    key: 'play',
	    value: function play() {
	      this.playing = true;
	    }
	  }, {
	    key: 'pause',
	    value: function pause() {
	      this.playing = false;
	    }
	  }, {
	    key: 'renderFrame',
	    value: function renderFrame() {
	      var _this5 = this;
	
	      if (this.playing) {
	        if (++this.frameIndex >= this.frames.length) {
	          if (this.options.loop) {
	            this.frameIndex = 0;
	          } else {
	            this.frameIndex = this.frames.length - 1;
	            this.pause();
	            this.options.onComplete(this.frameIndex);
	          }
	        }
	
	        this.draw(this.frameIndex);
	      }
	
	      var dur = this.frames[this.frameIndex].duration;
	      setTimeout(function () {
	        requestAnimationFrame(_this5.renderFrame.bind(_this5));
	      }, dur);
	    }
	  }, {
	    key: 'draw',
	    value: function draw(frame) {
	      this.options.onFrameUpdate(frame, this.frames.length - 1);
	      this.ctx.putImageData(this.frames[frame].img, 0, 0);
	    }
	  }]);
	
	  return BPGFramePlayer;
	}();

	exports.default = BPGFramePlayer;
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;
//# sourceMappingURL=BPGFramePlayer.js.map