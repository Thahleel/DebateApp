angular.module('controllers', ['firebase'])

.controller('AppCtrl', function($scope, $window, $state, fbUser) {
  // Signs out the user and returns to intro screen
  $scope.signOut = function () {
    firebase.auth().signOut().then(function() {
      fbUser.serviceShutDown();
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

          // Prepare app and switch to home view
          prepareApp(firebaseUser);

        }).catch(function(error) {
          console.log("Authentication failed:", error);
        });
      });
    }

    // prepares app after the login process succeeds
    var prepareApp = function(firebaseUser) {
      /*Initilises service with the firebaseUser object of the logged in user.
        The call attempts to retrieve data from the database. This is performed asynchronously hence
        at this moment in time the data may not be in the correct place yet. So the function returns a promise
        which tells us when the data has correctly been stored in the service.*/
      var promise = fbUser.initalUserSetup(firebaseUser);

      /* Instead of rushing off to the home view, we use the promise to wait until the data retrieval from the
         database was successful. If so, we run a function that sends us to the home view */
      promise.then(function () {
        $state.go("tab.home");
        //$location.path("/tab/home");
      }).reject( function () {
        $window.alert("Error: unable to initialise data");
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

.controller('HomeCtrl', function($scope, fbUser, $window, debateServ) {
  $scope.name = fbUser.getFirebaseUser().displayName;
  $scope.userData = fbUser.getUserData();

  $scope.getAllDebates = function () {
    return debateServ.getAllDebates()
  }

  $scope.something = function () {
    var updateData = {
      debateRank : $scope.userData.debateRank + 100
    };
    fbUser.updateUserData(updateData);
  }

  $scope.fakedebate = function () {
    fbUser.createDebate({
      premise: "Is pokemon GO too disruptive?",
      duration: 0.25,
      topic: "General"
    })
  }
})

.controller('PersonalCtrl', function($scope) {

})

.controller('InfoCtrl', function($scope) {

})

.controller('SettingsCtrl', function($scope) {

});
