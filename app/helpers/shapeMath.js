const MathJS = require('mathjs');
const THREE = require("three");
var _ = require('lodash');
var async = require('async');
var ShapeMath = require('./shapeMath').ShapeMath;
const FloatMath = require('./FloatMath').FloatMath;


/**
 * Function for finding Volumu by 8 points in 2 shpangs
 * 
 * //===========bottom============
    //
    // bottom[0]          bottom[3]
    //        |           |
    //        |           |
    //        |           |
    //        |___________|
    // bottom[1]          bottom[2]
    //
 
 
    //=============top============
    //
    //    top[0]          top[3]
    //        |           |
    //        |           |
    //        |           |
    //        |___________|
    //    top[1]          top[2]
*/
function getVolume(bottom, head, paramsObject) {
    // console.log('getVolume bottom', bottom)
    // console.log('getVolume head', head)

    //botom must have lenght=2
    if (bottom.length !== 2) {
        return;
    }

    //head must have lenght=1 
    if (head.length !== 1) {
        return;
    }

    // build proections
    bottom.push(proectionX(bottom[0]));
    bottom.push(proectionX(bottom[1]));
    head.push(proectionX(head[0]));

    let Volume1 = tetraedrVolume(head[0], bottom[0], bottom[1], bottom[3]);
    let Volume2 = tetraedrVolume(head[0], bottom[0], bottom[2], bottom[3]);
    let Volume3 = tetraedrVolume(head[0], bottom[2], bottom[3], head[1]);
    if (isNaN(Volume1) || isNaN(Volume2) || isNaN(Volume3)) {
        console.log('Volume1', Volume1)
        console.log('Volume2', Volume2)
        console.log('Volume3', Volume3)
    }
    /// newwwwwwwwww
    return {
        Volume1: Volume1,
        Volume2: Volume2,
        Volume3: Volume3,
        sum: FloatMath.add(
            FloatMath.add(
                Volume1,
                Volume2
            ),
            Volume3)
    };
}
/**
 * Function for Calculating distance 
 */
function distanceVector(v1, v2) {
    var dx = FloatMath.subtract(v2.x, v1.x);
    var dy = FloatMath.subtract(v2.y, v1.y);
    var dz = FloatMath.subtract(v2.z, v1.z);
    return Math.sqrt(FloatMath.add(
        FloatMath.multiply(
            dx,
            dx
        ),
        FloatMath.add(
            FloatMath.multiply(
                dy,
                dy
            ),
            FloatMath.multiply(
                dz,
                dz
            )
        )
    ));
}
/**
 * 
 * @param {head} a 
 * @param {*} b 
 * @param {*} c 
 * @param {*} d 
 */
function tetraedrVolume(a, b, c, d) {
    let ab = new THREE.Vector3(
        FloatMath.subtract(
            b.x,
            a.x
        ),
        FloatMath.subtract(
            b.y,
            a.y
        ),
        FloatMath.subtract(
            b.z,
            a.z
        )
    );

    let ac = new THREE.Vector3(
        FloatMath.subtract(
            c.x,
            a.x
        ),
        FloatMath.subtract(
            c.y,
            a.y
        ),
        FloatMath.subtract(
            c.z,
            a.z
        )
    );
    let ad = new THREE.Vector3(
        FloatMath.subtract(
            d.x,
            a.x
        ),
        FloatMath.subtract(
            d.y,
            a.y
        ),
        FloatMath.subtract(
            d.z,
            a.z
        )
    );
    // console.log('ab', ab)
    // console.log('ac', ac)
    // console.log('ad', ad)


    let vectorMultiply1 = FloatMath.multiply(
        ab.x,
        FloatMath.subtract(
            FloatMath.multiply(
                ac.y,
                ad.z
            ),
            FloatMath.multiply(
                ac.z,
                ad.y
            )
        )
    );
    let vectorMultiply2 = FloatMath.multiply(
        ab.y,
        FloatMath.subtract(
            FloatMath.multiply(
                ac.x,
                ad.z
            ),
            FloatMath.multiply(
                ac.z,
                ad.x
            )
        )
    );
    let vectorMultiply3 = FloatMath.multiply(
        ab.z,
        FloatMath.subtract(

            FloatMath.multiply(
                ac.x,
                ad.y
            ),
            FloatMath.multiply(
                ac.y,
                ad.x
            )
        )
    );
    // console.log('vectorMultiply1', vectorMultiply1)
    // console.log('vectorMultiply2', vectorMultiply2)
    // console.log('vectorMultiply3', vectorMultiply3)

    let result = MathJS.abs(FloatMath.add(
        FloatMath.subtract(
            vectorMultiply1,
            vectorMultiply2
        ),
        vectorMultiply3
    ));
    // console.log('result', result)
    let out = FloatMath.divide(
        result,
        6
    );
    // console.log('out', out)
    return out;
    // throw new Error('foo');
}


