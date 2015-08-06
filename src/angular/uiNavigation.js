(function(window, angular) {
    var app = angular.module('uiNavigation', ['ng']);
    var keyCodes = navigation.getKeyMapping();
    var events = [];
    for(var keyCode in keyCodes){
        if(events.indexOf(keyCodes[keyCode]) === -1){
            events.push(keyCodes[keyCode]);
        }
    }

    angular.forEach(events, function (eventName) {
        var dirName = 'nv' + (eventName.substring(0, 1).toUpperCase() + eventName.substr(1));
        app.directive(dirName, function () {
            return {
                restrict: 'A',
                link: function(scope, element, attrs, controller){
                    element.bind( 'nv-' + eventName, function (event) {
                        scope.$apply(function(){
                            scope.$eval(attrs[dirName], {'event': event});
                        });
                    });
                }
            }
        });
    });

    NavigationElement.$inject = ['$log', '$timeout'];
    function NavigationElement($log, $timeout){
        return {
            restrict: 'A',
            link: function(scope, element) {
                // wait set attr
                $timeout(function () {
                    navigation.addElement(element[0]);
                });
            }
        };
    }

    NavigationScope.$inject = ['$log', '$timeout'];
    function NavigationScope($log, $timeout){
        return {
            restrict: 'A',
            link: function (scope, element) {
                scope.$on("$destroy", function () {
                    navigation.removeScope(element[0])
                });
            }
        };
    }

    app.directive('nvScope', NavigationScope)
        .directive('nvEl', NavigationElement)



})(window, window.angular);