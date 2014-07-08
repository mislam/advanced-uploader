/* global mOxie */

;(function (window) {

	'use strict';

	// if already defined before
	if (window.Uploader) {
		return;
	}

	var

		document = window.document,
		console = window.console,

		SCRIPT_DIR = null,	// URL to the directory where this script is located

		XHR,	// Moxie XHR class

		BYTES_PER_CHUNK = 1024 * 1024,	// 1MB chunk sizes

		_el = function (id) {
			return document.getElementById(id);
		},

		init = function () {
			SCRIPT_DIR = getScriptDir();
		},

		/**
		 * Get URL to the directory where this script is located
		 * @return {String} URL to the script directory
		 */
		getScriptDir = function () {
			var
				scripts = document.getElementsByTagName('script'),
				thisScript = scripts[scripts.length-1];

			return thisScript.src.replace(/[^\/]*$/, '');
		},

		loadScript = function(url, callback) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = url;

			script.onload = callback;	// most browsers

			script.onreadystatechange = function() {	// IE 6 & 7
				if (this.readyState == 'complete') {
					callback();
				}
			};
			document.getElementsByTagName('head')[0].appendChild(script);
		},

		/**
		 * Checks if Flash Player is installed or not.
		 * @return {Boolean} Returns true if Flash Player is installed, false otherwise.
		 */
		isFlashInstalled = function () {
			var hasFlash = false;
			try {
				var flashObject = new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash');
				if (flashObject) {
					hasFlash = true;
				}
			} catch(e) {
				if (typeof navigator.mimeTypes['application/x-shockwave-flash'] !== 'undefined') {
					hasFlash = true;
				}
			}
			return hasFlash;
		},

		Uploader = window.Uploader = function (options) {
			this._initVars();
			this._applyOptions(options);
		};

	/**
	 * Define all class variables (public or _private)
	 */
	Uploader.prototype._initVars = function () {
		this._file = null;				// selected file
		this._uploadedChunks = 0;		// number of uploaded chunks
		this._url = null;
		this._browseButton = null;
		this._listeners = {};			// list of all event listeners
	};

	Uploader.prototype._applyOptions = function (options) {
		this._url = options.url;
		this._browseButton = _el(options.browseButton);
	};

	Uploader.prototype.initialize = function () {
		this._loadMoxie();
	};

	Uploader.prototype._loadMoxie = function () {

		var _this = this;

		// if running on IE browser
		if (!!window.navigator.appVersion.match(/MSIE \d+/)) {
			// parse the IE version as integer (e.g. 7, 8, 9, 10 etc.)
			var ieVersion = parseInt(navigator.appVersion.match(/MSIE (\d+)/)[1]);
			// require flash for IE version < 10
			if (ieVersion < 10) {
				if (!isFlashInstalled()) {
					this._trigger('noflash');
					return;
				}
			}
		}

		loadScript(SCRIPT_DIR + 'moxie.min.js', function () {

			window.mOxie.Env.swf_url = SCRIPT_DIR + 'moxie.min.swf';

			XHR = window.mOxie.XMLHttpRequest;

			var fileInput = new mOxie.FileInput({
				browse_button: _this._browseButton
			});

			fileInput.onchange = function (e) {
				_this._file = e.target.files[0];
			};

			fileInput.init();

			// Note: file drop doesn't work on IE9 and older

			var fileDrop = new mOxie.FileDrop(_this._browseButton);

			fileDrop.ondrop = function() {
				_this._file = this.files[0];
			};

			fileDrop.init();
		});
	};

	Uploader.prototype.upload = function () {
		// if no file is selected
		if (!this._file) {
			console.warn('No file selected');
			return false;
		}
		this._trigger('start');
		this._uploadChunk(0, BYTES_PER_CHUNK);
	};


	Uploader.prototype._uploadChunk = function (start, end, filename) {

		var
			_this = this,
			xhr = new XHR(),

			// use POST method for IE, otherwise use PUT
			method = navigator.userAgent.match(/msie/i) ? 'POST' : 'PUT';

		xhr.open(method, this._url, true);

		xhr.setRequestHeader('Content-Type', 'application/json');

		if (start === 0) {
			xhr.setRequestHeader('X-File-Extension', this._file.name.split('.').pop().toLowerCase());
		} else {
			xhr.setRequestHeader('X-File-Name', filename);
		}

		xhr.addEventListener('readystatechange', function() {
			if (xhr.readyState == XHR.DONE) {
				var response = JSON.parse(xhr.responseText);
				_this._uploadedChunks++;
				start = end;
				end = start + BYTES_PER_CHUNK;
				if (start < _this._file.size) {
					_this._uploadChunk(start, end, response.filename);
				} else {
					_this._trigger('complete');
					_this._uploadedChunks = 0;
				}
			}
		});

		xhr.upload.addEventListener('progress', function(e) {
			_this._trigger('progress', {
				uploadedBytes: e.loaded + _this._uploadedChunks * BYTES_PER_CHUNK,
				totalBytes: _this._file.size
			});
		});

		xhr.send(this._file.slice(start, end));
	};

	/**
	 * Bind an event
	 * @param  {String}   event    Name of the event
	 * @param  {Function} listener Event listener function
	 * @return {Object}            The uploader instance
	 */
	Uploader.prototype._bind = function (event, listener){
		if (typeof this._listeners[event] === 'undefined') {
			this._listeners[event] = [];
		}
		this._listeners[event].push(listener);
		return this;
	};

	/**
	 * Trigger an event
	 * @param  {String} event Name of the event
	 * @param  {Mixed}  data  The data to pass to the listener function
	 */
	Uploader.prototype._trigger = function (event, data) {
		if (this._listeners[event] instanceof Array) {
			var listeners = this._listeners[event];
			for (var i = 0, len = listeners.length; i < len; i++) {
				if (typeof data === 'undefined') {
					return listeners[i].call(this);
				} else {
					return listeners[i].call(this, data);
				}
			}
		}
	};

	/**
	 * Unbind an event
	 * @param  {String}   event    Name of the event
	 * @param  {Function} listener Event listener function
	 * @return {Object}            The uploader instance
	 */
	Uploader.prototype._unbind = function (event, listener) {
		if (this._listeners[event] instanceof Array) {
			var listeners = this._listeners[event];
			for (var i = 0, len = listeners.length; i < len; i++) {
				if (listeners[i] === listener) {
					listeners.splice(i, 1);
					break;
				}
			}
		}
		return this;
	};

	// Public alias to the bind and unbind method
	Uploader.prototype.on = Uploader.prototype._bind;
	Uploader.prototype.off = Uploader.prototype._unbind;

	init();

}(this));
