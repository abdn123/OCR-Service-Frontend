angular.module( 'app.home', [
  'ui.router',
  'angular-storage',
  'angular-jwt',
  'kendo.directives',
  'app',
  'app.login'
])
.config(function($stateProvider) {
  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'home/home.html',
    controller: 'HomeCtrl',
    data: {
      requiredRoles: ['ROLE_ADMIN'],
      requiresLogin: true
    }
  });
})
.controller( 'HomeCtrl', function HomeController( $scope, $http, store, $state, apiUrl) {
  $scope.jwt = store.get('jwt');
  
    $scope.resetPasswordItems = {};
    $scope.passwordInputType = 'password';
    
    $scope.userGrid = {
        dataSource: {
            transport: {
                read: {
                    url: apiUrl + '/users',
                    beforeSend: function(req) {
                        req.setRequestHeader('Authorization', "Bearer: " + JSON.parse(localStorage.getItem("jwt")));
                    },                    
                    dataType: "json",
                    type: "GET"
                }
            },
            schema: {
                model: {
                    id: "id",
                    fields: {
                        image: {type: "string"},
                        username: { type: "string", validation: { required: true } },
                        email: { type: "string",  validation: { required: true, email: true } },
                        active: { type: "bool",  validation: { required: true, active: true } },
                        role: { type: "string",  validation: { required: true, active: true } }
                    }
                },
                data: function(response) {
                    return response.map(function(item) {
                        if(item.authorities.some(authority => authority.authority === 'ROLE_ADMIN'))
                          roles = 'ADMIN';
                        else
                          roles = item.authorities.map(auth => auth.authority.replace('ROLE_', '')).join(', ');
                        return {
                            image: item.image,
                            id: item.id,
                            username: item.username,
                            email: item.email,
                            role: roles,
                            active: item.active
                        };
                    });
                }
            },
            pageSize: 10,
            serverPaging: true,
        },
        sortable: true,
        pageable: true,
        editable: 'inline',
        columns: [
            { 
                field: "image", 
                title: "Picture", 
                width: "60px",
                template: function(dataItem) {
                    if(!dataItem.image) {
                        src = `<img src="profile.jpg" alt='Image'>`;
                    } else {
                        src = "<img src='data:image/jpeg;base64," + dataItem.image + "'>";
                    }
                    return src;
                }
            },
            { field: "username", title: "Username", width: "150px" },
            { field: "email", title: "Email Address", width: "150px" },
            { field: "role", title: "Role", width: "100px" },
            { 
                field: "active", 
                title: "Status",
                template: function(dataItem) {
                    const badgeClass = dataItem.active ? 'badge-green' : 'badge-red';
                    const badgeText = dataItem.active ? 'Active' : 'Inactive';
                return `
                    <span class="status-badge ${badgeClass}">
                        ${badgeText}
                    </span>`;
                },
                width: "100px"
            },
            { template: 
                `<button kendo-button ng-click=editUserWindowOpen(dataItem)>
                <i class="fa fa-pencil-square-o" aria-hidden="true"></i>Edit</button>&nbsp;
                <button kendo-button ng-click="deleteUser(dataItem)">
                <i class="fa fa-trash" aria-hidden="true"></i>Delete</button>`,
                width: "200px"
            }
        ],
    };

    $scope.editUserWindowOpen = function(dataItem) {
        $scope.user = {
            "id": dataItem.id,
            "username": dataItem.username,
            "email": dataItem.email,
            "active": dataItem.active,
            "role": dataItem.role,
            "image": dataItem.image
        };
        $scope.addChangePicture = dataItem.image == '' ? "Add Profile Picture" : "Change Profile Picture"
        $scope.imagePreview = dataItem.image == '' || !dataItem.image ? "profile.jpg" : "data:image/jpeg;base64," + dataItem.image;
        $scope.editUserWindow.center().open();
    }

    $scope.deleteUser = function(dataItem) {
        kendo.confirm("Are you sure you want to delete this user?")
        .done(function(){
            $http({
                method: 'DELETE',
                url: apiUrl + '/users/delete',
                data: {'username': dataItem.username},
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(function(response) {
                $scope.windowMessage = response.data.message;
                $scope.notificationWindow.setOptions({title: "Delete Success"});
                $scope.notificationWindow.center().open();
                $scope.kendoGrid.dataSource.read();
                $scope.getUsers();
            })
            .catch(function(response) {
              $scope.windowMessage = response.data.message;
              $scope.notificationWindow.setOptions({title: "Update Failure"});
              $scope.notificationWindow.center().open();
            });
        })
    }

    $scope.editUser = function() {
        $http.post(apiUrl + '/users/update', $scope.user)
            .then(function(response) {
                $scope.windowMessage = response.data.message;
                $scope.notificationWindow.setOptions({title: "Update Success"});
                $scope.notificationWindow.center().open();
                $scope.resetUser();
                $scope.editUserWindow.close();
                $scope.kendoGrid.dataSource.read();
                $scope.getUsers();
              })
              .catch(function(response) {
                $scope.windowMessage = response.data.message;
                $scope.notificationWindow.setOptions({title: "Update Failure"});
                $scope.notificationWindow.center().open();
            });
    };

    $scope.uploadFile = function(files) {
        
        var file = files[0]
        var reader = new FileReader();
        
        reader.onload = function(e) {
            $scope.$apply(function() {
                $scope.imagePreview = e.target.result;
                $scope.user.image = e.target.result.split(',')[1];
            })
        }

        reader.readAsDataURL(file);
    };

    $scope.removeImage = function() {
        $scope.user.image = "";
        $scope.imagePreview = "profile.jpg";
    }

    $scope.addUser = function() {
        $http({
          method: 'POST',
          url: apiUrl + '/users/newuser',
          headers: {
            'Authorization': "Bearer: " + JSON.parse(localStorage.getItem("jwt"))
          },
          data: $scope.user
        })
        .then(function() {
            $scope.windowMessage = "User Added Successfully";
            $scope.notificationWindow.setOptions({title: "Add User Success"});
            $scope.notificationWindow.center().open();
            $scope.resetUser();
            $scope.addUserWindow.close();
            $scope.kendoGrid.dataSource.read();
            $scope.getUsers();
          })
          .catch(function(error) {
            $scope.windowMessage = error.message;
            $scope.notificationWindow.setOptions({title: "Add User Failure"});
            $scope.notificationWindow.center().open();
        });
    };

    $scope.resetPassword = function() {
        $http.post(apiUrl + '/users/resetpassword', $scope.resetPasswordItems)
            .then(function(response) {
                $scope.windowMessage = response.data.message;
                $scope.notificationWindow.center().open();
                $scope.resetPasswordItems = {};
                $scope.resetPasswordWindow.close();
            })
            .catch(function(error) {
                alert('Error resetting Password: ' + error.message);
            });
    }

    $scope.resetPasswordWindowOpen = function () {
        $scope.resetPasswordItems.username = $scope.user.username;
        $scope.editUserWindow.close();
        $scope.resetPasswordWindow.center().open();
    }
    
    $scope.onResetPasswordWindowClose = function() {
        $scope.resetPasswordItems = {};
    };

    $scope.onEditUserWindowClose = function() {
        $scope.resetUser();
    };

    $scope.onAddUserWindowClose = function() {
      $scope.resetUser();
    };


    $scope.togglePasswordVisibility = function() {
        if ($scope.passwordInputType === 'password') {
            $scope.passwordInputType = 'text';
        } else {
            $scope.passwordInputType = 'password';
        }
    };

    
    $scope.getUsers = function(){
        $http.get(apiUrl + '/users/getusers')
        .then(function(response){
            $scope.totalUsers =  response.data.totalUsers;
            $scope.activeUsers = response.data.activeUsers;
        })
    }

    $scope.getCurrentUser = function() {
      $http({
        method: 'GET',
        url: apiUrl + '/me',
        headers: {'Authorization': "Bearer: " + JSON.parse(localStorage.getItem("jwt"))}
      })
      .then(function(response){
        $scope.currentUsername = response.data.username;
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
      .catch(function(response) {
        if(response.status === 401)
          store.remove('jwt');
          $state.go('login')
      })
    }

    $scope.resetUser = function() {
      $scope.user = {};
      $scope.imagePreview = "";
      $scope.user.role = "USER";
      $scope.user.active = true;
    }

    $scope.logout = function() {
        store.remove('jwt');
        $state.go('login');
    }
});
