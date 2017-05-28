
var Volume = require('../../helpers/Volume');
var ShapeMath = require('../../helpers/shapeMath').ShapeMath;
var _ = require('lodash');
var MathJS = require('mathjs');
var async = require('async');
var ModelBuilder = require('../../helpers/modelBuilder');
const bluebird = require('bluebird');

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
 * //Neddded to have etta
 */
function StabilizedByDifferent(paramsObject) {

    return new Promise(function (resolve, reject) {
        if (!paramsObject.etta || !paramsObject.searchMassCenter) {
            reject('No etta or searchMassCenter  for Stabilized');
        }
        paramsObject.step = 0.1;
        var findedEtta = 100;
        var ResultObject = {};
        var min2 = {};

        var interation = 0;

        var start = -0.5;
        var end = 0.5;
        var resultArray = []
        var iteration = 0;
        var count = 0;

        async.whilst(
            () => { return paramsObject.etta < findedEtta && iteration < 5; },
            (whilstCallback) => {
                var PromisesArray = [];
                for (var i = start; i < end; i = ShapeMath.FloatMath().add(i, paramsObject.step)) {
                    PromisesArray.push(ModelBuilder.build(
                        Object.assign({},
                            {
                                UpDown: false,
                                different: MathJS.round(i, 10),
                                createShape: false,
                                mirrored: false,
                            },
                            paramsObject)
                    ));
                }
                return Promise
                    .all(PromisesArray)
                    .then((result) => {


                        ResultObject = _.minBy(result, (res) => {
                            return MathJS.abs((MathJS.tan(res.different) * (paramsObject.searchMassCenter.y - res.MassCenter.y)) - res.MassCenter.z + paramsObject.searchMassCenter.z);
                        });
                        var nextResult = _.filter(result, (res) => {
                            return MathJS.round(res.different, 10) !== MathJS.round(ResultObject.different, 10);
                        });
                        min2 = _.minBy(nextResult, (res) => {
                            return MathJS.abs((MathJS.tan(res.different) * (paramsObject.searchMassCenter.y - res.MassCenter.y)) - res.MassCenter.z + paramsObject.searchMassCenter.z);
                        });


                        findedEtta = MathJS.abs((MathJS.tan(ResultObject.different) * (paramsObject.searchMassCenter.y - ResultObject.MassCenter.y)) - ResultObject.MassCenter.z + paramsObject.searchMassCenter.z);

                        resultArray.push({
                            iterrationEtta: _.map(result, (res) => {
                                return {
                                    etta: MathJS.abs((MathJS.tan(res.different) * (paramsObject.searchMassCenter.y - res.MassCenter.y)) - res.MassCenter.z + paramsObject.searchMassCenter.z),
                                    different: res.different
                                }
                            }),
                            findedEtta: findedEtta,
                            iteration: iteration,
                            different: ResultObject.different,
                            min2: min2,
                            ResultObject: ResultObject
                        });
                        // new iteration
                        paramsObject.step = paramsObject.step * 0.1;
                        if (ResultObject.different < min2.different) {
                            start = ResultObject.different;
                            end = min2.different;
                        } else {
                            end = ResultObject.different;
                            start = min2.different;
                        }

                        iteration++;
                        // ResultObject = { findedEtta: p };
                        //findedEtta = paramsObject.etta / 100;
                        whilstCallback();

                    }).catch((err) => {
                        whilstCallback(err);
                    });
            },
            (err, n) => {
                if (err) {
                    reject('ssss');
                } else {
                    // resolve({
                    //     resultArray: resultArray
                    // });
                    resolve(ResultObject);
                }
            }
        );

    });
}

exports.Stabilized = Stabilized;
exports.StabilizedByDifferent = StabilizedByDifferent;