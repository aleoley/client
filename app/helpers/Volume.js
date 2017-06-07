var THREE = require("three");
var _ = require('lodash');
var async = require('async');
var ShapeMath = require('./shapeMath').ShapeMath;

'use strict';


function getVolume(bottom, head, paramsObject) {

    //botom must have lenght=2
    if (bottom.length !== 2) {
        return;
    }

    //head must have lenght=1 
    if (head.length !== 1) {
        return;
    }

    // build proections
    bottom.push(ShapeMath.proectionX(bottom[0]));
    bottom.push(ShapeMath.proectionX(bottom[1]));
    head.push(ShapeMath.proectionX(head[0]));

    // h must be fixed by default
    var vectorAH = new THREE.Vector3(0, 0, bottom[0].z);
    var vectorBH = new THREE.Vector3(0, 0, head[0].z);
    var fixedH = ShapeMath.distanceVector(vectorAH, vectorBH);

    var buttomA = ShapeMath.distanceVector(bottom[0], bottom[2]);
    var buttomB = ShapeMath.distanceVector(bottom[1], bottom[3]);
    var buttomC = ShapeMath.distanceVector(bottom[0], bottom[1]);
    var buttomD = ShapeMath.distanceVector(bottom[2], bottom[3]);

    //======================= get Mass Center 
    // var massCenter = ShapeMath.getMassCenter(bottom, head);
    // console.log('massCenter', massCenter);
    // addPoint(massCenter.FirstPyramidMassCenter, paramsObject);
    // addPoint(massCenter.SecondPyramidMassCenter, paramsObject);

    var triangleA = ShapeMath.distanceVector(bottom[2], bottom[3]);
    var triangleB = ShapeMath.distanceVector(head[1], bottom[3]);
    var triangleC = ShapeMath.distanceVector(bottom[2], head[1]);


    var trapezeSqueareV1 = ShapeMath.Squeare.Trapeze(buttomA, buttomB, buttomC, buttomD);
    var triangleSqueareV2 = ShapeMath.Squeare.Triangle(triangleA, triangleB, triangleC)

    var pyramid2H = ShapeMath.distanceVector(head[0], head[1]);

    var V1 = ShapeMath.Volume.Pyramid(trapezeSqueareV1, fixedH);
    var V2 = ShapeMath.Volume.Pyramid(triangleSqueareV2, pyramid2H);

    return {
        TrapezePyramidVolume: V1,
        TrianglePyramidVolume: V2,
        sum: V1 + V2
    };
}


