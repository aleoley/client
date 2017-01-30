var THREE = require("three");
var OrbitControls=require("./node_modules/three.js/examples/js/controls/OrbitControls.js");
require("./node_modules/three.js/examples/js/geometries/ConvexGeometry.js");
var Detector = require("./node_modules/three.js/examples/js/Detector");
require("./node_modules/three.js/examples/js/libs/stats.min.js");
var shpangs = require('./sheapTest.js');



'use strict';

angular.module('app')
    .controller('modelController', ['$scope', 'customerService', '$q', '$mdDialog',
        function modelController($scope, customerService, $q, $mdDialog) {
            $scope.show = function () {



                if (!Detector.webgl) Detector.addGetWebGLMessage();
                var group, camera, scene, renderer;
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
                    console.log(scene);
                    renderer = new THREE.WebGLRenderer({ antialias: true });
                    renderer.setPixelRatio(window.devicePixelRatio);
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    document.body.appendChild(renderer.domElement);
                    // camera
                    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
                    camera.position.set(15, 20, 30);
                    scene.add(camera);
                    // controls
                    controls = new THREE.OrbitControls(camera, renderer.domElement);
                    controls.minDistance = 20;
                    controls.maxDistance = 250;
                    controls.maxPolarAngle = Math.PI / 2;
                    //scene.add(new THREE.AmbientLight(0x222222));
                    // var light = new THREE.PointLight(0xffffff, 1);

                    light = new THREE.PointLight();
                    light.position.set(200, 100, 150);
                    scene.add(light);
                    camera.add(light);
                    // scene.add(new THREE.AxisHelper(20));

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
                    pointsGeometry.vertices = [];
                    for (var i = 0; i < shpangs.shpangs.length; i++) {
                        for (var j = 0; j < shpangs.shpangs[i].length; j++) {
                            pointsGeometry.vertices.push(new THREE.Vector3(-(shpangs.shpangs[i][j].x / 100), -(shpangs.shpangs[i][j].y / 100), -(shpangs.shpangs[i][j].z / 1.3)));
                            //pointsGeometry.vertices.push(new THREE.Vector3((shpangs.shpangs[i][j].x / 100), -(shpangs.shpangs[i][j].y / 100), -(shpangs.shpangs[i][j].z / 1.3)));
                        }
                        for (var j = 0; j < shpangs.shpangs[i].length; j++) {
                            //pointsGeometry.vertices.push(new THREE.Vector3(-(shpangs.shpangs[i][j].x / 100), -(shpangs.shpangs[i][j].y / 100), -(shpangs.shpangs[i][j].z / 1.3)));
                           pointsGeometry.vertices.push(new THREE.Vector3((shpangs.shpangs[i][j].x / 100), -(shpangs.shpangs[i][j].y / 100), -(shpangs.shpangs[i][j].z / 1.3)));
                        }

                    }
                    //assignUVs(pointsGeometry);

                    console.log('pointsGeometry', pointsGeometry);
                    // for (var i = 0; i < pointsGeometry.vertices.length; i++) {

                    //     //pointsGeometry.vertices[ i ].add( randomPoint().multiplyScalar( 2 ) ); // wiggle the points
                    // }
                    var pointsMaterial = new THREE.PointsMaterial({
                        color: 0x0080ff,
                        map: texture,
                        size: 4,
                        alphaTest: 0.5
                    });
                    var points = new THREE.Points(pointsGeometry, pointsMaterial);
                    group.add(points);
                    // convex hull
                    var meshMaterial = new THREE.MeshLambertMaterial({
                        color: 0xffffff,
                        opacity: 0.3,
                        transparent: true
                    });
                    var meshGeometry = new THREE.Geometry(pointsGeometry.vertices);
                    mesh = new THREE.Mesh(meshGeometry, meshMaterial);
                    mesh.material.side = THREE.BackSide; // back faces
                    mesh.renderOrder = 0;
                    group.add(mesh);
                    mesh = new THREE.Mesh(meshGeometry, meshMaterial.clone());
                    mesh.material.side = THREE.FrontSide; // front faces
                    mesh.renderOrder = 1;
                    group.add(mesh);
                    //

                    console.log('meshGeometry', meshGeometry);
                    window.addEventListener('resize', onWindowResize, false);
                }
                function randomPoint() {
                    return new THREE.Vector3(THREE.Math.randFloat(- 1, 1), THREE.Math.randFloat(- 1, 1), THREE.Math.randFloat(- 1, 1));
                }
                function onWindowResize() {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                }
                function animate() {
                    requestAnimationFrame(animate);
                    //group.rotation.y += 0.005;
                    render();
                }
                function render() {
                    renderer.render(scene, camera);
                }


            }
        }]);