/**
 * 
 * @param {*} bottom 
 * @param {*} head 
 */
function getMassCenter(bottom, head) {

    // bottom[2]       bottom[0]
    //         ________
    //        |        |
    //        |        |
    //        |        |
    //        |________|
    // bottom[3]        bottom[1]
    // console.log('getMassCenter START')
    // return {
    //     FirstPyramidMassCenter: trapezeMassCenter([bottom[0], bottom[2]], [bottom[1], bottom[3]]),
    //     SecondPyramidMassCenter: triangleMassCenter(bottom[2], bottom[3], head[1])
    // };

    return {
        massCenter1: tetraedrMassCenter(bottom[0], bottom[1], bottom[3], head[0]),
        massCenter2: tetraedrMassCenter(bottom[0], bottom[2], bottom[3], head[0]),
        massCenter3: tetraedrMassCenter(bottom[2], bottom[3], head[1], head[0]),
    }


    // //----------------------------------------- START BOTTOM ----------------------------------------
    // var BottomMassCenter = {};
    // var bottomType = 0;
    // //1.Bottom is Triangle
    // //1.1 bottomHead Triangle
    // if (bottom[0].x === bottom[2].x && bottom[0].y === bottom[2].y && bottom[0].z === bottom[2].z) {
    //     BottomMassCenter = triangleMassCenter(bottom[0], bottom[1], bottom[3]);
    //     bottomType = 'triangle1';
    // }
    // //1.2 bottomBottom Triangle
    // if (bottom[1].x === bottom[3].x && bottom[1].y === bottom[3].y && bottom[1].z === bottom[3].z) {
    //     BottomMassCenter = triangleMassCenter(bottom[0], bottom[2], bottom[3]);
    //     bottomType = 'triangle2';
    // }
    // //2.Bottom is Trapeze
    // if (bottom[0].x !== bottom[2].x && bottom[1].x !== bottom[3].x) {
    //     BottomMassCenter = trapezeMassCenter([bottom[0], bottom[2]], [bottom[1], bottom[3]]);
    //     bottomType = 'trapeze';
    // }
    // //3.Bottom is Line
    // if ((bottom[0].x === bottom[2].x && bottom[0].y === bottom[2].y && bottom[0].z === bottom[2].z) &&
    //     (bottom[1].x === bottom[3].x && bottom[1].y === bottom[3].y && bottom[1].z === bottom[3].z)) {
    //     BottomMassCenter = vertexCenter(bottom[0], bottom[1]);
    //     bottomType = 'line';
    // }
    // //4.Bottom is Point
    // if ((bottom[0].x === bottom[2].x && bottom[0].y === bottom[2].y && bottom[0].z === bottom[2].z) &&
    //     (bottom[1].x === bottom[3].x && bottom[1].y === bottom[3].y && bottom[1].z === bottom[3].z) &&
    //     (bottom[2].x === bottom[3].x && bottom[2].y === bottom[3].y && bottom[2].z === bottom[3].z)
    // ) {
    //     BottomMassCenter = bottom[0];
    //     bottomType = 'point';
    // }

    // //----------------------------------------- END BOTTOM ----------------------------------------



    // //----------------------------------------- START HEAD ----------------------------------------
    // var headType = 0;
    // //1.Head is Line
    // if (head[0].x !== head[1].x) {
    //     headType = 'line'
    // }
    // //2.Head is Point
    // if (head[0].x === head[1].x && head[0].y === head[1].y && head[0].z === head[1].z) {
    //     headType = 'point'
    // }

    // //----------------------------------------- END HEAD ----------------------------------------


    // switch (true) {
    //     case bottomType === 'trapeze' && headType === 'line':


    //     case bottomType === 'trapeze' && headType === 'point':

    //     case bottomType === 'triangle1' && headType === 'line':

    //     case bottomType === 'triangle1' && headType === 'point':

    //     case bottomType === 'triangle2' && headType === 'line':

    //     case bottomType === 'triangle2' && headType === 'point':

    //     case bottomType === 'line' && headType === 'line':

    //     case bottomType === 'line' && headType === 'point':

    //     case bottomType === 'point' && headType === 'line':

    //     case bottomType === 'point' && headType === 'point':


    //     default:
    //         console.log('bottom', bottom);
    //         console.log('head', head);
    //         console.log('bottomType', bottomType);
    //         console.log('headType', headType);
    //         throw new Error('Mass Center Dosen\'t identify!');




    // }
}


