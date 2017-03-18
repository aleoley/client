var THREE = require("three");
var _ = require('lodash');
var async = require('async');

function TktLoader(ship) {
    var OuterObject = Object.assign({}, ship);

    OuterObject.shpangs = _.map(ship.shpangs, function (shpang) {
        var i = 0;
        var shpanArray = [];
        for (var index = 0; index < shpang.points.length - 1; index++) {
            shpanArray.push(new THREE.Vector3(shpang.points[index].y, shpang.points[index].z, shpang.SpangX));

        }
        
        return shpanArray;


    });
    return OuterObject;
}


exports.TktLoader = TktLoader;