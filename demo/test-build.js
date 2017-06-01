(function () {
'use strict';

var pxRegex = function pxRegex() {
	return (/\d+px/
	);
};

var getPx = function getPx(str) {
	return parseInt(pxRegex().exec(str)[0], 10);
};
var fontAtSize = function fontAtSize(font, size) {
	return font.replace(pxRegex(), function () {
		return size + 'px';
	});
};
var join = function join() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	return args.join(' ');
};

var index = function getTextFitSize(containerElement, text) {
	var canvasContext = createCanvas();
	var containerComputedStyles = window.getComputedStyle(containerElement);
	var font = getFontString(containerComputedStyles);
	var targetWidth = getPx(containerComputedStyles.getPropertyValue('width'));

	return calculateFitSize(canvasContext, font, text, targetWidth);
};

function createCanvas() {
	var canvas = document.createElement('canvas');
	canvas.setAttribute('width', '1px');
	canvas.setAttribute('height', '1px');

	return canvas.getContext('2d');
}

function calculateFitSize(context, initialFont, text, targetWidth) {
	var conservativeTarget = targetWidth - 0.3;
	var currentFontSize = getPx(initialFont);

	var getWidthAt = function getWidthAt(font) {
		context.font = font;
		return context.measureText(text).width;
	};

	var currentWidth = getWidthAt(initialFont);

	if (currentWidth < conservativeTarget && currentWidth > conservativeTarget - 0.5) {
		return currentFontSize;
	}

	var size = getNewFontSizeUsingRatio(conservativeTarget, currentWidth, currentFontSize);

	var tooHigh = function tooHigh(size) {
		return getWidthAt(fontAtSize(initialFont, size)) >= conservativeTarget;
	};

	while (tooHigh(size)) {
		size = size - 0.1;
	}

	return size;
}

function getNewFontSizeUsingRatio(targetWidth, currentWidth, currentFontSize) {
	var ratio = targetWidth / currentWidth;
	return currentFontSize * ratio;
}

function getFontString(computedStyles) {
	var v = function v(p) {
		return computedStyles.getPropertyValue(p);
	};

	return v('font') || join(v('font-style'), v('font-variant'), v('font-weight'), v('font-stretch'), v('font-size'),
	// v('line-height'), line heights confuse Firefox I guess?
	v('font-family'));
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

function noop() {}

function assign(target) {
	var k,
	    source,
	    i = 1,
	    len = arguments.length;
	for (; i < len; i++) {
		source = arguments[i];
		for (k in source) {
			target[k] = source[k];
		}
	}

	return target;
}

function appendNode(node, target) {
	target.appendChild(node);
}

function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function differs(a, b) {
	return a !== b || a && (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object' || typeof a === 'function';
}

function dispatchObservers(component, group, newState, oldState) {
	for (var key in group) {
		if (!(key in newState)) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

		if (differs(newValue, oldValue)) {
			var callbacks = group[key];
			if (!callbacks) continue;

			for (var i = 0; i < callbacks.length; i += 1) {
				var callback = callbacks[i];
				if (callback.__calling) continue;

				callback.__calling = true;
				callback.call(component, newValue, oldValue);
				callback.__calling = false;
			}
		}
	}
}

function get$$1(key) {
	return key ? this._state[key] : this._state;
}

function fire(eventName, data) {
	var handlers = eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this, data);
	}
}

function observe(key, callback, options) {
	var group = options && options.defer ? this._observers.post : this._observers.pre;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function cancel() {
			var index = group[key].indexOf(callback);
			if (~index) group[key].splice(index, 1);
		}
	};
}