function massCenterCheck(massCenter, bottom, head) {
    if (parseInt(massCenter.x) > parseInt(_.maxBy(bottom, 'x').x) || parseInt(massCenter.x) < parseInt(_.minBy(bottom, 'x').x)) {
        console.log('massCenter', massCenter);
        console.log('bottom', bottom);
        console.log('head', head);
        // console.log('bottomType', bottomType);
        // console.log('headType', headType);
        // throw new Error('GOVNO!')
    }
}

function inDivide(a, b, head, bottom) {
    var headPerBottom = FloatMath.divide(head, bottom);

    var x = FloatMath.divide(
        FloatMath.add(
            a.x,
            FloatMath.multiply(
                headPerBottom,
                b.x
            )
        ),
        FloatMath.add(
            1,
            headPerBottom
        )
    );
    var y = FloatMath.divide(
        FloatMath.add(
            a.y,
            FloatMath.multiply(
                headPerBottom,
                b.y
            )
        ),
        FloatMath.add(
            1,
            headPerBottom
        )
    );
    var z = FloatMath.divide(
        FloatMath.add(
            a.z,
            FloatMath.multiply(
                headPerBottom,
                b.z
            )
        ),
        FloatMath.add(
            1,
            headPerBottom
        )
    );
    return new THREE.Vector3(x, y, z);
};





/**
 * 
 * @param {array} plane 
 * @param {array} line 
 */
