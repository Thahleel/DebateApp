angular.module('services', ['ionic','firebase'])
.factory('fbUser', function($firebaseAuth, $window) {
  var firebaseUser;

  //firebase.database().ref('testObj').set({
  //  num: 0;
  //});

  return {
    // Sets firebaseUser with user parameter
    setFirebaseUser : function (user) {
      firebaseUser = user;
    },

    // Returns current firebase user if one is signed in
    getFirebaseUser : function () {
      if (firebaseUser) {
        return firebaseUser;
      } else {
        $window.alert("Error: firebase user is undefined");
        return null;
      }
    },

    // For debugging purposes: creates alerts of user information
    alertUserInfo : function() {
      if (firebaseUser) {
        firebaseUser.providerData.forEach(function (profile) {
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
