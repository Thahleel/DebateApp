angular.module('services', ['ionic','firebase'])
.factory('fbUser', function($firebaseAuth, $window) {
  var firebaseUser; // Firebase obj containing user details
  var uid;          // Unique ID for user (Currently unique for the facebook provider)
  var userDB;       // A database reference for the current user object
  var userData;     // Latest snapshot of the user's data stored in the database

  // Sets firebaseUser with user parameter
  setFirebaseUser = function (user) {
    firebaseUser = user;
    uid = user.uid;
    userDB = firebase.database().ref('users/' + uid);
    userData = {};
  }

  var initialUserObject = {
    debateRank : 1
  }

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

    getUserData : function () {
      return userData;
    },

    // Used to initialise any data the user needs when signing in
    initalUserSetup : function (user) {
      if (!user) {
        $window.alert("Error: user parameter is null");
        return;
      }

      setFirebaseUser(user);

      var dbRetrievePromise = userDB.once('value').then(function(userDataSnap) {
        // If there is no data stored for the user, this is there first time
        // using the app. Default data will be initialised for them.
        if (!userDataSnap.val()) {
          $window.alert("Welcome to our app!"); // Alerts when you initialise user for the first time only

          userDB.set(initialUserObject);
        }

        userData = userDataSnap.val();
      });

      return dbRetrievePromise;
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

.factory('debateService', function(){

});
