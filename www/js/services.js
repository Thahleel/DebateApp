angular.module('services', ['ionic','firebase'])
.factory('fbUser', function($firebaseAuth, $window) {
  var firebaseUser;

  return {
    setFirebaseUser : function (user) {
      firebaseUser = user;
    },

    getFirebaseUser : function () {
      if (firebaseUser) {
        return firebaseUser;
      } else {
        $window.alert("Error: firebase user is undefined");
        return null;
      }
    }
  }
});
