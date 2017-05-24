
var Volume = require('../../helpers/Volume');
var ShapeMath = require('../../helpers/shapeMath').ShapeMath;
var _ = require('lodash');
var MathJS = require('mathjs');
var async = require('async');
var ModelBuilder = require('../../helpers/modelBuilder');

/**
 * 
 * @param {*} paramsObject
 * //Neddded to have searchVolume
 * //Neddded to have step
 */
function Stabilized(paramsObject) {

    return new Promise(function (resolve, reject) {
        if (!paramsObject.step || !paramsObject.searchVolume) {
            reject('No step for Stabilized');
        }
        var PromisesArray = [];
        for (var i = paramsObject.step; i < 4.5; i = ShapeMath.FloatMath().add(i, paramsObject.step)) {
            PromisesArray.push(Volume.build(
                Object.assign({},
                    {
                        UpDown: false,
                        filter: i
                    },
                    paramsObject)
            ));
        }
        return Promise
            .all(PromisesArray)
            .then(function (result) {
                var minFilter = _.minBy(result, function (res) {
                    return MathJS.abs(res.Volume - paramsObject.searchVolume);
                });

                return resolve(minFilter);
            })
            .catch((err) => {
                reject(err);
            });



    });


}

/**
 * 
 * @param {*} paramsObject 
 * //Neddded to have searchMassCenter
 * //Neddded to have step
 */
function StabilizedByDifferent(paramsObject) {

    return new Promise(function (resolve, reject) {
        if (!paramsObject.step || !paramsObject.searchMassCenter) {
            reject('No step for Stabilized');
        }
        var PromisesArray = [];
        for (var i = paramsObject.step; i < 1; i = ShapeMath.FloatMath().add(i, paramsObject.step)) {
            PromisesArray.push(ModelBuilder.build(
                Object.assign({},
                    {
                        UpDown: false,
                        different: i,
                        createShape: false,
                        mirrored: false,
                    },
                    paramsObject)
            ));
        }
        return Promise
            .all(PromisesArray)
            .then(function (result) {
                var minFilter = _.minBy(result, function (res) {
                    return MathJS.abs(res.Volume - paramsObject.searchVolume);
                });
                return resolve(minFilter);
            });

    });
}

exports.Stabilized = Stabilized;