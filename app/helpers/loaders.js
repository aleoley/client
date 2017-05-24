var THREE = require("three");
var _ = require('lodash');
var async = require('async');

function TktLoader(ship) {
    var OuterObject = Object.assign({}, ship);

    /**
     * Function for create vectors of Shpangs
     */
    OuterObject.shpangs = _.map(ship.base, function (shpang) {
        var i = 0;
        var shpanArray = [];
        for (var index = 0; index < shpang.points.length - 1; index++) {
            shpanArray.push(new THREE.Vector3(shpang.points[index].y, shpang.points[index].z, shpang.ShpangX));

        }

        return shpanArray;


    });
    /**
     * Function for create Vectors of Bow
     */
    OuterObject.Bow = _.map(ship.Bow, function (point) {

        if (!point.y) {
            point.y = 0;
        }
        return new THREE.Vector3(
            point.y,
            point.z,
            point.x
        );


    });
    /**
     * Function for creaate Vectors of Stern
     */
    OuterObject.Stern = _.map(ship.Stern, function (point) {
        if (!point.y) {
            point.y = 0;
        }
        return new THREE.Vector3(
            point.y,
            point.z,
            point.x
        );


    });
    //=========================ADD BOW to SHAPNGS===========================
    if (OuterObject.Bow.length > 0) {
        var AddShpang = [];
        _.forEach(OuterObject.Bow, function (point) {
            var indexOfShapngWithNeededZ = _.findIndex(ship.base, function (shpang) {
                return shpang.ShpangX > point.z;
            });

            if (indexOfShapngWithNeededZ < 0) {
                AddShpang.push(point);
            } else {
                OuterObject.shpangs[indexOfShapngWithNeededZ].push(point);
                OuterObject.shpangs[indexOfShapngWithNeededZ] = _.sortBy(OuterObject.shpangs[indexOfShapngWithNeededZ], 'y');
            }
        });


        if (AddShpang.length > 0) {

            AddShpang = _.sortBy(AddShpang, 'y');
            var newShapng = createShpang(AddShpang);
            OuterObject.base.push(newShapng);
            OuterObject.base = _.sortBy(OuterObject.base, 'ShpangX');
            OuterObject.shpangs.push(AddShpang);
        }
    }
    //=====================ADD STERN to Shpangs===============
    if (OuterObject.Stern.length > 0) {
        var AddShpang2 = [];
        _.forEach(OuterObject.Stern, function (point) {
            var indexOfShapngWithNeededZ = _.findLastIndex(ship.base, function (shpang) {
                return shpang.ShpangX < point.z;
            });
            if (indexOfShapngWithNeededZ < 0) {
                AddShpang2.push(point);
            } else {
                OuterObject.shpangs[indexOfShapngWithNeededZ].push(point);
                OuterObject.shpangs[indexOfShapngWithNeededZ] = _.sortBy(OuterObject.shpangs[indexOfShapngWithNeededZ], 'y');
            }


        });


        if (AddShpang2.length > 0) {
            AddShpang2 = _.sortBy(AddShpang2, 'y');
            var newShapng = createShpang(AddShpang2);
            OuterObject.base.push(newShapng);
            OuterObject.base = _.sortBy(OuterObject.base, 'ShpangX');
            OuterObject.shpangs.push(AddShpang2);
        }
    }
    console.log('OuterObject', OuterObject);
    OuterObject.shpangs = _.sortBy(OuterObject.shpangs, function (shpang) {
        return shpang[0].z;
    });




    //--------------------------LOAD COMPARTMENTS-------------------------

    var compartments = _.map(ship.Compartments, function (compartment) {
        console.log('compartment', compartment);
        return {

            Name: compartment.Name,
            bow: {
                Z: compartment.Bow.X,
                points: _.reverse(
                    _.uniqBy(
                        _.sortBy(
                            _.map(compartment.Bow.points, function (point) {
                                return new THREE.Vector3(point.y, point.z, compartment.Bow.X);
                            }),
                            ['x', 'y']),
                        function (point) {
                            return JSON.stringify(_.pick(point, ['x', 'y']));
                        })
                ),

            },
            stern: {
                Z: compartment.Stern.X,
                points: _.reverse(
                    _.uniqBy(
                        _.sortBy(
                            _.map(compartment.Stern.points, function (point) {
                                return new THREE.Vector3(point.y, point.z, compartment.Stern.X);
                            }),
                            ['x', 'y']),
                        function (point) {
                            return JSON.stringify(_.pick(point, ['x', 'y']));
                        })
                ),
            },

        }
    });

    OuterObject.compartments = compartments;


    return OuterObject;
}


function createShpang(shpanArray) {
    var outShpang = {

    };
    var ShpangX = _.minBy(shpanArray, function (point) {
        return point.z;
    });
    outShpang.ShpangX = ShpangX.z;
    outShpang.points = shpanArray;
    return outShpang;
}

exports.TktLoader = TktLoader;