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
          prepareApp(firebaseUser, $ionicHistory);

        }).catch(function(error) {
          console.log("Authentication failed:", error);
        });
      });
    }

    // prepares app after the login process succeeds
    var prepareApp = function(firebaseUser, $ionicHistory) {
      /*Initilises service with the firebaseUser object of the logged in user.
        The call attempts to retrieve data from the database. This is performed asynchronously hence
        at this moment in time the data may not be in the correct place yet. So the function returns a promise
        which tells us when the data has correctly been stored in the service.*/
      var promise = fbUser.initalUserSetup(firebaseUser);

      /* Instead of rushing off to the home view, we use the promise to wait until the data retrieval from the
         database was successful. If so, we run a function that sends us to the home view */
      promise.then(function () {
        $ionicHistory.nextViewOptions({
          disableBack: false
        });

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

.controller('HomeCtrl', function($scope, fbUser, $window, debateServ, $state, $ionicModal, $ionicPopover, $sce, debateServ) {
  $scope.name = fbUser.getFirebaseUser().displayName;
  $scope.userData = fbUser.getUserData();
  $scope.allDebates = [];
  $scope.state = $state;

  $scope.filter = {choice: "All"}

  $scope.$watch('filter.choice', function(){
    if($scope.filter.choice === "All"){
      debateServ.removeFilter();
      $scope.refreshDebates();
    }else{
      debateServ.addTopicFilter($scope.filter.choice);
      $scope.refreshDebates();
    }
  })


  $ionicPopover.fromTemplateUrl('templates/filters.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.filterPopover = modal;
  });


  $scope.refreshDebates = function () {
    var promise = debateServ.updateAllDebates();

    promise.then(function (allDebates) {
      $scope.allDebates = allDebates
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

  $scope.hideModal = function () {
    $scope.topic = {choice: ""};
    document.getElementById("premise").value = "";
    document.getElementById("enddate").value = "";
    document.getElementById("endtime").value = "";

    $scope.modal.hide();
  }

  $scope.openFilterPopover = function($event) {
    $scope.filterPopover.show($event);
  };

  // === VIEW EVENTS ===
  $scope.$on('$ionicView.enter', function(){
    $scope.refreshDebates();
    debateServ.addMostRecentSort();
  });

  $ionicModal.fromTemplateUrl('templates/modal.html', {
   scope: $scope
 }).then(function(modal) {
   $scope.modal = modal;
 });

 // The debate topic will default to general. This will is changed when a user
 // Selects a topic from the drowndown list.
 $scope.topic = {choice: ""}
 $scope.allTopics = debateServ.getAllTopics()

 $ionicPopover.fromTemplateUrl('templates/topics.html', {
   scope: $scope,
   animation: 'slide-in-up'
 }).then(function(modal) {
   $scope.popover = modal;
 });

 $scope.create = function (debateTitle,debateEndDate,debateEndTime) {
  var debateIDArg = fbUser.createDebate({
    topic: $scope.topic.choice,
    premise: debateTitle,
    endDate: debateEndDate.getTime() + debateEndTime.getTime()
  })

  //$scope.topic = ""; This doesn't work, if you do this, it will only let you add 1 debate per session
  this.debateTitle = null;
  this.debateEndTime = null;
  this.debateEndDate = null;

  $scope.modal.hide();
  $scope.topic = {choice: ""};
  document.getElementById("premise").value = "";
  document.getElementById("enddate").value = "";
  document.getElementById("endtime").value = "";

  $state.go('vote', {debateid : debateIDArg})
 }

 $scope.applySort = function (type) {
   if (type === "recent") {
     debateServ.addMostRecentSort()
   } else if (type === "popular") {
     debateServ.addPopularSort()
   } else if (type === "Preference") {

   }

   $scope.refreshDebates()
 }

 $scope.openPopover = function($event) {
   $scope.popover.show($event);
 };
 $scope.closePopover = function() {
   $scope.popover.hide();
 };

 // Execute action on hide popover
 $scope.$on('popover.hidden', function() {

   // Execute action
 });
})

.controller('PersonalCtrl', function($scope, fbUser) {
  $scope.startedDebatesList = []
  $scope.subscribedDebatesList = []

  // === VIEW EVENTS ===
  $scope.$on('$ionicView.enter', function(){
    fbUser.updateMyDebates().then(function (debates) {
      $scope.startedDebatesList = debates
      fbUser.viewReset()
    })

    fbUser.updateSubscribedDebates().then(function (subbedDebates) {
      $scope.subscribedDebatesList = subbedDebates
      fbUser.viewReset()
    });
  });

})

.controller('NotifCtrl', function($scope) {

})

.controller('SettingsCtrl', function($scope, $state, $window, $ionicActionSheet, fbUser, $ionicModal) {
  $scope.openMyInfoPage = function () {
    $state.go('tab.userinfo')
  }

  $scope.hideModal = function () {
    document.getElementById("handle").value = "";

    $scope.modal.hide();
  }

  $ionicModal.fromTemplateUrl('templates/modal.html', {
   scope: $scope
  }).then(function(modal) {
   $scope.modal = modal;
  });


  $scope.saveHandle = function ($handle) {
    var handleChoice = fbUser.setHandle({
      handle: $handle
    })
  }

  $scope.showActionsheet = function() {
    $ionicActionSheet.show({
      titleText: 'Sign out of Debatable?',
      destructiveText: 'Sign Out',
      cancelText: 'Cancel',
      cancel: function() {

      },
      buttonClicked: function(index) {
        return true;
      },
      destructiveButtonClicked: function() {
        firebase.auth().signOut().then(function() {
          fbUser.serviceShutDown();
          $state.go('intro');
        }, function(error) {
          $window.alert("Error: could not sign out");
        });
      }
    });
  };
})

.controller('UserInfoCtrl', function($scope, fbUser) {
  $scope.name = fbUser.getFirebaseUser().displayName;
  $scope.photoURL = fbUser.getFirebaseUser().photoURL;
  $scope.debateRank = fbUser.getUserData().debateRank;
  //$scope.debateCount = fbUser.getDebateCount();
})

.controller('CreateDebateCtrl', function($scope, $state, fbUser, $ionicPopover, $sce, debateServ) {


})

.controller('MainDebateCtrl', function($scope, $stateParams, debateServ, $window, fbUser, $state){
  var debateid = $stateParams.debateData.debateID
  var argumentState = 'pro'
  $scope.modelData = {}
  $scope.debateData = $stateParams.debateData
  var argManager = debateServ.makeArgumentManager(debateid);
  $scope.getArguments = []//argManager.getArguments
  $scope.subVal = (fbUser.getUserData().subscribedDebates[debateid] ? "Unsubscribe" : "Subscribe")



  $scope.pressBack = function () {
    $state.go('vote', {debateid : debateid})
  }

  $scope.subscribe = function (debateID) {
     fbUser.checkSubscription(debateID).then(function(result){
       $scope.subVal = result;
       fbUser.viewReset()
     });
  }

  $scope.refreshArguments = function () {
    var promise = argManager.updateArguments();

    promise.then(function (arguments) {
      $scope.getArguments = arguments
      $scope.$broadcast('scroll.refreshComplete');
      fbUser.viewReset()
   });
  }

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
    var argumentData = {
      text: $scope.modelData.argText,
      debateID: debateid,
      side: argumentState,
      upvoters: {}
    }

   debateServ.createArgument(argumentData, fbUser.getUid());

   $scope.modelData.argText = ""
   $scope.refreshArguments()

 }



  // === VIEW EVENTS ===
  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = true;
    $scope.refreshArguments();
  });
})

.controller('MainArgumentCtrl', function($scope, $stateParams, debateServ, $window, fbUser, $state){
  $scope.argInfo = $stateParams.argInfo
  $scope.modelData = {}
  $scope.getCounterArguments = []

  $scope.createCounterArgument = function() {
    var argumentData = {
      text: $scope.modelData.argText,
      origArgumentID: $scope.argInfo.argumentID,
      upvoters: {}
    }

    debateServ.createCounterArgument(argumentData, fbUser.getUid());

    $scope.modelData.argText = ""
    $scope.refreshCounterArguments()

  }

  $scope.refreshCounterArguments = function () {
    var promise = debateServ.updateCounterArguments($scope.argInfo.argumentID);

    promise.then(function (arguments) {
      $scope.getCounterArguments = arguments
      $scope.$broadcast('scroll.refreshComplete');
      fbUser.viewReset()
   });
  }

  $scope.pressBack = function () {
    firebase.database().ref('debates/'+$scope.argInfo.debateID).once('value')
    .then(function (debateSnap) {
      $state.go('mainDebate', {debateData : debateSnap.val()})
    })
  }

  // === VIEW EVENTS ===
  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = true;
    $scope.refreshCounterArguments();
  });
})

