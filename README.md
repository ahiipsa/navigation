## Smart TV navigation

Keyboard navigation for Smart TV applications

## [Demo](http://ahiipsa.github.io/navigation/demo/navigation.html)

## Download
 
[navigation.zip](https://github.com/ahiipsa/navigation/zipball/master)

[navigation.tar.gz](https://github.com/ahiipsa/navigation/tarball/master)

## Install with Bower

`bower install navigation`

## Install with npm

`npm i smarttv-navigation`
 
## Attributes

- `nv-scope` create scope
- `nv-scope-current` activate scope after bootstrap
- `nv-el` navigation element
- `nv-el-current` activate after bootstrap

### Example
```html

    <div nv-scope="menu" nv-scope-current>
        <div nv-el nv-el-current>Element 1</div>
        <div nv-el>Element 2</div>
        <div nv-el>Element 3</div>
    </div>
    
```

## Style, CSS class

- `nv-scope` add for scopes element
- `nv-scope-current` add for current scope element
- `nv-el` add for navigation elements
- `nv-el-current` add for current navigation element

```html

    <div nv-scope="menu" class="nv-scope nv-scope-current" nv-scope-current>
        <div nv-el nv-el-current class="nv-el nv-el-current">Element 1</div>
        <div nv-el class="nv-el">Element 2</div>
        <div nv-el class="nv-el">Element 3</div>
    </div>
    
```

## Event listener

```js

document.body.addEventListener('nv-left', function (event) {
    // logic
});

```

### Default event list

nv-left, nv-up, nv-right, nv-down, nv-enter, nv-move, nv-focus

nv-back, nv-red, nv-green, nv-yellow, nv-blue, nv-rw, nv-stop, nv-play, nv-ff, nv-ch_up, nv-ch_down, nv-info, nv-mic

Or use public api:

```js

console.table( navigation.getKeyMapping() );

```

### Refresh navigation after DOM update

```js
navigation.refresh();
```

### Custom events and key mapping

```js

// example [keyCode, eventName, value]
var keyMapping = [
    [37,     'left'],
    [38,     'up'],
    [39,     'right'],
    [40,     'down'],
    [13,     'enter'],
    [27,     'back'],
    [403,    'red'],
    [404,    'green'],
    [405,    'yellow'],
    [406,    'blue'],
    [412,    'rw'],
    [413,    'stop'],
    [415,    'play'],
    [417,    'ff'],
    [33,     'ch_up'],
    [34,     'ch_down'],
    [457,    'info'],
    [48,     'numpad', 0],
    [49,     'numpad', 1],
    [50,     'numpad', 2],
    [51,     'numpad', 3],
    [52,     'numpad', 4],
    [53,     'numpad', 5],
    [54,     'numpad', 6],
    [55,     'numpad', 7],
    [56,     'numpad', 8],
    [57,     'numpad', 9]
];

navigation.addKeyMapping(keyMapping);
 
document.body.addEventListener('nv-left', function (event) {
    // logic
});

```

### Debug mode

```js

navigation.debug(true);

```
