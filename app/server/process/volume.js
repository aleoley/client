const { ipcMain } = require('electron');
const StabilityFinder = require('../controllers/StabilityFinder');
const Loaders = require('../../helpers/loaders');
const ModelBuilder = require('../../helpers/modelBuilder');
var childProcess = require('child_process');





process.on('message', (params) => {
  try {
    StabilityFinder
      .Stabilized(params.arg)
      .then((res) => {
        process.send({
          result: res
        });
      })
      .catch((err) => {
        console.log('err', err);
        process.send({
          error: JSON.stringify(err)
        });
      });
  }
  catch (e) {
    process.send({
      error: 'Problem in VolumeFile'
    });
  }


});
