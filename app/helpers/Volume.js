var THREE = require("three");
var _ = require('lodash');
var async = require('async');
var ShapeMath = require('./shapeMath').ShapeMath;
const ModelBuilder = require('./modelBuilder');
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

                    var minDisArray = ModelBuilder.minDistanse(centerPoint, beforeShapng);

                    var head = [minDisArray[0]];

                    var volume = ShapeMath.Volume.getVolume(bottom, head, paramsObject);
                    middleVolume += volume.sum;

                    if (asyncJ >= beforeShapng.length) {

                        asyncJ++;
                        eachCallback2();
                    } else {
                        var bottom2 = [beforeShapng[asyncJ - 1], beforeShapng[asyncJ - 0]];

                        var centerPoint = vertexCenter(proectionOnShapng(beforeShapng[asyncJ - 1], paramsObject.Ship.base[asyncI - 1].ShpangX), proectionOnShapng(beforeShapng[asyncJ - 0], paramsObject.Ship.base[asyncI - 1].ShpangX));

                        var minDisArray2 = ModelBuilder.minDistanse(centerPoint, thisShpang, bottom, head);
                        var head2 = [minDisArray2[0]];

                        if (minDisArray2[1]) {
                            if (minDisArray[0].y !== minDisArray2[1].y) {
                                head2 = [minDisArray2[1]];
                            }
                        }

                        var volume2 = ShapeMath.Volume.getVolume(bottom2, head2, paramsObject);
                        middleVolume += volume2.sum;

                        asyncJ++;
                        eachCallback2();

                    }

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

                    var minDisArray = ModelBuilder.minDistanse(centerPoint, thisShpang);

                    var head = [minDisArray[0]];



                    var volume = ShapeMath.Volume.getVolume(bottom, head, paramsObject);
                    middleVolume += volume.sum;

                    if (asyncJ >= thisShpang.length) {
                        asyncJ++;
                        eachCallback2();
                    } else {
                        var bottom2 = [thisShpang[asyncJ - 1], thisShpang[asyncJ - 0]];

                        var centerPoint = vertexCenter(proectionOnShapng(thisShpang[asyncJ - 1], paramsObject.Ship.base[asyncI].ShpangX), proectionOnShapng(thisShpang[asyncJ - 0], paramsObject.Ship.base[asyncI].ShpangX));

                        var minDisArray2 = ModelBuilder.minDistanse(centerPoint, beforeShapng, bottom, head);
                        var head2 = [minDisArray2[0]];

                        if (minDisArray2[1]) {
                            if (minDisArray[0].y !== minDisArray2[1].y) {
                                head2 = [minDisArray2[1]];
                            }

                        }
                        var volume2 = ShapeMath.Volume.getVolume(bottom2, head2, paramsObject);
                        middleVolume += volume2.sum;


                        asyncJ++;
                        eachCallback2();

                    }



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

                var outerTonn = outerVolume * 2 * paramsObject.water;
                var outer = outerVolume * 2;

                resolve({
                    TonnVolume: outerTonn,
                    Volume: outer,
                    h: paramsObject.filter,
                    different: paramsObject.different,
                    filteredMassCenter: paramsObject.filteredMassCenter,
                    FilteredPlaneSquere: paramsObject.FilteredPlaneSquere,
                    initialPlusX: paramsObject.initialPlusX
                });
            } else {
                reject(err);
            }
        });
    });
}



function buildPlane(shpangsForWork, paramsObject, options) {
    options = options ? options : {};
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

        var shpangsForWork = JSON.parse(JSON.stringify(paramsObject.Ship.shpangs));


        //if different we must find mass center of waterline Square 
        var defaultPoint = new THREE.Vector3(0, 0, 0);
        if ((paramsObject.different || paramsObject.different === 0) && paramsObject.filter) {
            var filteredPlaneWithoutDifferent = buildPlane(shpangsForWork, paramsObject);
            defaultPoint = filteredPlaneWithoutDifferent.massCenter;
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



    });

}

exports.build = build;
