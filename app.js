angular.module( 'app', [
  'app.home',
  'app.login',
  'app.signup',
  'app.user',
  'angular-jwt',
  'angular-storage',
  'kendo.directives'
])
.constant('apiUrl', 'https://localhost:8000')
.config( function myAppConfig ($urlRouterProvider, jwtInterceptorProvider, $httpProvider) {
  $urlRouterProvider.otherwise('/');

  jwtInterceptorProvider.tokenGetter = function(store) {
    return store.get('jwt');
  }

  $httpProvider.interceptors.push('jwtInterceptor');
})
.run(function($rootScope, $state, store, jwtHelper) {
  $rootScope.$on('$stateChangeStart', function(e, to) {
    if (to.data && to.data.requiresLogin) {
      const token = store.get('jwt');

      if (!token || jwtHelper.isTokenExpired(store.get('jwt'))) {
        e.preventDefault();
        store.remove('jwt');
        $state.go('login');
      } else {
        const tokenPayload = jwtHelper.decodeToken(token);
        const userRoles = tokenPayload.authorities.map(authority => authority.authority);
        
        if (to.data.requiredRoles && !to.data.requiredRoles.some(
          role => userRoles.includes(role))) {
          e.preventDefault();
          $state.go('user');
        } 
      }
    }
  });
})
.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$routeChangeSuccess', function(e, nextRoute){
    if ( nextRoute.$$route && angular.isDefined( nextRoute.$$route.pageTitle ) ) {
      $scope.pageTitle = nextRoute.$$route.pageTitle + ' | ngEurope Sample' ;
    }
  });
})

;