.controller('VoteCtrl', function($scope, $stateParams, debateServ, $window, fbUser, $state){
  var debateid = $stateParams.debateid
  $scope.debateData = {}
  $scope.name = ""
  $scope.dateText = ""
  $scope.endDateText = ""
  $scope.stage = ""
  $scope.isVoter = false;


  // == Data base variable retrievals ==
  debateServ.getDebate(debateid).then(function (debateSnap) {
    $scope.debateData = debateSnap.val();

    firebase.database().ref('debates/'+debateid+'/preVoters/'+fbUser.getUid()).once('value')
    .then(function (voterSnap) {
      $scope.isVoter = (voterSnap.val() == null ? false : true)
    })

    firebase.database().ref('users/'+$scope.debateData.creator+'/handle').once('value')
    .then(function (nameSnap) {
      $scope.name = nameSnap.val()
      fbUser.viewReset()
    })

    var date = new Date($scope.debateData.creationDate)
    $scope.dateText = date.toLocaleDateString()
    date = new Date($scope.debateData.endDate)
    $scope.endDateText = date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") +
                         date.getMinutes() + " | " + date.toLocaleDateString()
    $scope.stage = $scope.debateData.endDate - Date.now()  > 0 ? "debate" :
                ($scope.debateData.endDate + 24*3600*1000 - Date.now()  > 0
                ? "post-debate" : "closed")
  })

  $scope.pressBack = function () {
    $state.go('tab.home');
  }

  $scope.goMainDebate = function () {
    $state.go('mainDebate', {debateData : $scope.debateData})
  }

  // === VIEW EVENTS ===
  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = true;
    $scope.refreshArguments();
  });
})
;
