var THREE = require("three");
var _ = require('lodash');
var async = require('async');
var ShapeMath = require('./shapeMath').ShapeMath;
var OrbitControls = require('../lib/OrbitControls.js');
require("../lib/ConvexGeometry.js");
//var Detector = require("../lib/Detector");
var Stats = require("../lib/stats.min.js");
const MathJS = require('mathjs');
const RandomColors = require('randomcolor');
const FloatMath = require('./FloatMath').FloatMath;
'use strict';

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
function minDistanse(vertex, shapg, previousBottom, previousHead) {


    outArray = [];

    var sortedShapng = _.sortBy(shapg, function (point) {
        return point.y
    })
    var more = _.filter(sortedShapng, function (point) {
        return vertex.y < point.y;
    });
    var less = _.filter(sortedShapng, function (point) {
        return vertex.y > point.y && MathJS.abs(FloatMath.subtract(point.y, vertex.y));
    });
    // more = _.sortBy(more, (point) => {
    //     return [MathJS.abs(FloatMath.subtract(point.y, vertex.y)), distanceVector(vertex, point)];
    // })
    // less = _.sortBy(less, (point) => {
    //     return [MathJS.abs(FloatMath.subtract(point.y, vertex.y)), distanceVector(vertex, point)];
    // })


    if (more.length > 0 && less.length > 0) {


        let moreDistance = MathJS.abs(FloatMath.subtract(more[0].y, vertex.y));
        let lessDistance = MathJS.abs(FloatMath.subtract(less[less.length - 1].y, vertex.y));

        switch (true) {
            case moreDistance.toFixed(3) > lessDistance.toFixed(3):
                outArray.push(less[less.length - 1]);
                break;
            case moreDistance.toFixed(3) < lessDistance.toFixed(3):
                outArray.push(more[0]);
                break;
            case (moreDistance.toFixed(3) === lessDistance.toFixed(3) ||
                (FloatMath.isEqual(
                    distanceVector(vertex, more[0]),
                    distanceVector(vertex, less[less.length - 1])
                ))):

                outArray.push(more[0]);
                outArray.push(less[less.length - 1]);

                break;

            default:
                break;
        }

    } else {
        if (less.length === 0) {
            let minDistances = _.sortBy(shapg, (point) => {
                MathJS.abs(FloatMath.subtract(point.y, vertex.y));
            });
            console.log('FOOOO1111', minDistances);
            console.log('FOOOO1111 vertex', vertex);
            if (FloatMath.isEqual(
                distanceVector(vertex, minDistances[0]),
                distanceVector(vertex, minDistances[1])) ||
                FloatMath.isEqual(
                    MathJS.abs(FloatMath.subtract(minDistances[0].y, vertex.y)),
                    MathJS.abs(FloatMath.subtract(minDistances[1].y, vertex.y))
                )
            ) {
                console.log('FOOOO1111')
                outArray.push(minDistances[0]);
                outArray.push(minDistances[1]);
            } else {
                outArray.push(minDistances[0]);
            }
            console.log('FOOOO1111 outArray', outArray)
        }
        if (more.length === 0) {

            let minDistances = _.sortBy(shapg, (point) => {
                return MathJS.abs(FloatMath.subtract(point.y, vertex.y));
            });
            // minDistances = _.filter(minDistances, () => {

            // })
            // console.log('FOOOO222', minDistances);
            // console.log('FOOOO222 vertex', vertex);
            if (FloatMath.isEqual(
                distanceVector(vertex, minDistances[0]),
                distanceVector(vertex, minDistances[1])) ||
                FloatMath.isEqual(
                    MathJS.abs(FloatMath.subtract(minDistances[0].y, vertex.y)),
                    MathJS.abs(FloatMath.subtract(minDistances[1].y, vertex.y))
                ) ||

                minDistances[0].y === minDistances[1].y

            ) {

                outArray.push(minDistances[0]);
                outArray.push(minDistances[1]);
            } else {
                outArray.push(minDistances[0]);
            }

            console.log('FOOOO222 outArray', outArray)
        }

    }

    return outArray;

}




function proectionX(vector) {
    var proectionVector = Object.assign({}, vector);
    proectionVector.x = 0;
    return new THREE.Vector3(proectionVector.x, proectionVector.y, proectionVector.z);
}

function proectionOnShapng(point, ShpangX) {
    return new THREE.Vector3(point.x, point.y, ShpangX);
};

//=================================START SQUEARS================================


/**
 * function for finding trapeze Squeare
 * 
 * Squeare is 1/2 * (a + b) * h
 * 
 */
