var THREE = require("three");
var _ = require('lodash');
var async = require('async');
var ShapeMath = require('./shapeMath').ShapeMath;
var OrbitControls = require('../lib/OrbitControls.js');
require("../lib/ConvexGeometry.js");
//var Detector = require("../lib/Detector");
var Stats = require("../lib/stats.min.js");
const MathJS = require('mathjs');
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
function minDistanse(vertex, shapg, shpangX) {


    outArray = [];
    var i = 0
    var sortedShapng = _.sortBy(shapg, function (point) {
        return point.y;
    })
    var more = _.filter(sortedShapng, function (point) {
        return vertex.y < point.y;
    });
    var less = _.filter(sortedShapng, function (point) {
        return vertex.y >= point.y;
    });

    if (more.length > 0 && less.length > 0) {


        var moreDistance = Math.abs(Math.round((more[0].y - vertex.y) * 1e12) / 1e12);
        var lessDistance = Math.abs(Math.round((less[less.length - 1].y - vertex.y) * 1e12) / 1e12);

        switch (true) {
            case moreDistance.toFixed(3) > lessDistance.toFixed(3):
                outArray.push(less[less.length - 1]);
                break;
            case moreDistance.toFixed(3) < lessDistance.toFixed(3):
                outArray.push(more[0]);
                break;
            case moreDistance.toFixed(3) === lessDistance.toFixed(3) || (distanceVector(vertex, more[0]) === distanceVector(vertex, less[less.length - 1])):
                outArray.push(more[0]);
                outArray.push(less[less.length - 1]);
                // console.log('GOVNOOOOOOO')
                break;

            default:
                break;
        }

    } else {
        if (less.length > 0) {
            outArray.push(less[less.length - 1]);
        }
        if (more.length > 0) {
            outArray.push(more[0]);
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
        color: '#5DB03D',
        map: paramsObject.texture,
        size: 0,
        alphaTest: 0.6
    });
    var points = new THREE.Points(pointsGeometry, pointsMaterial);


    var meshGeometry = new THREE.ConvexGeometry(pointsGeometry.vertices);

    var meshMaterial = new THREE.MeshLambertMaterial({

        color: paramsObject.color ? paramsObject.color : '#5DB03D',
        opacity: paramsObject.transparent ? 0.5 : 0,
        transparent: paramsObject.transparent ? true : paramsObject.visible ? false : true,
        // opacity: 0.5,
        // transparent: true
    });

    if (paramsObject.initialTimeout) {
        setTimeout(function () {
            var mesh = new THREE.Mesh(meshGeometry, meshMaterial.clone());
            var massCenterPoint = getCenterPoint(mesh);
            if (!paramsObject.createShape) {
                return callback(massCenterPoint);
            } else {

                //  paramsObject.group.add(points);

                mesh.material.side = THREE.FrontSide; // front faces
                mesh.renderOrder = 1;
                paramsObject.group.add(mesh);
                return callback(massCenterPoint);
            }

        }, paramsObject.initialTimeout);
    } else {
        var mesh = new THREE.Mesh(meshGeometry, meshMaterial.clone());
        var massCenterPoint = getCenterPoint(mesh);
        if (!paramsObject.createShape) {
            return callback(massCenterPoint);
        } else {
            // paramsObject.group.add(points);
            mesh.material.side = THREE.FrontSide; // front faces
            mesh.renderOrder = 1;
            paramsObject.group.add(mesh);
            return callback(massCenterPoint);
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
        size: 3,
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

                    var minDisArray = minDistanse(centerPoint, beforeShapng, paramsObject.Ship.base[asyncI - 1].ShpangX);

                    var head = [minDisArray[0]];

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

                            var minDisArray2 = minDistanse(centerPoint, thisShpang, paramsObject.Ship.base[asyncI].ShpangX);
                            var head2 = [minDisArray2[0]];

                            if (minDisArray2[1]) {
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

                    var minDisArray = minDistanse(centerPoint, thisShpang, paramsObject.Ship.base[asyncI - 1].ShpangX);

                    var head = [minDisArray[0]];

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

                            var minDisArray2 = minDistanse(centerPoint, beforeShapng, paramsObject.Ship.base[asyncI - 1].ShpangX);
                            var head2 = [minDisArray2[0]];

                            if (minDisArray2[1]) {
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
                    TfTa: ShapeMath.FloatMath().subtract(paramsObject.Tf.y, paramsObject.Ta.y),
                    initialPlusX: paramsObject.initialPlusX,
                    newfilteredSquere: paramsObject.newfilteredSquere * 2,
                    newMassCenter: paramsObject.newMassCenter

                });
            } else {
                reject(err);
            }
        });
    });
}


