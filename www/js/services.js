angular.module('debatable.services', ['ionic','firebase'])
.factory('fbUser', function($firebaseAuth, $window, $rootScope, debateServ) {
  var firebaseUser; // Firebase obj containing user firebase details (from facebook)
  var uid;          // Unique ID for user (Currently unique for the facebook provider)
  var userDB;       // A database reference for the current user object
  var userData;     // Latest snapshot of the user's data stored in the database
  var id;

  // Initilises local private variables of the service
  setupFirebaseUser = function (user) {
    firebaseUser = user;
    uid = user.uid;
    id = user.uid;

      var bar
      for (bar in user.uid)
      {
          console.log("user has property " + bar);
      }

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

    // Returns users uid
    getUid : function () {
      return uid
    },

      getId : function () {
          return id
      },

    updateUserHandle : function(newHandle){

       firebase.database().ref('users/'+uid).update({"handle" : newHandle})
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
          initialUserObject['handle'] = firebaseUser.displayName
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
      debateDetails['proArguments'] = {};
      debateDetails['conArguments'] = {};
      debateDetails['preVoters'] = {};
      debateDetails['postVoters'] = {};

      debateDetails['preConVotes'] = 0;
      debateDetails['preProVotes'] = 0;
      debateDetails['preUndecidedVotes'] = 0;
      debateDetails['postProVotes'] = 0;
      debateDetails['postConVotes'] = 0;
      debateDetails['postUndecidedVotes'] = 0;

      var newDebateID = debateServ.createDebate(debateDetails);

      var update = {};
      update[newDebateID] = true;
      firebase.database().ref('users/'+uid+'/debates').update(update);

      return newDebateID;
    },

    checkSubscription : function(debateID){

     return firebase.database().ref('users/'+uid+'/subscribedDebates/'+debateID)
      .once('value').then ( function (snapOfBool) {
          if (!snapOfBool.val()){
            var updates = {}
            updates[debateID]=true
            firebase.database().ref('users/'+uid+'/subscribedDebates').update(updates);
            return "Unsubscribe"
          }else{
            var updates = {}
            updates[debateID]=false
            firebase.database().ref('users/'+uid+'/subscribedDebates').update(updates);
            return "Subscribe"
          }
      })
    },

    getPreferences : function () {
      return firebase.database().ref('users/'+uid+'/preferences').once('value')
    },

    updatePreferences : function(preferenceList){
      var updates = {}
      updates['preferences'] = preferenceList
      firebase.database().ref('users/'+uid).update(updates)
    },

    // Destroys the myDebates array and replaces it with a new up to date
    // version. (All async done within function)
    updateMyDebates : function () {
      var promises = [];

      for (var debateid in userData.debates) {
        if (userData.debates.hasOwnProperty(debateid)) {
          promises.push(firebase.database().ref('debates/'+debateid).once('value'));
        }
      };

      return Promise.all(promises).then(function (values) {
        return values.map(function (snap) {return snap.val()}).sort(function (a, b) {
          return b.creationDate - a.creationDate
        })
      })

    },

    updateSubscribedDebates : function () {
      var promises = [];

      for (var debateid in userData.subscribedDebates) {
        if (userData.subscribedDebates.hasOwnProperty(debateid) && userData.subscribedDebates[debateid]) {
          promises.push(firebase.database().ref('debates/'+debateid).once('value'));
        }
      };

      return Promise.all(promises).then(function (values) {
        return values.map(function (snap) {return snap.val()}).sort(function (a, b) {
          return b.creationDate - a.creationDate
        })
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

    viewReset : function () {
      if($rootScope.$root.$$phase != '$apply' && $rootScope.$root.$$phase != '$digest'){
        $rootScope.$apply(function() {
        self.tags = true;
        });
      } else {
        self.tags = true;
      }
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

.factory('debateServ', function($window) {
  var debateDB = firebase.database().ref('debates')
  var topicFilter = ""
  var allTopics = ["General","Gaming","Sports","Politics","Tech","TV","Anime"
                  ,"Religion","Education","History","Literature","Science","Random"]

  // == Sortiing functions ==
  var mostRecentSort = function (a, b) {
    return b.creationDate - a.creationDate
  }

  var popularSort = function (a, b) {
    return (b.proArguments + b.conArguments) - (a.proArguments + a.conArguments)
  }

  // == Filter functions ==
  var byTopicFilter = function (debate) {
    return (topicFilter === "" ? true : debate.topic === topicFilter)
  }

  var preferenceFilter = function (debate) {
    if (fbUser.getUser().preferences === undefined) {
      return false
    }

    return fbUser.getUser().preferences[debate.topic]
  }

  var sortFunc = mostRecentSort
  var filterFunc = byTopicFilter

  return {
    /* Adds a new debates to the universal list of debates. Returns the new debate id
       of the debate */
    createDebate : function(debateDetails) {
      var debateid = firebase.database().ref('debates').push(debateDetails).key
      var updates = {}
      updates['debateID'] = debateid
      firebase.database().ref('debates/'+debateid).update(updates)

      return debateid;
    },

    /* Returns a promise for the update of the allDebates variable */
    updateAllDebates : function () {
      return debateDB.once('value').then(function(debateSnap) {
        var allDebates = []

        for (var debateid in debateSnap.val()) {
          if (debateSnap.val().hasOwnProperty(debateid)) {
            allDebates.push(debateSnap.val()[debateid])
          }
        };

        return allDebates.filter(filterFunc).sort(sortFunc)
      });
    },

    /* Returns a list of all posible topics */
    getAllTopics : function () {
      return allTopics
    },

    /* After calling this function, the return of updateAllDebates will be filtered
      by the desired topic */
    addTopicFilter : function (topic) {
      filterFunc = byTopicFilter
      topicFilter = topic
    },

    /* After calling this function, the return of updateAllDebate will be filtered by
       the users topic preferences */
    addPreferenceFilter : function () {
      filterFunc = preferenceFilter
    },

    /* Removes all filters from the return of updateAllDebates */
    removeFilter : function () {
      filterFunc = byTopicFilter
      topicFilter = ""
    },

    /* After calling this function, the return of updateAllDebates will be sorted
       by most recent debate */
    addMostRecentSort : function () {
      sortFunc = mostRecentSort
    },

    /* After calling this function, the return of updateAllDebates will be sorted
       by most recent debate */
    addPopularSort : function () {
      sortFunc = popularSort
    },

    /* Returns a special object that manages a list of arguments */
    makeArgumentManager : function (debateID) {
      return function (debateID) {
        var debateid = debateID
        var proArgDB = firebase.database().ref('debates/'+debateid+'/proArguments')
        var conArgDB = firebase.database().ref('debates/'+debateid+'/conArguments')

        return {

          updateArguments: function () {
            arguments = []

            return new Promise(function (resolve) {
              var proObj = {}
              var conObj = {}
              var promises = []

              var prepareList = function () {
                for (var argumentid in proObj) {
                  if (proObj.hasOwnProperty(argumentid)) {
                    promises.push(firebase.database().ref('arguments/'+argumentid).once('value'));
                  }
                };

                for (var argumentid in conObj) {
                  if (conObj.hasOwnProperty(argumentid)) {
                    promises.push(firebase.database().ref('arguments/'+argumentid).once('value'));
                  }
                };

                Promise.all(promises).then(function (values) {
                  var arguments = values.map(function (snap) {return snap.val()}).sort(function (a, b) {
                    return b.creationDate - a.creationDate
                  })
                  resolve(arguments)
                })
              }

              proArgDB.once('value').then(function (snap) {
                proObj = (snap.val() === null ? {} : snap.val())

                conArgDB.once('value').then(function (snap) {
                  conObj = (snap.val() === null ? {} : snap.val())

                  prepareList();
                })
              })

            })

          }
        }

      } (debateID)
    },

    /* Returns a promise for a list of counter arguments for a specified argument */
    updateCounterArguments : function (argumentID) {
      return firebase.database().ref('arguments/'+argumentID+"/counterArguments")
      .once('value').then(function (argumentSnap) {
        var counterArguments = []

        for (var argumentid in argumentSnap.val()) {
          if (argumentSnap.val().hasOwnProperty(argumentid)) {
            counterArguments.push(argumentSnap.val()[argumentid])
          }
        };

        return counterArguments
      })
    },

    /* Adds a new argument to the debate with the specified debateid */
    createArgument : function (argumentData, uid) {
      argumentData['creator'] = uid
      argumentData['creationDate'] = Date.now()
      argumentData['upvotes'] = 0

      var argumentid = firebase.database().ref('arguments').push(argumentData).key
      firebase.database().ref('arguments/'+argumentid).update({argumentID : argumentid})

      var updates = {}
      updates[argumentid] = true
      firebase.database().ref('debates/'+argumentData.debateID+'/'+argumentData.side+'Arguments').update(updates);

      return argumentid
    },

    /* Creates a new counter argument for an original argument */
    createCounterArgument : function (argumentData, uid) {
      argumentData['creator'] = uid
      argumentData['creationDate'] = Date.now()
      argumentData['upvotes'] = 0
      argumentData['side'] = "undecided"

      var counterArgumentid = firebase.database()
      .ref('arguments/'+argumentData.origArgumentID+'/counterArguments').push(argumentData).key
      firebase.database().ref('arguments/'+argumentData.origArgumentID+'/counterArguments/'+counterArgumentid)
      .update({argumentID : counterArgumentid})

      return counterArgumentid
    },

    /* Returns promise for the debate information of debateid */
    getDebate : function(debateid) {
      return firebase.database().ref('debates/' + debateid).once('value');
    }
  }
});
