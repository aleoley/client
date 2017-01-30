
'use strict';

angular.module('app')
    .controller('settingsController', ['$scope', 'customerService', '$q', '$mdDialog',
        function settingsController($scope, customerService, $q, $mdDialog) {
            $scope.show = function () {
                console.log('fooo');
            }
        }
    ]);