function trapezeSqueare(a, b, c, d, caller) {
    // h is Math.sqrt(c*c - (a-b)*(a-b) +c*c - d*d )
    if (b === c && a === 0 && d === 0) {
        return 0;
    }
    if (a > b) {

        var m = b;
        b = a;
        a = m;
    }
    var in1 = ((a - b) * (a - b) + c * c - d * d);
    var ab2 = 2 * (a - b);
    if (ab2 === 0) {
        return a * c;
    }
    var ab22 = (in1 / ab2) * (in1 / ab2);

    var h = Math.sqrt(c * c - ab22);
    var squeare = (h * (a + b)) / 2;

    if (isNaN(squeare)) {
        console.log('caller', caller);
        console.log('a', a)
        console.log('b', b)
        console.log('c', c)
        console.log('d', d)
        console.log('NAN SQUERE')
        squeare = 0;

    }

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

    var p = ((a + b + c)) / 2;


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

    return ((S1 + Math.sqrt(S1 * S2) + S2)) / 3;

}

/**
 * Parallelogram Volume
 */
function parallelogramVolume(a, b, c) {
    return a * b * c;
}

//=====================++!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!=========================
function getCenterPoint(mesh) {
    var middle = new THREE.Vector3();
    var geometry = mesh.geometry;

    geometry.computeBoundingBox();

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    mesh.localToWorld(middle);
    return middle;
}
//=====================++!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!=========================

//=================================END VOLUEM================================


//===================Center Vertex============
function vertexCenter(vertex1, vertex2) {

    var x = (vertex1.x + vertex2.x) / 2;
    var y = (vertex1.y + vertex2.y) / 2;
    var z = (vertex1.z + vertex2.z) / 2;

    return new THREE.Vector3(x, y, z);
}

//===================FUNCTION FOR CREATING NEW SHAPE=========
function addShape(points, paramsObject, callback) {

    if (!points || !paramsObject.createShape) {
        return callback({});
    }
    let checkArray = _.map(points, (point) => {
        return point.x === 0;
    });
    if (checkArray[0] === true && checkArray[1] === true && checkArray[2] === true) {
        paramsObject.visible = false;
    } else {
        paramsObject.visible = true;
    }
    var pointsGeometry = new THREE.Geometry();

    if (paramsObject.mirrored) {
        var mirroredPoints = _.map(points, function (point) {
            return new THREE.Vector3(-point.x, point.y, point.z);
        });
        var newParamsObject = Object.assign({}, paramsObject, { mirrored: false });
        addShape(mirroredPoints, newParamsObject, function () {
            return;
        });
        //points = points.concat(mirroredPoints);
    }
    if (paramsObject.half) {
        var halfPoints = _.map(points, function (point) {
            return proectionX(point);
        })
        points = points.concat(halfPoints);
    }

    pointsGeometry.vertices = points;

    var pointsMaterial = new THREE.PointsMaterial({
        color: points[0].z === -35.21891 ? '#000000' : '#5DB03D',
        map: paramsObject.texture,
        size: 0,
        alphaTest: 0.6
    });
    var points = new THREE.Points(pointsGeometry, pointsMaterial);


    var meshGeometry = new THREE.ConvexGeometry(pointsGeometry.vertices);

    var meshMaterial = new THREE.MeshLambertMaterial({

        color: paramsObject.color ? paramsObject.color : '#5DB03D',
        // color: RandomColors(),
        opacity: paramsObject.transparent ? 0.5 : 0,
        transparent: paramsObject.visible ? false : true,
        // opacity: 0.5,
        // transparent: true
    });

    if (paramsObject.initialTimeout) {
        setTimeout(function () {
            var mesh = new THREE.Mesh(meshGeometry, meshMaterial.clone());

            if (!paramsObject.createShape) {
                return callback({});
            } else {

                paramsObject.group.add(points);

                mesh.material.side = THREE.FrontSide; // front faces
                mesh.renderOrder = 1;
                paramsObject.group.add(mesh);
                return callback({});
            }

        }, paramsObject.initialTimeout);
    } else {
        var mesh = new THREE.Mesh(meshGeometry, meshMaterial.clone());

        if (!paramsObject.createShape) {
            return callback({});
        } else {
            paramsObject.group.add(points);
            mesh.material.side = THREE.FrontSide; // front faces
            mesh.renderOrder = 1;
            paramsObject.group.add(mesh);
            return callback({});
        }
    }

}





function addPoint(point, paramsObject) {
    if (!point || !paramsObject.createShape) {
        return;
    }
    var pointsGeometry = new THREE.Geometry();

    pointsGeometry.vertices = [point];

    var pointsMaterial = new THREE.PointsMaterial({
        color: '#ad0808',
        map: paramsObject.texture,
        size: 1.3,
        alphaTest: 0.6
    });
    var points = new THREE.Points(pointsGeometry, pointsMaterial);


    return paramsObject.group.add(points);

}

function editingMassCenters(massCenter, volume) {

    let out = {
        firstPartMassCenter_X: massCenter.massCenter1.x * volume.Volume1 + massCenter.massCenter2.x * volume.Volume2 + massCenter.massCenter3.x * volume.Volume3,
        firstPartMassCenter_Y: massCenter.massCenter1.y * volume.Volume1 + massCenter.massCenter2.y * volume.Volume2 + massCenter.massCenter3.y * volume.Volume3,
        firstPartMassCenter_Z: massCenter.massCenter1.z * volume.Volume1 + massCenter.massCenter2.z * volume.Volume2 + massCenter.massCenter3.z * volume.Volume3
    }
    out.middlePoint = new THREE.Vector3(out.firstPartMassCenter_X / volume.sum, out.firstPartMassCenter_Y / volume.sum, out.firstPartMassCenter_Z / volume.sum)
    return out;

}






