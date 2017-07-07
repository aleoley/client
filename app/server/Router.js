const { ipcMain } = require('electron');
const StabilityFinder = require('./controllers/StabilityFinder');
const Loaders = require('../helpers/loaders');
const ModelBuilder = require('../helpers/modelBuilder');


/**
 * Function For stabilazed Ship by ParamsObject and return current filter
 * @param {*} event 
 * @param {*} arg 
 */
function stabilazed_volume(event, arg) {
    const cp = require('child_process');
    const n = cp.fork(`${__dirname}/process/volume.js`);
    n.on('message', (responce) => {
        console.log('PARENT got message:', responce);
        if (responce.error) {
            event.sender.send('error-reply', responce.error);
        } else {
            event.sender.send('stabilazed_volume-reply', responce.result);
        }
        n.kill('SIGKILL');
    });

    n.on('unhandledRejection', (reason, p) => {
        event.sender.send('error-reply', {
            reason: reason,
            p: p
        });
        n.kill('SIGKILL');
    });

    process.on('uncaughtException', (err) => {
        event.sender.send('error-reply', {
            err: err
        });
        n.kill('SIGKILL');
    });
    process.on('rejectionHandled', (p) => {
        event.sender.send('error-reply', {
            p: p
        });
        n.kill(1);
    });
    //event.sender.send('stabilazed_volume-reply', `${__dirname}/process/volume.js`);
    n.send({ arg: arg });

}


/**
 * Function For stabilazed Ship by ParamsObject and return current different
 * @param {*} event 
 * @param {*} arg 
 */
function stabilazed_different(event, arg) {
    const cp = require('child_process');
    const n = cp.fork(`${__dirname}/process/different.js`);
    n.on('message', (responce) => {
        console.log('PARENT got message:', responce);
        if (responce.error) {
            event.sender.send('error-reply', responce.error);
        } else {
            event.sender.send('stabilazed_different-reply', responce.result);
        }
        n.kill('SIGKILL');
    });

    n.on('unhandledRejection', (reason, p) => {
        event.sender.send('error-reply', {
            reason: reason,
            p: p
        });
        n.kill('SIGKILL');
    });

    n.send({ arg: arg });

}

/**
 * Function For load ship from file. Return new object nedded for working with Three.js
 * @param {*} event 
 * @param {*} arg 
 */
function load_ship(event, arg) {

    Loaders.TktLoader(arg)
        .then((res) => {
            console.log('here1', arg)
            event.sender.send('load_ship-reply', res);
        })
        .catch((err) => {

            event.sender.send('error-reply', err);
        });
}

/**
 * Function For build ship Volumeby paramsObject. Return all info about buit model
 * @param {*} event 
 * @param {*} arg 
 */
function build_model(event, arg) {

    ModelBuilder.build(arg)
        .then((res) => {
            event.sender.send('build_model-reply', res);
        })
        .catch((err) => {
            console.log('err', err);
            event.sender.send('error-reply', err);
        });
}




/**
 * Main Export
 */
module.exports = {
    stabilazed_volume: stabilazed_volume,
    stabilazed_different: stabilazed_different,
    load_ship: load_ship,
    build_model: build_model
}













