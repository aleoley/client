var MathJS = require('mathjs');
var THREE = require("three");
var _ = require('lodash');
var async = require('async');
var ShapeMath = require('./shapeMath').ShapeMath;
var ModelBuilder = require('./modelBuilder');
var RandomColors = require('randomcolor')

function buildIntersectPoint(paramsObject, beforePoint, thisPoint, head) {
    // console.log('=====================================================================')
    // console.log('beforePoint', beforePoint)
    // console.log('thisPoint', thisPoint)
    // console.log('head', head)
    // console.log(' paramsObject.compartment.bow.points[0]', paramsObject.compartment.bow.points[0])
    // console.log('paramsObject.compartment.bow.points[1]', paramsObject.compartment.bow.points[1])
    // console.log(' paramsObject.compartment.bow.points[2]', paramsObject.compartment.bow.points[2])
    var outerArray = [];
    //-------------------------START find and build compartment points!
    var intersectCompartmentPlane_beforePoint = {};
    var intersectCompartmentPlane_thisPoint = {};
    if (paramsObject.bow) {
        // console.log('START')
        intersectCompartmentPlane_beforePoint = ShapeMath
            .intersectionPlaneLine([
                paramsObject.compartment.bow.points[0],
                paramsObject.compartment.bow.points[1],
                paramsObject.compartment.bow.points[2]
            ],
            [
                beforePoint,
                head
            ]);
        intersectCompartmentPlane_thisPoint = ShapeMath
            .intersectionPlaneLine([
                paramsObject.compartment.bow.points[0],
                paramsObject.compartment.bow.points[1],
                paramsObject.compartment.bow.points[2]
            ],
            [
                thisPoint,
                head
            ]);
    }
    if (paramsObject.stern) {
        //  console.log('END')
        intersectCompartmentPlane_beforePoint = ShapeMath
            .intersectionPlaneLine([
                paramsObject.compartment.stern.points[0],
                paramsObject.compartment.stern.points[1],
                paramsObject.compartment.stern.points[2]
            ],
            [
                beforePoint,
                head
            ]);
        intersectCompartmentPlane_thisPoint = ShapeMath
            .intersectionPlaneLine([
                paramsObject.compartment.stern.points[0],
                paramsObject.compartment.stern.points[1],
                paramsObject.compartment.stern.points[2]
            ],
            [
                thisPoint,
                head
            ]);
    }
    //console.log('intersectCompartmentPlane_thisPoint', intersectCompartmentPlane_thisPoint);
    // if (intersectCompartmentPlane_thisPoint.y <= paramsObject.compartment.bow.points[0].y && intersectCompartmentPlane_thisPoint.y > paramsObject.compartment.bow.points[1].y) {
    if (intersectCompartmentPlane_thisPoint)
        outerArray.push(intersectCompartmentPlane_thisPoint);
    // }
    if (intersectCompartmentPlane_beforePoint)
        // if (intersectCompartmentPlane_beforePoint.y <= paramsObject.compartment.bow.points[0].y && intersectCompartmentPlane_beforePoint.y > paramsObject.compartment.bow.points[1].y) {
        outerArray.push(intersectCompartmentPlane_beforePoint);
    // }
    // console.log('intersectCompartmentPlane_thisPoint', intersectCompartmentPlane_thisPoint);
    // console.log('intersectCompartmentPlane_beforePoint', intersectCompartmentPlane_beforePoint);
    //-------------------------END find and build compartment points!
    //  console.log('=====================================================================')
    return outerArray;
}



//-------------------------------------------Start Build Compartment------------------------

