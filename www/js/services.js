angular.module('services', ['ionic','firebase'])
.factory('fbUser', function($firebaseAuth, $window, $rootScope, debateServ) {
  var firebaseUser; // Firebase obj containing user firebase details (from facebook)
  var uid;          // Unique ID for user (Currently unique for the facebook provider)
  var userDB;       // A database reference for the current user object
  var userData;     // Latest snapshot of the user's data stored in the database
  var myDebates;    // List of all the users debate information

  // Initilises local private variables of the service
  setupFirebaseUser = function (user) {
    firebaseUser = user;
    uid = user.uid;
    userDB = firebase.database().ref('users/' + uid);
    userData = {};
    myDebates = [];
  }

  // The default object of any new user to the debatable app
  var initialUserObject = {
    debateRank : 1,
    handle : "",
    debates : [],
    recentDebates: {},
    subscribedDebates: {},
    preferences: {}
  }

  /* -- WATCH FUNCTIONS --
   Used to keep a watch on any changes to the database and ensures all service
   variables are up to date */
  var startWatchers = function () {
    userDB.on('value', function(snapshot) {
      angular.copy(snapshot.val(), userData);

      if($rootScope.$root.$$phase != '$apply' && $rootScope.$root.$$phase != '$digest'){
        $rootScope.$apply(function() {
        self.tags = true;
        });
      } else {
        self.tags = true;
      }

    firebase.database().ref('debates')
  })

  }

  /* Returns an object of service access methods
     The service MUST be initialised with initalUserSetup as the service will only
     work with one user at any one time.
     When the user is no longer signed in the service MUST be shut down with
     serviceShutDown to turn off all listeners to the logging out user's profile
     and to reset the service for possible future us */
  return {
    // Returns current firebase user if one is signed in
    getFirebaseUser : function () {
      if (firebaseUser) {
        return firebaseUser;
      } else {
        $window.alert("Error: firebase user is undefined");
        return null;
      }
    },

    // Returns lastest snapshot of userData
    getUserData : function () {
      return userData;
    },

    // Used to initialise any data the user needs when signing in
    initalUserSetup : function (user) {
      if (!user) {
        $window.alert("Error: user parameter is null");
        return;
      }

      setupFirebaseUser(user);

      var dbRetrievePromise = userDB.once('value').then(function(userDataSnap) {
        /* If there is no data stored for the user, this is their first time
           using the app. Default data will be initialised for them. */
        if (!userDataSnap.val()) {
          // Alerts when you initialise user for the first time only
          $window.alert("Welcome to our app!");
          userDB.set(initialUserObject);
          userData = initialUserObject;
          return;
        }

        userData = userDataSnap.val();
      });

      // Start listening for changes to the user database record and save changes
      startWatchers();

      /* The call to the firebase database is run asynchronously hence the
         function caller may not get the data they want in time. Hence this
         function returns a promise that the caller can wait on so they can
         be certain the data is in the correct place. */
      return dbRetrievePromise;
    },

    /* Updates the database with new data passed in through the parameter
    updateData : object contain fields to update and their value
    Example: updateData = {field: "debateRank", value: 20}, {field: "handle", value: "nman"} */
    updateUserData : function(updates) {
      userDB.update(updates);
    },

     /* Creates a debate with the details given in the parameter. The debate is added
        To the users list of debates as well as the overall list of debates*/
    createDebate : function(debateDetails) {
      debateDetails['creator'] = uid;
      debateDetails['creationDate'] = Date.now();

      var newDebateID = debateServ.createDebate(debateDetails);

      var update = {};
      update[newDebateID] = true;
      firebase.database().ref('users/'+uid+'/debates').update(update);

      return newDebateID;
    },

    // Returns a list of debates the current user created
    getMyDebates : function () {
      return myDebates;
    },

    // Destroys the myDebates array and replaces it with a new up to date
    // version. (All async done within function)
    updateMyDebates : function () {
      myDebates = []
      var promises = [];

      for (var debateid in userData.debates) {
        if (userData.debates.hasOwnProperty(debateid)) {
          promises.push(firebase.database().ref('debates/'+debateid).once('value'));
        }
      };

      Promise.all(promises).then(function (values) {
        myDebates = values.map(function (snap) {return snap.val()})
      })

    },

    // Used to shut down the service but turning off all database listeners
    // (used when signing out)
    serviceShutDown : function () {
      userDB.off();
      firebaseUser = null;
      uid = -1;
      userDB = null;
      userData = {};
    },

    // For debugging purposes: creates alerts of user information
    alertUserInfo : function() {
      if (firebaseUser) {
        firebaseUser.providerData.forEach(function (profile) {
          $window.alert(" AuthID: "+uid);
          $window.alert("Sign-in provider: "+profile.providerId);
          $window.alert("  Provider-specific UID: "+profile.uid);
          $window.alert("  Name: "+profile.displayName);
          $window.alert("  Email: "+profile.email);
          $window.alert("  Photo URL: "+profile.photoURL);
        });
      } else {
        $window.alert("Firebase user is null")
      }
    }

  }
})

.factory('debateServ', function($window){
  var debateDB = firebase.database().ref('debates')
  var allDebates = []

  return {
    /* Adds a new debates to the universal list of debates. Returns the new debate id
       of the debate */
    createDebate : function(debateDetails) {
      return firebase.database().ref('debates').push(debateDetails).key
    },

    /* Returns a promise for the update of the allDebates variable */
    updateAllDebates : function () {
      return debateDB.once('value').then(function(debateSnap) {
        allDebates = debateSnap.val();
      });
    },

    /* Returns a list of all debates */
    getAllDebates : function() {
      return allDebates;
    },

    /* Returns promise for the debate information of debateid */
    getDebate : function(debateid) {
      return firebase.database().ref('debates/' + debateid).once('value');
    }
  }
});
