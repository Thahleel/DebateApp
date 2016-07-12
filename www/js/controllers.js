angular.module('controllers', ['firebase'])

.controller('AppCtrl', function($scope, $window, $state) {
  $scope.signOut = function () {
    firebase.auth().signOut().then(function() {
      $state.go('intro');
    }, function(error) {
      $window.alert("Error: could not sign out");
    });
  }
})

.controller('IntroCtrl', function($scope, $state, fbUser, $window, $firebaseAuth, $location, $ionicHistory){
  $scope.signIn = function() {
    var fbLoginSuccess = function (userData) {
      // Call back success function
      facebookConnectPlugin.getAccessToken(function(token) {
          var credential = firebase.auth.FacebookAuthProvider.credential(token);
          $firebaseAuth().$signInWithCredential(credential).then(function(firebaseUser) {
          $ionicHistory.nextViewOptions({
            disableBack: true
          });

          //Initilises service with the firebaseUser object of the logged in user
          var promise = fbUser.initalUserSetup(firebaseUser);

          promise.then(function () {
            $state.go("tab.home");
            //$location.path("/tab/home");
          }).reject( function () {
            $window.alert("Error: unable to initialise data");
          });

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

.controller('HomeCtrl', function($scope, fbUser) {
  $scope.name = fbUser.getFirebaseUser().displayName;
  $scope.rank = fbUser.getUserData().debateRank;

})

.controller('PersonalCtrl', function($scope) {

})

.controller('InfoCtrl', function($scope) {

})

.controller('SettingsCtrl', function($scope) {

});
