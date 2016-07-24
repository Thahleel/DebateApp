app.directive('backImg', function(){
    return function(scope, element, attrs){
        var url = attrs.backImg;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover'
        });
    };
})

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

.directive('argumentCard', function($window, $state, $compile) {
  return {
    restrict: 'E',
    scope: {
      argInfo: '='
    },
    templateUrl: 'js/directives/argumentCard.html',
    link: function(scope, elem, attrs) {
      scope.cardClass = (scope.argInfo.side === "pro" ? "proArgcard" : "conArgcard");
      var date = new Date(scope.argInfo.creationDate)
      scope.dateText = date.toDateString()
    }
  }
});
