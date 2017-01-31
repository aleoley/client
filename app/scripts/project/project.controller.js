
'use strict';

angular.module('app')
    .controller('projectController', ['$rootScope', '$scope', '$q', '$mdDialog', '$timeout', '$mdpDatePicker',
        function homeController($rootScope, $scope, $q, $mdDialog, $timeout, $mdpDatePicker) {

            $scope.language = $rootScope.getLanguage();
            
            $scope.myDate = new Date();

            $scope.minDate = new Date(
                $scope.myDate.getFullYear(),
                $scope.myDate.getMonth() - 2,
                $scope.myDate.getDate());
            $scope.maxDate = new Date(
                $scope.myDate.getFullYear(),
                $scope.myDate.getMonth() + 2,
                $scope.myDate.getDate());
            $scope.currentDate = new Date();
            this.showDatePicker = function (ev) {
                $mdpDatePicker($scope.currentDate, {
                    targetEvent: ev
                }).then(function (selectedDate) {
                    $scope.currentDate = selectedDate;
                });;
            };

            this.filterDate = function (date) {
                return moment(date).date() % 2 == 0;
            };

            this.showTimePicker = function (ev) {
                $mdpTimePicker($scope.currentTime, {
                    targetEvent: ev
                }).then(function (selectedDate) {
                    $scope.currentTime = selectedDate;
                });;
            }



            $scope.openDialog = function ($event) {
                $mdDialog.show({
                    controller: DialogCtrl,
                    controllerAs: 'ctrl',
                    templateUrl: './scripts/templates/dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    clickOutsideToClose: true
                })
            }

            $scope.user = {
                title: 'Developer',
                email: 'ipsum@lorem.com',
                firstName: '',
                lastName: '',
                company: 'Google',
                address: '1600 Amphitheatre Pkwy',
                city: 'Mountain View',
                state: 'CA',
                biography: 'Loves kittens, snowboarding, and can type at 130 WPM.\n\nAnd rumor has it she bouldered up Castle Craig!',
                postalCode: '94043'
            };
            $scope.minDate = new Date('Wed Jan 22 2017 17:07:29 GMT-0800 (PST)');
            console.log('minDate', $scope.minDate);
            $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
                'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
                'WY').split(' ').map(function (state) {
                    return { abbrev: state };
                });

            function DialogCtrl($timeout, $q, $scope, $mdDialog) {
                var self = this;
                // list of `state` value/display objects
                self.states = loadAll();
                self.querySearch = querySearch;
                // ******************************
                // Template methods
                // ******************************
                self.cancel = function ($event) {
                    $mdDialog.cancel();
                };
                self.finish = function ($event) {
                    $mdDialog.hide();
                };
                // ******************************
                // Internal methods
                // ******************************
                /**
                 * Search for states... use $timeout to simulate
                 * remote dataservice call.
                 */
                function querySearch(query) {
                    return query ? self.states.filter(createFilterFor(query)) : self.states;
                }
                /**
                 * Build `states` list of key/value pairs
                 */
                function loadAll() {
                    var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
              Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
              Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
              Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
              North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
              South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
              Wisconsin, Wyoming';
                    return allStates.split(/, +/g).map(function (state) {
                        return {
                            value: state.toLowerCase(),
                            display: state
                        };
                    });
                }
                /**
                 * Create filter function for a query string
                 */
                function createFilterFor(query) {
                    var lowercaseQuery = angular.lowercase(query);
                    return function filterFn(state) {
                        return (state.value.indexOf(lowercaseQuery) === 0);
                    };
                }
            }
        }
    ]);