function intersectionPlaneLine(plane, line, debug) {

    // plane mast contains of 3 points
    if (plane.length !== 3 || line.length !== 2) {
        return;
    }
    //plane
    var p1 = plane[0];
    var p2 = plane[1];
    var p3 = plane[2];
    //line
    var l1 = line[0];
    var l2 = line[1];


    // ----------- create nedded components for plane 
    //A
    var pA1 = FloatMath.multiply(FloatMath.subtract(p2.y, p1.y), FloatMath.subtract(p3.z, p1.z));
    var pA2 = FloatMath.multiply(FloatMath.subtract(p2.z, p1.z), FloatMath.subtract(p3.y, p1.y));
    var A = FloatMath.subtract(pA1, pA2);

    //B
    var pB1 = FloatMath.multiply(FloatMath.subtract(p2.x, p1.x), FloatMath.subtract(p3.z, p1.z));
    var pB2 = FloatMath.multiply(FloatMath.subtract(p2.z, p1.z), FloatMath.subtract(p3.x, p1.x));
    var B = FloatMath.subtract(pB1, pB2);

    //C
    var pC1 = FloatMath.multiply(FloatMath.subtract(p2.x, p1.x), FloatMath.subtract(p3.y, p1.y));
    var pC2 = FloatMath.multiply(FloatMath.subtract(p2.y, p1.y), FloatMath.subtract(p3.x, p1.x));
    var C = FloatMath.subtract(pC1, pC2);

    // Search for T param

    var tA_x = FloatMath.multiply(A, FloatMath.subtract(l2.x, l1.x));
    var tB_y = FloatMath.multiply(B, FloatMath.subtract(l2.y, l1.y));
    var tC_z = FloatMath.multiply(C, FloatMath.subtract(l2.z, l1.z));

    var divideT = FloatMath.add(tC_z, FloatMath.subtract(tA_x, tB_y));
    // if (divideT === 0 || isNaN(divideT)) {
    //     divideT = 0.000001;
    // }

    var A_x = FloatMath.multiply(A, FloatMath.subtract(l1.x, p1.x));
    var B_y = FloatMath.multiply(B, FloatMath.subtract(l1.y, p1.y));
    var C_z = FloatMath.multiply(C, FloatMath.subtract(l1.z, p1.z));

    var headT = FloatMath.add(C_z, FloatMath.subtract(A_x, B_y));

    var t = FloatMath.divide(-headT, divideT);

    if (debug) {
        console.log('t', t);
    }

    if (!isNaN(t)) {
        var x = FloatMath.add(FloatMath.multiply(t, FloatMath.subtract(l2.x, l1.x)), l1.x);
        var y = FloatMath.add(FloatMath.multiply(t, FloatMath.subtract(l2.y, l1.y)), l1.y);
        var z = FloatMath.add(FloatMath.multiply(t, FloatMath.subtract(l2.z, l1.z)), l1.z);

        return new THREE.Vector3(x, y, z);
    } else {

        console.log('plane', plane);
        console.log('line', line);
        throw new Error('No intersection LinePlane');
        //return new THREE.Vector3();
    }

}



function intersection(a, b, c, d) {
    //First check
    if ((a.x === b.x && a.y === b.y && a.z === b.z)
        ||
        (c.x === d.x && c.y === d.y && c.z === d.z)) {
        throw new Error('SAME Points!');
    }

    var components = {
        a1: FloatMath.subtract(b.x, a.x),
        a2: FloatMath.subtract(d.x, c.x),
        b1: FloatMath.subtract(b.y, a.y),
        b2: FloatMath.subtract(d.y, c.y),
        c1: FloatMath.subtract(b.z, a.z),
        c2: FloatMath.subtract(d.z, c.z),
    }


    var p;
    var bottom;
    var head;
    var iteration;

    var combinations = [
        [
            'a',
            'b',
            'x',
            'y'
        ], [
            'a',
            'c',
            'x',
            'z'
        ], [
            'b',
            'a',
            'y',
            'x'
        ], [
            'b',
            'c',
            'y',
            'z'
        ], [
            'c',
            'a',
            'z',
            'x'
        ], [
            'c',
            'b',
            'z',
            'y'
        ]
    ]


    for (var i = 0; i < combinations.length; i++) {
        //a2*b1-a1*b2
        bottom = FloatMath.subtract(
            FloatMath.multiply(
                components[combinations[i][0] + '2'],
                components[combinations[i][1] + '1']
            ),
            FloatMath.multiply(
                components[combinations[i][0] + '1'],
                components[combinations[i][1] + '2']
            )
        );
        if (bottom !== 0 && !isNaN(bottom)) {
            // a1*y1'-a1*y1 + b1*x1-b1*x1'
            var head = FloatMath.add(
                FloatMath.subtract(
                    FloatMath.multiply(
                        components[combinations[i][0] + '1'],
                        c[combinations[i][3]]
                    ),
                    FloatMath.multiply(
                        components[combinations[i][0] + '1'],
                        a[combinations[i][3]]
                    )
                ),
                FloatMath.subtract(
                    FloatMath.multiply(
                        components[combinations[i][1] + '1'],
                        a[combinations[i][2]]

                    ),
                    FloatMath.multiply(
                        c[combinations[i][2]],
                        components[combinations[i][1] + '1']
                    )
                )
            );

            p = FloatMath.divide(head, bottom);

            if (!isNaN(p)) {
                //  console.log('Break', p);

                iteration = i;
                // console.log('iteration', iteration);
                break;
            }
        }
    }

    var x = FloatMath.add(
        FloatMath.multiply(
            p,
            components.a2
        ),
        c.x
    );
    var y = FloatMath.add(
        FloatMath.multiply(
            p,
            components.b2
        ),
        c.y
    );
    var z = FloatMath.add(
        FloatMath.multiply(
            p,
            components.c2
        ),
        c.z
    );
    return new THREE.Vector3(x, y, z);

}