function on(eventName, handler) {
	if (eventName === 'teardown') return this.on('destroy', handler);

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function cancel() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set$$1(newState) {
	this._set(assign({}, newState));
	this._root._flush();
}

function _flush() {
	if (!this._renderHooks) return;

	while (this._renderHooks.length) {
		this._renderHooks.pop()();
	}
}

var proto = {
	get: get$$1,
	fire: fire,
	observe: observe,
	on: on,
	set: set$$1,
	_flush: _flush
};

var template$1 = function () {
	return {
		data: function data() {
			return {
				renderText: false,
				size: 'inherit',
				text: ''
			};
		},
		oncreate: function oncreate() {
			var _this = this;

			this.recalculate();
			this.observe('text', function () {
				return _this.recalculate();
			});
		},

		methods: {
			recalculate: function recalculate() {
				var container = this.refs.container;
				this.set({
					renderText: false,
					size: 'inherit'
				});
				var size = index(container, this.get('text'));
				this.set({
					size: size + 'px',
					renderText: true
				});
			},
			onResize: function onResize() {
				var _this2 = this;

				if (!this.get('resizing')) {
					this.set({
						resizing: true
					});
					window.requestAnimationFrame(function () {
						_this2.recalculate();
						_this2.set({
							resizing: false
						});
					});
				}
			}
		}
	};
}();

function create_main_fragment$1(state, component) {
	var div_style_value;

	function onwindowresize(event) {
		component.onResize();
	}
	window.addEventListener('resize', onwindowresize);

	var text = createText("\n\n");
	var div = createElement('div');
	div.className = "center-container";
	div.style.cssText = div_style_value = "font-size: " + state.size + ";";
	component.refs.container = div;

	var if_block = state.renderText && create_if_block(state, component);

	if (if_block) if_block.mount(div, null);

	return {
		mount: function mount(target, anchor) {
			insertNode(text, target, anchor);
			insertNode(div, target, anchor);
		},

		update: function update(changed, state) {
			if (div_style_value !== (div_style_value = "font-size: " + state.size + ";")) {
				div.style.cssText = div_style_value;
			}

			if (state.renderText) {
				if (if_block) {
					if_block.update(changed, state);
				} else {
					if_block = create_if_block(state, component);
					if_block.mount(div, null);
				}
			} else if (if_block) {
				if_block.unmount();
				if_block.destroy();
				if_block = null;
			}
		},

		unmount: function unmount() {
			detachNode(text);
			detachNode(div);
			if (if_block) if_block.unmount();
		},

		destroy: function destroy() {
			window.removeEventListener('resize', onwindowresize);

			if (component.refs.container === div) component.refs.container = null;
			if (if_block) if_block.destroy();
		}
	};
}

function create_if_block(state, component) {
	var text_value;

	var text = createText(text_value = state.text);

	return {
		mount: function mount(target, anchor) {
			insertNode(text, target, anchor);
		},

		update: function update(changed, state) {
			if (text_value !== (text_value = state.text)) {
				text.data = text_value;
			}
		},

		unmount: function unmount() {
			detachNode(text);
		},

		destroy: noop
	};
}

function Component(options) {
	options = options || {};
	this.refs = {};
	this._state = assign(template$1.data(), options.data);

	this._observers = {
		pre: Object.create(null),
		post: Object.create(null)
	};

	this._handlers = Object.create(null);

	this._root = options._root || this;
	this._yield = options._yield;

	this._torndown = false;

	this._fragment = create_main_fragment$1(this._state, this);
	if (options.target) this._fragment.mount(options.target, null);

	if (options._root) {
		options._root._renderHooks.push(template$1.oncreate.bind(this));
	} else {
		template$1.oncreate.call(this);
	}
}

assign(Component.prototype, template$1.methods, proto);

Component.prototype._set = function _set(newState) {
	var oldState = this._state;
	this._state = assign({}, oldState, newState);
	dispatchObservers(this, this._observers.pre, newState, oldState);
	this._fragment.update(newState, this._state);
	dispatchObservers(this, this._observers.post, newState, oldState);
};

Component.prototype.teardown = Component.prototype.destroy = function destroy(detach) {
	this.fire('destroy');

	if (detach !== false) this._fragment.unmount();
	this._fragment.destroy();
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

function recompute(state, newState, oldState, isInitial) {
	if (isInitial || 'zs' in newState && differs(state.zs, oldState.zs)) {
		state.wazzup = newState.wazzup = template.computed.wazzup(state.zs);
	}
}

var template = function () {
	var times = function times(_times, char) {
		var result = '';
		for (var i = 0; i < _times; ++i) {
			result += char;
		}
		return result;
	};

	return {
		data: function data() {
			return {
				zs: 2
			};
		},
		oncreate: function oncreate() {
			var _this = this;

			setTimeout(function () {
				return _this.nextZ();
			}, 1000);
		},

		computed: {
			wazzup: function wazzup(zs) {
				return 'wa' + times(zs, 'z') + 'up';
			}
		},
		methods: {
			nextZ: function nextZ() {
				var _this2 = this;

				var zs = this.get('zs');
				this.set({
					zs: zs + 1
				});
				setTimeout(function () {
					return _this2.nextZ();
				}, zs * 1000);
			}
		}
	};
}();

function create_main_fragment(state, component) {
	var h1 = createElement('h1');

	var fittext = new Component({
		target: h1,
		_root: component._root,
		data: { text: state.wazzup }
	});

	var text = createText("\n");
	var h2 = createElement('h2');

	var fittext_1 = new Component({
		target: h2,
		_root: component._root,
		data: { text: "You seem pretty cool" }
	});

	var text_1 = createText("\n");
	var p = createElement('p');

	var fittext_2 = new Component({
		target: p,
		_root: component._root,
		data: { text: "What have you been working on?" }
	});

	var text_2 = createText("\n");
	var p_1 = createElement('p');
	p_1.style.cssText = "font-weight: 700";

	var fittext_3 = new Component({
		target: p_1,
		_root: component._root,
		data: {
			text: "Perfectly-fitting text makes me kind of happy y'all"
		}
	});

	var text_3 = createText("\n");
	var p_2 = createElement('p');
	appendNode(createText("Check it out "), p_2);
	var a = createElement('a');
	appendNode(a, p_2);
	a.href = "https://github.com/TehShrike/text-fit-component";
	appendNode(createText("on Github"), a);

	return {
		mount: function mount(target, anchor) {
			insertNode(h1, target, anchor);
			insertNode(text, target, anchor);
			insertNode(h2, target, anchor);
			insertNode(text_1, target, anchor);
			insertNode(p, target, anchor);
			insertNode(text_2, target, anchor);
			insertNode(p_1, target, anchor);
			insertNode(text_3, target, anchor);
			insertNode(p_2, target, anchor);
		},

		update: function update(changed, state) {
			var fittext_changes = {};

			if ('wazzup' in changed) fittext_changes.text = state.wazzup;

			if (Object.keys(fittext_changes).length) fittext.set(fittext_changes);
		},

		unmount: function unmount() {
			detachNode(h1);
			detachNode(text);
			detachNode(h2);
			detachNode(text_1);
			detachNode(p);
			detachNode(text_2);
			detachNode(p_1);
			detachNode(text_3);
			detachNode(p_2);
		},

		destroy: function destroy() {
			fittext.destroy(false);
			fittext_1.destroy(false);
			fittext_2.destroy(false);
			fittext_3.destroy(false);
		}
	};
}

function TestMain$1(options) {
	options = options || {};
	this._state = assign(template.data(), options.data);
	recompute(this._state, this._state, {}, true);

	this._observers = {
		pre: Object.create(null),
		post: Object.create(null)
	};

	this._handlers = Object.create(null);

	this._root = options._root || this;
	this._yield = options._yield;

	this._torndown = false;
	this._renderHooks = [];

	this._fragment = create_main_fragment(this._state, this);
	if (options.target) this._fragment.mount(options.target, null);
	this._flush();

	if (options._root) {
		options._root._renderHooks.push(template.oncreate.bind(this));
	} else {
		template.oncreate.call(this);
	}
}

assign(TestMain$1.prototype, template.methods, proto);

TestMain$1.prototype._set = function _set(newState) {
	var oldState = this._state;
	this._state = assign({}, oldState, newState);
	recompute(this._state, newState, oldState, false);
	dispatchObservers(this, this._observers.pre, newState, oldState);
	this._fragment.update(newState, this._state);
	dispatchObservers(this, this._observers.post, newState, oldState);
	this._flush();
};

TestMain$1.prototype.teardown = TestMain$1.prototype.destroy = function destroy(detach) {
	this.fire('destroy');

	if (detach !== false) this._fragment.unmount();
	this._fragment.destroy();
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

new TestMain$1({
	target: document.getElementById('container')
});

}());