function getProectionOnLine(point1, point2, point3) {

    return ((point3.y - point1.y) / (point2.y - point1.y)) * (point2.x - point1.x) + point1.x;
}
function BuildVolume(paramsObject) {
    return new Promise(function (resolve, reject) {
        var initialTimeout = paramsObject.initialTimeout;
        var mirrored = paramsObject.mirrored;
        var firstPartMassCenter_X = 0;
        var firstPartMassCenter_Y = 0;
        var firstPartMassCenter_Z = 0;

        // Outer Voleme Intitalize
        var outerVolume = 0;

        //Initialize Global iterator 
        var asyncI = 0;

        async.eachSeries(paramsObject.simpleShpangs, function (thisShpang, eachCallback1) {
            //Initialize iterator for this iteration
            var asyncJ = 0;
            var middleVolume = 0;
            if (asyncI === 0) {
                asyncI++;
                return eachCallback1();
            }
            var beforeShapng = paramsObject.simpleShpangs[asyncI - 1];
            if (thisShpang.length > beforeShapng.length) {

                async.eachSeries(thisShpang, function (thisPoint, eachCallback2) {
                    if (asyncJ === 0) {
                        asyncJ++;
                        return eachCallback2();
                    }
                    var beforePoint = thisShpang[asyncJ - 1];


                    var beforeShapngIndex = asyncJ - 1;
                    if (asyncJ >= beforeShapng.length) {
                        beforeShapngIndex = beforeShapng.length - 1;
                    }

                    var bottom = [beforePoint, thisPoint];

                    var centerPoint = vertexCenter(proectionOnShapng(beforePoint, paramsObject.Ship.base[asyncI].ShpangX), proectionOnShapng(thisPoint, paramsObject.Ship.base[asyncI].ShpangX));

                    var minDisArray = minDistanse(centerPoint, beforeShapng);

                    var head = [minDisArray[0]];
                    if (minDisArray[1] && asyncJ >= beforeShapng.length - 1) {
                        head = [minDisArray[1]];
                    }

                    var shape;
                    if (paramsObject.createShape) {
                        shape = bottom.concat(head);
                    }



                    var volume = ShapeMath.Volume.getVolume(bottom, head, paramsObject);
                    middleVolume += volume.sum;
                    if (volume.firstAnsaver) {
                        middleVolume += volume.firstAnsaver.sum;
                    }

                    paramsObject.visible = true;
                    if (volume.sum === 0) {
                        paramsObject.visible = false;
                    }

                    addShape(shape, paramsObject, function (massCenter) {

                        massCenter = ShapeMath.getMassCenter(bottom, head);

                        let newPart = editingMassCenters(massCenter, volume);
                        //console.log('newPart', newPart);
                        // addPoint(newPart.middlePoint, paramsObject);

                        firstPartMassCenter_X += newPart.firstPartMassCenter_X;

                        firstPartMassCenter_Y += newPart.firstPartMassCenter_Y;

                        firstPartMassCenter_Z += newPart.firstPartMassCenter_Z;

                        if (asyncJ >= beforeShapng.length) {

                            asyncJ++;
                            eachCallback2();
                        } else {
                            var bottom2 = [beforeShapng[asyncJ - 1], beforeShapng[asyncJ - 0]];

                            var centerPoint = vertexCenter(proectionOnShapng(beforeShapng[asyncJ - 1], paramsObject.Ship.base[asyncI - 1].ShpangX), proectionOnShapng(beforeShapng[asyncJ - 0], paramsObject.Ship.base[asyncI - 1].ShpangX));

                            var minDisArray2 = minDistanse(centerPoint, thisShpang, bottom, head);
                            var head2 = [minDisArray2[0]];

                            if (minDisArray2[1] && asyncJ < beforeShapng.length - 1) {
                                if (minDisArray[0].y !== minDisArray2[1].y) {
                                    head2 = [minDisArray2[1]];
                                }
                            }

                            var shape2;
                            if (paramsObject.createShape) {
                                shape2 = bottom2.concat(head2);
                            }

                            var volume2 = ShapeMath.Volume.getVolume(bottom2, head2, paramsObject);
                            middleVolume += volume2.sum;
                            if (volume2.firstAnsaver) {
                                middleVolume += volume2.firstAnsaver.sum;
                            }

                            paramsObject.visible = true;
                            if (volume2.sum === 0) {
                                paramsObject.visible = false;
                            }

                            addShape(shape2, paramsObject, function (massCenter2) {

                                massCenter2 = ShapeMath.getMassCenter(bottom2, head2);

                                let newPart2 = editingMassCenters(massCenter2, volume2);
                                // console.log('newPart2', newPart2);
                                // addPoint(newPart2.middlePoint, paramsObject);

                                firstPartMassCenter_X += newPart2.firstPartMassCenter_X;

                                firstPartMassCenter_Y += newPart2.firstPartMassCenter_Y;

                                firstPartMassCenter_Z += newPart2.firstPartMassCenter_Z;

                                asyncJ++;
                                eachCallback2();
                            });
                        }


                    });


                }, function (err) {
                    if (!err) {
                        outerVolume += middleVolume;
                        asyncI++;
                        eachCallback1();
                    }
                });
            } else {
                async.eachSeries(beforeShapng, function (thisPoint, eachCallback2) {

                    if (asyncJ === 0) {
                        asyncJ++;
                        return eachCallback2();
                    }
                    var beforePoint = beforeShapng[asyncJ - 1];


                    var bottom = [beforePoint, thisPoint];
                    var centerPoint = vertexCenter(proectionOnShapng(beforePoint, paramsObject.Ship.base[asyncI - 1].ShpangX), proectionOnShapng(thisPoint, paramsObject.Ship.base[asyncI - 1].ShpangX));

                    var minDisArray = minDistanse(centerPoint, thisShpang);

                    var head = [minDisArray[0]];
                    if (minDisArray[1] && asyncJ >= thisShpang.length - 1) {

                        head = [minDisArray[1]];
                    }

                    var shape;
                    if (paramsObject.createShape) {
                        var shape = bottom.concat(head);
                    }

                    var volume = ShapeMath.Volume.getVolume(bottom, head, paramsObject);
                    middleVolume += volume.sum;

                    if (volume.firstAnsaver) {
                        middleVolume += volume.firstAnsaver.sum;
                    }

                    paramsObject.visible = true;

                    if (volume.sum === 0) {
                        paramsObject.visible = false;
                    }

                    addShape(shape, paramsObject, function (massCenter) {

                        massCenter = ShapeMath.getMassCenter(bottom, head);
                        let newPart = editingMassCenters(massCenter, volume);
                        //console.log('newPart', newPart);
                        // addPoint(newPart.middlePoint, paramsObject);

                        firstPartMassCenter_X += newPart.firstPartMassCenter_X;

                        firstPartMassCenter_Y += newPart.firstPartMassCenter_Y;

                        firstPartMassCenter_Z += newPart.firstPartMassCenter_Z;

                        if (asyncJ >= thisShpang.length) {
                            asyncJ++;
                            eachCallback2();
                        } else {
                            var bottom2 = [thisShpang[asyncJ - 1], thisShpang[asyncJ - 0]];

                            var centerPoint = vertexCenter(proectionOnShapng(thisShpang[asyncJ - 1], paramsObject.Ship.base[asyncI].ShpangX), proectionOnShapng(thisShpang[asyncJ - 0], paramsObject.Ship.base[asyncI].ShpangX));

                            var minDisArray2 = minDistanse(centerPoint, beforeShapng, bottom, head);
                            var head2 = [minDisArray2[0]];

                            if (minDisArray2[1] && asyncJ < thisShpang.length - 1) {
                                if (minDisArray[0].y !== minDisArray2[1].y) {
                                    head2 = [minDisArray2[1]];
                                }
                            }



                            var shape2;
                            if (paramsObject.createShape) {
                                var shape2 = bottom2.concat(head2);
                            }

                            var volume2 = ShapeMath.Volume.getVolume(bottom2, head2, paramsObject);
                            middleVolume += volume2.sum;
                            if (volume2.firstAnsaver) {
                                middleVolume += volume2.firstAnsaver.sum;
                            }

                            paramsObject.visible = true;
                            if (volume2.sum === 0) {
                                paramsObject.visible = false;
                            }

                            addShape(shape2, paramsObject, function (massCenter2) {

                                massCenter2 = ShapeMath.getMassCenter(bottom2, head2);
                                let newPart2 = editingMassCenters(massCenter2, volume2);
                                // console.log('newPart2', newPart2);
                                // addPoint(newPart2.middlePoint, paramsObject);

                                firstPartMassCenter_X += newPart2.firstPartMassCenter_X;

                                firstPartMassCenter_Y += newPart2.firstPartMassCenter_Y;

                                firstPartMassCenter_Z += newPart2.firstPartMassCenter_Z;

                                asyncJ++;
                                eachCallback2();
                            });
                        }

                    });


                }, function (err) {
                    if (!err) {
                        outerVolume += middleVolume;
                        asyncI++;
                        eachCallback1();
                    }
                });
            }


        }, function (err) {
            if (!err) {
                //   console.log('GREAT!!!!!!!!!! VOLUEM=', outerVolume * 2);
                //   console.log('GREAT!!!!!!!!!!TONN VOLUEM=', outerVolume * 2 * paramsObject.water);
                var outerTonn = outerVolume * 2 * paramsObject.water;
                var outer = outerVolume * 2;

                var RealMassCenter_L_X = firstPartMassCenter_X / outerVolume;
                var RealMassCenter_L_Y = firstPartMassCenter_Y / outerVolume;
                var RealMassCenter_L_Z = firstPartMassCenter_Z / outerVolume;

                var RealMassCenter_R_X = - RealMassCenter_L_X;
                var RealMassCenter_R_Y = RealMassCenter_L_Y;
                var RealMassCenter_R_Z = RealMassCenter_L_Z;

                var RealMassCenter_X = (RealMassCenter_L_X * outerVolume + RealMassCenter_R_X * outerVolume) / outer;
                var RealMassCenter_Y = (RealMassCenter_L_Y * outerVolume + RealMassCenter_R_Y * outerVolume) / outer;
                var RealMassCenter_Z = (RealMassCenter_L_Z * outerVolume + RealMassCenter_R_Z * outerVolume) / outer;

                var massCenter = new THREE.Vector3(RealMassCenter_X, RealMassCenter_Y, RealMassCenter_Z);
                console.log('massCenter', massCenter);
                addPoint(massCenter, paramsObject);

                resolve({
                    TonnVolume: outerTonn,
                    Volume: outer,
                    MassCenter: massCenter,
                    filter: paramsObject.filter,
                    different: paramsObject.different,
                    filteredMassCenter: paramsObject.filteredMassCenter,
                    FilteredPlaneSquere: paramsObject.FilteredPlaneSquere,
                    group: paramsObject.group,
                    Tw: paramsObject.Tw.y,
                    Tf: paramsObject.Tf.y,
                    Ta: paramsObject.Ta.y,
                    TfTa: FloatMath.subtract(paramsObject.Tf.y, paramsObject.Ta.y),
                    initialPlusX: paramsObject.initialPlusX,
                    newfilteredSquere: paramsObject.newfilteredSquere * 2,
                    newMassCenter: paramsObject.newMassCenter,
                    defaultPoint: paramsObject.defaultPoint,
                    defaultPointArray: paramsObject.defaultPointArray
                });
            } else {
                reject(err);
            }
        });
    });
}

