(function () {
'use strict';

const pxRegex = /\d+px/;

const getPx = str => parseInt(pxRegex.exec(str)[0], 10);
const fontAtSize = (font, size) => font.replace(pxRegex, () => size + 'px');

var index = function getTextFitSize(containerElement, text) {
	const canvasContext = createCanvas();
	const containerComputedStyles = window.getComputedStyle(containerElement);
	const font = containerComputedStyles.getPropertyValue('font');
	const targetWidth = getPx(containerComputedStyles.getPropertyValue('width'));

	return calculateFitSize(canvasContext, font, text, targetWidth)
};

function createCanvas() {
	const canvas = document.createElement('canvas');
	canvas.setAttribute('width', '1px');
	canvas.setAttribute('height', '1px');

	return canvas.getContext('2d')
}

function calculateFitSize(context, initialFont, text, targetWidth) {
	const currentFontSize = getPx(initialFont);

	const getWidthAt = font => {
		context.font = font;
		return context.measureText(text).width
	};

	const currentWidth = getWidthAt(initialFont);

	if (currentWidth < targetWidth && currentWidth > targetWidth - 0.5) {
		return currentFontSize
	}

	let size = getNewFontSizeUsingRatio(targetWidth, currentWidth, currentFontSize);

	const tooHigh = size => getWidthAt(fontAtSize(initialFont, size)) > targetWidth;

	while (tooHigh(size)) {
		size = size - 0.2;
	}

	return size
}

function getNewFontSizeUsingRatio(targetWidth, currentWidth, currentFontSize) {
	const ratio = targetWidth / currentWidth;
	return currentFontSize * ratio
}

function noop () {}

function assign ( target ) {
	var k, source, i = 1, len = arguments.length;
	for ( ; i < len; i++ ) {
		source = arguments[i];
		for ( k in source ) target[k] = source[k];
	}

	return target;
}

function insertNode ( node, target, anchor ) {
	target.insertBefore( node, anchor );
}

function detachNode ( node ) {
	node.parentNode.removeChild( node );
}

function createElement ( name ) {
	return document.createElement( name );
}

function createText ( data ) {
	return document.createTextNode( data );
}

function differs ( a, b ) {
	return ( a !== b ) || ( a && ( typeof a === 'object' ) || ( typeof a === 'function' ) );
}

function dispatchObservers ( component, group, newState, oldState ) {
	for ( var key in group ) {
		if ( !( key in newState ) ) continue;

		var newValue = newState[ key ];
		var oldValue = oldState[ key ];

		if ( differs( newValue, oldValue ) ) {
			var callbacks = group[ key ];
			if ( !callbacks ) continue;

			for ( var i = 0; i < callbacks.length; i += 1 ) {
				var callback = callbacks[i];
				if ( callback.__calling ) continue;

				callback.__calling = true;
				callback.call( component, newValue, oldValue );
				callback.__calling = false;
			}
		}
	}
}

function get ( key ) {
	return key ? this._state[ key ] : this._state;
}

function fire ( eventName, data ) {
	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
	if ( !handlers ) return;

	for ( var i = 0; i < handlers.length; i += 1 ) {
		handlers[i].call( this, data );
	}
}

function observe ( key, callback, options ) {
	var group = ( options && options.defer ) ? this._observers.post : this._observers.pre;

	( group[ key ] || ( group[ key ] = [] ) ).push( callback );

	if ( !options || options.init !== false ) {
		callback.__calling = true;
		callback.call( this, this._state[ key ] );
		callback.__calling = false;
	}

	return {
		cancel: function () {
			var index = group[ key ].indexOf( callback );
			if ( ~index ) group[ key ].splice( index, 1 );
		}
	};
}

function on ( eventName, handler ) {
	if ( eventName === 'teardown' ) return this.on( 'destroy', handler );

	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
	handlers.push( handler );

	return {
		cancel: function () {
			var index = handlers.indexOf( handler );
			if ( ~index ) handlers.splice( index, 1 );
		}
	};
}

function set ( newState ) {
	this._set( assign( {}, newState ) );
	this._root._flush();
}

function _flush () {
	if ( !this._renderHooks ) return;

	while ( this._renderHooks.length ) {
		this._renderHooks.pop()();
	}
}

var proto = {
	get: get,
	fire: fire,
	observe: observe,
	on: on,
	set: set,
	_flush: _flush
};

var template = function () {
	return {
		data: function data() {
			return {
				renderText: false,
				size: 'inherit',
				text: ''
			};
		},
		oncreate: function oncreate() {
			this.recalculate();
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
				var _this = this;

				if (!this.get('resizing')) {
					this.set({
						resizing: true
					});
					window.requestAnimationFrame(function () {
						_this.recalculate();
						_this.set({
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
	this._state = assign(template.data(), options.data);

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
		options._root._renderHooks.push(template.oncreate.bind(this));
	} else {
		template.oncreate.call(this);
	}
}

assign(Component.prototype, template.methods, proto);

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

function create_main_fragment(state, component) {
	var h1 = createElement('h1');

	var fittext = new Component({
		target: h1,
		_root: component._root,
		data: { text: "wazzup" }
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
			text: "Centered text makes me kind of happy y'all"
		}
	});

	return {
		mount: function mount(target, anchor) {
			insertNode(h1, target, anchor);
			insertNode(text, target, anchor);
			insertNode(h2, target, anchor);
			insertNode(text_1, target, anchor);
			insertNode(p, target, anchor);
			insertNode(text_2, target, anchor);
			insertNode(p_1, target, anchor);
		},

		unmount: function unmount() {
			detachNode(h1);
			detachNode(text);
			detachNode(h2);
			detachNode(text_1);
			detachNode(p);
			detachNode(text_2);
			detachNode(p_1);
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
	this._state = options.data || {};

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
}

assign(TestMain$1.prototype, proto);

TestMain$1.prototype._set = function _set(newState) {
	var oldState = this._state;
	this._state = assign({}, oldState, newState);
	dispatchObservers(this, this._observers.pre, newState, oldState);
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
