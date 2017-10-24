'use strict';


angular.module('app')
    .controller('loadController', ['$scope', '$q', '$mdDialog', '$mdToast', 'NgTableParams', 'usSpinnerService',
        function loadController($scope, $q, $mdDialog, $mdToast, NgTableParams, usSpinnerService) {
            $scope.tableParams = new NgTableParams({}, { dataset: [] });





        }]);
