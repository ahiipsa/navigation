(function() {
    if (typeof DEBUG === 'undefined') DEBUG = true; // will be removed

    var prefix = 'nv';
    var options = {
        FOV: 35,
        attr: prefix,
        attrScope: prefix + '-scope',
        attrScopeCurrent: prefix + '-scope-current',
        attrElement: prefix + '-el',
        attrElementCurrent: prefix + '-el-current'
    };


    /**
     * Navigation object
     * @returns {Nav}
     * @constructor
     */
    var Nav = function(){
        if(Nav.instance){
            return Nav.instance;
        }

        Nav.instance = this;
        return Nav.instance;
    };


    /**
     * Is mouse control enable
     * @type {boolean}
     */
    Nav.prototype.isMouseEnable = true;


    /**
     * Mouse enable timeout
     * @type {boolean}
     */
    Nav.prototype.mouseEnableTimeout = true;


    /**
     * Registered navigation scopes
     * @type {NavScope[]}
     * @private
     */
    Nav.prototype._scopes = {};


    /**
     * Current navigation scope
     * @type {NavScope}
     */
    Nav.prototype_currentScope = null;


    /**
     * Previous navigation scope
     * @type {NavScope}
     * @private
     */
    Nav.prototype._prevScope = null;


    /**
     * Key mapping key/value table
     * @type {object}
     * @private
     */
    Nav.prototype._keyMapping = {
        // web and lg smart tv
        37:     'left',
        38:     'up',
        39:     'right',
        40:     'down',
        13:     'enter',
        27:     'back',
        403:    'red',
        404:    'green',
        405:    'yellow',
        406:    'blue',
        412:    'rw',
        413:    'stop',
        415:    'play',
        417:    'ff',
        33:     'ch_up',
        34:     'ch_down',
        457:    'info',
        461:    'back', // return
        1015:   'mic',
        // samsung smart tv
        4:      'left',
        5:      'right',
        29460:  'up',
        29461:  'down',
        29443:  'enter'
    };


    /**
     * Initialize navigation
     * @returns {Nav}
     */
    Nav.prototype.initialize = function() {
        var self = this,
            body = document.body,
            navElements = getElementsByAttributeName(body.children, options.attrElement);

        body.addEventListener('keydown', self);

        navElements.forEach(function (element) {
            self.addElement(element);
        });

        if(!this.getCurrentScope()){
            DEBUG && console.log('not found current scope');
        }

        return this;
    };


    /**
     * Deinitialize navigation
     */
    Nav.prototype.deinitialize = function () {
        this._scopes = {};
        this._currentScope = null;
        this._prevScope = null;
        document.body.removeEventListener('keydown', self);
    };


    /**
     * Refresh navigation
     */
    Nav.prototype.refresh = function () {
        this.deinitialize();
        this.initialize();
    };


    /**
     * Return navigation options
     * @returns {object}
     */
    Nav.prototype.getOptions = function () {
        var opt = clone(options);
        return opt;
    };


    /**
     * Return key/value key binding
     * @returns {object}
     */
    Nav.prototype.getKeyMapping = function () {
        return this._keyMapping;
    };


    /**
     * Override current key mapping
     * @param keyMapping
     * @returns {Nav}
     */
    Nav.prototype.setKeyMapping = function (keyMapping) {
        this._keyMapping = keyMapping;
        return this;
    };


    /**
     * Add keyMapping to current nav
     * @param keyMapping
     * @returns {Nav}
     */
    Nav.prototype.addKeyMapping = function (keyMapping) {
        this._keyMapping = mergeObjects(this._keyMapping, keyMapping);
        return this;
    };


    /**
     * Add scope to navigation
     * @param {HTMLElement} element
     * @returns {Nav}
     */
    Nav.prototype.addScope = function (element) {
        var self = this,
            navScope = new NavScope(element);

        self._scopes[navScope.name] = navScope;
        // is current
        var attrCurrentScope = element.getAttribute(options.attrScopeCurrent);
        if(attrCurrentScope === '' || attrCurrentScope === 'true'){
            DEBUG && console.info(navScope.name, ': is current scope');
            self.setCurrentScope(navScope);
        }

        // trick listen remove from DOM
        var _remove = element.remove;
        element.remove = function () {
            self.removeScope(element);
            _remove.call(element);
        };

        addClass(element, options.attrScope);

        return self;
    };


    /**
     * Remove scope from navigation
     * @param {string} scope
     */
    Nav.prototype.removeScope = function (scope) {
        var scopeName = '';

        // if name
        if (typeof scope === 'string') {
            scopeName = scope;
        }

        // if element
        if(typeof scope === 'object'){
            scopeName = scope.getAttribute(options.attrScope)
        }

        // todo if object

        this.getScopes()[scopeName] = null;
    };


    /**
     * @todo change attr to {string} scopeName
     * Check is scope is current
     * @param {NavScope} scope
     * @returns {boolean}
     */
    Nav.prototype.isCurrentScope = function (scope) {
        if(scope === this.getCurrentScope()){
            return true;
        }

        return false;
    };


    /**
     * Change current scope to scope
     * @param {string} scopeName
     * @returns {Nav}
     */
    Nav.prototype.changeScope = function (scopeName) {
        var scope = this.getScopes()[scopeName];

        if(!scope){
            throw new Error('Scope not found');
        }

        this.setCurrentScope(scope);
        scope.activate();
        return this;
    };


    /**
     * Return previous scope
     * @returns {NavScope}
     */
    Nav.prototype.getPrevScope = function () {
        if(!this._prevScope){
            return false;
        }

        return this._prevScope;
    };


    /**
     * @todo throw exception if current scope not exist
     * Return current scope
     * @returns {NavScope}
     */
    Nav.prototype.getCurrentScope = function () {
        if(!this._currentScope){
            return false;
        }

        return this._currentScope;
    };


    /**
     * Set current scope
     * @param {NavScope} scope
     * @returns {Nav}
     */
    Nav.prototype.setCurrentScope = function (scope) {
        this._prevScope = this.getCurrentScope();
        var prevElement = null;

        if(this._prevScope){
            prevElement = this._prevScope.getCurrentElement();
            var prevScopeEl = this._prevScope.getScopeElement();

            prevScopeEl.removeAttribute(options.attrScopeCurrent)
            removeClass(prevScopeEl, options.attrScopeCurrent);

            if(prevElement){
                removeClass(this._prevScope.getCurrentElement(), options.attrElementCurrent);
            }
        }

        this._currentScope = scope;
        addClass(scope.getScopeElement(), options.attrScopeCurrent);
        scope.getScopeElement().setAttribute(options.attrScopeCurrent, 'true');
        return this;
    };


    /**
     * Return registered scopes
     * @returns {NavScope[]}
     */
    Nav.prototype.getScopes = function () {
        return this._scopes;
    };


    /**
     * @todo resolve if scope not found
     * @param {Event} event
     * @returns {string}
     */
    Nav.prototype.getEventName = function(event) {
        if (typeof this._keyMapping[event.keyCode] !== 'undefined') {
            return this._keyMapping[event.keyCode];
        }

        return false;
    };


    /**
     * @todo throw exception if scope not found
     * Return scope by name
     * @param scopeName
     * @returns {NavScope}
     */
    Nav.prototype.getScope = function (scopeName) {
        var scope = this.getScopes()[scopeName];

        if(!scope){
            return false;
        }

        return scope;
    };


    /**
     * Return current nav element
     * @returns {HTMLElement}
     */
    Nav.prototype.getCurrentElement = function () {
        return this.getCurrentScope().getCurrentElement();
    };


    /**
     * Add element to scope
     * @param {string} scopeName
     * @param {HTMLElement} element
     * @returns {Nav}
     */
    Nav.prototype.addElementToScope = function (scopeName, element){
        var self = this,
            scope = this.getScope(scopeName)

        if(!scope){
            throw Error('Scope "' + scopeName + '" not found');
        }

        DEBUG && console.info( scope.name, ': add new element');

        scope.addElement(element);

        element.setAttribute('tabindex', (scope.getNavigationElements().length + 1).toString());

        // trick listen remove from DOM
        var _remove = element.remove;
        element.remove = function () {
            console.log('----  remove element');
            scope.removeElement(element);
            _remove.call(element);
        }

        if(scope.isCurrentElement(element)){
            DEBUG && console.info(scope.name, ': new element is current');
            scope.setCurrentElement(element);
        }

        element.addEventListener('mouseover', function (event) {
            if(!self.isMouseEnable){
                return false;
            }

            if(!scope.isCurrentElement(element)){
                scope.setCurrentElement(element);
            }

            if(!self.isCurrentScope(scope)){
                self.changeScope(scope.name);
            }

        });

        return self;
    };


    /**
     * Add element to navigation (find scope for element)
     * @param {HTMLElement} element
     */
    Nav.prototype.addElement = function (element) {
        var scopeName = null,
            _el = element,
            attrName = options.attrScope;

        while(scopeName === null && _el.parentElement !== null) {
            scopeName = _el.parentElement.getAttribute(attrName);
            _el = _el.parentElement;
        }

        if(!scopeName){
            throw new Error(element + ' not belong to scope');
        }

        var scope = this.getScope(scopeName);

        if(!scope){
            this.addScope(_el);
        }

        this.addElementToScope(scopeName, element);
        addClass(element, options.attrElement);
    };


    /**
     * Handle event interface
     * @param {Event} event
     */
    Nav.prototype.handleEvent = function (event) {
        this.onKeyDown(event);
    };


    /**
     * Main function in navigation for handle all keyboard events
     * and trigger registered event
     * @param {Event} event
     */
    Nav.prototype.onKeyDown = function(event) {
        var self = this,
            currentScope = self.getCurrentScope();

        if(!currentScope){
            console.error('current scope not found');
            return;
        }

        var currentElement = currentScope.getCurrentElement();

        if(!currentElement) {
            DEBUG && console.info('current element not found');
            return;
        }

        var eventName = this.getEventName(event),
            nextElement = null;

        if (eventName && ['left', 'right', 'up', 'down'].indexOf(eventName) > -1) {
            nextElement = currentScope.getNextElement(eventName);

            if (nextElement) {
                currentScope.setCurrentElement(nextElement);
                this.trigger('move', currentElement);
            }

            if(self.mouseEnableTimeout){
                clearTimeout(self.mouseEnableTimeout);
            }

            self.isMouseEnable = false;
            self.mouseEnableTimeout = setTimeout(function () {
                self.isMouseEnable = true;
            }, 1000);
        }

        // if declared event / dispatch declared event
        if(eventName){
            this.trigger(eventName, currentElement);
        }

        var log = document.getElementById('nav-event-info');

        if(log){
            log.innerHTML = '<b>Last event:</b>' +
            '<br /> navEvent: ' + options.prefix + '-' + eventName +
            '<br /> keyValue: ' + String.fromCharCode(event.keyCode || event.charCode) +
            '<br /> keyCode: ' + event.keyCode +
            '<br /> eventType: ' + event.type +
            '<br /> navScope: ' + currentScope.name;
        }
    };


    /**
     * Trigger navigation event
     * @param name
     * @param target
     */
    Nav.prototype.trigger = function (name, target) {
        var eventName = prefix + '-' + name;
        var navEvent = new Event(eventName, {
            bubbles: true,
            cancelable: false,
            target: target,
            toElement: target
        });

        target.dispatchEvent(navEvent);

        // jquery support
        if(typeof $ !== 'undefined'){
            $(target).trigger(eventName);
        }
    };


    var NavScope = function(element){
        var self = this;
        self.name = element.getAttribute(options.attrScope);
        DEBUG && console.info(self.name, ': scope create');
        self.element = element;
        self.navigationElements = [];
        self.currentElement = null;
        self.activate();
        return self;
    };


    /**
     * Activate scope
     * @returns {NavScope}
     */
    NavScope.prototype.activate = function () {
        console.log(this.name, ': activated, elements', this.navigationElements.length);

        this.currentElement = this.getCurrentElement();

        if(!this.currentElement){
            DEBUG && console.info(this.name, ': not found current element');
        }

        if(this.currentElement){
            addClass(this.currentElement, options.attrElementCurrent);
        }

        return this;
    };


    /**
     * Add element to scope
     * @param {HTMLElement} element
     * @returns {NavScope}
     */
    NavScope.prototype.addElement = function (element) {
        if(this.navigationElements.indexOf(element) > -1){
            return this;
        }

        this.navigationElements.push(element);

        return this;
    };


    /**
     * Remove element from scope
     * @param {HTMLElement} element
     * @returns {NavScope}
     */
    NavScope.prototype.removeElement = function (element) {
        var index = this.navigationElements.indexOf(element);

        if(this.isCurrentElement(element)){
            DEBUG && console.info('remove current element');
        }

        if(index > -1){
            this.navigationElements.splice(index, 1);
        }

        return this;
    };


    /**
     * Return scope html container
     * @returns {HTMLElement}
     */
    NavScope.prototype.getScopeElement = function () {
        if(!this.element){
            return false;
        }

        return this.element;
    };


    /**
     * Return current element
     * @returns {HTMLElement}
     */
    NavScope.prototype.getCurrentElement = function() {
        if(this.currentElement){
            return this.currentElement;
        }

        var navElements = this.navigationElements,
            currentElement = false;

        for (var i = 0, n = navElements.length; i < n; i++) {
            if (this.isCurrentElement(navElements[i])) {
                currentElement = navElements[i];
                // @todo break loop
            }

        }

        return currentElement;
    };


    /**
     * Get all navigation elements from scope
     * @returns {HTMLElement[]}
     */
    NavScope.prototype.getNavigationElements = function () {
        return this.navigationElements;
    };


    /**
     * Check is current element
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    NavScope.prototype.isCurrentElement = function (element) {
        var attr = element.getAttribute(options.attrElementCurrent);
        if (attr === '' || attr === 'true') {
            return true;
        }

        return false;
    };


    /**
     * Set current element
     * @param {HTMLElement} element
     */
    NavScope.prototype.setCurrentElement = function(element) {
        var prevElement = this.getCurrentElement();
        this.currentElement = element;

        if(prevElement){
            prevElement.removeAttribute(options.attrElementCurrent);
            removeClass(prevElement, options.attrElementCurrent);
        }

        this.currentElement = element;
        addClass(this.currentElement, options.attrElementCurrent);

        this.currentElement.setAttribute(options.attrElementCurrent, 'true');
    };


    /**
     * Get next element by direction
     * @param {string} direction
     * @returns {HTMLElement}
     */
    NavScope.prototype.getNextElement = function(direction) {
        var current = this.getCurrentElement();

        if(!current){
            DEBUG && console.info('Current element not found');
            return;
        }

        var distance = null,
            index,
            navElements = this.navigationElements,
            currentRect = current.getBoundingClientRect(),
        // todo function
            cx = currentRect.left + (currentRect.width / 2),
            cy = currentRect.top + (currentRect.height / 2);

        var FOV = options.FOV;

        for (var i = 0; i < navElements.length; i++) {
            var el = navElements[i],
                isHidden = el.offsetParent == null,
                isCurrent = navElements.indexOf(current) == i,
                inDOM = document.body.contains(el);

            // if current
            if (isHidden || isCurrent || !inDOM) {
                continue;
            }

            var elRect = el.getBoundingClientRect(),
                ex = elRect.left + (elRect.width / 2),
                ey = elRect.top + (elRect.height / 2),
                xdiff = cx - ex,
                ydiff = cy - ey,
                dis = Math.round(Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5)),
                angle = Math.round(Math.atan2(ydiff, xdiff) * (180 / Math.PI));

            // angle normalize [0,360]
            if (angle < 0) angle += 360;

            // 45  90  135
            //  0      180
            //315 270  225
            var inFOV = false;

            // left
            if (direction == 'left' && (angle > (360 - FOV) && angle <= 360 || angle >= 0 && angle < (0 + FOV) )) {
                inFOV = true;
            } else if (direction == 'down' && (angle > (270 - FOV) && angle < (270 + FOV))) {
                inFOV = true;
            } else if (direction == 'right' && (angle > (180 - FOV) && angle < (180 + FOV))) {
                inFOV = true;
            } else if (direction == 'up' && (angle > (90 - FOV)  && angle < (90 + FOV))) {
                inFOV = true;
            }

            if(!inFOV){
                continue;
            }

            if (distance === null || distance > dis) {
                distance = dis;
                index = i;
            }
        }

        if (typeof index === 'undefined') {
            return false;
        }

        var nextElement = navElements[index];
        scroll(this.element, current, nextElement);

        return nextElement;
    };


    /**
     * Function for scroll
     * @param {HTMLElement} scrollContainer
     * @param {HTMLElement} currentElement
     * @param {HTMLElement} nextElement
     */
    function scroll(scrollContainer, currentElement, nextElement){
        var scrollLeft = nextElement.offsetLeft + (nextElement.offsetWidth / 2) - (scrollContainer.offsetWidth / 2);
        var scrollTop = nextElement.offsetTop + (nextElement.offsetHeight / 2) - (scrollContainer.offsetHeight / 2);

        scrollContainer.scrollLeft = scrollLeft;
        scrollContainer.scrollTop = scrollTop;
    }


    /**
     * Find and return HTMLElements by attribute name
     * @param {HTMLElement[]} elements
     * @param {string} attribute
     * @returns {HTMLElement[]}
     */
    function getElementsByAttributeName(elements, attribute) {
        var result = [];
        for (var i = 0, n = elements.length; i < n; i++) {
            if (elements[i].getAttribute(attribute) !== null) {
                result.push(elements[i]);
            }

            if(elements[i].children.length > 0){
                var childrens = getElementsByAttributeName(elements[i].children, attribute);
                if(childrens.length > 0){
                    result = result.concat(childrens);
                }
            }
        }

        return result;
    }


    /**
     * Add class to HTMLElement
     * @param {HTMLElement} element
     * @param {string} className
     */
    function addClass(element, className) {
        removeClass(element, className);
        element.className = element.className.split(' ').concat([className]).join(' ').trim();
    }


    /**
     * Remove class from HTMLElement
     * @param {HTMLElement} element
     * @param {string} className
     */
    function removeClass(element, className) {
        var classes = element.className.split(' ');

        for(var i= (classes.length-1); i >= 0; i--) {
            if (classes[i] == className) {
                classes.splice(i, 1);
            }
        }

        element.className = classes.join(' ');
    }


    /**
     * Merge objects2 to object2 and return new object
     * @param {object} obj1
     * @param {object} obj2
     * @returns {object}
     */
    function mergeObjects(obj1, obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }

    /**
     * Clone object
     * @param obj
     * @returns {object}
     */
    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    var nav = new Nav();
    window.navigation = function () {
        return nav.initialize();
    }();
})();