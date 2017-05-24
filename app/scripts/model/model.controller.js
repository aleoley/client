var THREE = require("three");
var OrbitControls = require("./node_modules/three.js/examples/js/controls/OrbitControls.js");
require("./node_modules/three.js/examples/js/geometries/ConvexGeometry.js");
var Detector = require("./node_modules/three.js/examples/js/Detector");
var Stats = require("./node_modules/three.js/examples/js/libs/stats.min.js");
var shpangs = require('./sheapTest.js');
var natali = require('./natali.js').natali;
var _ = require('lodash');
var TktLoader = require('./helpers/loaders').TktLoader;
var async = require('async');
var ModelBuilder = require('./helpers/modelBuilder');
var CompartmentBuilder = require('./helpers/BuildCompartment');
var StabilityFinder = require('./helpers/StabilityFinder');
'use strict';

angular.module('app')
    .controller('modelController', ['$scope', 'customerService', '$q', '$mdDialog', '$mdSidenav',
        function modelController($scope, customerService, $q, $mdDialog, $mdSidenav) {
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

            $scope.show = function () {
                if ($scope.model3d)
                    return;
                $scope.model3d = true;


                if (!Detector.webgl) Detector.addGetWebGLMessage();
                var mouse = new THREE.Vector2(), INTERSECTED;
                var radius = 100, theta = 0;
                var raycaster = new THREE.Raycaster();
                init();
                animate();

                function assignUVs(geometry) {

                    geometry.faceVertexUvs[0] = [];

                    geometry.faces.forEach(function (face) {

                        var components = ['x', 'y', 'z'].sort(function (a, b) {
                            return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
                        });

                        var v1 = geometry.vertices[face.a];
                        var v2 = geometry.vertices[face.b];
                        var v3 = geometry.vertices[face.c];

                        geometry.faceVertexUvs[0].push([
                            new THREE.Vector2(v1[components[0]], v1[components[1]]),
                            new THREE.Vector2(v2[components[0]], v2[components[1]]),
                            new THREE.Vector2(v3[components[0]], v3[components[1]])
                        ]);

                    });

                    geometry.uvsNeedUpdate = true;
                }

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
                    var loader = new THREE.TextureLoader();
                    var texture = loader.load('./node_modules/three.js/examples/textures/sprites/disc.png');
                    group = new THREE.Group();
                    scene.add(group);
                    // points
                    var pointsGeometry = new THREE.Geometry(10);
                    // var simpleShpangs = [
                    //     // [
                    //     //     new THREE.Vector3(-2, 6, -15),
                    //     //     new THREE.Vector3(-1, 0, -15),
                    //     //     new THREE.Vector3(2, 6, -15),
                    //     //     new THREE.Vector3(1, 0, -15),

                    //     // ],
                    //     // [
                    //     //     new THREE.Vector3(10, 7, -3),
                    //     //     new THREE.Vector3(9, 3, -3),
                    //     //     new THREE.Vector3(6, 0, -3),

                    //     //     new THREE.Vector3(-10, 7, -3),
                    //     //     new THREE.Vector3(-9, 3, -3),
                    //     //     new THREE.Vector3(-6, 0, -3),

                    //     // ],
                    //     // [
                    //     //     new THREE.Vector3(10, 7, 3),
                    //     //     new THREE.Vector3(9, 5, 3),
                    //     //     new THREE.Vector3(6, 0, 3),

                    //     //     new THREE.Vector3(-10, 7, 3),
                    //     //     new THREE.Vector3(-9, 5, 3),
                    //     //     new THREE.Vector3(-6, 0, 3),

                    //     // ],
                    //     // [

                    //     //     new THREE.Vector3(-4, 5, 15),
                    //     //     new THREE.Vector3(-3, 0, 15),
                    //     //     new THREE.Vector3(4, 5, 15),
                    //     //     new THREE.Vector3(3, 0, 15),

                    //     // ]
                    // ]
                    var simpleShpangs = [
                        // [
                        //     new THREE.Vector3(1, 0, -15),
                        //     new THREE.Vector3(2, 6, -15),
                        //     new THREE.Vector3(3, 7, -15),
                        // ],

                        // [
                        //     new THREE.Vector3(6, 0, -3),
                        //     new THREE.Vector3(9, 3, -3),
                        //     new THREE.Vector3(10, 7, -3),
                        //     new THREE.Vector3(12, 10, -3),
                        //     new THREE.Vector3(13, 11, -3),
                        //     new THREE.Vector3(14, 12, -3),
                        //     new THREE.Vector3(17, 13, -3),
                        //     new THREE.Vector3(19, 17, -3),


                        // ],
                        [
                            new THREE.Vector3(6, 0, 3),
                            new THREE.Vector3(9, 5, 3),
                            new THREE.Vector3(10, 6, 3),
                            new THREE.Vector3(10, 7, 3),
                            new THREE.Vector3(18, 9, 3),
                            new THREE.Vector3(21, 21, 3),



                        ],
                        [
                            new THREE.Vector3(5, 0, 13),
                            new THREE.Vector3(8, 5, 14),
                            new THREE.Vector3(0, 6, 15),
                            new THREE.Vector3(0, 7, 14),
                            new THREE.Vector3(9, 8, 13),

                        ]
                    ];


                    var Ship = TktLoader(natali);
                    //  Ship.shpangs = simpleShpangs;
                    //simpleShpangs = Ship.shpangs;
                    // console.log('simpleShpangs!!!!!!!!!!!!!!', simpleShpangs);

                    pointsGeometry.vertices = [];

                    for (var i = 0; i < simpleShpangs.length; i++) {

                        for (var j = 0; j < simpleShpangs[i].length; j++) {

                            pointsGeometry.vertices.push(simpleShpangs[i][j]);
                        }
                    }

                   // var shiipGroup = new THREE.Group();
                    // ModelBuilder.build({
                    //     Ship: Ship,
                    //     initialTimeout: 0,
                    //     filter: 3.3,
                    //     different: 0.0323,
                    //     createShape: true,
                    //     mirrored: true,
                    //     // half: true,
                    //     water: 1.025,
                    //     group: shiipGroup,
                    //     UpDown: true,
                    //     texture: texture
                    // }).then(function (res) {
                    //     scene.add(shiipGroup);
                    //     console.log('RES', res);
                    //     console.log('Ship.compartments[3]', Ship.compartments[3]);
                    //     return Promise.all[
                    //         CompartmentBuilder.build({
                    //             Ship: Ship,
                    //             initialTimeout: 1000,
                    //             //  filter: 3.2,
                    //             // different: 0.1,
                    //             createShape: true,
                    //             mirrored: true,
                    //             half: true,
                    //             water: 1.025,
                    //             group: group,
                    //             texture: texture,
                    //             compartment: Ship.compartments[1]
                    //         })

                    //     ]
                    // })
                    //     .then(function (res) {
                    //         console.log('res!!!!!!!!1', res);
                    //     })
                    // raycaster = new THREE.Raycaster();
                    StabilityFinder.Stabilized({
                        Ship: Ship,
                        searchVolume: Ship.Weight / 1.025,
                        step: 0.1,
                        water: 1.025,
                    }).then(function (res) {
                        console.log('====Res====', res);
                        ModelBuilder.build({
                            Ship: Ship,
                            initialTimeout: 0,
                            filter: res.h,
                           // different: 0.0323,
                            createShape: true,
                            mirrored: true,
                            // half: true,
                            water: 1.025,
                            group: group,
                            UpDown: true,
                            texture: texture
                        })
                            .then(function (res) {
                                console.log('res!!!!!!!!1', res);
                            })
                    });

                    stats = new Stats();
                    // document.getElementById('model').appendChild(stats.dom);
                    // document.addEventListener('mousemove', onDocumentMouseMove, false);
                    window.addEventListener('resize', onWindowResize, false);
                }
                function randomPoint() {
                    return new THREE.Vector3(THREE.Math.randFloat(- 1, 1), THREE.Math.randFloat(- 1, 1), THREE.Math.randFloat(- 1, 1));
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
                    // // theta += 0.1;
                    // // camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
                    // // camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
                    // // camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
                    // camera.lookAt(scene.position);
                    // camera.updateMatrixWorld();
                    // // find intersections
                    // raycaster.setFromCamera(mouse, camera);
                    // var intersects = raycaster.intersectObjects(scene.children);
                    // if (intersects.length > 0) {
                    //     if (INTERSECTED != intersects[0].object) {
                    //         if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                    //         INTERSECTED = intersects[0].object;
                    //         INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                    //         INTERSECTED.material.emissive.setHex(0xff0000);
                    //     }
                    // } else {
                    //     if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                    //     INTERSECTED = null;
                    // }
                    renderer.render(scene, camera);
                }



            }














            $scope.show2d = function () {
                var container, stats;
                var camera, scene, raycaster, renderer;
                var mouse = new THREE.Vector2(), INTERSECTED;
                var radius = 100, theta = 0;
                container = document.getElementById('model2d');

                init();
                animate();
                function init() {

                    //document.body.appendChild(container);
                    var info = document.createElement('div');

                    camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 1, 10000);
                    scene = new THREE.Scene();
                    var light = new THREE.DirectionalLight(0xffffff, 1);
                    light.position.set(1, 1, 1).normalize();
                    scene.add(light);
                    var geometry = new THREE.BoxBufferGeometry(20, 20, 20);
                    for (var i = 0; i < 2000; i++) {
                        var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
                        object.position.x = Math.random() * 800 - 400;
                        object.position.y = Math.random() * 800 - 400;
                        object.position.z = Math.random() * 800 - 400;
                        object.rotation.x = Math.random() * 2 * Math.PI;
                        object.rotation.y = Math.random() * 2 * Math.PI;
                        object.rotation.z = Math.random() * 2 * Math.PI;
                        object.scale.x = Math.random() + 0.5;
                        object.scale.y = Math.random() + 0.5;
                        object.scale.z = Math.random() + 0.5;
                        scene.add(object);
                    }
                    raycaster = new THREE.Raycaster();
                    renderer = new THREE.WebGLRenderer();
                    renderer.setClearColor(0xf0f0f0);
                    renderer.setPixelRatio(window.devicePixelRatio);
                    renderer.setSize(container.clientWidth, container.clientHeight);
                    renderer.sortObjects = false;
                    container.appendChild(renderer.domElement);
                    stats = new Stats();
                    container.appendChild(stats.dom);
                    document.addEventListener('mousemove', onDocumentMouseMove, false);
                    //
                    window.addEventListener('resize', onWindowResize, false);
                }
                function onWindowResize() {
                    camera.aspect = container.clientWidth / container.clientHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(container.clientWidth, container.clientHeight);
                }
                function onDocumentMouseMove(event) {
                    event.preventDefault();
                    mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
                    mouse.y = - (event.clientY / container.clientHeight) * 2 + 1;
                }
                //
                function animate() {
                    requestAnimationFrame(animate);
                    render();
                    stats.update();
                }
                function render() {
                    theta += 0.1;
                    camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
                    camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
                    camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
                    camera.lookAt(scene.position);
                    camera.updateMatrixWorld();
                    // find intersections
                    raycaster.setFromCamera(mouse, camera);
                    var intersects = raycaster.intersectObjects(scene.children);
                    if (intersects.length > 0) {
                        if (INTERSECTED != intersects[0].object) {
                            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                            INTERSECTED = intersects[0].object;
                            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                            INTERSECTED.material.emissive.setHex(0xff0000);
                        }
                    } else {
                        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                        INTERSECTED = null;
                    }
                    renderer.render(scene, camera);
                }
            }
        }]);
