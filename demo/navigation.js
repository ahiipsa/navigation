(function() {
    if (typeof DEBUG === 'undefined') {
        var DEBUG = false;
    }

    var prefix = 'nv';
    var options = {
        FOV: 90,
        prefix: prefix,
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
     * Switch debug mode
     * @param flag
     */
    Nav.prototype.debug = function (flag) {
        return DEBUG = flag;
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
    Nav.prototype._currentScope = null;


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
        29443:  'enter',
        108:    'red',
        20:     'green',
        21:     'yellow',
        22:     'blue',
        69:     'rw',
        71:     'play',
        74:     'pause',
        72:     'ff',
        7:      'volume_up',
        11:     'volume_down',
        68:     'ch_up',
        65:     'ch_down',
        70:     'stop',
        27:     'mute',
        31:     'info',
        101:    '1',
        98:     '2',
        6:      '3',
        8:      '4',
        9:      '5',
        10:     '6',
        12:     '7',
        //13:     '8',
        14:     '9',
        17:     '0'
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
        var self = this;
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
     * @param {string|Object} scope
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

        scope = this.getScope(scopeName);

        if(this.isCurrentScope(scope)){
            DEBUG && console.log('remove current scope');
            this._currentScope = null;
        }

        // todo if object

        DEBUG && console.log('remove scope', scopeName);
        this.getScopes()[scopeName] = undefined;
        delete this.getScopes()[scopeName];
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
        var scope = this.getScope(scopeName);

        if(!scope){
            throw new Error('Scope not found');
        }

        this.setCurrentScope(scope);
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
        var prevScope = this.getCurrentScope();
        var prevElement = null;

        if(prevScope.name === scope.name){
            DEBUG && console.info(scope.name, ': scope is current now');
            return this;
        }

        this._prevScope = prevScope;

        if(this._prevScope){
            prevElement = this._prevScope.getCurrentElement();
            var prevScopeEl = this._prevScope.getScopeElement();

            prevScopeEl.removeAttribute(options.attrScopeCurrent)
            removeClass(prevScopeEl, options.attrScopeCurrent);

            if(prevElement){
                removeClass(prevElement, options.attrElementCurrent);
            }
        }

        this._currentScope = scope;
        addClass(scope.getScopeElement(), options.attrScopeCurrent);
        scope.getScopeElement().setAttribute(options.attrScopeCurrent, 'true');
        scope.activate();
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


    Nav.prototype.isScopeExist = function (scopeName) {
        var scope = this.getScope(scopeName);

        if(scope){
            return true;
        }

        return false;
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
            DEBUG && console.log('----  remove element');
            scope.removeElement(element);
            _remove.call(element);
        };

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

            scope.setCurrentElement(element);
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
            DEBUG && console.error('current scope not found');
            return;
        }

        var currentElement = currentScope.getCurrentElement();

        if(!currentElement) {
            DEBUG && console.info('current element not found');
            return;
        }

        var eventName = this.getEventName(event);

        if (eventName && ['left', 'right', 'up', 'down'].indexOf(eventName) > -1) {
            self.move(eventName);
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


    Nav.prototype.move = function (direction) {
        var self = this;
        var currentScope = self.getCurrentScope();
        var currentElement = currentScope.getCurrentElement();
        var nextElement = currentScope.getNextElement(direction);

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
    };


    /**
     * Trigger navigation event
     * @param {string} name
     * @param {HTMLElement} target
     */
    Nav.prototype.trigger = function (name, target) {
        var eventName = options.prefix + '-' + name;
        var navEvent = null;

        if(typeof CustomEvent === 'function') {
            navEvent = new CustomEvent(eventName, {bubbles: "true"});
        } else if(typeof document.createEvent === 'function') {
            navEvent = document.createEvent('CustomEvent');
            navEvent.initCustomEvent(eventName, true, true);
        } else {
            DEBUG && console.log('Can\t create custom event');
            throw new Error('Can\t create custom event');
        }

        target.dispatchEvent(navEvent);
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
        DEBUG && console.log(this.name, ': activated, elements', this.navigationElements.length);

        this.currentElement = this.getCurrentElement();

        if(!this.currentElement){
            DEBUG && console.info(this.name, ': not found current element');
        } else {
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
            this.cleanCurrentElement(prevElement);
        }

        this.currentElement = element;
        addClass(this.currentElement, options.attrElementCurrent);

        this.currentElement.setAttribute(options.attrElementCurrent, 'true');
    };


    NavScope.prototype.cleanCurrentElement = function (element) {
        element.removeAttribute(options.attrElementCurrent);
        removeClass(element, options.attrElementCurrent);
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

        var windowSize = getWindowSize(),
            FOV = options.FOV,
            halfFOV = FOV / 2,
            distance = null,
            index,
            navElements = this.navigationElements,
            currentElementRect = current.getBoundingClientRect(),
            currentElementX = currentElementRect.left + (currentElementRect.width / 2),
            currentElementY = currentElementRect.top + (currentElementRect.height / 2),
            currentElementCenter = new Point(currentElementX, currentElementY);

        // offset in the direction of motion
        if ('up' == direction) {
            currentElementCenter.y = currentElementRect.top;
        } else if('down' == direction){
            currentElementCenter.y = currentElementRect.top + currentElementRect.height;
        } else if('left' == direction){
            currentElementCenter.x = currentElementRect.left;
        } else if('right' == direction){
            currentElementCenter.x = currentElementRect.left + currentElementRect.width;
        } else {
            DEBUG && console.error('Not declared direction: ' + direction);
        }

        for (var i = 0; i < navElements.length; i++) {
            var el = navElements[i],
                isHidden = el.offsetParent == null,
                isCurrent = navElements.indexOf(current) == i,
                inDOM = document.body.contains(el);

            if (isHidden || isCurrent || !inDOM) {
                continue;
            }

            var elementRect = el.getBoundingClientRect(),
                elementCenterX = elementRect.left + (elementRect.width / 2),
                elementCenterY = elementRect.top + (elementRect.height / 2),
                elementCenter = new Point(elementCenterX, elementCenterY),
                elementDistance = getDistance(currentElementCenter, elementCenter),
                angle = getAngle(currentElementCenter, elementCenter);

            // angle normalize [0,360]
            if (angle < 0) angle += 360;

            // 45  90  135
            //  0      180
            //315 270  225
            var inFOV = false;

            // left
            if (direction == 'left' && (angle > (360 - halfFOV) && angle <= 360 || angle >= 0 && angle < (0 + halfFOV) )) {
                inFOV = true;
            } else if (direction == 'down' && (angle > (270 - halfFOV) && angle < (270 + halfFOV))) {
                inFOV = true;
            } else if (direction == 'right' && (angle > (180 - halfFOV) && angle < (180 + halfFOV))) {
                inFOV = true;
            } else if (direction == 'up' && (angle > (90 - halfFOV)  && angle < (90 + halfFOV))) {
                inFOV = true;
            }

            // Intersection
            var x1 = elementRect.left,
                x2 = elementRect.left + elementRect.width,
                y1 = elementRect.top,
                y2 = elementRect.top + elementRect.height;

            var intersections = [], endPoint, line;

            if ('up' == direction) {
                // bottom line
                line = {start: new Point(x1, y2), end: new Point(x2, y2)};
                endPoint = new Point(currentElementCenter.x, 0);
            } else if ('down' == direction){
                // top line
                line = {start: new Point(x1, y1), end: new Point(x2, y1)};
                endPoint = new Point(currentElementCenter.x, windowSize.height);
            } else if ('left' == direction) {
                // right line
                line = {start: new Point(x2, y1), end: new Point(x2, y2)};
                endPoint = new Point(0, currentElementCenter.y);
            } else if ('right' == direction) {
                // left line
                line = {start: new Point(x1, y1), end: new Point(x1, y2)};
                endPoint = new Point(windowSize.width, currentElementCenter.y);
            }

            var intersection = getIntersection(endPoint, currentElementCenter, line.start, line.end);

            if(intersection){
                elementDistance = getDistance(currentElementCenter, intersection);
                intersections.push(intersection);
            }

            if(!inFOV && !intersections.length){
                continue;
            }

            // save to best way
            if (distance === null || distance > elementDistance) {
                distance = elementDistance;
                index = i;
            }
        }

        // if not found
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

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    function Point2f(start, type, end) {
        if(type == '-') {
            return {x: start.x - end.x, y: start.y - end.y}
        }
        else if(type == '*') {
            return {x: start.x * end.x, y: start.y * end.y}
        }
        else if(type == '+') {
            return {x: start.x + end.x, y: start.y + end.y}
        }
        else if(type == '/') {
            return {x: start.x / end.x, y: start.y / end.y}
        }
    }


    function getIntersection(start1, end1, start2, end2) {
        var dir1 = Point2f(end1, '-', start1),
            dir2 = Point2f(end2, '-', start2);

        // считаем уравнения прямых проходящих через отрезки
        var a1 = -dir1.y;
        var b1 = +dir1.x;
        var d1 = -(a1*start1.x + b1*start1.y);

        var a2 = -dir2.y;
        var b2 = +dir2.x;
        var d2 = -(a2*start2.x + b2*start2.y);

        // подставляем концы отрезков, для выяснения в каких полуплоскотях они
        var seg1_line2_start = a2*start1.x + b2*start1.y + d2;
        var seg1_line2_end = a2*end1.x + b2*end1.y + d2;

        var seg2_line1_start = a1*start2.x + b1*start2.y + d1;
        var seg2_line1_end = a1*end2.x + b1*end2.y + d1;

        // если концы одного отрезка имеют один знак, значит он в одной полуплоскости и пересечения нет
        if (seg1_line2_start * seg1_line2_end >= 0 || seg2_line1_start * seg2_line1_end >= 0)
            return false;

        var u = seg1_line2_start / (seg1_line2_start - seg1_line2_end);

        var pin_out = Point2f({x: u, y: u}, '*', dir1);

        return Point2f(start1, '+', pin_out);
    }

    function getAngle(pointA, pointB){
        var diff = Point2f(pointA, '-', pointB);
        var angle = Math.round(Math.atan2(diff.y, diff.x) * (180 / Math.PI));
        return angle;
    }

    function getDistance(pointA, pointB){
        var diff = Point2f(pointA, '-', pointB);
        var dis = Math.round( Math.pow((diff.x * diff.x + diff.y * diff.y), 0.5));
        return dis;
    }

    function getWindowSize() {
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            width = w.innerWidth || e.clientWidth || g.clientWidth,
            height = w.innerHeight || e.clientHeight || g.clientHeight;

        return {width: width, height: height};
    }

    var nav = new Nav();
    window.navigation = function () {
        return nav.initialize();
    }();
})();