function getProectionOnLine(point1, point2, point3) {

    return ((point3.y - point1.y) / (point2.y - point1.y)) * (point2.x - point1.x) + point1.x;
}

//=================================START MASS CENTERS================================

function trapezeMassCenter(bottom, head) {

    // bottom[0] - real
    // bottom[1] - proection   
    // head[0] - real
    // head[1] - proection 
    //
    //     head
    //        _____________
    //        |   |   \
    //  ______|___|____\
    //
    //     bottom
    //
    if ((bottom[0].x === bottom[1].x && bottom[0].y === bottom[1].y && bottom[0].z === bottom[1].z)
        &&
        (head[0].x === head[1].x && head[0].y === head[1].y && head[0].z === head[1].z)) {
        return vertexCenter(bottom[0], head[0]);

    }

    if (bottom[0].x === bottom[1].x && bottom[0].y === bottom[1].y && bottom[0].z === bottom[1].z) {
        return triangleMassCenter(bottom[0], head[0], head[1]);
    }
    if (head[0].x === head[1].x && head[0].y === head[1].y && head[0].z === head[1].z) {
        return triangleMassCenter(head[0], bottom[0], bottom[1]);
    }
    var maxOsnovanie = distanceVector(bottom[0], bottom[1]);
    var minOsnovanie = distanceVector(head[0], head[1]);

    if (distanceVector(bottom[0], bottom[1]) < distanceVector(head[0], head[1])) {
        var m = JSON.parse(JSON.stringify(head));
        var r = JSON.parse(JSON.stringify(bottom));

        bottom = m;
        head = r;

        var p = maxOsnovanie;
        maxOsnovanie = minOsnovanie;
        minOsnovanie = maxOsnovanie;
    }

    // if (bottom[0].x < head[0].x) {

    //     var m = _.cloneDeep(head);
    //     var r = _.cloneDeep(bottom);
    //     bottom = m;
    //     head = r;
    // }

    // get centers of bottom and head of trapeze
    //--------------------------SECOND VARIANT
    // var bottomCenter = vertexCenter(bottom[0], bottom[1]);
    // var headCenter = vertexCenter(head[0], head[1]);

    // var trapezeH = distanceVector(head[1], bottom[1]);

    // var Rac = (trapezeH / 3) * ((2 * maxOsnovanie + minOsnovanie) / (minOsnovanie + maxOsnovanie));


    // var Rab = distanceVector(bottomCenter, headCenter);
    // var k = Rac / Rab
    // var Xc = bottomCenter.x + (headCenter.x - bottomCenter.x) * k
    // var Yc = bottomCenter.y + (headCenter.y - bottomCenter.y) * k
    // var Zc = bottomCenter.z + (headCenter.z - bottomCenter.z) * k

    //----------------------------THIRD VARIANT
    var Xc = 0;
    var Yc = 0;
    var Zc = 0;
    if (bottom[0].x > head[0].x) {
        var proectionPoint = new THREE.Vector3(head[0].x, bottom[0].y, bottom[0].z);
        var triaSquere = triangleSqueare(
            distanceVector(bottom[0], head[0]),
            distanceVector(bottom[0], proectionPoint),
            distanceVector(proectionPoint, head[0])
        )
        var triaMassCenter = triangleMassCenter(bottom[0], proectionPoint, head[0]);
        var parallelogramSquere = FloatMath.multiply(
            distanceVector(bottom[1], head[1]),
            distanceVector(bottom[1], proectionPoint)
        );
        var parallelogramMassCenter = intersection(head[1], proectionPoint, bottom[1], head[0]);
        Xc = FloatMath.divide(FloatMath.add(
            FloatMath.multiply(
                triaSquere,
                triaMassCenter.x
            ),
            FloatMath.multiply(
                parallelogramSquere,
                parallelogramMassCenter.x
            )
        ),
            FloatMath.add(
                triaSquere,
                parallelogramSquere
            )
        );
        Yc = FloatMath.divide(FloatMath.add(
            FloatMath.multiply(
                triaSquere,
                triaMassCenter.y
            ),
            FloatMath.multiply(
                parallelogramSquere,
                parallelogramMassCenter.y
            )
        ),
            FloatMath.add(
                triaSquere,
                parallelogramSquere
            )
        );
        Zc = FloatMath.divide(FloatMath.add(
            FloatMath.multiply(
                triaSquere,
                triaMassCenter.z
            ),
            FloatMath.multiply(
                parallelogramSquere,
                parallelogramMassCenter.z
            )
        ),
            FloatMath.add(
                triaSquere,
                parallelogramSquere
            )
        );

    } else {
        var proectionPoint = new THREE.Vector3(bottom[0].x, head[0].y, head[0].z);
        var triaSquere = triangleSqueare(
            distanceVector(bottom[0], head[0]),
            distanceVector(bottom[0], proectionPoint),
            distanceVector(proectionPoint, head[0])
        )
        var triaMassCenter = triangleMassCenter(bottom[0], proectionPoint, head[0]);
        var parallelogramSquere = FloatMath.multiply(
            distanceVector(bottom[1], head[1]),
            distanceVector(head[1], proectionPoint)
        );
        var parallelogramMassCenter = intersection(bottom[1], proectionPoint, bottom[0], head[1]);
        Xc = FloatMath.divide(FloatMath.add(
            FloatMath.multiply(
                triaSquere,
                triaMassCenter.x
            ),
            FloatMath.multiply(
                parallelogramSquere,
                parallelogramMassCenter.x
            )
        ),
            FloatMath.add(
                triaSquere,
                parallelogramSquere
            )
        );
        Yc = FloatMath.divide(FloatMath.add(
            FloatMath.multiply(
                triaSquere,
                triaMassCenter.y
            ),
            FloatMath.multiply(
                parallelogramSquere,
                parallelogramMassCenter.y
            )
        ),
            FloatMath.add(
                triaSquere,
                parallelogramSquere
            )
        );
        Zc = FloatMath.divide(FloatMath.add(
            FloatMath.multiply(
                triaSquere,
                triaMassCenter.z
            ),
            FloatMath.multiply(
                parallelogramSquere,
                parallelogramMassCenter.z
            )
        ),
            FloatMath.add(
                triaSquere,
                parallelogramSquere
            )
        );
    }



    //----------------------------FISRT VARIAN
    // var doubleHead = new THREE.Vector3(FloatMath.add(bottom[0].x, head[0].x), head[0].y, head[0].z);


    // var doubleBottom = new THREE.Vector3(FloatMath.subtract(0, bottom[0].x), bottom[0].y, bottom[0].z);


    // var massCenter = intersection(headCenter, bottomCenter, doubleBottom, doubleHead);

    return new THREE.Vector3(Xc, Yc, Zc);
}
/**
 * 
 */
