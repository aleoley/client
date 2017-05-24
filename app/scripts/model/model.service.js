const { ipcRenderer } = require('electron');

(function () {
    'use strict';

    angular.module('app')
        .service('ModelService', ['$q', '$mdToast', ModelService]);

    function ModelService($q, $mdToast) {

        const Ship = {
            Load: (ship) => {
                return new Promise((resolve, reject) => {

                    ipcRenderer.on('error-reply', (event, err) => {
                        showAlert(err);
                    });

                    ipcRenderer.on('load_ship-reply', (event, responce) => {
                        resolve(responce);
                    });

                    ipcRenderer.send('load_ship', ship);
                });
            },
            Stabilazed: (params) => {
                return new Promise((resolve, reject) => {

                    ipcRenderer.on('error-reply', (event, err) => {
                        showAlert(err);
                    });

                    ipcRenderer.on('stabilazed_volume-reply', (event, responce) => {
                        resolve(responce);
                    });

                    ipcRenderer.send('stabilazed_volume', params);
                });
            },

        };
        const Model = {
            Build: (params) => {
                return new Promise((resolve, reject) => {

                    ipcRenderer.on('error-reply', (event, err) => {
                        console.log('err!!!!11',err);
                        showAlert(err);
                    });

                    ipcRenderer.on('build_model-reply', (event, responce) => {
                        resolve(responce);
                    });

                    ipcRenderer.send('build_model', params);
                });
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
            Model: Model

        };
    }
})();