function buildCompartment(paramsObject) {
    return new Promise(function (resolve, reject) {
        var outerShpangs = [];

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

                    var centerPoint = ShapeMath.vertexCenter(ShapeMath.proectionOnShapng(beforePoint, paramsObject.Ship.base[asyncI].ShpangX), ShapeMath.proectionOnShapng(thisPoint, paramsObject.Ship.base[asyncI].ShpangX));

                    var minDisArray = ModelBuilder.minDistanse(centerPoint, beforeShapng, paramsObject.Ship.base[asyncI - 1].ShpangX);

                    var head = [minDisArray[0]];
                    outerShpangs = _.concat(outerShpangs, buildIntersectPoint(paramsObject, beforePoint, thisPoint, head[0]));


                    if (asyncJ >= beforeShapng.length) {
                        asyncJ++;
                        eachCallback2();
                    } else {
                        var bottom2 = [beforeShapng[asyncJ - 1], beforeShapng[asyncJ - 0]];

                        var centerPoint = ShapeMath.vertexCenter(ShapeMath.proectionOnShapng(beforeShapng[asyncJ - 1], paramsObject.Ship.base[asyncI - 1].ShpangX), ShapeMath.proectionOnShapng(beforeShapng[asyncJ - 0], paramsObject.Ship.base[asyncI - 1].ShpangX));

                        var minDisArray2 = ModelBuilder.minDistanse(centerPoint, thisShpang, paramsObject.Ship.base[asyncI].ShpangX);
                        var head2 = [minDisArray2[0]];



                        if (minDisArray2[1]) {
                            if (minDisArray[0].y !== minDisArray2[1].y) {
                                head2 = [minDisArray2[1]];
                            }
                        }
                        outerShpangs = _.concat(outerShpangs, buildIntersectPoint(paramsObject, beforeShapng[asyncJ - 1], beforeShapng[asyncJ - 0], head2[0]));
                        asyncJ++;
                        eachCallback2();
                    }

                }, function (err) {
                    if (!err) {
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
                    var centerPoint = ShapeMath.vertexCenter(ShapeMath.proectionOnShapng(beforePoint, paramsObject.Ship.base[asyncI - 1].ShpangX), ShapeMath.proectionOnShapng(thisPoint, paramsObject.Ship.base[asyncI - 1].ShpangX));

                    var minDisArray = ModelBuilder.minDistanse(centerPoint, thisShpang, paramsObject.Ship.base[asyncI - 1].ShpangX);

                    var head = [minDisArray[0]];
                    outerShpangs = _.concat(outerShpangs, buildIntersectPoint(paramsObject, beforePoint, thisPoint, head[0]));


                    if (asyncJ >= thisShpang.length) {
                        asyncJ++;
                        eachCallback2();
                    } else {
                        var bottom2 = [thisShpang[asyncJ - 1], thisShpang[asyncJ - 0]];

                        var centerPoint = ShapeMath.vertexCenter(ShapeMath.proectionOnShapng(thisShpang[asyncJ - 1], paramsObject.Ship.base[asyncI].ShpangX), ShapeMath.proectionOnShapng(thisShpang[asyncJ - 0], paramsObject.Ship.base[asyncI].ShpangX));

                        var minDisArray2 = ModelBuilder.minDistanse(centerPoint, beforeShapng, paramsObject.Ship.base[asyncI - 1].ShpangX);
                        var head2 = [minDisArray2[0]];

                        if (minDisArray2[1]) {
                            if (minDisArray[0].y !== minDisArray2[1].y) {
                                head2 = [minDisArray2[1]];
                            }

                        }
                        outerShpangs = _.concat(outerShpangs, buildIntersectPoint(paramsObject, thisShpang[asyncJ - 1], thisShpang[asyncJ - 0], head2[0]));
                        asyncJ++;
                        eachCallback2();
                    }

                }, function (err) {
                    if (!err) {
                        asyncI++;
                        eachCallback1();
                    }
                });
            }


        }, function (err) {
            if (!err) {
                resolve(outerShpangs);
            } else {
                throw new Error('Compartment Build Error');
            }
        });
    });
}



/**
 * 
 * 
 * @param {*} paramsObject
 * 
 * Copmartment
 * start:{
 * Z: NUM,
 * points:[[],[],[],[]]
 * },
 * end:{
 * Z: NUM,
 * points:[[],[],[],[]]
 * }  
 */



