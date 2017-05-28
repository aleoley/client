const { ipcRenderer } = require('electron');

const stabilityList = require('./assets/baseStructures/stabilityList').StabilitiList;

(function () {
    'use strict';

    angular.module('app')
        .service('ModelService', ['$q', '$mdToast', ModelService]);

    function ModelService($q, $mdToast) {

        const Ship = {
            Load: (ship) => {
                return $q((resolve, reject) => {

                    ipcRenderer.on('error-reply', (event, err) => {
                        showAlert(err);
                        reject(err);
                    });

                    ipcRenderer.on('load_ship-reply', (event, responce) => {
                        resolve(responce);
                    });

                    ipcRenderer.send('load_ship', ship);
                });
            },
            Stabilazed: (params) => {
                return $q((resolve, reject) => {

                    ipcRenderer.on('error-reply', (event, err) => {
                        showAlert(err);
                        reject(err);
                    });

                    ipcRenderer.on('stabilazed_volume-reply', (event, responce) => {
                        resolve(responce);
                    });

                    ipcRenderer.send('stabilazed_volume', params);
                });
            },
            StabilazedDifferent: (params) => {
                return $q((resolve, reject) => {

                    ipcRenderer.on('error-reply', (event, err) => {
                        showAlert(err);
                        reject(err);
                    });

                    ipcRenderer.on('stabilazed_different-reply', (event, responce) => {
                        resolve(responce);
                    });

                    ipcRenderer.send('stabilazed_different', params);
                });
            },

        };
        const Model = {
            Build: (params) => {
                return $q((resolve, reject) => {

                    ipcRenderer.on('error-reply', (event, err) => {
                        console.log('err!!!!11', err);
                        showAlert(err);
                        reject(err);
                    });

                    ipcRenderer.on('build_model-reply', (event, responce) => {
                        resolve(responce);
                    });

                    ipcRenderer.send('build_model', params);
                });
            },
        }

        const DataSet = {
            Build: (inputObject) => {

                var outArray = _.compact(_.map(stabilityList, (item) => {
                    var getter = _.get(inputObject, item.systemName);
                    if (getter || getter === 0) {
                        item.value = _.get(inputObject, item.systemName);
                        return item;
                    } else {
                        return false;
                    }
                }));
                return outArray;
            },
        }


        const showAlert = (text) => {
            let toast = $mdToast.simple()

                .textContent('Error: ' + text)
                .action('UNDO')
                .highlightAction(true)
                .highlightClass('md-primary')
                .toastClass('md-primary')
                .theme('docs-light')
                // Accent is used by default, this just demonstrates the usage.
                .position('top right');

            $mdToast
                .show(toast)
                .then((response) => {
                    if (response == 'ok') {
                        console.log('You clicked the \'UNDO\' action.');
                    }
                });
        }




        return {
            Ship: Ship,
            Model: Model,
            DataSet: DataSet

        };
    }
})();