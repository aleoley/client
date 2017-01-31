
'use strict';

angular.module('app')
    .controller('navController', ['$scope', '$q', '$mdDialog',
        function NavController($scope, $q, $mdDialog) {


            $scope.currentNavItem = 'project';


            $scope.isOpen = false;

            $scope.topDirections = ['left', 'up'];
            $scope.bottomDirections = ['down', 'right'];

            $scope.isOpen = false;

            $scope.availableModes = ['md-fling', 'md-scale'];
            $scope.selectedMode = 'md-scale';

            $scope.availableDirections = ['up', 'down', 'left', 'right'];
            $scope.selectedDirection = 'up';


        }]);
