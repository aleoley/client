var path = require('path');

const Languages = require('./assets/languages/index');


'use strict';

var _templateBase = './scripts';

angular.module('app', [
    'ngRoute',
    'ngMaterial',
    'ngMessages',
    'ngAnimate',
    'ui.router',
    'mdPickers',
    'angularFileUpload',
    'ngTable',
    'angularSpinner',
    'md.data.table'

])
    .run(function ($rootScope) {

        /**
         * function for settingLanguage
         */
        function setLanguage(language) {

        }


        /**
        * function for gettingLanguage
        */
        function getLanguage(language) {
            return Languages.English;
        }


        getLanguage();
        $rootScope.Setlanguage = setLanguage;
        $rootScope.getLanguage = getLanguage;

    })
    .config(['$routeProvider', function ($routeProvider) {
        // $routeProvider.when('/', {
        //     templateUrl: _templateBase + '/customer/customer.html' ,
        //     controller: 'customerController',
        //     controllerAs: '_ctrl'
        // });
        // $routeProvider.otherwise({ redirectTo: '/' });
    }]).config(function ($compileProvider) {
        $compileProvider.preAssignBindingsEnabled(true);
    }).config(function ($mdThemingProvider) {

        // Configure a dark theme with primary foreground yellow

        $mdThemingProvider
            .theme('docs-dark', 'default')
            .primaryPalette('blue')
            .accentPalette('blue')
            //.backgroundPalette('pink')
            .dark();

        $mdThemingProvider
            .theme('docs-light')
            .backgroundPalette('blue')
            .primaryPalette('red')
            .accentPalette('red')





    }).config(['usSpinnerConfigProvider', function (usSpinnerConfigProvider) {
        usSpinnerConfigProvider.setTheme('bigBlue', { color: 'blue', radius: 20 });
        usSpinnerConfigProvider.setTheme('smallRed', { color: 'red', radius: 6 });
    }]);
