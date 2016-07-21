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

.controller('IntroCtrl', function($scope, $state, debateServ, fbUser, $window, $firebaseAuth, $location, $ionicHistory){

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
      }, function () {
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

.controller('HomeCtrl', function($scope, fbUser, $window, debateServ, $state) {
  $scope.name = fbUser.getFirebaseUser().displayName;
  $scope.userData = fbUser.getUserData();
  $scope.allDebates = debateServ.getAllDebates;
  $scope.state = $state;

  $scope.refreshDebates = function () {
    var promise = debateServ.updateAllDebates();

    promise.then(function () {
      $scope.$broadcast('scroll.refreshComplete');
      if($rootScope.$root.$$phase != '$apply' && $rootScope.$root.$$phase != '$digest'){
        $rootScope.$apply(function() {
        self.tags = true;
        });
      } else {
        self.tags = true;
      }
   });
  }

  $scope.switchCreatePage = function () {
    $state.go("createDebate");
  }

  // === VIEW EVENTS ===
  $scope.$on('$ionicView.enter', function(){
    $scope.refreshDebates();
  });
})

.controller('PersonalCtrl', function($scope) {

})

.controller('NotifCtrl', function($scope) {

})

.controller('SettingsCtrl', function($scope, $state, $window) {
  $scope.openMyInfoPage = function () {
    $state.go('tab.userinfo')
  }
})

.controller('UserInfoCtrl', function($scope) {

})

.controller('CreateDebateCtrl', function($scope, $state, fbUser, $window) {
  $scope.goBackHome = function () {
    $state.go('tab.home')
  }

  $scope.create = function (debateTopic,debateTitle,debateEndDate,debateEndTime) {
  var debateIDArg = fbUser.createDebate({
     topic: debateTopic,
     premise: debateTitle,
     endDate: debateEndDate.getTime() + debateEndTime.getTime()
   })

   this.debateTitle = null;
   this.debateEndTime = null;
   this.debateTopic = null;
   this.debateEndDate = null;

   $state.go('mainDebate', {debateid : debateIDArg})
  }
})

.controller('MainDebateCtrl', function($scope, $stateParams, debateServ, $window, fbUser, $state){
  var debateid = $stateParams.debateid
  var argumentState = 'pro'
  $scope.debateData = {}

  debateServ.getDebate(debateid).then(function (debateSnap) {
    $scope.debateData = debateSnap.val();
    fbUser.viewReset()
  })

  $scope.pressBack = function () {
    $state.go('tab.home')
  }

  $scope.autoExpand = function(e) {
     var element = typeof e === 'object' ? e.target : document.getElementById(e);
     var scrollHeight = element.scrollHeight -40; // replace 60 by the sum of padding-top and padding-bottom
     element.style.height =  scrollHeight + "px";
  };

  $scope.switchArgState = function (argState) {
    if (argState === argumentState) return;
    argumentState = argState

    if (argState === 'pro') {
      angular.element( document.querySelector( '#proBut' ) ).removeClass("button-outline")
      angular.element( document.querySelector( '#conBut' ) ).addClass("button-outline")
    } else {
      angular.element( document.querySelector( '#conBut' ) ).removeClass("button-outline")
      angular.element( document.querySelector( '#proBut' ) ).addClass("button-outline")
    }
  }

  $scope.createArgument = function() {
    var argText = angular.element(document.querySelector('#argTextbox')).value

    var argumentData = {
      //text: argText,
      //debateID: debateid,
      side: argumentState
    }

   debateServ.createArgument(argumentData, fbUser.getUid());

   angular.element(document.querySelector('#argTextbox')).value = ""

 }

  // === VIEW EVENTS ===
  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = true;
  });
});
