app.directive('backImg', function(){
    return function(scope, element, attrs){
        var url = attrs.backImg;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover'
        });
    };
})

.directive('debateCard', function($window) {
  return {
    restrict: 'E',
    scope: {
      debateInfo: '='
    },
    templateUrl: 'js/directives/debateCard.html',
    link: function(scope, elem, attrs) {
      scope.stage = Date.now() - scope.debateInfo.creationDate - scope.debateInfo.duration > 0
                    ? "debate" : "post-debate"

      elem.bind("click", function (e) {
        $window.alert("CLICK")
      })
    }
  }
});