function tetraedrMassCenter(a, b, c, d) {
    let Xc = FloatMath.divide(
        FloatMath.add(
            FloatMath.add(a.x, b.x),
            FloatMath.add(c.x, d.x)
        ),
        4
    );

    let Yc = FloatMath.divide(
        FloatMath.add(
            FloatMath.add(a.y, b.y),
            FloatMath.add(c.y, d.y)
        ),
        4
    );

    let Zc = FloatMath.divide(
        FloatMath.add(
            FloatMath.add(a.z, b.z),
            FloatMath.add(c.z, d.z)
        ),
        4
    );

    return new THREE.Vector3(Xc, Yc, Zc);
}
function triangleMassCenter(a, b, c) {
    let Xc = FloatMath.divide(
        FloatMath.add(
            FloatMath.add(a.x, b.x),
            c.x
        ),
        3
    );

    let Yc = FloatMath.divide(
        FloatMath.add(
            FloatMath.add(a.y, b.y),
            c.y
        ),
        3
    );

    let Zc = FloatMath.divide(
        FloatMath.add(
            FloatMath.add(a.z, b.z),
            c.z
        ),
        3
    );

    // var centerAB = vertexCenter(pointA, pointB);
    // var centerBC = vertexCenter(pointB, pointC);

    // var massCenter = intersection(centerAB, pointC, centerBC, pointA);

    //return massCenter;
    return new THREE.Vector3(Xc, Yc, Zc);
}