function scale(shapng, k) {
    let shpangSqueare = 0;
    var FilteredPlaneMassCenter_X = 0;
    var FilteredPlaneMassCenter_Y = 0;
    var FilteredPlaneMassCenter_Z = 0;
    // find Shapng Center 
    for (var i = 1; i < shapng.length; i++) {


        let thisPoint = shapng[i];
        let previousPoint = shapng[i - 1];
        let thisProection = proectionX(thisPoint);
        let previousProection = proectionX(previousPoint);

        let triangleMassCenter1 = ShapeMath.triangleMassCenter(thisPoint, previousPoint, previousProection);
        let triangleMassCenter2 = ShapeMath.triangleMassCenter(thisPoint, thisProection, previousProection);

        let triangleSqueare1 = ShapeMath.Squeare.Triangle(
            ShapeMath.distanceVector(thisPoint, previousPoint),
            ShapeMath.distanceVector(previousPoint, previousProection),
            ShapeMath.distanceVector(previousProection, thisPoint)
        );
        let triangleSqueare2 = ShapeMath.Squeare.Triangle(
            ShapeMath.distanceVector(thisPoint, thisProection),
            ShapeMath.distanceVector(thisProection, previousProection),
            ShapeMath.distanceVector(previousProection, thisPoint)
        );

        shpangSqueare += triangleSqueare1 + triangleSqueare2;

        FilteredPlaneMassCenter_X += triangleMassCenter1.x * triangleSqueare1 + triangleMassCenter2.x * triangleSqueare2;
        FilteredPlaneMassCenter_Y += triangleMassCenter1.y * triangleSqueare1 + triangleMassCenter2.y * triangleSqueare2;
        FilteredPlaneMassCenter_Z += triangleMassCenter1.z * triangleSqueare1 + triangleMassCenter2.z * triangleSqueare2;
    }

    var RealMassCenter_L_X = FloatMath.divide(FilteredPlaneMassCenter_X, shpangSqueare);
    var RealMassCenter_L_Y = FloatMath.divide(FilteredPlaneMassCenter_Y, shpangSqueare);
    var RealMassCenter_L_Z = FloatMath.divide(FilteredPlaneMassCenter_Z, shpangSqueare);

    var RealMassCenter_R_X = - RealMassCenter_L_X;
    var RealMassCenter_R_Y = RealMassCenter_L_Y;
    var RealMassCenter_R_Z = RealMassCenter_L_Z;

    var RealMassCenter_X = (RealMassCenter_L_X * shpangSqueare + RealMassCenter_R_X * shpangSqueare) / (shpangSqueare * 2);
    var RealMassCenter_Y = (RealMassCenter_L_Y * shpangSqueare + RealMassCenter_R_Y * shpangSqueare) / (shpangSqueare * 2);
    var RealMassCenter_Z = (RealMassCenter_L_Z * shpangSqueare + RealMassCenter_R_Z * shpangSqueare) / (shpangSqueare * 2);

    var center = new THREE.Vector3(RealMassCenter_X, RealMassCenter_Y, RealMassCenter_Z);

    //console.log('center', center);

    let out = _.map(shapng, (point) => {
        return new THREE.Vector3(
            point.x === 0 ? point.x : (point.x - center.x) * k + center.x,
            (point.y - center.y) * k + center.y,

            (point.z - center.z) * k + center.z
        );
    });

    return out;



}


