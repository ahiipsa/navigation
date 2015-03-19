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


    var Nav = function(){
        this.isMouseEnable = true;
        this.mouseEnableTimeout = true;
        this._scopes = {};
        this._currentScope = null;
        this.prevScope = null;

        this.keyMapping = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            13: 'enter',
            27: 'back'
        }
    };


    Nav.prototype.initialize = function() {
        var self = this,
            body = window.document.body,
            navElements = getElementsByAttributeName(body.children, options.attrElement);

        body.addEventListener('keydown', function (event) {
            self.onKeyDown(event);
        });

        navElements.forEach(function (element) {
            self.addElement(element);
        });

        if(!this.getCurrentScope()){
            DEBUG && console.info('not found current scope');
        }

        return this;
    };


    Nav.prototype.getOptions = function () {
        var opt = clone(options);
        return opt;
    };


    Nav.prototype.getKeyMapping = function () {
        return this.keyMapping;
    };


    Nav.prototype.setKeyMapping = function (keyMapping) {
        this.keyMapping = keyMapping;
        return this;
    };


    Nav.prototype.addKeyMapping = function (keyMapping) {
        this.keyMapping = mergeObjects(this.keyMapping, keyMapping);
        return this;
    };


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

        return self;
    };


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


    Nav.prototype.isCurrentScope = function (scope) {
        if(scope === this.getCurrentScope()){
            return true;
        }

        return false;
    };


    Nav.prototype.changeScope = function (scopeName) {
        var scope = this.getScopes()[scopeName];

        if(!scope){
            throw new Error('Scope not found');
        }

        this.setCurrentScope(scope);
        scope.activate();
        return this;
    };


    Nav.prototype.getPrevScope = function () {
        if(!this._prevScope){
            return false;
        }

        return this._prevScope;
    };

    Nav.prototype.getCurrentScope = function () {
        if(!this._currentScope){
            return false;
        }

        return this._currentScope;
    };


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


    Nav.prototype.getScopes = function () {
        return this._scopes;
    };


    Nav.prototype.getEventName = function(event) {
        if (typeof this.keyMapping[event.keyCode] !== 'undefined') {
            return this.keyMapping[event.keyCode];
        }

        return false;
    };

    Nav.prototype.getScope = function (scopeName) {
        var scope = this.getScopes()[scopeName];

        if(!scope){
            return false;
        }

        return scope;
    };

    Nav.prototype.getCurrentElement = function () {
        return this.getCurrentScope().getCurrentElement();
    }

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
    };


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

                var eventMove = new Event(prefix + '-move', {
                    bubbles: true,
                    cancelable: true,
                    target: currentElement,
                    toElement: currentElement
                });

                currentElement.dispatchEvent(eventMove);
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
            var navEvent = new Event( prefix + '-' + eventName, {
                bubbles: true,
                cancelable: true,
                target: currentElement,
                toElement: currentElement
            });

            currentElement.dispatchEvent(navEvent);
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


    NavScope.prototype.addElement = function (element) {
        if(this.navigationElements.indexOf(element) > -1){
            return this;
        }

        this.navigationElements.push(element);

        return this;
    };


    NavScope.prototype.removeElement = function (element) {
        var index = this.navigationElements.indexOf(element);

        if(this.isCurrentElement(element)){
            DEBUG && console.info('remove current element');
        }

        if(index > -1){
            this.navigationElements.splice(index, 1);
        }

        return this;
    }


    NavScope.prototype.getScopeElement = function () {
        if(!this.element){
            return false;
        }

        return this.element;
    };

    NavScope.prototype.getCurrentElement = function() {
        if(this.currentElement){
            return this.currentElement;
        }

        var navElements = this.navigationElements,
            currentElement = false;

        for (var i = 0, n = navElements.length; i < n; i++) {
            if (this.isCurrentElement(navElements[i])) {
                currentElement = navElements[i];
            }
        }

        return currentElement;
    };


    NavScope.prototype.getNavigationElements = function () {
        return this.navigationElements;
    };


    NavScope.prototype.isCurrentElement = function (element) {
        var attr = element.getAttribute(options.attrElementCurrent);
        if (attr === '' || attr === 'true') {
            return true;
        }

        return false;
    };


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

        // focus on input after first enter
        // this.currentElement.focus();
    };


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


    function scroll(scrollContainer, currentElement, nextElement){
        // push scroll
        var ymin = scrollContainer.scrollTop,
            ymax = scrollContainer.scrollTop + scrollContainer.offsetHeight,
            xmin = scrollContainer.scrollLeft,
            xmax = scrollContainer.scrollLeft + scrollContainer.offsetWidth,
            ytop = scrollContainer.offsetTop,
            ybottom = nextElement.offsetTop + nextElement.offsetHeight,
            xleft = nextElement.offsetLeft,
            xright = nextElement.offsetLeft + nextElement.offsetWidth;

        var inScreenV = ymin < ytop && ymax > ybottom,
            inScreenH = xmin < xleft && xmax > xright;

        var scrollDistanceY = ytop - currentElement.offsetTop,
            scrollDistanceX = xleft - currentElement.offsetLeft;

        if(inScreenV == false){
            scrollContainer.scrollTop = scrollContainer.scrollTop + scrollDistanceY;
        }

        if(inScreenH == false){
            scrollContainer.scrollLeft = scrollContainer.scrollLeft + scrollDistanceX;
        }
    }


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


    function addClass(element, className) {
        removeClass(element, className);
        element.className = element.className.split(' ').concat([className]).join(' ').trim();
    }


    function removeClass(element, className) {
        element.className = element.className.replace(className, '').trim();
    }


    function mergeObjects(obj1, obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }

    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }


    window.navigation = function () {
        return new Nav().initialize();
    }();
})();