//=================================END MASS CENTERS================================



function proectionX(vector) {
    var proectionVector = Object.assign({}, vector);
    proectionVector.x = 0;
    return new THREE.Vector3(proectionVector.x, proectionVector.y, proectionVector.z);
}

function proectionOnShapng(point, ShpangX) {
    return new THREE.Vector3(point.x, point.y, ShpangX);
};



//=================================START SQUEARS================================


/**
 * function for finding trapeze Squeare
 * 
 * Squeare is 1/2 * (a + b) * h
 * 
 */
function trapezeSqueare(a, b, c, d) {
    // h is Math.sqrt(c*c - (a-b)*(a-b) +c*c - d*d )
    if (b === c && a === 0 && d === 0) {
        return 0;
    }
    if (a > b) {

        var m = b;
        b = a;
        a = m;
    }
    var in1 = ((a - b) * (a - b) + c * c - d * d);
    var ab2 = 2 * (a - b);
    if (ab2 === 0) {
        return a * c;
    }
    var ab22 = (in1 / ab2) * (in1 / ab2);



    var h = Math.sqrt(c * c - ab22);
    var squeare = (h * (a + b)) / 2;

    if (isNaN(squeare)) {

        squeare = 0;

    }

    return squeare;
}


/**
 * function for finding triangle Squeare
 * 
 * 
 * Squeare is 1/2 * a * h
 * 
 */
function triangleSqueare(a, b, c) {

    var p = ((a + b + c)) / 2;


    return Math.sqrt(p * (p - a) * (p - b) * (p - c));


}

//===================================END SQUEARS==================================



//=================================START VOLUEM===================================

/**
 * Pyramid Volume
 * 
 * Volume is 1/3 * h
 * or h * bottomS
 * 
 */
function pyramidVolume(bottomS, h) {
    return 1 / 3 * h * bottomS;
}
function prismaVolume(bottomS, h) {
    return h * bottomS;
}

/**
 * Trancated Pyramid Volume
 * 
 * Volume is V= 1/3 * (S1 + sqrt(S1 * S2) + S2)
 * 
 */
function trancatedPyramidVolume(S1, S2, h) {
    var V = 0;

    return ((S1 + Math.sqrt(S1 * S2) + S2)) / 3;

}

/**
 * Parallelogram Volume
 */
function parallelogramVolume(a, b, c) {
    return a * b * c;
}

function vertexCenter(vertex1, vertex2) {

    var x = FloatMath.divide(FloatMath.add(vertex1.x, vertex2.x), 2);
    var y = FloatMath.divide(FloatMath.add(vertex1.y, vertex2.y), 2);
    var z = FloatMath.divide(FloatMath.add(vertex1.z, vertex2.z), 2);

    return new THREE.Vector3(x, y, z);
}