function buildPlane(shpangsForWork, paramsObject, options) {
    options = options ? options : {

    };
    let FilteredPlane = [];
    let ShpangsForFilter = JSON.parse(JSON.stringify(shpangsForWork));
    let defaultPoint = options.defaultPoint ? options.defaultPoint : new THREE.Vector3();


    var FilteredShpangs = _.compact(_.map(ShpangsForFilter, function (spang) {

        // add initialPlusX if exists
        if (paramsObject.initialPlusX) {
            //  spang = scale(spang, paramsObject.initialPlusX);
        }
        var PlusShpangs = spang;
        // filtered if exists
        var midddleShpang = PlusShpangs;
        if (paramsObject.filter) {
            var filterY = paramsObject.filter;

            var p1 = new THREE.Vector3(defaultPoint.x, paramsObject.filter, defaultPoint.z + 1);
            var p2 = new THREE.Vector3(defaultPoint.x, paramsObject.filter, defaultPoint.z);
            var p3 = new THREE.Vector3(defaultPoint.x + 1, paramsObject.filter, defaultPoint.z);

            if ((paramsObject.different || paramsObject.different === 0)) {

                var differentTan = Math.tan(ShapeMath.getRad(paramsObject.different));
                var newZ = FloatMath.multiply(differentTan, 1);
                p1.y = paramsObject.filter + newZ;
                // p1 = new THREE.Vector3(defaultPoint.x,, 1);
                filterY = ShapeMath.returnYbyLine(p1, p2, spang[0].z);
            }

            if (options.up) {
                midddleShpang = _.filter(PlusShpangs, function (point) {
                    return point.y >= filterY;
                });
                var underBottomIndex = _.findLastIndex(PlusShpangs, function (point) {
                    return point.y <= filterY;
                });

                if (spang[underBottomIndex] && midddleShpang.length > 0 && midddleShpang.length !== spang.length) {

                    var proectionPoint = ShapeMath.intersectionPlaneLine([p1, p2, p3], [spang[underBottomIndex], midddleShpang[0]]);
                    midddleShpang.push(proectionPoint);
                }
            } else {
                midddleShpang = _.filter(PlusShpangs, function (point) {
                    return point.y <= filterY;
                });
                if (spang[midddleShpang.length] && midddleShpang.length > 0 && midddleShpang.length !== spang.length) {

                    var proectionPoint = ShapeMath.intersectionPlaneLine([p1, p2, p3], [spang[midddleShpang.length], spang[midddleShpang.length - 1]]);
                    midddleShpang.push(proectionPoint);

                }
                // else {
                //     if (midddleShpang.length === 0) {
                //         midddleShpang.push(spang[spang.length - 1]);
                //     }
                // }
            }
        }
        midddleShpang = _.sortBy(midddleShpang, 'y');
        //var out = _.reverse(midddleShpang);
        var out = midddleShpang;

        FilteredPlane.push(_.last(midddleShpang));

        if (midddleShpang.length > 0) {
            return out;
        } else {
            return false;
        }

    }));
    var FilteredPlaneMassCenter_X = 0;
    var FilteredPlaneMassCenter_Y = 0;
    var FilteredPlaneMassCenter_Z = 0;

    var FilteredPlaneSquere = 0;

    FilteredPlane = _.map(_.compact(FilteredPlane), (point) => {
        point.y = MathJS.round(point.y, 3);
        return point
    });
    console.log('FilteredPlane', FilteredPlane);

    for (var i = 1; i < FilteredPlane.length; i++) {


        let thisPoint = FilteredPlane[i];
        let previousPoint = FilteredPlane[i - 1];
        let thisProection = proectionX(thisPoint);
        let previousProection = proectionX(previousPoint);

        let triangleMassCenter1 = ShapeMath.triangleMassCenter(thisPoint, previousPoint, previousProection);
        let triangleMassCenter2 = ShapeMath.triangleMassCenter(thisPoint, thisProection, previousProection);

        let triangleSqueare1 = ShapeMath.Squeare.Triangle(
            ShapeMath.distanceVector(thisPoint, previousPoint),
            ShapeMath.distanceVector(previousPoint, previousProection),
            ShapeMath.distanceVector(previousProection, thisPoint)
        );
        let triangleSqueare2 = ShapeMath.Squeare.Triangle(
            ShapeMath.distanceVector(thisPoint, thisProection),
            ShapeMath.distanceVector(thisProection, previousProection),
            ShapeMath.distanceVector(previousProection, thisPoint)
        );
        let middleSquere = FloatMath.add(
            triangleSqueare1,
            triangleSqueare2
        )

        FilteredPlaneSquere = FloatMath.add(
            FilteredPlaneSquere,
            middleSquere
        );


        let middleMassCenterHead_X = FloatMath.add(
            FloatMath.multiply(
                triangleMassCenter1.x,
                triangleSqueare1
            ),
            FloatMath.multiply(
                triangleMassCenter2.x,
                triangleSqueare2
            )
        );
        let middleMassCenterHead_Y = FloatMath.add(
            FloatMath.multiply(
                triangleMassCenter1.y,
                triangleSqueare1
            ),
            FloatMath.multiply(
                triangleMassCenter2.y,
                triangleSqueare2
            )
        );
        let middleMassCenterHead_Z = FloatMath.add(
            FloatMath.multiply(
                triangleMassCenter1.z,
                triangleSqueare1
            ),
            FloatMath.multiply(
                triangleMassCenter2.z,
                triangleSqueare2
            )
        );


        FilteredPlaneMassCenter_X = FloatMath.add(
            FilteredPlaneMassCenter_X,
            middleMassCenterHead_X
        );
        FilteredPlaneMassCenter_Y = FloatMath.add(
            FilteredPlaneMassCenter_Y,
            middleMassCenterHead_Y
        );
        FilteredPlaneMassCenter_Z = FloatMath.add(
            FilteredPlaneMassCenter_Z,
            middleMassCenterHead_Z
        );
        let midddleMassCenter = new THREE.Vector3(
            FloatMath.divide(
                middleMassCenterHead_X,
                middleSquere
            ),
            FloatMath.divide(
                middleMassCenterHead_Y,
                middleSquere
            ),
            FloatMath.divide(
                middleMassCenterHead_Z,
                middleSquere
            )
        );
        if (!options.up)
            addPoint(midddleMassCenter, paramsObject);


    }

    if (!options.up) {
        let asyncI = 0;
        async.eachSeries(FilteredPlane, (thisPoint, eachCallback) => {
            if (asyncI === 0) {
                asyncI++;
                eachCallback();
            } else {

                setTimeout(() => {
                    let shape = [
                        FilteredPlane[asyncI - 1],
                        thisPoint,
                        proectionX(FilteredPlane[asyncI - 1]),
                        proectionX(thisPoint)
                    ];
                    let arr1 = [1, 2, 3, 4, 5, 3, 3, 4, 9, 9, 0, 8];

                    let ar2 = _.uniqBy(shape, (p1) => {
                        return p1.z + ' ' + p1.x
                    });
                    console.log('ar2', ar2);
                    shape = _.uniqBy(shape, (p1) => {
                        return p1.z + ' ' + p1.x
                    });
                    console.log('SHAPE', shape);
                    addShape(shape, paramsObject, () => {

                        eachCallback();
                    });
                    asyncI++

                }, 1000);



            }

        }, () => {

        });
    }
    var RealMassCenter_L_X = FloatMath.divide(FilteredPlaneMassCenter_X, FilteredPlaneSquere);
    var RealMassCenter_L_Y = FloatMath.divide(FilteredPlaneMassCenter_Y, FilteredPlaneSquere);
    var RealMassCenter_L_Z = FloatMath.divide(FilteredPlaneMassCenter_Z, FilteredPlaneSquere);

    var RealMassCenter_R_X = - RealMassCenter_L_X;
    var RealMassCenter_R_Y = RealMassCenter_L_Y;
    var RealMassCenter_R_Z = RealMassCenter_L_Z;

    var RealMassCenter_X = (RealMassCenter_L_X * FilteredPlaneSquere + RealMassCenter_R_X * FilteredPlaneSquere) / (FilteredPlaneSquere * 2);
    var RealMassCenter_Y = (RealMassCenter_L_Y * FilteredPlaneSquere + RealMassCenter_R_Y * FilteredPlaneSquere) / (FilteredPlaneSquere * 2);
    var RealMassCenter_Z = (RealMassCenter_L_Z * FilteredPlaneSquere + RealMassCenter_R_Z * FilteredPlaneSquere) / (FilteredPlaneSquere * 2);

    var massCenter = new THREE.Vector3(RealMassCenter_X, RealMassCenter_Y, RealMassCenter_Z);
    if (options.addMassCenter) {
        addPoint(massCenter, paramsObject);
    }


    // RESULT!!!!!!!!!!!!!!!!!!!!!!
    return ({
        Squeare: FilteredPlaneSquere * 2,
        massCenter: massCenter,
        FilteredShpangs: FilteredShpangs
    })
}

