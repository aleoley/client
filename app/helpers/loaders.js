var THREE = require("three");
var _ = require('lodash');
var async = require('async');
const ShapeMath = require('./shapeMath').ShapeMath;
const regression = require('regression');

function TktLoader(ship) {

    return new Promise((resolve, reject) => {
        console.log('here1')
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
        //  OuterObject.shpangs[OuterObject.shpangs.length - 1] = _.map(OuterObject.shpangs[OuterObject.shpangs.length - 1], (point) => {
        //      point.x += 0.1;
        //       return point;
        //  })
        //  OuterObject.shpangs[OuterObject.shpangs.length - 2] = _.map(OuterObject.shpangs[OuterObject.shpangs.length - 2], (point) => {
        //      point.x += 0.1;
        //     return point;
        //})

        let newPoints = [];
        // OuterObject.regression = [];
        for (var i = 0; i < 3; i++) {
            _.forEach(OuterObject.shpangs[OuterObject.shpangs.length - 2], (point, index) => {
                if (index % 4 !== 0 || index === 0) {
                    return;
                }
                let intersectPoint1 = ShapeMath.vertexCenter(OuterObject.shpangs[OuterObject.shpangs.length - 2][index - 3], OuterObject.shpangs[OuterObject.shpangs.length - 2][index - 2]);
                let intersectPoint2 = ShapeMath.vertexCenter(OuterObject.shpangs[OuterObject.shpangs.length - 2][index - 1], point);
                let data = [
                    [
                        OuterObject.shpangs[OuterObject.shpangs.length - 2][index - 3].x,
                        OuterObject.shpangs[OuterObject.shpangs.length - 2][index - 3].y
                    ],
                    [
                        OuterObject.shpangs[OuterObject.shpangs.length - 2][index - 2].x,
                        OuterObject.shpangs[OuterObject.shpangs.length - 2][index - 2].y
                    ],
                    [
                        OuterObject.shpangs[OuterObject.shpangs.length - 2][index - 1].x,
                        OuterObject.shpangs[OuterObject.shpangs.length - 2][index - 1].y
                    ],
                    [
                        point.x,
                        point.y
                    ]
                ]
                let result = regression('polynomial', data, 2);
                let intersectPoint1_Y = Math.pow(intersectPoint1.x, 2) * result.equation[2] + intersectPoint1.x * result.equation[1] + result.equation[0];
                let intersectPoint2_Y = Math.pow(intersectPoint2.x, 2) * result.equation[2] + intersectPoint2.x * result.equation[1] + result.equation[0];

                // OuterObject.regression.push(result);

                newPoints.push(new THREE.Vector3(
                    intersectPoint1.x,
                    intersectPoint1_Y,
                    intersectPoint1.z
                ));
                newPoints.push(new THREE.Vector3(
                    intersectPoint2.x,
                    intersectPoint2_Y,
                    intersectPoint2.z
                ));

            });
            OuterObject.shpangs[OuterObject.shpangs.length - 2] = _.sortBy(_.concat(OuterObject.shpangs[OuterObject.shpangs.length - 2], newPoints), 'y');

        }



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
            // let newPoints = [];
            // OuterObject.regression = [];
            // for (var i = 0; i < 2; i++) {
            //     _.forEach(OuterObject.Bow, (point, index) => {
            //         if (index % 4 !== 0 || index === 0) {
            //             return;
            //         }
            //         let intersectPoint1 = ShapeMath.vertexCenter(OuterObject.Bow[index - 3], OuterObject.Bow[index - 2]);
            //         let intersectPoint2 = ShapeMath.vertexCenter(OuterObject.Bow[index - 1], point);
            //         let data = [
            //             [
            //                 OuterObject.Bow[index - 3].z,
            //                 OuterObject.Bow[index - 3].y
            //             ],
            //             [
            //                 OuterObject.Bow[index - 2].z,
            //                 OuterObject.Bow[index - 2].y
            //             ],
            //             [
            //                 OuterObject.Bow[index - 1].z,
            //                 OuterObject.Bow[index - 1].y
            //             ],
            //             [
            //                 point.z,
            //                 point.y
            //             ]
            //         ]
            //         let result = regression('polynomial', data, 2);
            //         let intersectPoint1_Y = Math.pow(intersectPoint1.z, 2) * result.equation[2] + intersectPoint1.z * result.equation[1] + result.equation[0];
            //         let intersectPoint2_Y = Math.pow(intersectPoint2.z, 2) * result.equation[2] + intersectPoint2.z * result.equation[1] + result.equation[0];

            //         OuterObject.regression.push(result);

            //         newPoints.push(new THREE.Vector3(
            //             0,
            //             intersectPoint1_Y,
            //             intersectPoint1.z
            //         ));
            //         newPoints.push(new THREE.Vector3(
            //             0,
            //             intersectPoint2_Y,
            //             intersectPoint2.z
            //         ));

            //     });
            //     OuterObject.Bow = _.sortBy(_.concat(OuterObject.Bow, newPoints), 'y');

            // }



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


        resolve(OuterObject);
    });

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