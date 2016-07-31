angular.module('debatable.directives', ['ionic','firebase'])

.directive('debateCard', function($window, $state) {
  return {
    restrict: 'E',
    scope: {
      debateInfo: '='
    },
    templateUrl: 'js/directives/debateCard.html',
    link: function(scope, elem, attrs) {
      scope.stage = scope.debateInfo.endDate - Date.now()  > 0 ? "debate" :
                   (scope.debateInfo.endDate + 24*3600*1000 - Date.now()  > 0
                   ? "post-debate" : "closed")

      scope.endDate = new Date(scope.debateInfo.endDate)
      scope.endDateText = scope.endDate.toLocaleDateString();

      scope.stageHuman = function () {
        if ((scope.debateInfo.endDate - Date.now()) > 0) {
          return "Debating";
        } else if ((scope.debateInfo.endDate + 24*3600*1000 - Date.now()) > 0) {
          return "Seeking verdict";
        } else {
          return "Finished";
        }
      };

      scope.stageColour = function () {
        if ((scope.debateInfo.endDate - Date.now()) > 0) {
          return "#92F22A";
        } else if ((scope.debateInfo.endDate + 24*3600*1000 - Date.now()) > 0) {
          return "#FFC153";
        } else {
          return "#EE543A";
        }
      };

      elem.bind("click", function (e) {
        $state.go('vote', {debateid : scope.debateInfo.debateID})
      })
    }
  }
})

.directive('argumentCard', function($window, $state, $compile, fbUser) {
  return {
    restrict: 'E',
    scope: {
      argInfo: '=',
      truncate: '='
    },
    templateUrl: 'js/directives/argumentCard.html',
    link: function(scope, elem, attrs) {
      scope.argText = ""
      scope.cardClass = (scope.argInfo.side === "pro" ? "proArgcard" :
                         (scope.argInfo.side === "con" ? "conArgcard" : "unArgcard"));
      var date = new Date(scope.argInfo.creationDate)
      scope.dateText = date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes() + "  " + date.toLocaleDateString()
      scope.name = ""

      //If we want the text truncated and its long enough to be
      if(scope.truncate === true && scope.argInfo.text.length >= 200 ){
        //truncate the text
        scope.argText = scope.argInfo.text.substring(0,197) + "..."
      }else{
        //original text remians
        scope.argText = scope.argInfo.text;
      }


      scope.upVoteArgument = function () {
        var location = 'arguments/'+
        (scope.argInfo.side === "undecided" ? scope.argInfo.origArgumentID+"/counterArguments/" : "")+
        scope.argInfo.argumentID+'/upvoters/'+fbUser.getUid()

        firebase.database().ref(location).once('value').then(function (upvotedBeforeSnap) {
          var upvotedBefore = upvotedBeforeSnap.val()

          if (upvotedBefore === undefined) {
            upvotedBefore = false;
          }

          var updates = {}

          if (upvotedBefore) {
            fbUser.addExp(scope.argInfo.creator, -5);
            scope.argInfo.upvotes--
            updates[fbUser.getUid()] = false
            angular.element( document.querySelector( '#upArrow'+scope.argInfo.argumentID ) ).removeClass("balanced")

          } else {
            fbUser.addExp(scope.argInfo.creator, 5);
            scope.argInfo.upvotes++
            updates[fbUser.getUid()] = true
            angular.element( document.querySelector( '#upArrow'+scope.argInfo.argumentID ) ).addClass("balanced")

          }

          firebase.database().ref('arguments/'+
          (scope.argInfo.side === "undecided" ? scope.argInfo.origArgumentID+"/counterArguments/" : "")+
          scope.argInfo.argumentID).update(
            {upvotes : scope.argInfo.upvotes}
          )
          firebase.database().ref('arguments/'+
          (scope.argInfo.side === "undecided" ? scope.argInfo.origArgumentID+"/counterArguments/" : "")+
          scope.argInfo.argumentID+'/upvoters').update(updates)
          fbUser.viewReset()
        })
      }

      scope.goArgumentView = function () {
        if (scope.argInfo.side === 'undecided') {
          return
        }
        $state.go('mainArgument', {argInfo : scope.argInfo})
      }

      var location = (scope.argInfo.side !== 'undecided' ?
                      'arguments/'+scope.argInfo.argumentID+'/upvoters/'+fbUser.getUid():
                      'arguments/'+scope.argInfo.origArgumentID+'/counterArguments/'+scope.argInfo.argumentID+'/upvoters/'+fbUser.getUid())
      firebase.database().ref(location).once('value')
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