function build(paramsObject) {

    return new Promise(function (resolve, reject) {
        //  paramsObject.group = new THREE.Group(paramsObject.group);
        paramsObject.Ship.shpangs = _.map(paramsObject.Ship.shpangs, function (shpang) {
            return _.sortBy(shpang, 'y');
        });
        if (!paramsObject.different) {
            paramsObject.different = 0;
        }
        if (paramsObject.ShipMassCenter) {
            addPoint(paramsObject.ShipMassCenter, paramsObject);
        }
        var shpangsForWork = JSON.parse(JSON.stringify(paramsObject.Ship.shpangs));


        //if different we must find mass center of waterline Square 
        var defaultPoint = new THREE.Vector3(0, 0, 0);
        if ((paramsObject.different || paramsObject.different === 0) && paramsObject.filter && !paramsObject.defaultPoint) {

            let filteredPlaneWithoutDifferent = buildPlane(shpangsForWork, Object.assign({}, paramsObject, { different: 0 }));
            defaultPoint = filteredPlaneWithoutDifferent.massCenter;
            paramsObject.defaultPoint = defaultPoint;


        } else {
            if (paramsObject.defaultPoint) {
                defaultPoint = new THREE.Vector3(paramsObject.defaultPoint.x, paramsObject.defaultPoint.y, paramsObject.defaultPoint.z);
            }
        }
        paramsObject.defaultPointArray = paramsObject.defaultPointArray ? paramsObject.defaultPointArray : [];
        paramsObject.defaultPointArray.push(defaultPoint);
        // if (paramsObject.UpDown) {
        //     console.log('filteredPlaneWithoutDifferent', filteredPlaneWithoutDifferent)
        //     console.log('shpangsForWork', shpangsForWork)
        // }

        // at first create reverse array of shpangs

        var newFilteredPlane = [];

        let filteredPlaneWithDifferent = buildPlane(
            shpangsForWork,
            paramsObject,
            {
                defaultPoint: defaultPoint
            });


        var simpleShpangs1 = filteredPlaneWithDifferent.FilteredShpangs;

        paramsObject.filteredMassCenter = filteredPlaneWithDifferent.massCenter;
        paramsObject.FilteredPlaneSquere = filteredPlaneWithDifferent.Squeare;
        paramsObject.newfilteredSquere = filteredPlaneWithDifferent.Squeare;
        paramsObject.newMassCenter = filteredPlaneWithDifferent.massCenter;
        //-------------------------START GET TW, TA, TF-----------
        if (paramsObject.filter) {
            var p1 = new THREE.Vector3(defaultPoint.x, paramsObject.filter, defaultPoint.z + 1);
            var p2 = new THREE.Vector3(defaultPoint.x, paramsObject.filter, defaultPoint.z);
            var p3 = new THREE.Vector3(defaultPoint.x + 1, paramsObject.filter, defaultPoint.z);
            if (paramsObject.different) {
                var differentTan = Math.tan(ShapeMath.getRad(paramsObject.different));
                var newZ = FloatMath.multiply(differentTan, 1);
                p1.y = paramsObject.filter + newZ;
                //p1 = new THREE.Vector3(0, paramsObject.filter + newZ, 1);
            }
            console.log('defaultPoint', defaultPoint);

            paramsObject.Tw = ShapeMath.intersectionPlaneLine([
                p1,
                p2,
                p3
            ], [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, paramsObject.filter, 0),

                ]);
            paramsObject.Tf = ShapeMath.intersectionPlaneLine([
                p1,
                p2,
                p3
            ], [
                    new THREE.Vector3(0, 0, FloatMath.divide(paramsObject.Ship.Length, 2)),
                    new THREE.Vector3(0, paramsObject.filter, FloatMath.divide(paramsObject.Ship.Length, 2)),

                ]);
            paramsObject.Ta = ShapeMath.intersectionPlaneLine([
                p1,
                p2,
                p3
            ], [
                    new THREE.Vector3(0, 0, -FloatMath.divide(paramsObject.Ship.Length, 2)),
                    new THREE.Vector3(0, paramsObject.filter, -FloatMath.divide(paramsObject.Ship.Length, 2)),

                ]);

        }
        //-------------------------END GET TW, TA, TF-----------

        if (paramsObject.UpDown) {
            let UpfilteredPlaneWithDifferent = buildPlane(
                shpangsForWork,
                paramsObject,
                {
                    defaultPoint: defaultPoint,
                    up: true
                });
            var simpleShpangs2 = UpfilteredPlaneWithDifferent.FilteredShpangs;

            Promise.all([
                BuildVolume(Object.assign({}, {

                    simpleShpangs: simpleShpangs1,
                    color: '#770406'
                }, paramsObject)),
                BuildVolume(Object.assign({}, {

                    color: '#51565e',
                    simpleShpangs: simpleShpangs2
                }, paramsObject)),
            ]).then(function (result) {
                //result.resultShpangs = paramsObject.simpleShpangs;
                resolve(result);
            }).catch((err) => {
                console.log('err');
                reject(err);
            });
        } else {
            paramsObject.simpleShpangs = simpleShpangs1;
            //create model 
            BuildVolume(paramsObject)
                .then(function (result) {
                    //  result.resultShpangs = paramsObject.simpleShpangs;
                    resolve(result);
                }).catch((err) => {
                    console.log('err');
                    reject(err);
                });
        }


    });

}

exports.build = build;
exports.minDistanse = minDistanse;
