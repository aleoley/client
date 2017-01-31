angular
  .module('app')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: './scripts/home/home.html',
        controller: 'homeController'
      })
      .state('model', {
        url: '/model',
        templateUrl: './scripts/model/model.html',
        controller: 'modelController'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: './scripts/settings/settings.html',
        controller: 'settingsController'
      })
      .state('project', {
        url: '/',
        templateUrl: './scripts/project/project.html',
        controller: 'projectController'
      });

    //   .state('reset_pwd', {
    //     url: '/reset/:hash',
    //     templateUrl: 'app/components/auth/templates/resetPwd.html',
    //     controller: 'ResetPwdCtrl',
    //     resolve: {
    //       VerifyHash: function (AuthFactory, $stateParams) {
    //         return AuthFactory.verifyPwdHash($stateParams.hash);
    //       }
    //     }
    //   });
    $urlRouterProvider.otherwise('/');
  });
