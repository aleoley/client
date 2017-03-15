var THREE = require("three");
var OrbitControls = require("./node_modules/three.js/examples/js/controls/OrbitControls.js");
require("./node_modules/three.js/examples/js/geometries/ConvexGeometry.js");
var Detector = require("./node_modules/three.js/examples/js/Detector");
require("./node_modules/three.js/examples/js/libs/stats.min.js");
var shpangs = require('./sheapTest.js');
var _ = require('lodash');



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
                    console.log(scene);
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
                    var simpleShpangs = [
                        [
                            new THREE.Vector3(-2, 6, -15),
                            new THREE.Vector3(-1, 0, -15),
                            new THREE.Vector3(2, 6, -15),
                            new THREE.Vector3(1, 0, -15),

                        ],
                        [
                            new THREE.Vector3(10, 7, -3),
                            new THREE.Vector3(9, 3, -3),
                            new THREE.Vector3(6, 0, -3),

                            new THREE.Vector3(-10, 7, -3),
                            new THREE.Vector3(-9, 3, -3),
                            new THREE.Vector3(-6, 0, -3),

                        ],
                        [
                            new THREE.Vector3(10, 7, 3),
                            new THREE.Vector3(9, 5, 3),
                            new THREE.Vector3(6, 0, 3),

                            new THREE.Vector3(-10, 7, 3),
                            new THREE.Vector3(-9, 5, 3),
                            new THREE.Vector3(-6, 0, 3),

                        ],
                        [

                            new THREE.Vector3(-4, 5, 15),
                            new THREE.Vector3(-3, 0, 15),
                            new THREE.Vector3(4, 5, 15),
                            new THREE.Vector3(3, 0, 15),

                        ]
                    ]

                    // for (var i = 0; i < shpangs.shpangs.length; i++) {
                    //     var middleArray = [];
                    //     for (var j = 0; j < shpangs.shpangs[i].length; j++) {
                    //         middleArray.push(new THREE.Vector3(-(shpangs.shpangs[i][j].x / 100), -(shpangs.shpangs[i][j].y / 100), -(shpangs.shpangs[i][j].z / 1.3)));
                    //         middleArray.push(new THREE.Vector3((shpangs.shpangs[i][j].x / 100), -(shpangs.shpangs[i][j].y / 100), -(shpangs.shpangs[i][j].z / 1.3)));
                    //     }
                    //     simpleShpangs.push(middleArray);
                    // }



                    pointsGeometry.vertices = [];

                    for (var i = 0; i < simpleShpangs.length; i++) {

                        for (var j = 0; j < simpleShpangs[i].length; j++) {

                            pointsGeometry.vertices.push(simpleShpangs[i][j]);
                        }
                    }




                    /**
                     * Function for Calculating distance 
                     */
                    function distanceVector(v1, v2) {
                        var dx = v1.x - v2.x;
                        var dy = v1.y - v2.y;
                        var dz = v1.z - v2.z;

                        return Math.sqrt(dx * dx + dy * dy + dz * dz);
                    }

                    /**
                     * This function must return only 2 vertex with min distanse to current
                     */
                    function minDistanse(vertex, shapg) {
                        var outObject = {
                            vertex1: {},
                            vertex2: {},
                            vertex: vertex
                        };
                        var shpangsForShearch = _.filter(shapg, function (vector) { return vertex.x >= 0 ? vector.x >= 0 : vector.x <= 0 });


                        var sortedDistanceShpangVertex = _.sortBy(shpangsForShearch, function (point) {
                            return distanceVector(vertex, point);
                        });
                        if (sortedDistanceShpangVertex.length >= 2) {
                            outObject.vertex1 = sortedDistanceShpangVertex[0];
                            outObject.vertex2 = sortedDistanceShpangVertex[1];
                        }

                        return sortedDistanceShpangVertex;

                    }

                    for (var i = 0; i < simpleShpangs.length - 1; i++) {
                        for (var j = 0; j < simpleShpangs[i].length; j++) {
                            var minVectors = minDistanse(simpleShpangs[i][j], simpleShpangs[i + 1]);
                            for (var k = 0; k < minVectors.length; k++) {
                                for (var z = 0; z < minVectors.length; z++) {
                                    var index1 = _.findIndex(pointsGeometry.vertices, function (vector) {
                                        return vector.x === minVectors[k].x && vector.y === minVectors[k].y && vector.z === minVectors[k].z;
                                    });
                                    var index2 = _.findIndex(pointsGeometry.vertices, function (vector) {
                                        return vector.x === minVectors[z].x && vector.y === minVectors[z].y && vector.z === minVectors[z].z;
                                    });
                                    var index3 = _.findIndex(pointsGeometry.vertices, function (vector) {
                                        return vector.x === simpleShpangs[i][j].x && vector.y === simpleShpangs[i][j].y && vector.z === simpleShpangs[i][j].z;
                                    });
                                    pointsGeometry.faces.push(new THREE.Face3(index1, index2, index3));
                                }
                            }



                            // pointsGeometry.faces.push(new THREE.Face3(index3, index2, index1));
                            // pointsGeometry.faces.push(new THREE.Face3(index2, index1, index3));

                        }
                    }

                    for (var i = simpleShpangs.length - 1; i > 0; i--) {
                        for (var j = 0; j < simpleShpangs[i].length; j++) {
                            var minVectors = minDistanse(simpleShpangs[i][j], simpleShpangs[i - 1]);
                            for (var k = 0; k < minVectors.length; k++) {
                                for (var z = 0; z < minVectors.length; z++) {
                                    var index1 = _.findIndex(pointsGeometry.vertices, function (vector) {
                                        return vector.x === minVectors[k].x && vector.y === minVectors[k].y && vector.z === minVectors[k].z;
                                    });
                                    var index2 = _.findIndex(pointsGeometry.vertices, function (vector) {
                                        return vector.x === minVectors[z].x && vector.y === minVectors[z].y && vector.z === minVectors[z].z;
                                    });
                                    var index3 = _.findIndex(pointsGeometry.vertices, function (vector) {
                                        return vector.x === simpleShpangs[i][j].x && vector.y === simpleShpangs[i][j].y && vector.z === simpleShpangs[i][j].z;
                                    });
                                    pointsGeometry.faces.push(new THREE.Face3(index1, index2, index3));
                                }
                            }
                        }
                    }



                    /**
                     * Function for finding Volumu by 8 points in 2 shpangs
                     * 
                     * //===========bottom============
                        //
                        // bottom[0]          bottom[3]
                        //        |           |
                        //        |           |
                        //        |           |
                        //        |___________|
                        // bottom[1]          bottom[2]
                        //


                        //=============top============
                        //
                        //    top[0]          top[3]
                        //        |           |
                        //        |           |
                        //        |           |
                        //        |___________|
                        //    top[1]          top[2]


                     * Volume is V= 1/3*(S1+sqrt(S1*S2)+S2)
                     * 
                     */
                    function Volume(bottom, top) {

                        //default Existings check

                        if (bottom.length !== 4) {
                            console.log('Havent Neddet points in bottom')
                            return;
                        }
                        if (top.length !== 4) {
                            console.log('Havent Neddet points in top')
                            return;
                        }


                        ///Length Check 
                        var b0 = bottom[0],
                            b1 = bottom[1],
                            b2 = bottom[2],
                            b3 = bottom[3];

                        var t0 = top[0],
                            t1 = top[1],
                            t2 = top[2],
                            t3 = top[3];

                        var bottomHeight1 = distanceVector(b0, b1),
                            bottomHeight2 = distanceVector(b2, b3),

                            bottomWidth1 = distanceVector(b1, b2),
                            bottomWidth2 = distanceVector(b0, b3);

                        var topHeight1 = distanceVector(t0, t1),
                            topHeight2 = distanceVector(t2, t3),

                            topWidth1 = distanceVector(t1, t2),
                            topWidth2 = distanceVector(t0, t3);



                        if (bottomHeight1 !== bottomHeight2 || topHeight1 !== topHeight2) {
                            console.log('The height is different');
                            return;
                        }

                        var S1 = trapezeSqueare(bottomHeight1, bottomHeight2, bottomWidth1, bottomWidth2);
                        var S2 = trapezeSqueare(topHeight1, topHeight2, topWidth1, topWidth2);






                    }

                    function getVolume(bottom, head) {

                        //botom must have lenght=2
                        if (bottom.length !== 2) {
                            return;
                        }

                        //head must have lenght=1 
                        if (head.length !== 1) {
                            return;
                        }

                        // build proections
                        bottom.push(proectionX(bottom[0]));
                        bottom.push(proectionX(bottom[1]));
                        head.push(proectionX(head[0]));

                        // h must be fixed by default
                        var fixedH = 15;

                        var buttomA = distanceVector(bottom[0], bottom[2]);
                        var buttomB = distanceVector(bottom[1], bottom[3]);
                        var buttomC = distanceVector(bottom[0], bottom[1]);
                        var buttomD = distanceVector(bottom[2], bottom[3]);
                        console.log('buttomA!!!', buttomA);
                        console.log('buttomB!!!', buttomB);
                        console.log('buttomC!!!', buttomC);
                        console.log('buttomD!!!', buttomD);


                        var triangleA = distanceVector(bottom[2], bottom[3]);
                        var triangleB = distanceVector(head[1], bottom[3]);
                        var triangleC = distanceVector(bottom[2], head[1]);
                        console.log('triangleA!!!', triangleA);
                        console.log('triangleB!!!', triangleB);
                        console.log('triangleC!!!', triangleC);

                        var trapezeSqueareV1 = trapezeSqueare(buttomA, buttomB, buttomC, buttomD);
                        var triangleSqueareV2 = triangleSqueare(triangleA, triangleB, triangleC)
                        console.log('trapezeSqueareV1!!!', trapezeSqueareV1);
                        console.log('triangleSqueareV2!!!', triangleSqueareV2);
                        var pyramid2H = distanceVector(head[0], head[1]);

                        var V1 = pyramidVolume(trapezeSqueareV1, fixedH);
                        var V2 = pyramidVolume(triangleSqueareV2, pyramid2H);

                        return V1 + V2;
                    }

                    function proectionX(vector) {
                        var proectionVector = Object.assign({}, vector);
                        proectionVector.x = 0;
                        return proectionVector;
                    }

                    //=================================START SQUEARS================================


                    /**
                     * function for finding trapeze Squeare
                     * 
                     * Squeare is 1/2 * (a + b) * h
                     * 
                     */
                    function trapezeSqueare(a, b, c, d) {
                        // h is Math.sqrt(c*c - (a-b)*(a-b) +c*c - d*d )

                        var in1 = ((a - b) * (a - b) + c * c - d * d);
                        var ab2 = 2 * (a - b);
                        if (ab2 === 0) {
                            return a * c;
                        }
                        var ab22 = (in1 / ab2) * (in1 / ab2);
                        console.log('IN1!!!', in1);
                        console.log('ab2!!!', ab2);

                        console.log('ab22!!!', ab22);


                        var h = Math.sqrt(c * c - ab22);
                        console.log('trapezeSqueare HHHHHHHHH', h);
                        var squeare = 1 / 2 * h * (a + b);

                        return squeare;
                    }


                    /**
                     * function for finding triangle Squeare
                     * 
                     * 
                     * Squeare is 1/2 * a * h
                     * 
                     */
                    function triangleSqueare(a, b, c) {

                        var p = 1 / 2 * (a + b + c);


                        return Math.sqrt(p * (p - a) * (p - b) * (p - c));


                    }

                    //===================================END SQUEARS==================================



                    //=================================START VOLUEM===================================

                    /**
                     * Pyramid Volume
                     * 
                     * Volume is 1/3 * h
                     * or h * bottomS
                     * 
                     */
                    function pyramidVolume(bottomS, h) {
                        return 1 / 3 * h * bottomS;
                    }
                    function prismaVolume(bottomS, h) {
                        return h * bottomS;
                    }

                    /**
                     * Trancated Pyramid Volume
                     * 
                     * Volume is V= 1/3 * (S1 + sqrt(S1 * S2) + S2)
                     * 
                     */
                    function trancatedPyramidVolume(S1, S2, h) {
                        var V = 0;

                        return 1 / 3 * (S1 + Math.sqrt(S1 * S2) + S2);

                    }

                    /**
                     * Parallelogram Volume
                     */
                    function parallelogramVolume(a, b, c) {
                        return a * b * c;
                    }



                    //=================================END VOLUEM================================










                    var pointsMaterial = new THREE.PointsMaterial({
                        color: 0x0080ff,
                        map: texture,
                        size: 2,
                        alphaTest: 0.5
                    });
                    var points = new THREE.Points(pointsGeometry, pointsMaterial);
                    group.add(points);
                    // convex hull
                    var meshMaterial = new THREE.MeshLambertMaterial({
                        color: 0x0080ff,
                        opacity: 0.3,
                        transparent: true
                    });
                    console.log('pointsGeometry', pointsGeometry);
                    //var meshGeometry = new THREE.ConvexGeometry(pointsGeometry.vertices, faces);
                    var meshGeometry = pointsGeometry;


                    mesh = new THREE.Mesh(meshGeometry, meshMaterial);
                    mesh.material.side = THREE.BackSide; // back faces
                    mesh.renderOrder = 0;
                    group.add(mesh);
                    mesh = new THREE.Mesh(meshGeometry, meshMaterial.clone());
                    mesh.material.side = THREE.FrontSide; // front faces
                    mesh.renderOrder = 1;
                    group.add(mesh);


                    //-------------=================SHAPE 2 ==============-----------------
                    var pointsGeometry2 = new THREE.Geometry();

                    var Shape2 = [


                        new THREE.Vector3(2, 6, -15), //0
                        new THREE.Vector3(1, 0, -15), //1
                        new THREE.Vector3(0, 6, -15), //2
                        new THREE.Vector3(0, 0, -15), //3

                        new THREE.Vector3(9, 3, -3),  //4
                        // new THREE.Vector3(6, 0, -3),  //5 
                        new THREE.Vector3(0, 3, -3),  //6
                        //  new THREE.Vector3(0, 0, -3),  //7



                    ];
                    pointsGeometry2.vertices = Shape2;

                    var pointsMaterial2 = new THREE.PointsMaterial({
                        color: '#FC636B',
                        map: texture,
                        size: 3,
                        alphaTest: 0.6
                    });
                    var points2 = new THREE.Points(pointsGeometry2, pointsMaterial2);
                    group.add(points2);

                    var meshGeometry2 = new THREE.ConvexGeometry(pointsGeometry2.vertices);

                    var meshMaterial2 = new THREE.MeshLambertMaterial({
                        color: '#FC636B',
                        opacity: 0.5,
                        transparent: true
                    });
                    mesh2 = new THREE.Mesh(meshGeometry2, meshMaterial2);
                    mesh2.material.side = THREE.BackSide; // back faces
                    mesh2.renderOrder = 0;
                    //   group.add(mesh2);
                    mesh2 = new THREE.Mesh(meshGeometry2, meshMaterial2.clone());
                    mesh2.material.side = THREE.FrontSide; // front faces
                    mesh2.renderOrder = 1;
                    //  group.add(mesh2);

                    //-------------=================SHAPE 3 ==============-----------------
                    var pointsGeometry3 = new THREE.Geometry();

                    var Shape3 = [


                        // new THREE.Vector3(2, 6, -15), //0
                        new THREE.Vector3(1, 0, -15), //1
                        //  new THREE.Vector3(0, 6, -15), //2
                        new THREE.Vector3(0, 0, -15), //3

                        new THREE.Vector3(6, 3, 0),  //4
                        new THREE.Vector3(6, 0, 0), //5 
                        new THREE.Vector3(0, 3, 0),  //6
                        new THREE.Vector3(0, 0, 0),  //7



                    ];

                    //=======================SHAPE 3 VOLUME===========
                    var bottom3 = [
                        new THREE.Vector3(6, 0, 0),
                        new THREE.Vector3(6, 3, 0)  //4
                        //5 
                    ];

                    var head3 = [
                        new THREE.Vector3(1, 0, -15), //1
                    ]

                    var Volume3 = getVolume(bottom3, head3);
                    console.log('Volume3!!!!!!!', Volume3);


                    pointsGeometry3.vertices = Shape3;

                    var pointsMaterial3 = new THREE.PointsMaterial({
                        color: '#5DB03D',
                        map: texture,
                        size: 3,
                        alphaTest: 0.6
                    });
                    var points3 = new THREE.Points(pointsGeometry3, pointsMaterial3);
                    group.add(points3);

                    var meshGeometry3 = new THREE.ConvexGeometry(pointsGeometry3.vertices);

                    var meshMaterial3 = new THREE.MeshLambertMaterial({
                        color: '#5DB03D',
                        opacity: 0.5,
                        transparent: true
                    });
                    mesh3 = new THREE.Mesh(meshGeometry3, meshMaterial3);
                    mesh3.material.side = THREE.BackSide; // back faces
                    mesh3.renderOrder = 0;
                    group.add(mesh3);
                    mesh3 = new THREE.Mesh(meshGeometry3, meshMaterial3.clone());
                    mesh3.material.side = THREE.FrontSide; // front faces
                    mesh3.renderOrder = 1;
                    group.add(mesh3);

                    console.log('meshGeometry', meshGeometry);
                    window.addEventListener('resize', onWindowResize, false);
                }
                function randomPoint() {
                    return new THREE.Vector3(THREE.Math.randFloat(- 1, 1), THREE.Math.randFloat(- 1, 1), THREE.Math.randFloat(- 1, 1));
                }
                function onWindowResize() {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize($scope.modelSize.width, $scope.modelSize.height);
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














            $scope.show2d = function () {
                if ($scope.model2d)
                    return;
                $scope.model2d = true;
                // Global scene object 
                var scene1;

                // Global camera object 
                var camera1;
                var renderer1;
                // Initialize the scene 
                initializeScene();

                // Render the scene (map the 3D world to the 2D scene) 
                renderScene();

                /** 
    * Initialze the scene. 
    */
                function initializeScene() {
                    // Check whether the browser supports WebGL. If so, instantiate the hardware accelerated 
                    // WebGL renderer. For antialiasing, we have to enable it. The canvas renderer uses 
                    // antialiasing by default. 
                    // The approach of multiple renderers is quite nice, because your scene can also be 
                    // viewed in browsers, which don't support WebGL. The limitations of the canvas renderer 
                    // in contrast to the WebGL renderer will be explained in the tutorials, when there is a 
                    // difference. 
                    if (Detector.webgl) {
                        renderer1 = new THREE.WebGLRenderer({ antialias: true });

                        // If its not supported, instantiate the canvas renderer to support all non WebGL 
                        // browsers 

                    } else {
                        renderer1 = new THREE.CanvasRenderer();

                    }

                    // Set the background color of the renderer to black, with full opacity 
                    renderer1.setClearColor(0x000000, 1);

                    // Get the size of the inner window (content area) to create a full size renderer 
                    var canvasWidth1 = window.innerWidth;
                    var canvasHeight1 = window.innerHeight;

                    // Set the renderers size to the content areas size 
                    renderer1.setSize(1280, 1024);

                    // Get the DIV element from the HTML document by its ID and append the renderers DOM 
                    // object to it 
                    document.getElementById("model2d").appendChild(renderer1.domElement);

                    // Create the scene, in which all objects are stored (e. g. camera, lights, 
                    // geometries, ...) 
                    scene1 = new THREE.Scene();

                    // Now that we have a scene, we want to look into it. Therefore we need a camera. 
                    // Three.js offers three camera types: 
                    //  - PerspectiveCamera (perspective projection) 
                    //  - OrthographicCamera (parallel projection) 
                    //  - CombinedCamera (allows to switch between perspective / parallel projection 
                    //    during runtime) 
                    // In this example we create a perspective camera. Parameters for the perspective 
                    // camera are ... 
                    // ... field of view (FOV), 
                    // ... aspect ratio (usually set to the quotient of canvas width to canvas height) 
                    // ... near and 
                    // ... far. 
                    // Near and far define the cliping planes of the view frustum. Three.js provides an 
                    // example (http://mrdoob.github.com/three.js/examples/ 
                    // -> canvas_camera_orthographic2.html), which allows to play around with these 
                    // parameters. 
                    // The camera is moved 10 units towards the z axis to allow looking to the center of 
                    // the scene. 
                    // After definition, the camera has to be added to the scene. 
                    camera1 = new THREE.PerspectiveCamera(45, canvasWidth1 / canvasHeight1, 1, 100);
                    camera1.position.set(0, 0, 10);
                    camera1.lookAt(scene1.position);
                    scene1.add(camera1);

                    // Create the triangle (or any arbitrary geometry). 
                    // 1. Instantiate the geometry object 
                    // 2. Add the vertices 
                    // 3. Define the faces by setting the vertices indices 
                    var triangleGeometry = new THREE.Geometry();
                    triangleGeometry.vertices = [];
                    for (var i = 0; i < shpangs.shpangs.length; i++) {
                        for (var j = 0; j < shpangs.shpangs[i].length; j++) {
                            triangleGeometry.vertices.push(new THREE.Vector3(-(shpangs.shpangs[i][j].x / 100), -(shpangs.shpangs[i][j].y / 100), -(shpangs.shpangs[i][j].z / 1.3)));
                            //pointsGeometry.vertices.push(new THREE.Vector3((shpangs.shpangs[i][j].x / 100), -(shpangs.shpangs[i][j].y / 100), -(shpangs.shpangs[i][j].z / 1.3)));
                        }
                        for (var j = 0; j < shpangs.shpangs[i].length; j++) {
                            //pointsGeometry.vertices.push(new THREE.Vector3(-(shpangs.shpangs[i][j].x / 100), -(shpangs.shpangs[i][j].y / 100), -(shpangs.shpangs[i][j].z / 1.3)));
                            triangleGeometry.vertices.push(new THREE.Vector3((shpangs.shpangs[i][j].x / 100), -(shpangs.shpangs[i][j].y / 100), -(shpangs.shpangs[i][j].z / 1.3)));
                        }

                    }

                    triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));
                    triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));
                    triangleGeometry.faces.push(new THREE.Face3(1, 4, 5));
                    triangleGeometry.faces.push(new THREE.Face3(3, 4, 5));
                    triangleGeometry.faces.push(new THREE.Face3(3, 1, 2));

                    // To color the surface, a material has to be created. If all faces have the same color, 
                    // the THREE.MeshBasicMaterial fits our needs. It offers a lot of attributes (see 
                    // https://github.com/mrdoob/three.js/blob/master/src/materials/MeshBasicMaterial.js) 
                    // from which we need in this lesson only 'color'. 

                    // Create a white basic material and activate the 'doubleSided' attribute to force the 
                    // rendering of both sides of each face (front and back). This prevents the so called 
                    // 'backface culling'. Usually, only the side is rendered, whose normal vector points 
                    // towards the camera. The other side is not rendered (backface culling). But this 
                    // performance optimization sometimes leads to wholes in the surface. When this happens 
                    // in your surface, simply set 'doubleSided' to 'true'. 
                    var triangleMaterial = new THREE.MeshBasicMaterial({
                        color: 0xFFFFFF,
                        side: THREE.DoubleSide
                    });

                    // Create a mesh and insert the geometry and the material. Translate the whole mesh 
                    // by -1.5 on the x axis and by 4 on the z axis. Finally add the mesh to the scene. 
                    var triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);
                    triangleMesh.position.set(-1.5, 0.0, 4.0);
                    scene1.add(triangleMesh);

                    // The creation of the square is done in the same way as the triangle, except of the 
                    // face definition. Instead of using one THREE.Face3, we have to define two 
                    // THREE.Face3 objects. 
                    // 1. Instantiate the geometry object 
                    // 2. Add the vertices 
                    // 3. Define the faces by setting the vertices indices 
                    var squareGeometry = new THREE.Geometry();
                    squareGeometry.vertices.push(new THREE.Vector3(-1.0, 1.0, 0.0));
                    squareGeometry.vertices.push(new THREE.Vector3(1.0, 1.0, 0.0));
                    squareGeometry.vertices.push(new THREE.Vector3(1.0, -1.0, 0.0));
                    squareGeometry.vertices.push(new THREE.Vector3(-1.0, -1.0, 0.0));
                    squareGeometry.faces.push(new THREE.Face3(0, 1, 2));
                    squareGeometry.faces.push(new THREE.Face3(0, 2, 3));

                    // Create a white basic material and activate the 'doubleSided' attribute. 
                    var squareMaterial = new THREE.MeshBasicMaterial({
                        color: 0xFFFFFF,
                        side: THREE.DoubleSide
                    });

                    // Create a mesh and insert the geometry and the material. Translate the whole mesh 
                    // by 1.5 on the x axis and by 4 on the z axis and add the mesh to the scene. 
                    var squareMesh = new THREE.Mesh(squareGeometry, squareMaterial);
                    squareMesh.position.set(1.5, 0.0, 4.0);
                    scene1.add(squareMesh);

                }
                /** 
    * Render the scene. Map the 3D world to the 2D screen.             */
                function renderScene() {
                    renderer1.render(scene1, camera1);

                }
            }
        }]);