function buildPlane(shpangsForWork, paramsObject, options) {
    options = options ? options : {

    };
    let FilteredPlane = [];
    let ShpangsForFilter = JSON.parse(JSON.stringify(shpangsForWork));
    let defaultPoint = options.defaultPoint ? options.defaultPoint : new THREE.Vector3();


    var FilteredShpangs = _.compact(_.map(ShpangsForFilter, function (spang) {
        var PlusShpangs = spang;
        // add initialPlusX if exists
        if (paramsObject.initialPlusX) {
            PlusShpangs = _.map(spang, function (point) {
                if (point.x !== 0) {
                    point.x = ShapeMath.FloatMath().add(paramsObject.initialPlusX, point.x);
                }
                return point;
            });
        }

        // filtered if exists
        var midddleShpang = PlusShpangs;
        if (paramsObject.filter) {
            var filterY = paramsObject.filter;

            var p1 = new THREE.Vector3(defaultPoint.x, paramsObject.filter, defaultPoint.z + 1);
            var p2 = new THREE.Vector3(defaultPoint.x, paramsObject.filter, defaultPoint.z);
            var p3 = new THREE.Vector3(defaultPoint.x + 1, paramsObject.filter, defaultPoint.z);

            if ((paramsObject.different || paramsObject.different === 0)) {

                var differentTan = Math.tan(ShapeMath.getRad(paramsObject.different));
                var newZ = ShapeMath.FloatMath().multiply(differentTan, 1);
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
            }
        }
        midddleShpang = _.sortBy(midddleShpang, 'y');
        var out = _.reverse(midddleShpang);
        FilteredPlane.push(_.head(midddleShpang));

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

    FilteredPlane = _.compact(FilteredPlane);


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

        FilteredPlaneSquere += triangleSqueare1 + triangleSqueare2;

        FilteredPlaneMassCenter_X += triangleMassCenter1.x * triangleSqueare1 + triangleMassCenter2.x * triangleSqueare2;
        FilteredPlaneMassCenter_Y += triangleMassCenter1.y * triangleSqueare1 + triangleMassCenter2.y * triangleSqueare2;
        FilteredPlaneMassCenter_Z += triangleMassCenter1.z * triangleSqueare1 + triangleMassCenter2.z * triangleSqueare2;


    }
    var RealMassCenter_L_X = ShapeMath.FloatMath().divide(FilteredPlaneMassCenter_X, FilteredPlaneSquere);
    var RealMassCenter_L_Y = ShapeMath.FloatMath().divide(FilteredPlaneMassCenter_Y, FilteredPlaneSquere);
    var RealMassCenter_L_Z = ShapeMath.FloatMath().divide(FilteredPlaneMassCenter_Z, FilteredPlaneSquere);

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
        if ((paramsObject.different || paramsObject.different === 0) && paramsObject.filter) {
            var filteredPlaneWithoutDifferent = buildPlane(shpangsForWork, paramsObject);
            defaultPoint = filteredPlaneWithoutDifferent.massCenter;
        }
        if (paramsObject.UpDown) {
            console.log('filteredPlaneWithoutDifferent', filteredPlaneWithoutDifferent)
            console.log('shpangsForWork', shpangsForWork)
        }

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
                var newZ = ShapeMath.FloatMath().multiply(differentTan, 1);
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
                    new THREE.Vector3(0, 0, ShapeMath.FloatMath().divide(paramsObject.Ship.Length, 2)),
                    new THREE.Vector3(0, paramsObject.filter, ShapeMath.FloatMath().divide(paramsObject.Ship.Length, 2)),

                ]);
            paramsObject.Ta = ShapeMath.intersectionPlaneLine([
                p1,
                p2,
                p3
            ], [
                    new THREE.Vector3(0, 0, -ShapeMath.FloatMath().divide(paramsObject.Ship.Length, 2)),
                    new THREE.Vector3(0, paramsObject.filter, -ShapeMath.FloatMath().divide(paramsObject.Ship.Length, 2)),

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
