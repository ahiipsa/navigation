var assert = chai.assert;
var expect = chai.expect;

describe("Navigation.initialize", function() {

    it("navigation in global scope", function() {
        assert.typeOf(window.navigation, 'object', 'in window.navigation');
        assert.typeOf(navigation, 'object', 'in navigation');
    });

    it('getOptions()', function () {
        var options = navigation.getOptions();

        assert.isObject(options);
    });

    it('setOption(name, value)', function () {
        var FOV = 91;

        navigation.setOption('FOV', 91);
        assert.equal(navigation.getOptions()['FOV'], FOV);
    });

    it('deinitialize / initialize', function () {
        navigation.deinitialize();

        var scopes = navigation.getScopes();
        assert.isObject(scopes);
        expect(scopes).to.be.empty;

        navigation.initialize();
        scopes = navigation.getScopes();
        expect(scopes).to.not.empty;
    });

    it('refresh', function () {
        navigation.refresh();
        var scopes = navigation.getScopes();
        expect(scopes).to.not.empty;
    });

});


describe('Navigation.scopes', function () {

    var scopes;
    var scopeFirst;
    var scopeSecond;

    before(function () {
        scopes      = navigation.getScopes();
        scopeFirst  = navigation.getScope('first');
        scopeSecond = navigation.getScope('second');
    });

    it('removeScope(name || scope)', function () {
        navigation.removeScope('first');
        assert.isFalse( navigation.getScope('first') );
        navigation.refresh();
    });

    it('getScopes()', function () {
        assert.isObject(scopes);
    });

    it('getScope(name): has scopes first, second', function () {
        assert.isObject(scopeFirst);
        assert.equal(scopeFirst.name, 'first', 'scope name is "first"');

        assert.equal(scopeFirst.name, 'first', 'scope name is "first"');
        assert.isObject(scopeSecond);
    });

    it('getCurrentScope(): return is current scope', function () {
        var scope = navigation.getCurrentScope();
        var isCurrentScope = navigation.isCurrentScope(scope);
        assert.isTrue(isCurrentScope, 'getCurrentScope scope return current scope');
    });

    it('changeScope(name): to second and back', function () {
        navigation.changeScope('second');

        console.log('scopeSecond.name', scopeSecond.name);
        console.log('navigation.getCurrentscope().name', navigation.getCurrentScope().name);
        assert.isFalse(navigation.isCurrentScope(scopeFirst), 'scopeFirst is not current');
        assert.isTrue(navigation.isCurrentScope(scopeSecond), 'scopeSecond is current');

        navigation.changeScope('first');
        assert.isFalse(navigation.isCurrentScope(scopeSecond));
        assert.isTrue(navigation.isCurrentScope(scopeFirst));
    });

    it('_setCurrentScope(scope)', function () {
        navigation.changeScope('first');

        navigation._setCurrentScope(scopeSecond);
        assert.isTrue(navigation.isCurrentScope(scopeSecond));
    });

    it('isScopeExist(name)', function () {
        assert.isFalse(navigation.isScopeExist('somename'));
        assert.isTrue(navigation.isScopeExist('first'));
        assert.isTrue(navigation.isScopeExist('second'));
    });

    it('addScope(element)', function () {
        var scopeEl = document.createElement('div');
        scopeEl.setAttribute('nv-scope', 'third');
        scopeEl.setAttribute('id', 'scopeThird');

        var scopeContainer = document.getElementById('scopeContainer');
        scopeContainer.appendChild(scopeEl);
        navigation.addScope(scopeEl);
        assert.isObject(navigation.getScope('third'));
    });

    it('addElement(element)', function () {
        var scopeEl = document.getElementById('scopeThird');
        var number = 10;

        for (var i = 0; i < number; i++) {
            var nvEl = document.createElement('span');
            nvEl.setAttribute('nv-el', '');
            nvEl.innerText = ' span' + i;
            scopeEl.appendChild(nvEl);
            navigation.addElement(nvEl);
        }

        var scope = navigation.getScope('third');
        assert.isObject(scope);

        var elements = scope.getNavigationElements();
        expect(elements).to.have.length(number);
    });

    it('hasElement(element)', function () {
        // add element
        var scopeEl = document.getElementById('scopeThird');
        var navEl   = document.createElement('span');
        navEl.setAttribute('nv-el', '');
        navEl.innerText = 'dynamic element';
        scopeEl.appendChild(navEl);
        navigation.addElement(navEl);

        // check is navigation has element
        assert.isTrue( navigation.hasElement( navEl ) );
    });

    it('getScopeByElement(element)');

    it('removeElement(element)', function () {
        // add element
        var scopeThird = navigation.getScope('third');
        var scopeEl = document.getElementById('scopeThird');
        var navEl   = document.createElement('span');
        navEl.setAttribute('nv-el', '');
        navEl.innerText = 'removed';
        scopeEl.appendChild(navEl);

        var countElement = scopeThird.getNavigationElements().length;

        navigation.addElement(navEl);
        // check: is added?
        assert.isTrue(navigation.hasElement(navEl), 'navigation has element');
        // remove element
        navigation.removeElement(navEl);
        // check: is removed?
        assert.isFalse(navigation.hasElement(navEl), 'navigation has not element');

        expect(scopeThird.getNavigationElements().length).to.be.equal(countElement);
    });

    it('getPrevScope()', function () {
        navigation.changeScope('first');
        navigation.changeScope('second');
        var scope = navigation.getPrevScope();
        assert.equal(scope.name, 'first');
    });

    it('getEventName(event)');

    it('getEventValue(event)');

    it('getCurrentElement()', function () {
        var element = navigation.getCurrentElement();
        assert.isObject(element);
        assert.isTrue(element.hasAttribute('nv-el-current'));
        expect(element.className).to.contain('nv-el-current');
    });

    it('onKeyDown');

    it('trigger');
});

describe('Navigation.keyMapping', function () {
    it('getKeyMapping()', function () {
        var mapping = navigation.getKeyMapping();
        assert.isArray(mapping);

        for (var i = 0; i < mapping.length; i++) {
            var arr = mapping[i];
            assert.isArray(arr);
            assert.isNumber(arr[0]);
            assert.isString(arr[1]);
        }
    });

    it('setKeyMapping(array)', function () {
        var newMapping = [ [1, 'left'], [2, 'up'], [3, 'right'], [4, 'down'] ];
        var defaultMapping = navigation.getKeyMapping();

        navigation.setKeyMapping(newMapping);
        assert.equal( newMapping, navigation.getKeyMapping() );
        navigation.setKeyMapping(defaultMapping);
        assert.equal(defaultMapping, navigation.getKeyMapping() );
    });

    it('addKeyMapping', function () {
        var keys = [ [1, 'left'], [2, 'up'], [3, 'right'], [4, 'down'] ];

        navigation.addKeyMapping(keys);
        var keyMapping = navigation.getKeyMapping();

        assert.includeMembers(keyMapping, keys);
    });
});

describe('Scopes', function () {

    it('NavScope');

    // activate
    // addElement
    // removeElement
    // getScopeElement
    // getCurrentElement
    // getNavigationElements
    // isCurrentElement
    // setCurrentElement
    // cleanCurrentElement
    // getNextElement

});

describe('move', function () {
    it('move left', function () {
        navigation.move('left');
    });
});