function build(paramsObject) {

    return new Promise(function (resolve, reject) {
        paramsObject.Ship.shpangs = _.map(paramsObject.Ship.shpangs, function (shpang) {
            return _.sortBy(shpang, 'y');
        });
        var compartmentShpangs = paramsObject.Ship.shpangs;

        console.log('buildCompartment', paramsObject);

        if (paramsObject.compartment) {
            if (!paramsObject.compartment.bow || !paramsObject.compartment.stern) {
                throw new Error('No All data for building Compartment')
            } else {
                compartmentShpangs = _.compact(_.filter(paramsObject.Ship.shpangs, function (spang) {
                    if (spang[0]) {
                        return spang[0].z >= paramsObject.compartment.bow.Z && spang[0].z <= paramsObject.compartment.stern.Z
                    } else {
                        return false;
                    }
                }));

                // if (compartmentShpangs.length === 0) {
                var fisrtShpang = _.findLast(paramsObject.Ship.shpangs, function (shpang) {

                    return shpang[0].z <= paramsObject.compartment.bow.Z;
                });
                var lastShpang = _.find(paramsObject.Ship.shpangs, function (shpang) {
                    return shpang[0].z >= paramsObject.compartment.stern.Z;
                });
                console.log('!!!!!!!!fisrtShpang', fisrtShpang);
                console.log('!!!!!!!!lastShpang', lastShpang);
            }
        }
        console.log('!!!!!!!!compartmentShpangs1', compartmentShpangs);
        if (compartmentShpangs.length > 0) {
            var simpleShpangs1 = [];
            var simpleShpangs2 = [];
            if (compartmentShpangs.length === 1) {
                simpleShpangs1 = [fisrtShpang, compartmentShpangs[0]];
                simpleShpangs1 = [compartmentShpangs[0], lastShpang];
            } else {
                simpleShpangs1 = [fisrtShpang, compartmentShpangs[0]];
                simpleShpangs2 = [compartmentShpangs[compartmentShpangs.length - 1], lastShpang];
            }
            simpleShpangs1 = _.map(simpleShpangs1, function (shpang) {
                return _.reverse(shpang);
            });
            simpleShpangs2 = _.map(simpleShpangs2, function (shpang) {
                return _.reverse(shpang);
            });

            //BuildCompartment Points
            console.log('!!!!!!!!simpleShpangs1', simpleShpangs1);
            console.log('!!!!!!!!simpleShpangs2', simpleShpangs2);
            Promise.all([
                buildCompartment(Object.assign({}, {
                    bow: true,
                    stern: false,
                    simpleShpangs: simpleShpangs1,

                },
                    paramsObject)),
                buildCompartment(Object.assign({}, {
                    bow: false,
                    stern: true,
                    simpleShpangs: simpleShpangs2,

                },
                    paramsObject))
            ])
                .then(function (result) {

                    console.log('result', result);
                    var sortedShapngs = _.sortBy(result, function (shpang) {
                        return shpang[0].z;
                    });
                    console.log('sortedShapngs', sortedShapngs);
                    return _.concat([sortedShapngs[0]], _.concat(compartmentShpangs, [sortedShapngs[1]]));

                })
                .then(function (volumeShpangs) {
                    volumeShpangs = _.map(volumeShpangs, function (shpang) {
                        return _.sortBy(shpang, 'y');
                    });
                    volumeShpangs = _.compact(_.map(volumeShpangs, function (spang) {

                        // filtered if exists

                        var UpperPoint,
                            BottomPoint,
                            midddleShpang;

                        //main Plane Vectors 
                        var p1 = new THREE.Vector3(0, 0, 1);
                        var p2 = new THREE.Vector3(0, 0, 0);
                        var p3 = new THREE.Vector3(1, 0, 0);

                        //---------------- Start Upper Filter-------------------- 

                        var uppreFilter = _.filter(spang, function (point) {
                            return point.y <= paramsObject.compartment.bow.points[0].y;
                        });
                       
                        if (spang[uppreFilter.length] && uppreFilter.length > 0 && uppreFilter.length !== spang.length) {
                            p1.y = paramsObject.compartment.bow.points[0].y;
                            p2.y = paramsObject.compartment.bow.points[0].y;
                            p3.y = paramsObject.compartment.bow.points[0].y;
                            var proectionPoint = ShapeMath.intersectionPlaneLine([p1, p2, p3], [spang[uppreFilter.length], spang[uppreFilter.length - 1]]);
                            
                            UpperPoint = proectionPoint;

                        }
                        //---------------- End Upper Filter-------------------- 

                        //---------------- Start Bottom Filter--------------------

                        var bottomFilter = _.filter(spang, function (point) {
                            return point.y >= paramsObject.compartment.bow.points[1].y;
                        });
                        var underBottomIndex = _.findLastIndex(spang, function (point) {
                            return point.y <= paramsObject.compartment.bow.points[1].y;
                        });
                       
                        if (bottomFilter.length > 0 && spang[underBottomIndex]) {
                            p1.y = paramsObject.compartment.bow.points[1].y;
                            p2.y = paramsObject.compartment.bow.points[1].y;
                            p3.y = paramsObject.compartment.bow.points[1].y;
                           
                            var proectionPoint = ShapeMath.intersectionPlaneLine([p1, p2, p3], [bottomFilter[0], spang[underBottomIndex]]);
                            
                            BottomPoint = proectionPoint;
                        }
                        //---------------- End Bottom Filter-------------------- 
                        midddleShpang = _.filter(spang, function (point) {
                            return point.y <= paramsObject.compartment.bow.points[0].y && point.y >= paramsObject.compartment.bow.points[1].y;
                        });
                        if (UpperPoint) {
                            midddleShpang.push(UpperPoint);
                        }
                        if (BottomPoint) {
                            midddleShpang.push(BottomPoint);
                        }



                        // console.log('MIDDLESHPANG', midddleShpang);
                        if (midddleShpang.length > 0) {
                            return _.uniqBy(_.sortBy(_.map(midddleShpang, function (point) {
                                point.x = point.x - 0.01;
                                return point;
                            }), 'y'), 'y');
                        } else {
                            return false;
                        }

                    }));




                    console.log('!!!!!!!!compartmentShpangs', compartmentShpangs);
                    console.log('!!!!!!!!volumeShpangs', volumeShpangs);
                    //paramsObject.filter = paramsObject.compartment.bow.points[0].y;
                    paramsObject.Ship.shpangs = volumeShpangs;
                    paramsObject.color = RandomColors();
                    paramsObject.initialPlusX = 0;
                    paramsObject.mirrored = false;
                    paramsObject.filter = false;
                    //  paramsObject.transparent = true;
                   // paramsObject.initialTimeout = 10;
                    return ModelBuilder.build(paramsObject);
                })
                .then(function (result) {
                    return resolve(result);
                })



        } else {
            var simpleShpangs1 = _.map([fisrtShpang, lastShpang], function (shpang) {
                return _.reverse(shpang);
            });

            //BuildCompartment Points
            buildCompartment(Object.assign({},
                {
                    end: true,
                    start: true,
                    simpleShpangs: simpleShpangs1,

                },
                paramsObject))
                .then(function (result) {

                    var sortedShapngs = _.sortBy(result, function (shpang) {
                        return shpang[0].z;
                    });
                    return _.concat([sortedShapngs[0]], _.concat(compartmentShpangs, sortedShapngs[0]));

                })
                .then(function (volumeShpangs) {
                    paramsObject.simpleShpangs = volumeShpangs;
                    console.log('!!!!!!!!compartmentShpangs', compartmentShpangs);
                    console.log('!!!!!!!!volumeShpangs', volumeShpangs);
                    paramsObject.color = '#251C35';
                    return ModelBuilder.build(paramsObject);
                })
                .then(function (result) {
                    return resolve(result);
                })

        }
    });

}

exports.build = build;