// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'controllers', 'firebase', 'services', 'directives'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');

  $stateProvider
  .state('intro', {
    url: '/intro',
    templateUrl: 'templates/intro.html',
    controller: 'IntroCtrl'
  })

  // setup an abstract state for the tab-menu directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    controller: 'AppCtrl',
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:
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

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/intro');
});
