angular.module( 'app.user', [
    'ui.router',
    'angular-storage',
    'app'
])
.config(function($stateProvider) {
    $stateProvider.state('user', {
        url: '/user',
        controller: 'UserController',
        templateUrl: 'user/user.html',
        data: {
            requiresLogin: true,
            requiredRoles: ['ROLE_ADMIN', 'ROLE_USER']
          },
    });
})
.controller('UserController', function($scope, $http, apiUrl, store, $state) {
    $scope.getCurrentUser = function() {
        $scope.currentUser = {};
        $http({
          method: 'GET',
          url: apiUrl + '/me',
          headers: {'Authorization': "Bearer: " + JSON.parse(localStorage.getItem("jwt"))}
        })
        .then(function(response){
          $scope.currentUser = response.data;
          $http({
            method: 'GET',
            url: apiUrl + '/' + $scope.currentUser.id + '/image',
            headers: {'Authorization': "Bearer: " + JSON.parse(localStorage.getItem("jwt"))}
            })
            .then(function(res) {
                if(res.data.image && res.data.image !== '')
                    $scope.userImage = 'data:image/jpeg;base64,' + res.data.image;
                else
                    $scope.userImage = 'profile.jpg';
            })
            .catch(function(error) {
                console.error(error);
            })
        })
        .catch(function(error) {
            console.log(error);
        })
    }

    $scope.logout = function() {
        store.remove('jwt');
        $state.go('login');
    }

    $scope.uploadFile = function(files) {
        
        var file = files[0]
        $scope.fileName = file.name;
        $scope.fd = new FormData();
        $scope.fd.append('file', file);
        $scope.$apply();
    };

    $scope.submitFile = function() {
        $http({
          method: 'POST',
          url: apiUrl + '/documents',
          headers: {
            'Authorization': "Bearer: " + JSON.parse(localStorage.getItem("jwt")),
            'Content-Type': undefined
          },
          data: $scope.fd,
          transformRequest: angular.identity
        })
        .then(function(response) {
            $scope.fileUploadResponse = response.data;
        })
        .catch(function(response) {
            $scope.fileUploadResponse = response.data;
        })
    }
})