function BuildVolume(paramsObject) {
    return new Promise(function (resolve, reject) {
        var initialTimeout = paramsObject.initialTimeout;
        var mirrored = paramsObject.mirrored;
        // Outer Volume Intitalize
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

                    var centerPoint = ShapeMath.vertexCenter(
                        ShapeMath.proectionOnShapng(
                            beforePoint,
                            paramsObject.Ship.base[asyncI].ShpangX
                        ),
                        ShapeMath.proectionOnShapng(
                            thisPoint,
                            paramsObject.Ship.base[asyncI].ShpangX)
                    );

                    var minDisArray = ShapeMath.minDistanse(
                        centerPoint,
                        beforeShapng,
                        paramsObject.Ship.base[asyncI - 1].ShpangX
                    );

                    var head = [minDisArray[0]];

                    var volume = getVolume(bottom, head, paramsObject);
                    middleVolume += volume.TrapezePyramidVolume + volume.TrianglePyramidVolume;




                    if (asyncJ >= beforeShapng.length) {

                        asyncJ++;
                        eachCallback2();
                    } else {
                        var bottom2 = [beforeShapng[asyncJ - 1], beforeShapng[asyncJ - 0]];

                        var centerPoint = ShapeMath.vertexCenter(
                            ShapeMath
                                .proectionOnShapng(beforeShapng[asyncJ - 1],
                                paramsObject.Ship.base[asyncI - 1].ShpangX),
                            ShapeMath
                                .proectionOnShapng(beforeShapng[asyncJ - 0],
                                paramsObject.Ship.base[asyncI - 1].ShpangX)
                        );

                        var minDisArray2 = ShapeMath.minDistanse(centerPoint, thisShpang, paramsObject.Ship.base[asyncI].ShpangX);
                        var head2 = [minDisArray2[0]];

                        if (minDisArray2[1]) {
                            if (minDisArray[0].y !== minDisArray2[1].y) {

                                head2 = [minDisArray2[1]];
                            }
                        }

                        var volume2 = getVolume(bottom2, head2, paramsObject);
                        middleVolume += volume2.TrapezePyramidVolume + volume2.TrianglePyramidVolume;;

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
                    var centerPoint = ShapeMath
                        .vertexCenter(
                        ShapeMath
                            .proectionOnShapng(
                            beforePoint,
                            paramsObject.Ship.base[asyncI - 1].ShpangX
                            ),
                        ShapeMath
                            .proectionOnShapng(
                            thisPoint,
                            paramsObject.Ship.base[asyncI - 1].ShpangX
                            )
                        );

                    var minDisArray = ShapeMath
                        .minDistanse(
                        centerPoint,
                        thisShpang,
                        paramsObject.Ship.base[asyncI - 1].ShpangX
                        );

                    var head = [minDisArray[0]];



                    var volume = getVolume(bottom, head, paramsObject);
                    middleVolume += volume.TrapezePyramidVolume + volume.TrianglePyramidVolume;;





                    if (asyncJ >= thisShpang.length) {
                        asyncJ++;
                        eachCallback2();
                    } else {
                        var bottom2 = [thisShpang[asyncJ - 1], thisShpang[asyncJ - 0]];

                        var centerPoint = ShapeMath
                            .vertexCenter(
                            ShapeMath
                                .proectionOnShapng(
                                thisShpang[asyncJ - 1],
                                paramsObject.Ship.base[asyncI].ShpangX
                                ),
                            ShapeMath
                                .proectionOnShapng(
                                thisShpang[asyncJ - 0],
                                paramsObject.Ship.base[asyncI].ShpangX
                                )
                            );

                        var minDisArray2 = ShapeMath
                            .minDistanse(
                            centerPoint,
                            beforeShapng,
                            paramsObject.Ship.base[asyncI - 1].ShpangX
                            );
                        var head2 = [minDisArray2[0]];

                        if (minDisArray2[1]) {
                            if (minDisArray[0].y !== minDisArray2[1].y) {
                                head2 = [minDisArray2[1]];
                            }

                        }

                        var volume2 = getVolume(bottom2, head2, paramsObject);
                        middleVolume += volume2.TrapezePyramidVolume + volume2.TrianglePyramidVolume;

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
                console.log('resolve');
                resolve({
                    TonnVolume: outerTonn,
                    Volume: outer,
                    h: paramsObject.filter,
                    different: paramsObject.different
                });
            }
        });
    });
}

