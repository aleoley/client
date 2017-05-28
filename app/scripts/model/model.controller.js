var THREE = require("three");
var OrbitControls = require("./node_modules/three.js/examples/js/controls/OrbitControls.js");
require("./node_modules/three.js/examples/js/geometries/ConvexGeometry.js");
var Detector = require("./node_modules/three.js/examples/js/Detector");
var Stats = require("./node_modules/three.js/examples/js/libs/stats.min.js");
var shpangs = require('./sheapTest.js');
var natali = require('./natali.js').natali;
var _ = require('lodash');
var ModelBuilder = require('./helpers/modelBuilder');
var async = require('async');
const MathJS = require('mathjs');

'use strict';

angular.module('app')
    .controller('modelController', ['$scope', 'ModelService', '$q', '$mdDialog', '$mdToast', '$mdSidenav', 'NgTableParams', 'usSpinnerService',
        function modelController($scope, ModelService, $q, $mdDialog, $mdToast, $mdSidenav, NgTableParams, usSpinnerService) {

            //-----------------------------INITIAL DEFAAULT PARAMS------------------
            var group, camera, scene, renderer;
            $scope.tableParams = new NgTableParams({}, { dataset: [] });
            $scope.toggleLeft = buildToggler('left');
            $scope.toggleRight = buildToggler('right');
            function buildToggler(componentId) {
                return function () {
                    setTimeout(function () { $mdSidenav(componentId).toggle(), 700 });

                }
            }
            $scope.modelSize = {
                width: 1280,
                height: 1024
            }
            $scope.model3d = false;
            $scope.model2d = false;
            $scope.finded_different = {
                different: 0.0023
            }
            $scope.finded_filter = {
                h: 3.3
            }
            $scope.ResultShipData = {};

            $scope.setWidth = function () {
                renderer.setSize($scope.modelSize.width, $scope.modelSize.height);
            }
            var loader = new THREE.TextureLoader();
            var texture = loader.load('./assets/materials/monkey.png');


            if (!Detector.webgl) Detector.addGetWebGLMessage();
            var mouse = new THREE.Vector2(), INTERSECTED;
            var radius = 100, theta = 0;
            var raycaster = new THREE.Raycaster();
            init();
            animate();







            function init() {
                scene = new THREE.Scene();
                scene.background = new THREE.Color('#303030');

                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize($scope.modelSize.width, $scope.modelSize.height);
                document.getElementById('model').appendChild(renderer.domElement);
                // camera
                camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
                camera.position.set(55, 10, 100);
                scene.add(camera);
                // controls
                controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.minDistance = 20;
                controls.maxDistance = 250;
                controls.maxPolarAngle = Math.PI / 2;
                scene.add(new THREE.AmbientLight(0x222222));
                var light = new THREE.PointLight(0x0080ff, 1);

                light = new THREE.PointLight();
                light.position.set(200, 100, 150);
                scene.add(light);
                camera.add(light);
                scene.add(new THREE.AxisHelper(200));

                var gridHelper = new THREE.GridHelper(400, 40, 0x0000ff, 0x808080);
                gridHelper.position.y = 0;
                gridHelper.position.x = 0;
                scene.add(gridHelper);
                //

                group = new THREE.Group();
                scene.add(group);


                window.addEventListener('resize', onWindowResize, false);
            }

            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);

                renderer.setSize($scope.modelSize.width, $scope.modelSize.height);
            }



            function animate() {
                requestAnimationFrame(animate);
                // //group.rotation.y += 0.005;
                render();
            }

            function onDocumentMouseMove(event) {
                event.preventDefault();
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            }
            //




            function render() {

                renderer.render(scene, camera);
            }


            $scope.Ship = {
                name: 'TEST'
            }

            $scope.load = () => {
                $scope.startSpin();
                ModelService
                    .Ship
                    .Load(natali)
                    .then((res) => {
                        $scope.stopSpin();
                        console.log('RES!!!!!!', res);
                        $scope.Ship = res;
                        console.log('$scope.Ship!!!!!!', $scope.Ship);
                        return res;
                    });
            };

            $scope.stabilazed = () => {
                $scope.startSpin();
                ModelService
                    .Ship
                    .Stabilazed({
                        // initialPlusX: 0.004,
                        Ship: $scope.Ship,
                        searchVolume: $scope.Ship.Weight / 1.025,
                        step: 0.1,
                        water: 1.025,
                    })
                    .then((res) => {

                        $scope.stopSpin();
                        console.log('STABILAZED', res);
                        $scope.finded_filter = res;
                    })
            };

            $scope.stabilazedDifferent = () => {
                $scope.startSpin();
                ModelService
                    .Ship
                    .StabilazedDifferent({
                        //initialPlusX: 0.004,
                        Ship: $scope.Ship,
                        searchMassCenter: new THREE.Vector3(0, 4.81, -2.33),
                        etta: 0.1,
                        filter: $scope.finded_filter.h,
                        water: 1.025,
                    })
                    .then((res) => {
                        $scope.stopSpin();
                        console.log('STABILAZED', res);
                        $scope.finded_different = res;
                    });
            };

            $scope.build = () => {
                $scope.startSpin();
                ModelBuilder
                    .build({
                        //initialPlusX: 0.004,
                        Ship: $scope.Ship,
                        initialTimeout: 0,
                        filter: $scope.finded_filter.h,
                        different: $scope.finded_different.different,
                        createShape: true,
                        mirrored: true,
                        // half: true,
                        water: 1.025,
                        texture: texture,
                        UpDown: true,
                        group: group
                    })
                    .then((res) => {
                        $scope.stopSpin();
                        $scope.ResultShipData = res[0];
                        $scope.ResultShipData.Tm = res[0].filter;
                        $scope.ResultShipData.ShipTonnVolume = $scope.Ship.Weight;
                        $scope.ResultShipData.ShipVolume = $scope.Ship.Weight / 1.025;
                        $scope.ResultShipData.ShipMassCenter = new THREE.Vector3(0, 4.81, -2.33);
                        var dataSet = ModelService.DataSet.Build($scope.ResultShipData);
                        console.log('dataSet', dataSet);
                        $scope.tableParams = new NgTableParams({}, { dataset: dataSet });
                        //xc=xg-(zc-zg)*tg 
                        //zc=zg-(yc-yg)*tg
                        console.log('etta', MathJS.abs((MathJS.tan(res[0].different) * (4.81 - res[0].MassCenter.y)) + (-2.33) - res[0].MassCenter.z));
                        var shipGroup = new THREE.Group(res[1].group);
                        console.log('shipGroup', shipGroup);
                        scene.add(shipGroup);
                        // render();
                        console.log('Build', res);
                    })
            };

            $scope.startSpin = function () {
                usSpinnerService.spin('spinner-1');
            }
            $scope.stopSpin = function () {
                usSpinnerService.stop('spinner-1');
            }





        }]);
