
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
        var interation = 0;
        var start = -1;
        var resultArray = []
        var iteration = 0;
        var count = 0;

        async.whilst(
            () => { return paramsObject.etta < findedEtta && iteration < 50; },
            (whilstCallback) => {


                start = start + paramsObject.step;

                return ModelBuilder
                    .build(Object.assign({},
                        paramsObject, {
                            initialPlusX: paramsObject.initialPlusX,
                            UpDown: false,
                            different: start,
                            createShape: false,
                            mirrored: false,
                        }))
                    .then((result) => {

                        var thisEtta = getEtta(result, paramsObject);
                        if (thisEtta > findedEtta) {
                            paramsObject.step = - paramsObject.step / 3;
                        }
                        resultArray.push({
                            iteration: iteration,
                            different: result.different,
                            etta: thisEtta,
                            step: paramsObject.step,
                            start: start
                        });
                        findedEtta = thisEtta;
                        iteration++;
                        ResultObject = result;
                        return whilstCallback();

                    }).catch((err) => {
                        return whilstCallback(err);
                    });
            },
            (err, n) => {
                if (err) {
                    reject(err);
                } else {
                    // resolve({
                    //     resultArray: resultArray
                    // });
                    ResultObject.resultArray = resultArray;
                    resolve(ResultObject);
                }
            }
        );

    });
}


//x=y
//y=z
//z=x
//tgFI(zg-zc)+xg-xc
function getEtta(res, paramsObject) {
    return MathJS.abs((MathJS.tan(ShapeMath.getRad(res.different)) * (paramsObject.searchMassCenter.y - res.MassCenter.y)) - res.MassCenter.z + paramsObject.searchMassCenter.z);
}

exports.Stabilized = Stabilized;
exports.StabilizedByDifferent = StabilizedByDifferent;