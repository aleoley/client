
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
        for (var i = 0; i < 10; i = i + 0.1) {
            PromisesArray.push(
                Volume
                    .build(
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

                var minFilter = _.minBy(result, (res) => {
                    return MathJS.abs(res.Volume - paramsObject.searchVolume);
                });
                return minFilter.h;
                //return resolve(minFilter);
            })
            .then((h) => {
                paramsObject.step = 0.1;
                var findedEtta = 100;
                var etta = paramsObject.etta ? paramsObject.etta : 0.01;
                var ResultObject = {};
                var interation = 0;
                var start = h;
                var resultArray = []
                var iteration = 0;
                var count = 0;
                return new Promise((resolve2, reject2) => {
                    async.whilst(
                        () => { return etta < findedEtta && iteration < 100; },
                        (whilstCallback) => {

                            start = start + paramsObject.step;
                            return Volume
                                .build(
                                Object.assign({},
                                    {
                                        UpDown: false,
                                        filter: start
                                    },
                                    paramsObject)
                                )
                                .then((result) => {
                                    var thisEtta = MathJS.abs(result.Volume - paramsObject.searchVolume);
                                    if (thisEtta > findedEtta) {
                                        paramsObject.step = - paramsObject.step / 3;
                                    }

                                    findedEtta = thisEtta;
                                    iteration++;
                                    ResultObject = result;
                                    return whilstCallback();

                                })
                                .catch((err) => {
                                    return whilstCallback(err);
                                });
                        },
                        (err, n) => {
                            if (err) {
                                reject2(err);
                            } else {
                                resolve2(ResultObject);
                            }
                        }
                    );
                });
            })
            .then((result) => {
                return resolve(result);
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
function StabilizedByDifferent1(paramsObject) {

    return new Promise(function (resolve, reject) {
        if (!paramsObject.etta || !paramsObject.searchMassCenter) {
            reject('No etta or searchMassCenter  for Stabilized');
        }


        var PromisesArray = [];
        for (var i = -30; i < 30; i++) {
            PromisesArray.push(
                ModelBuilder
                    .build(
                    Object.assign(
                        {},
                        paramsObject,
                        {
                            initialPlusX: paramsObject.initialPlusX,
                            UpDown: false,
                            different: i,
                            createShape: false,
                            mirrored: false,
                        }
                    ))
            );
        }
        return Promise
            .all(PromisesArray)
            .then(function (result) {

                var min = _.minBy(result, (res) => {
                    return getEtta(res, paramsObject);
                });
                return min;
                //resolve(min);

            })
            .then((min) => {
                paramsObject.step = 1;
                var findedEtta = getEtta(min, paramsObject);
                var ResultObject = min;
                var interation = 0;
                var start = min.different;
                var resultArray = []
                var iteration = 0;
                var count = 0;
                return new Promise((resolve2, reject2) => {

                    async.whilst(
                        () => { return paramsObject.etta < findedEtta && iteration < 100; },
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
                                reject2(err);
                            } else {
                                // resolve({
                                //     resultArray: resultArray
                                // });
                                ResultObject.resultArray = resultArray;
                                resolve2(ResultObject);
                            }
                        }
                    );

                });
            })
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            })












    });
}

function StabilizedByDifferent(paramsObject) {

    return new Promise(function (resolve, reject) {
        if (!paramsObject.etta || !paramsObject.searchMassCenter) {
            reject('No etta or searchMassCenter  for Stabilized');
        }
        let start = -30;
        let step = 10;
        let iteration = 0;
        let ResultObject = {};
        let findedEtta = 100;

        return new Promise((resolve2, reject2) => {
            async.whilst(() => {
                return paramsObject.etta < findedEtta && iteration < 100;
            },
                (whilstCallback) => {
                    if (iteration)
                        start = start + step;
                    ModelBuilder
                        .build(Object.assign(
                            {},
                            paramsObject,
                            {
                                initialPlusX: paramsObject.initialPlusX,
                                UpDown: false,
                                different: start,
                                createShape: false,
                                mirrored: false,
                            }
                        ))
                        .then((result) => {
                            paramsObject.defaultPoint = result.defaultPoint;
                            paramsObject.defaultPointArray = result.defaultPointArray;
                            var thisEtta = getEtta(result, paramsObject);
                            if (thisEtta > findedEtta) {
                                step = - step / 3;
                            }

                            findedEtta = thisEtta;
                            iteration++;
                            ResultObject = result;
                            return whilstCallback();

                        }).catch((err) => {
                            return whilstCallback(err);
                        });
                },
                (err) => {
                    if (err) {
                        reject2(err);
                    } else {
                        resolve2(ResultObject);
                    }
                })
        })
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });

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