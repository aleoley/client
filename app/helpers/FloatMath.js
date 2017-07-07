const MathJS = require('mathjs');

class FloatMath {
    /**
    * subtract
    * @param {*} a 
    * @param {*} b 
    */
    static subtract(a, b) {
        return MathJS.round(Math.round((a - b) * 1e12) / 1e12, 5);

    }
    /**
     * add
     * @param {*} a 
     * @param {*} b 
     */
    static add(a, b) {
        return MathJS.round(Math.round((a + b) * 1e12) / 1e12, 15);
    }

    /**
     * multiply
     * @param {*} a 
     * @param {*} b 
     */
    static multiply(a, b) {
        return MathJS.round(Math.round((a * b) * 1e12) / 1e12, 15);
    }

    /**
     * divide
     * @param {*} a 
     * @param {*} b 
     */
    static divide(a, b) {
        return MathJS.round(Math.round((a / b) * 1e12) / 1e12, 15);
    }
    /**
     * 
     * @param {*} a 
     * @param {*} b 
     */
    static isEqual(a, b) {
        return MathJS.round(a, 15) === MathJS.round(b, 15);
    }
}

exports.FloatMath = FloatMath;