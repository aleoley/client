function Test() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('SERVER');
            resolve();
        }, 5000);
    });

};

module.exports.Test = Test;