function build(paramsObject) {

    return new Promise(function (resolve, reject) {
        paramsObject.Ship.shpangs = _.map(paramsObject.Ship.shpangs, function (shpang) {
            return _.sortBy(shpang, 'y');
        });

         var shpangsForWork = JSON.parse(JSON.stringify(paramsObject.Ship.shpangs));
        console.log('Volume', paramsObject);
        //if different we must find mass center of all squeare by filter
        var defaultPoint = new THREE.Vector3(0, 0, 0);
        if (paramsObject.different && paramsObject.filter) {
            var FilteredPlane = _.compact(_.map(shpangsForWork, function (spang) {

                var midddleShpang = _.filter(spang, function (point) {
                    return point.y <= paramsObject.filter;
                });


                if (spang[midddleShpang.length] && midddleShpang.length > 0 && midddleShpang.length !== spang.length) {
                    var proectionPoint = new THREE.Vector3();
                    proectionPoint.z = spang[midddleShpang.length].z;
                    proectionPoint.y = paramsObject.filter;
                    proectionPoint.x = ShapeMath.getProectionOnLine(spang[midddleShpang.length], spang[midddleShpang.length - 1], proectionPoint);

                    return proectionPoint;
                } else {
                    return false
                }
            }));
            var FilteredPlaneMassCenter_X = 0;
            var FilteredPlaneMassCenter_Y = 0;
            var FilteredPlaneMassCenter_Z = 0;

            var FilteredPlaneSquere = 0;

            for (var i = 1; i < FilteredPlane.length; i++) {

                var midddleSqquere = ShapeMath.Squeare.Trapeze(
                    ShapeMath.distanceVector(
                        FilteredPlane[i - 1],
                        ShapeMath.proectionX(FilteredPlane[i - 1])
                    ),
                    ShapeMath.distanceVector(
                        FilteredPlane[i],
                        ShapeMath.proectionX(FilteredPlane[i])
                    ),
                    ShapeMath.distanceVector(
                        FilteredPlane[i],
                        ShapeMath.proectionX(FilteredPlane[i - 1])
                    ),
                    ShapeMath.distanceVector(
                        FilteredPlane[i - 1],
                        ShapeMath.proectionX(FilteredPlane[i])
                    )
                );


                var middleMassCenter = ShapeMath.trapezeMassCenter([
                    FilteredPlane[i - 1],
                    ShapeMath.proectionX(FilteredPlane[i - 1])
                ], [
                        FilteredPlane[i],
                        ShapeMath.proectionX(FilteredPlane[i])
                    ]
                );
                FilteredPlaneSquere += midddleSqquere;


                FilteredPlaneMassCenter_X += middleMassCenter.x * midddleSqquere;
                FilteredPlaneMassCenter_Y += middleMassCenter.y * midddleSqquere;
                FilteredPlaneMassCenter_Z += middleMassCenter.z * midddleSqquere;

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
            addPoint(massCenter, paramsObject);

            // RESULT!!!!!!!!!!!!!!!!!!!!!!
            defaultPoint = massCenter
            console.log('RealFilteredPlaneMassCenter', massCenter);
        }
        ////trapezeMassCenter

        // at first create reverse array of shpangs
        var simpleShpangs1 = _.compact(_.map(shpangsForWork, function (spang) {
            var PlusShpangs = spang;
            // add initialPlusX if exists
            if (paramsObject.initialPlusX) {
                PlusShpangs = _.map(spang, (point) => {
                    if (point.x !== 0) {
                        var sum = Math.round((paramsObject.initialPlusX + point.x) * 1e12) / 1e12;
                        point.x = sum;
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

                if (paramsObject.different) {

                    var differentTan = Math.tan(ShapeMath.getRad(paramsObject.different));
                    var newZ = ShapeMath.FloatMath().multiply(differentTan, 1);
                    p1 = new THREE.Vector3(0, paramsObject.filter + newZ, 1);
                    filterY = ShapeMath.returnYbyLine(p1, p2, spang[0].z);
                }



                midddleShpang = _.filter(PlusShpangs, function (point) {
                    return point.y <= filterY;
                });

                if (spang[midddleShpang.length] && midddleShpang.length > 0 && midddleShpang.length !== spang.length) {

                    var proectionPoint = ShapeMath.intersectionPlaneLine([p1, p2, p3], [spang[midddleShpang.length], spang[midddleShpang.length - 1]]);
                    midddleShpang.push(proectionPoint);
                }

            }

            if (midddleShpang.length > 0) {
                return _.reverse(midddleShpang);
            } else {
                return false;
            }

        }));

        if (paramsObject.UpDown) {
            var simpleShpangs2 = _.compact(_.map(shpangsForWork, function (spang) {
                var PlusShpangs = spang;
                // add initialPlusX if exists
                if (paramsObject.initialPlusX) {
                    PlusShpangs = _.map(spang, function (point) {
                        if (point.x !== 0) {
                            var sum = Math.round((paramsObject.initialPlusX + point.x) * 1e12) / 1e12;
                            point.x = sum;
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

                    if (paramsObject.different) {

                        var differentTan = Math.tan(ShapeMath.getRad(paramsObject.different));
                        var newZ = ShapeMath.FloatMath().multiply(differentTan, 1);
                        p1 = new THREE.Vector3(0, paramsObject.filter + newZ, 1);
                        filterY = ShapeMath.returnYbyLine(p1, p2, spang[0].z);
                    }



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

                }
                midddleShpang = _.sortBy(midddleShpang, function (point) {
                    return point.y;
                });
                console.log('midddleShpang!!!!!!!!!!!!!!!!!!!!!!!!!', midddleShpang);
                if (midddleShpang.length > 0) {
                    return _.reverse(midddleShpang);
                } else {
                    return false;
                }

            }));

            Promise.all([
                BuildVolume(Object.assign({}, {
                    initialTimeout: 10,
                    simpleShpangs: simpleShpangs1,
                    color: '#770406'
                }, paramsObject)),
                BuildVolume(Object.assign({}, {
                    initialTimeout: 100,
                    color: '#51565e',
                    simpleShpangs: simpleShpangs2
                }, paramsObject)),
            ]).then(function (result) {
                //result.resultShpangs = paramsObject.simpleShpangs;

                resolve(paramsObject);
            })
        } else {
            paramsObject.simpleShpangs = simpleShpangs1;
            console.log('create model ');
            //create model 
            BuildVolume(paramsObject)
                .then(function (result) {
                    //  result.resultShpangs = paramsObject.simpleShpangs;

                    resolve(result);
                })
                .catch((err) => {
                    reject(paramsObject);
                });
        }


    });

}

exports.build = build;
exports.getVolume = getVolume;
