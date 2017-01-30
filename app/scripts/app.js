

'use strict';

var _templateBase = './scripts';

angular.module('app', [
    'ngRoute',
    'ngMaterial',
    'ngMessages',
    'ngAnimate',
    'ui.router',
    'mdPickers',
    'angularFileUpload'

])
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

        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('blue')
            .accentPalette('blue')
            //.backgroundPalette('pink')
            .dark();

        $mdThemingProvider.theme('docs-light', 'default')
            .primaryPalette('blue');


    });
