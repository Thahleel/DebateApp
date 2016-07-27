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
      scope.cardClass = (scope.argInfo.side === "pro" ? "proArgcard" :
                         (scope.argInfo.side === "con" ? "conArgcard" : "unArgcard"));
      var date = new Date(scope.argInfo.creationDate)
      scope.dateText = date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes() + " | " + date.toLocaleDateString()
      scope.name = ""

      scope.upVoteArgument = function () {
        var location = 'arguments/'+scope.argInfo.argumentID+'/upvoters/'+fbUser.getUid()
        firebase.database().ref(location).once('value').then(function (upvotedBeforeSnap) {
          var upvotedBefore = upvotedBeforeSnap.val()

          if (upvotedBefore === undefined) {
            upvotedBefore = false;
          }

          var updates = {}

          if (upvotedBefore) {
            scope.argInfo.upvotes--
            updates[fbUser.getUid()] = false
            angular.element( document.querySelector( '#upArrow'+scope.argInfo.argumentID ) ).removeClass("balanced")

          } else {
            scope.argInfo.upvotes++
            updates[fbUser.getUid()] = true
            angular.element( document.querySelector( '#upArrow'+scope.argInfo.argumentID ) ).addClass("balanced")

          }

          firebase.database().ref('arguments/'+scope.argInfo.argumentID).update(
            {upvotes : scope.argInfo.upvotes}
          )
          firebase.database().ref('arguments/'+scope.argInfo.argumentID+'/upvoters').update(updates)
          fbUser.viewReset()
        })
      }

      scope.goArgumentView = function () {
        $state.go('mainArgument', {argInfo : scope.argInfo})
      }

      firebase.database().ref('arguments/'+scope.argInfo.argumentID+'/upvoters/'+fbUser.getUid()).once('value')
      .then(function (upvotedBeforeSnap) {
        if (upvotedBeforeSnap.val()) {
          angular.element( document.querySelector( '#upArrow'+scope.argInfo.argumentID ) ).addClass("balanced")
          fbUser.viewReset()
        }
      })

      firebase.database().ref('users/'+scope.argInfo.creator+'/handle').once('value')
      .then(function (nameSnap) {
        scope.name = nameSnap.val()
        fbUser.viewReset()
      })
    }
  }
});
