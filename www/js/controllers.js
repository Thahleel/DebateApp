angular.module('starter.controllers', [])

.controller('IntroCtrl', function($scope, $state, $firebaseAuth, $location, $ionicHistory){
  $scope.signIn = function() {
    var fbLoginSuccess = function (userData) {
      // Call back success function
      facebookConnectPlugin.getAccessToken(function(token) {
        var credential = firebase.auth.FacebookAuthProvider.credential(token);
        $firebaseAuth().$signInWithCredential(credential).then(function(firebaseUser) {
          $ionicHistory.nextViewOptions({
            disableBack: true
          });

          $state.go("tab.home");
          //$location.path("/tab/home");
        }).catch(function(error) {
          console.log("Authentication failed:", error);
        });
      });
    }

    // Try to login, if successful call fbLoginSuccess
    facebookConnectPlugin.login(["public_profile"], fbLoginSuccess,
      function (error) {
        console.error(error);
      }
    );
  };
})

.controller('HomeCtrl', function($scope) {

})

.controller('PersonalCtrl', function($scope) {

})

.controller('InfoCtrl', function($scope) {

})

.controller('SettingsCtrl', function($scope) {

});
