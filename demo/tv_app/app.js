(function(){

    MainCtrl.$inject = ['$scope', '$location', '$window', 'ApiService'];
    function MainCtrl($scope, $location, $window, ApiService) {
        $scope.opt = {
            limit: 30,
            offset: 0
        };

        $scope.reloadRoute = function () {
            $window.location.reload();
        };

        $scope.movies = [];

        $scope.currentIndex = 0;

        ApiService.movies.query($scope.opt).$promise.then(function (data) {
            $scope.movies = $scope.movies.concat( data.rows );
            loadPosters(data.rows);
        });

        $scope.loadNext = function () {
            $scope.opt.offset += $scope.opt.limit;
            ApiService.movies.query($scope.opt).$promise.then(function (data) {
                $scope.movies = $scope.movies.concat( data.rows );
                loadPosters(data.rows);
            });
        };

        var loadPosters = function (movies) {
            angular.forEach(movies, function (movie) {
                var img =  new Image();
                img.src = movie.assets.poster + '?w=600&h=360';
            });
        }

        $scope.toTopMenu = function () {
            console.log('TO TOP MENU');
            navigation.changeScope('topmenu');
        }

        $scope.shift = function (direction) {
            var index = null;
            if (direction == 'left') {
                index = $scope.currentIndex-1;
            }

            if (direction == 'right') {
                index = $scope.currentIndex+1;
            }

            if (index < 1) {
                index = 0;
            }

            if(index >= ($scope.movies.length - 1)){
                index = ($scope.movies.length - 1);
            }

            if(($scope.movies.length - 1) == index){
                $scope.loadNext();
                return;
            }

            $scope.currentIndex = index;

            return;
        }

        $scope.toMovie = function (movie) {
            $location.path('/movies/' + movie.id);
        }
    }


    ApiService.$inject = ['$resource'];
    function ApiService($resource){

        var api = {
            movies: $resource('https://api.look1.ru/movies/:id', {id: "@id"},
                {
                    query: {
                        isArray: false,
                        cache: true,
                        withCredentials: true
                    },
                    get: {
                        withCredentials: true
                    },
                    search: {
                        url: '/movies/search',
                        withCredentials: true
                    }
                }
            )
        }

        return api;
    };

    MovieCtrl.$inject = ['$scope', '$routeParams', '$window', 'ApiService'];
    function MovieCtrl ($scope, $routeParams, $window, ApiService) {
        $scope.movie ={};

        ApiService.movies.get({id:$routeParams.movieId}).$promise.then(function (data) {
            $scope.movie = data;
        });

        $scope.back = function (par) {
            $window.history.back();
        }
    }

    TopMenuCtrl.$inject = ['$scope', '$routeParams', '$window', 'ApiService'];
    function TopMenuCtrl ($scope, $routeParams, $window, ApiService) {
        $scope.toPrevScope = function () {
            var prevScope = navigation.getPrevScope();
            navigation.changeScope(prevScope.name);
        }
    }

    angular
        .module('look1_tv_app', ['ngResource', 'ngRoute', 'uiNavigation'])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider
                .when('/', {templateUrl: './main.html', controller: 'MainCtrl'})
                .when('/movies/:movieId', {templateUrl: './movie.html', controller: 'MovieCtrl'})
                .otherwise({redirectTo: '/'});
        }])
        .controller('MainCtrl', MainCtrl)
        .controller('MovieCtrl', MovieCtrl)
        .controller('TopMenuCtrl', TopMenuCtrl)
        .service('ApiService', ApiService)
})();