/**
 * 
 * @param {vector} l1 
 * @param {vector} l2 
 * @param {vector} point 
 */
function returnYbyLine(l1, l2, z) {
    var z = FloatMath.divide(FloatMath.subtract(z, l1.z), FloatMath.subtract(l2.z, l1.z));

    return FloatMath.add(FloatMath.multiply(z, FloatMath.subtract(l2.y, l1.y)), l1.y);

}





/**
 * This function must return only 2 vertex with min distanse to current
 */
function minDistanse(vertex, shapg, shpangX) {


    outArray = [];
    var i = 0
    var sortedShapng = _.sortBy(shapg, function (point) {
        return point.y;
    })
    var more = _.filter(sortedShapng, function (point) {
        return vertex.y < point.y;
    });
    var less = _.filter(sortedShapng, function (point) {
        return vertex.y >= point.y;
    });

    if (more.length > 0 && less.length > 0) {


        var moreDistance = Math.abs(Math.round((more[0].y - vertex.y) * 1e12) / 1e12);
        var lessDistance = Math.abs(Math.round((less[less.length - 1].y - vertex.y) * 1e12) / 1e12);

        switch (true) {
            case moreDistance.toFixed(3) > lessDistance.toFixed(3):
                outArray.push(less[less.length - 1]);
                break;
            case moreDistance.toFixed(3) < lessDistance.toFixed(3):
                outArray.push(more[0]);
                break;
            case moreDistance.toFixed(3) === lessDistance.toFixed(3) || (distanceVector(vertex, more[0]) === distanceVector(vertex, less[less.length - 1])):
                outArray.push(more[0]);
                outArray.push(less[less.length - 1]);
                // console.log('GOVNOOOOOOO')
                break;

            default:
                break;
        }

    } else {
        if (less.length > 0) {
            outArray.push(less[less.length - 1]);
        }
        if (more.length > 0) {
            outArray.push(more[0]);
        }
    }


    return outArray;

}









///=========================================  MATH OPERATIONS FOR FLOAT NUMBERS=====================
//Subtraction 
//multiplication
//division
//addition




// function FloatMath {
//     this.add = add;
//     this.subtract = subtract;
//     this.multiply = multiply;
//     this.divide = divide;
//     /**
//      * subtract
//      * @param {*} a 
//      * @param {*} b 
//      */
//     function subtract(a, b) {
//         return Math.round((a - b) * 1e12) / 1e12;

//     }

//     /**
//      * add
//      * @param {*} a 
//      * @param {*} b 
//      */
//     function add(a, b) {
//         return Math.round((a + b) * 1e12) / 1e12;
//     }

//     /**
//      * multiply
//      * @param {*} a 
//      * @param {*} b 
//      */
//     function multiply(a, b) {
//         return Math.round((a * b) * 1e12) / 1e12;
//     }

//     /**
//      * divide
//      * @param {*} a 
//      * @param {*} b 
//      */
//     function divide(a, b) {
//         return Math.round((a / b) * 1e12) / 1e12;
//     }

//     return {
//         subtract: subtract,
//         multiply: multiply,
//         divide: divide,
//         add: add
//     }
// }
function getRad(deg) {
    var rad = deg * Math.PI / 180;
    return rad;
}


exports.ShapeMath = {
    FloatMath: FloatMath,
    getMassCenter: getMassCenter,
    returnYbyLine: returnYbyLine,
    intersectionPlaneLine: intersectionPlaneLine,
    trapezeMassCenter: trapezeMassCenter,
    triangleMassCenter: triangleMassCenter,
    vertexCenter: vertexCenter,
    proectionOnShapng: proectionOnShapng,
    getProectionOnLine: getProectionOnLine,
    distanceVector: distanceVector,
    proectionX: proectionX,
    getRad: getRad,
    Squeare: {
        Triangle: triangleSqueare,
        Trapeze: trapezeSqueare,

    },
    Volume: {
        Pyramid: pyramidVolume,
        getVolume: getVolume

    },
    minDistanse: minDistanse

};