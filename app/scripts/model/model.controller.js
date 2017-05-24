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

'use strict';

angular.module('app')
    .controller('modelController', ['$scope', 'ModelService', '$q', '$mdDialog', '$mdToast', '$mdSidenav',
        function modelController($scope, ModelService, $q, $mdDialog, $mdToast, $mdSidenav) {
            var group, camera, scene, renderer;


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


            $scope.setWidth = function () {
                renderer.setSize($scope.modelSize.width, $scope.modelSize.height);
            }
            var loader = new THREE.TextureLoader();
            var texture = loader.load('./node_modules/three.js/examples/textures/sprites/disc.png');


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








            $scope.load = () => {
                ModelService
                    .Ship
                    .Load(natali)
                    .then((res) => {
                        console.log('RES!!!!!!', res);
                        $scope.Ship = res;
                    })
            };

            $scope.stabilazed = () => {
                ModelService
                    .Ship
                    .Stabilazed({
                        Ship: $scope.Ship,
                        searchVolume: $scope.Ship.Weight / 1.025,
                        step: 0.1,
                        water: 1.025,
                    })
                    .then((res) => {
                        console.log('STABILAZED', res);
                        $scope.finded_filter = res;
                    })
            };
            $scope.build = () => {

                ModelBuilder

                    .build({
                        Ship: $scope.Ship,
                        initialTimeout: 0,
                        filter: $scope.finded_filter.h,
                        different: 0.0323,
                        createShape: true,
                        mirrored: true,
                        // half: true,
                        water: 1.025,
                        texture: texture,
                        UpDown: true,
                        group: group
                    })
                    .then((res) => {
                        console.log('res[0].group', res[1].group);
                        var shipGroup = new THREE.Group(res[1].group);
                        console.log('shipGroup', shipGroup);
                        scene.add(shipGroup);
                        // render();
                        console.log('Build', res);
                    })
            };



        }]);
