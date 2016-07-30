angular.module('starter', ['ionic', 'controllers', 'firebase', 'services', 'directives'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    /* Keyboard input settings */
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    /* Make sure that after you pull that you run "cordova plugin add cordova-plugin-statusbar" to have a status bar which works */
    if (window.StatusBar) {
      StatusBar.overlaysWebView(true);
      // Remember that this works WITH the statusbar settings in config.xml, not just alone
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('intro', {
    url: '/intro',
    templateUrl: 'templates/intro.html',
    controller: 'IntroCtrl'
  })

  /* This app is based on tabs, this needs to be abstract as it is the superclass of all the tabs in our app */
  .state('tab', {
    url: '/tab',
    abstract: true,
    controller: 'AppCtrl',
    templateUrl: 'templates/tabs.html'
  })

  /* Each tab in the app has its own navigation route */

  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('tab.personal', {
      url: '/personal',
      views: {
        'tab-personal': {
          templateUrl: 'templates/tab-personal.html',
          controller: 'PersonalCtrl'
        }
      }
  })

  .state('tab.notifications', {
    url: '/notifications',
    views: {
      'tab-notifications': {
        templateUrl: 'templates/tab-notifications.html',
        controller: 'NotifCtrl'
      }
    }
  })

  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('tab.userinfo', {
    url: '/userinfo',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-userinfo.html',
        controller: 'UserInfoCtrl'
      }
    }
  })

  .state('tab.communityguidelines', {
    url: '/communityguidelines',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-communityguidelines.html',
        controller: 'CommunityGuidelinesCtrl'
      }
    }
  })

  /* This is the main debating view, away from the tabs */

  .state('createDebate', {
    url: '/createDebate',
    templateUrl: 'templates/createDebate.html',
    controller: 'CreateDebateCtrl'
  })

  .state('mainDebate', {
    url: '/mainDebate',
    templateUrl: 'templates/debateMain.html',
    controller: 'MainDebateCtrl',
    params: {
      debateData: null,
      stage: null
    }
  })

  .state('mainArgument', {
    url: '/mainArgument',
    templateUrl: 'templates/argumentMain.html',
    controller: 'MainArgumentCtrl',
    params: {
      argInfo: null
    }
  })

  .state('vote', {
    url: '/vote',
    templateUrl: 'templates/votePage.html',
    controller: 'VoteCtrl',
    params: {
      debateid: null
    }
  });

  /* Google: Angular UI Router, this, along with the above is used to set the navigation in the app, the starting point is /intro */
  $urlRouterProvider.otherwise('/intro');
});
