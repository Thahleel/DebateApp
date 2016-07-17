app.directive('backImg', function(){
    return function(scope, element, attrs){
        var url = attrs.backImg;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover'
        });
    };
})

.directive('debateCard', function() {
  return {
    restrict: 'E',
    scope: {
      debateInfo: '='
    },
    templateUrl: 'js/directives/debateCard.html',
    link: function(scope, element, attrs) {
      scope.stage = (Date.now().getTime() - debateInfo.creationDate - debateInfo.duration*3600*1000 >= 0
                     ? "debate" : "post-debate")
    }
  }
});
