angular.module( 'app.login', [
  'ui.router',
  'angular-storage',
  'app.user',
  'app'
])
.config(function($stateProvider) {
  $stateProvider.state('login', {
    url: '/login',
    controller: 'LoginCtrl',
    templateUrl: 'login/login.html'
  });
})
.controller( 'LoginCtrl', function LoginController( $scope, $http, store, $state, apiUrl) {

  $scope.user = {};
  $scope.inputType = 'password';

    $scope.togglePasswordVisibility = function() {
        if ($scope.inputType === 'password') {
            $scope.inputType = 'text';
        } else {
            $scope.inputType = 'password';
        }
    };

  $scope.login = function() {
    $http({
      url: apiUrl + '/api/v1/auth/login',
      method: 'POST',
      data: $scope.user
    }).then(function(response) {
      store.set('jwt', response.data.token);
      $state.go('home');
    }, function(response) {
      if(response.status === 401){
        $scope.invalidCredentialsMessage = response.data.invalidCredentialsError;
        $scope.invalidCredentials = true;
      }
    });
  }

});
