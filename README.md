## Navigation
For application that use the keyboard (Smart TV)

 
## Attributes
- `nv-scope` - declared scope for navigation
- `nv-scope-current` - marked and set this scope as active for first load
- `nv-el` - navigation element
- `nv-el-current` - marked and set this element as active for first load

### Example
```html

    <div nv-scope="menu" nv-scope-current>
        <div nv-el nv-el-current>Element 1</div>
        <div nv-el>Element 2</div>
        <div nv-el>Element 3</div>
    </div>
    
```

## Class

- `nv-scope` - add for scopes element
- `nv-scope-current` - add for current scope element
- `nv-el` - add for navigation elements
- `nv-el-current` - add for current navigation element

```html

    <div nv-scope="menu" class="nv-scope nv-scope-current" nv-scope-current>
        <div nv-el nv-el-current class="nv-el nv-el-current">Element 1</div>
        <div nv-el class="nv-el">Element 2</div>
        <div nv-el class="nv-el">Element 3</div>
    </div>
    
```

## Event listener

### Default events
nv-left, nv-right, nv-up, nv-down, nv-enter


### How to add event handler

```js

document.body.addEventListener('nv-left', function (event) {
    // logic
});

```



