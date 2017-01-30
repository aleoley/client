
'use strict';

angular.module('app')
    .controller('homeController', ['$scope', 'customerService', '$q', '$mdDialog',
        function homeController($scope, customerService, $q, $mdDialog) {
            $scope.show = function () {
                console.log('fooo');
            }
        }
    ]);
