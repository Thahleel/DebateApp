angular.module('directives', ['ionic','firebase'])

.directive('debateCard', function($window, $state) {
  return {
    restrict: 'E',
    scope: {
      debateInfo: '='
    },
    templateUrl: 'js/directives/debateCard.html',
    link: function(scope, elem, attrs) {
      scope.stage = Date.now() - scope.debateInfo.endDate > 0
                    ? "debate" : "post-debate"

      elem.bind("click", function (e) {
        $state.go('mainDebate', {debateid : scope.debateInfo.debateID})
      })
    }
  }
})

.directive('argumentCard', function($window, $state, $compile, fbUser) {
  return {
    restrict: 'E',
    scope: {
      argInfo: '='
    },
    templateUrl: 'js/directives/argumentCard.html',
    link: function(scope, elem, attrs) {
      scope.cardClass = (scope.argInfo.side === "pro" ? "proArgcard" : "conArgcard");
      var date = new Date(scope.argInfo.creationDate)
      scope.dateText = date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes() + " | " + date.toLocaleDateString()
      scope.name = fbUser.getFirebaseUser().displayName

      scope.upVoteArgument = function () {
        var location = 'arguments/'+scope.argInfo.argumentID+'/upvoters/'+fbUser.getUid()
        firebase.database().ref(location).once('value').then(function (upvotedBeforeSnap) {
          var upvotedBefore = upvotedBeforeSnap.val()

          if (upvotedBefore === undefined) {
            upvotedBefore = false;
          }

          if (upvotedBefore) {
            scope.argInfo.upvotes--
            firebase.database().ref('arguments/'+scope.argInfo.argumentID+'/upvotes').update(scope.argInfo.upvotes)

            var updates = {}
            updates[fbUser.getUid()] = false
            firebase.database().ref('arguments/'+scope.argInfo.argumentID+'/upvoters').update(updates)
            angular.element( document.querySelector( '#upArrow' ) ).removeClass("balanced")
          } else {
            scope.argInfo.upvotes++
            firebase.database().ref('arguments/'+scope.argInfo.argumentID+'/upvotes').update(scope.argInfo.upvotes)

            var updates = {}
            updates[fbUser.getUid()] = true
            firebase.database().ref('arguments/'+scope.argInfo.argumentID+'/upvoters').update(updates)
            angular.element( document.querySelector( '#upArrow' ) ).addClass("balanced")
          }
        })
      }

      firebase.database().ref('arguments/'+scope.argInfo.argumentID+'/upvoters/'+fbUser.getUid()).then(function (upvotedBeforeSnap) {
        if (upvotedBeforeSnap.val()) {
          angular.element( document.querySelector( '#upArrow' ) ).addClass("balanced")
        }
      })
    }
  }
});
