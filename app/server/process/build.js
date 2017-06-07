const { ipcMain } = require('electron');
const StabilityFinder = require('../controllers/StabilityFinder');
const Loaders = require('../../helpers/loaders');
const ModelBuilder = require('../../helpers/modelBuilder');
var childProcess = require('child_process');





process.on('message', (params) => {
    ModelBuilder
        .build(params.arg)
        .then((res) => {
            process.send(res);
        })
        .catch((err) => {
            console.log('err', err);
            process.send({
                error: err
            });
        });

});

