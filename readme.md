# text-fit-component

[See the demo](https://tehshrike.github.io/text-fit-component)

Puts text inside of another element at just the right font size so that it perfectly fits the width of its container.

Uses [get-text-fit-size](https://github.com/TehShrike/get-text-fit-size/).

Automatically adjust on window resize.

## Example

```html
<body>
	<h1 id="header"></h1>
	<p>Aw yeah</p>
</body>
```

```js

const TextFit = require('text-fit-component')

new TextFit({
	target: document.getElementById('header'),
	data: {
		text: 'This is a cool header'
	}
})

```

This module is also usable as a [Svelte](https://svelte.technology/) component.

```html
<h1 id="header">
	<TextFit text="This is a cool header" />
</h1>
<p>Aw yeah</p>

<script>
	import TextFit from 'text-fit-component'

	export default {
		components: {
			TextFit
		}
	}
</script>
```

# License

[WTFPL](http://wtfpl2.com)
