const MathJS = require('mathjs');
const THREE = require("three");
var _ = require('lodash');
var async = require('async');
var ShapeMath = require('./shapeMath').ShapeMath;
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



    let Volume1 = 0;
    let Volume2 = 0;
    let Volume3 = 0;
    let firstAnsaver;
    let posibleShape;
    let triangleH1 = distanceVector(head[0], new THREE.Vector3(head[0].x, head[0].y, bottom[0].z));
    let triangleH2 = distanceVector(head[0], head[1]);
    //----------------------------------Previous Bad Variant
    // if (bottom[0].z !== bottom[1].z) {

    //     if (head[0].z > bottom[0].z) {

    //         if (bottom[0].z < bottom[1].z) {

    //             let midddleVector = new THREE.Vector3(bottom[0].x, bottom[0].y, bottom[1].z);
    //             posibleShape = {
    //                 bottom: [
    //                     midddleVector,
    //                     bottom[1],
    //                 ],
    //                 head: [
    //                     bottom[0],
    //                 ]
    //             }
    //             firstAnsaver = getVolume(posibleShape.bottom, posibleShape.head, paramsObject);
    //             Volume1 = firstAnsaver.sum;
    //             triangleH1 = distanceVector(head[0], new THREE.Vector3(head[0].x, head[0].y, bottom[1].z));

    //         } else {

    //             let midddleVector = new THREE.Vector3(bottom[1].x, bottom[1].y, bottom[0].z);
    //             posibleShape = {
    //                 bottom: [
    //                     bottom[0],
    //                     midddleVector,

    //                 ],
    //                 head: [
    //                     bottom[1],
    //                 ]
    //             };

    //             firstAnsaver = getVolume(posibleShape.bottom, posibleShape.head, paramsObject);
    //             Volume1 = firstAnsaver.sum;
    //         }


    //     } else {

    //         if (bottom[0].z < bottom[1].z) {

    //             let midddleVector = new THREE.Vector3(bottom[1].x, bottom[1].y, bottom[0].z);
    //             posibleShape = {
    //                 bottom: [
    //                     bottom[0],
    //                     midddleVector,

    //                 ],
    //                 head: [
    //                     bottom[1],

    //                 ]
    //             };

    //             firstAnsaver = getVolume(posibleShape.bottom, posibleShape.head, paramsObject);
    //             Volume1 = firstAnsaver.sum;
    //         } else {

    //             let midddleVector = new THREE.Vector3(bottom[0].x, bottom[0].y, bottom[1].z);
    //             posibleShape = {
    //                 bottom: [
    //                     midddleVector,
    //                     bottom[1],

    //                 ],
    //                 head: [
    //                     bottom[0],

    //                 ]
    //             };
    //             triangleH1 = distanceVector(head[0], new THREE.Vector3(head[0].x, head[0].y, bottom[1].z));

    //             firstAnsaver = getVolume(posibleShape.bottom, posibleShape.head, paramsObject);
    //             Volume1 = firstAnsaver.sum;
    //         }

    //     }
    // }

    //TEST
    let triangleBottom1 = triangleSqueare(
        distanceVector(bottom[0], bottom[1]),
        distanceVector(bottom[1], bottom[2]),
        distanceVector(bottom[2], bottom[0]));

    let triangleBottom2 = triangleSqueare(
        distanceVector(bottom[1], bottom[2]),
        distanceVector(bottom[2], bottom[3]),
        distanceVector(bottom[3], bottom[1]));
    let triangleBottom3 = triangleSqueare(
        distanceVector(bottom[2], bottom[3]),
        distanceVector(bottom[3], head[1]),
        distanceVector(head[1], bottom[2]));





    Volume1 += pyramidVolume(triangleBottom1, triangleH1);
    Volume2 += pyramidVolume(triangleBottom2, triangleH1);
    Volume3 += pyramidVolume(triangleBottom3, triangleH2);
    let out = {
        Volume1: Volume1,
        Volume2: Volume2,
        Volume3: Volume3,
        sum: Volume1 + Volume2 + Volume3
    }

    return out;








    // //----------------------------------END Previous Bad Variant------------------------------------

    // //----------------------------------------- START BOTTOM ----------------------------------------
    // var BottomMassCenter = {};
    // var bottomType = 0;
    // //1.Bottom is Triangle
    // //1.1 bottomHead Triangle
    // if (bottom[0].x === bottom[2].x && bottom[0].y === bottom[2].y && bottom[0].z === bottom[2].z) {
    //     bottomType = 'triangle1';
    // }
    // //1.2 bottomBottom Triangle
    // if (bottom[1].x === bottom[3].x && bottom[1].y === bottom[3].y && bottom[1].z === bottom[3].z) {
    //     bottomType = 'triangle2';
    // }
    // //2.Bottom is Trapeze
    // if (bottom[0].x !== bottom[2].x && bottom[1].x !== bottom[3].x) {
    //     bottomType = 'trapeze';
    // }
    // //3.Bottom is Line
    // if ((bottom[0].x === bottom[2].x && bottom[0].y === bottom[2].y && bottom[0].z === bottom[2].z) &&
    //     (bottom[1].x === bottom[3].x && bottom[1].y === bottom[3].y && bottom[1].z === bottom[3].z)) {
    //     bottomType = 'line';
    // }
    // //4.Bottom is Point
    // if ((bottom[0].x === bottom[2].x && bottom[0].y === bottom[2].y && bottom[0].z === bottom[2].z) &&
    //     (bottom[1].x === bottom[3].x && bottom[1].y === bottom[3].y && bottom[1].z === bottom[3].z) &&
    //     (bottom[2].x === bottom[3].x && bottom[2].y === bottom[3].y && bottom[2].z === bottom[3].z)
    // ) {
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


    // var bottomSquere = 0;
    // // h must be fixed by default
    // var vectorAH = new THREE.Vector3(0, 0, bottom[0].z);
    // var vectorBH = new THREE.Vector3(0, 0, head[0].z);
    // var fixedH = distanceVector(vectorAH, vectorBH);
    // var pyramid2H = distanceVector(head[0], head[1]);

    // var buttomA = distanceVector(bottom[0], bottom[2]);
    // var buttomB = distanceVector(bottom[1], bottom[3]);
    // var buttomC = distanceVector(bottom[0], bottom[1]);
    // var buttomD = distanceVector(bottom[2], bottom[3]);

    // var triangleA = distanceVector(bottom[2], bottom[3]);
    // var triangleB = distanceVector(head[1], bottom[3]);
    // var triangleC = distanceVector(bottom[2], head[1]);

    // switch (true) {
    //     case bottomType === 'trapeze' && headType === 'line':
    //         bottomSquere = trapezeSqueare(buttomA, buttomB, buttomC, buttomD, 'govno1');
    //         var triangleSqueareV2 = triangleSqueare(triangleA, triangleB, triangleC)



    //         var V1 = pyramidVolume(bottomSquere, fixedH);
    //         var V2 = pyramidVolume(triangleSqueareV2, pyramid2H);

    //         Answer = {
    //             TrapezePyramidVolume: V1,
    //             TrianglePyramidVolume: V2,
    //             sum: V1 + V2
    //         };
    //         break;

    //     case bottomType === 'trapeze' && headType === 'point':
    //         bottomSquere = trapezeSqueare(buttomA, buttomB, buttomC, buttomD, 'govno1');
    //         var outerSquere = pyramidVolume(bottomSquere, fixedH)
    //         Answer = {
    //             TrapezePyramidVolume: outerSquere / 2,
    //             TrianglePyramidVolume: outerSquere / 2,
    //             sum: outerSquere
    //         }
    //         break;
    //     case bottomType === 'triangle1' && headType === 'line':
    //         bottomSquere = triangleSqueare(buttomB, buttomC, buttomD);
    //         var outerSquere = pyramidVolume(bottomSquere, fixedH)
    //         Answer = {
    //             TrapezePyramidVolume: outerSquere / 2,
    //             TrianglePyramidVolume: outerSquere / 2,
    //             sum: outerSquere
    //         }
    //         break;
    //     case bottomType === 'triangle1' && headType === 'point':
    //         bottomSquere = triangleSqueare(buttomB, buttomC, buttomD);
    //         var outerSquere = pyramidVolume(bottomSquere, fixedH)
    //         Answer = {
    //             TrapezePyramidVolume: outerSquere / 2,
    //             TrianglePyramidVolume: outerSquere / 2,
    //             sum: outerSquere
    //         }
    //         break;
    //     case bottomType === 'triangle2' && headType === 'line':
    //         bottomSquere = triangleSqueare(buttomA, buttomC, buttomD);
    //         var outerSquere = pyramidVolume(bottomSquere, fixedH)
    //         Answer = {
    //             TrapezePyramidVolume: outerSquere / 2,
    //             TrianglePyramidVolume: outerSquere / 2,
    //             sum: outerSquere
    //         }
    //         break;
    //     case bottomType === 'triangle2' && headType === 'point':

    //         bottomSquere = triangleSqueare(buttomA, buttomC, buttomD);
    //         var outerSquere = pyramidVolume(bottomSquere, fixedH)
    //         Answer = {
    //             TrapezePyramidVolume: outerSquere / 2,
    //             TrianglePyramidVolume: outerSquere / 2,
    //             sum: outerSquere
    //         }
    //         break;
    //     case bottomType === 'line' && headType === 'line':
    //         var spec1 = distanceVector(bottom[3], head[1]);
    //         var spec2 = distanceVector(bottom[2], head[1]);

    //         bottomSquere = triangleSqueare(spec1, spec2, buttomD);
    //         var outerSquere = pyramidVolume(bottomSquere, pyramid2H);
    //         Answer = {
    //             TrapezePyramidVolume: outerSquere / 2,
    //             TrianglePyramidVolume: outerSquere / 2,
    //             sum: outerSquere
    //         }
    //         break;
    //     case bottomType === 'line' && headType === 'point':
    //         Answer = {
    //             TrapezePyramidVolume: 0,
    //             TrianglePyramidVolume: 0,
    //             sum: 0
    //         }
    //         break;
    //     case bottomType === 'point' && headType === 'line':
    //         Answer = {
    //             TrapezePyramidVolume: 0,
    //             TrianglePyramidVolume: 0,
    //             sum: 0
    //         }
    //         break;
    //     case bottomType === 'point' && headType === 'point':
    //         Answer = {
    //             TrapezePyramidVolume: 0,
    //             TrianglePyramidVolume: 0,
    //             sum: 0
    //         }
    //         break;
    //     default:
    //         throw new Error('Something went wrong!');


    // }

    // if (firstAnsaver) {
    //     console.log('firstAnsaver', firstAnsaver);
    //     if (firstAnsaver.sum === 0) {
    //         firstAnsaver.massCenter = getMassCenter(posibleShape.bottom, posibleShape.head);
    //         Answer.firstAnsaver = firstAnsaver;
    //     }
    // }
    // return Answer;
}
/**
 * Function for Calculating distance 
 */
function distanceVector(v1, v2) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
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
        massCenter1: tetraedrMassCenter(bottom[0], bottom[1], bottom[2], head[0]),
        massCenter2: tetraedrMassCenter(bottom[1], bottom[2], bottom[3], head[0]),
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
    var headPerBottom = floatMath().divide(head, bottom);

    var x = floatMath().divide(
        floatMath().add(
            a.x,
            floatMath().multiply(
                headPerBottom,
                b.x
            )
        ),
        floatMath().add(
            1,
            headPerBottom
        )
    );
    var y = floatMath().divide(
        floatMath().add(
            a.y,
            floatMath().multiply(
                headPerBottom,
                b.y
            )
        ),
        floatMath().add(
            1,
            headPerBottom
        )
    );
    var z = floatMath().divide(
        floatMath().add(
            a.z,
            floatMath().multiply(
                headPerBottom,
                b.z
            )
        ),
        floatMath().add(
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
    var pA1 = floatMath().multiply(floatMath().subtract(p2.y, p1.y), floatMath().subtract(p3.z, p1.z));
    var pA2 = floatMath().multiply(floatMath().subtract(p2.z, p1.z), floatMath().subtract(p3.y, p1.y));
    var A = floatMath().subtract(pA1, pA2);

    //B
    var pB1 = floatMath().multiply(floatMath().subtract(p2.x, p1.x), floatMath().subtract(p3.z, p1.z));
    var pB2 = floatMath().multiply(floatMath().subtract(p2.z, p1.z), floatMath().subtract(p3.x, p1.x));
    var B = floatMath().subtract(pB1, pB2);

    //C
    var pC1 = floatMath().multiply(floatMath().subtract(p2.x, p1.x), floatMath().subtract(p3.y, p1.y));
    var pC2 = floatMath().multiply(floatMath().subtract(p2.y, p1.y), floatMath().subtract(p3.x, p1.x));
    var C = floatMath().subtract(pC1, pC2);

    // Search for T param

    var tA_x = floatMath().multiply(A, floatMath().subtract(l2.x, l1.x));
    var tB_y = floatMath().multiply(B, floatMath().subtract(l2.y, l1.y));
    var tC_z = floatMath().multiply(C, floatMath().subtract(l2.z, l1.z));

    var divideT = floatMath().add(tC_z, floatMath().subtract(tA_x, tB_y));
    // if (divideT === 0 || isNaN(divideT)) {
    //     divideT = 0.000001;
    // }

    var A_x = floatMath().multiply(A, floatMath().subtract(l1.x, p1.x));
    var B_y = floatMath().multiply(B, floatMath().subtract(l1.y, p1.y));
    var C_z = floatMath().multiply(C, floatMath().subtract(l1.z, p1.z));

    var headT = floatMath().add(C_z, floatMath().subtract(A_x, B_y));

    var t = floatMath().divide(-headT, divideT);

    if (debug) {
        console.log('t', t);
    }

    if (!isNaN(t)) {
        var x = floatMath().add(floatMath().multiply(t, floatMath().subtract(l2.x, l1.x)), l1.x);
        var y = floatMath().add(floatMath().multiply(t, floatMath().subtract(l2.y, l1.y)), l1.y);
        var z = floatMath().add(floatMath().multiply(t, floatMath().subtract(l2.z, l1.z)), l1.z);

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
        a1: floatMath().subtract(b.x, a.x),
        a2: floatMath().subtract(d.x, c.x),
        b1: floatMath().subtract(b.y, a.y),
        b2: floatMath().subtract(d.y, c.y),
        c1: floatMath().subtract(b.z, a.z),
        c2: floatMath().subtract(d.z, c.z),
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
        bottom = floatMath().subtract(
            floatMath().multiply(
                components[combinations[i][0] + '2'],
                components[combinations[i][1] + '1']
            ),
            floatMath().multiply(
                components[combinations[i][0] + '1'],
                components[combinations[i][1] + '2']
            )
        );
        if (bottom !== 0 && !isNaN(bottom)) {
            // a1*y1'-a1*y1 + b1*x1-b1*x1'
            var head = floatMath().add(
                floatMath().subtract(
                    floatMath().multiply(
                        components[combinations[i][0] + '1'],
                        c[combinations[i][3]]
                    ),
                    floatMath().multiply(
                        components[combinations[i][0] + '1'],
                        a[combinations[i][3]]
                    )
                ),
                floatMath().subtract(
                    floatMath().multiply(
                        components[combinations[i][1] + '1'],
                        a[combinations[i][2]]

                    ),
                    floatMath().multiply(
                        c[combinations[i][2]],
                        components[combinations[i][1] + '1']
                    )
                )
            );

            p = floatMath().divide(head, bottom);

            if (!isNaN(p)) {
                //  console.log('Break', p);

                iteration = i;
                // console.log('iteration', iteration);
                break;
            }
        }
    }

    var x = floatMath().add(
        floatMath().multiply(
            p,
            components.a2
        ),
        c.x
    );
    var y = floatMath().add(
        floatMath().multiply(
            p,
            components.b2
        ),
        c.y
    );
    var z = floatMath().add(
        floatMath().multiply(
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
        var parallelogramSquere = floatMath().multiply(
            distanceVector(bottom[1], head[1]),
            distanceVector(bottom[1], proectionPoint)
        );
        var parallelogramMassCenter = intersection(head[1], proectionPoint, bottom[1], head[0]);
        Xc = floatMath().divide(floatMath().add(
            floatMath().multiply(
                triaSquere,
                triaMassCenter.x
            ),
            floatMath().multiply(
                parallelogramSquere,
                parallelogramMassCenter.x
            )
        ),
            floatMath().add(
                triaSquere,
                parallelogramSquere
            )
        );
        Yc = floatMath().divide(floatMath().add(
            floatMath().multiply(
                triaSquere,
                triaMassCenter.y
            ),
            floatMath().multiply(
                parallelogramSquere,
                parallelogramMassCenter.y
            )
        ),
            floatMath().add(
                triaSquere,
                parallelogramSquere
            )
        );
        Zc = floatMath().divide(floatMath().add(
            floatMath().multiply(
                triaSquere,
                triaMassCenter.z
            ),
            floatMath().multiply(
                parallelogramSquere,
                parallelogramMassCenter.z
            )
        ),
            floatMath().add(
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
        var parallelogramSquere = floatMath().multiply(
            distanceVector(bottom[1], head[1]),
            distanceVector(head[1], proectionPoint)
        );
        var parallelogramMassCenter = intersection(bottom[1], proectionPoint, bottom[0], head[1]);
        Xc = floatMath().divide(floatMath().add(
            floatMath().multiply(
                triaSquere,
                triaMassCenter.x
            ),
            floatMath().multiply(
                parallelogramSquere,
                parallelogramMassCenter.x
            )
        ),
            floatMath().add(
                triaSquere,
                parallelogramSquere
            )
        );
        Yc = floatMath().divide(floatMath().add(
            floatMath().multiply(
                triaSquere,
                triaMassCenter.y
            ),
            floatMath().multiply(
                parallelogramSquere,
                parallelogramMassCenter.y
            )
        ),
            floatMath().add(
                triaSquere,
                parallelogramSquere
            )
        );
        Zc = floatMath().divide(floatMath().add(
            floatMath().multiply(
                triaSquere,
                triaMassCenter.z
            ),
            floatMath().multiply(
                parallelogramSquere,
                parallelogramMassCenter.z
            )
        ),
            floatMath().add(
                triaSquere,
                parallelogramSquere
            )
        );
    }



    //----------------------------FISRT VARIAN
    // var doubleHead = new THREE.Vector3(floatMath().add(bottom[0].x, head[0].x), head[0].y, head[0].z);


    // var doubleBottom = new THREE.Vector3(floatMath().subtract(0, bottom[0].x), bottom[0].y, bottom[0].z);


    // var massCenter = intersection(headCenter, bottomCenter, doubleBottom, doubleHead);

    return new THREE.Vector3(Xc, Yc, Zc);
}
/**
 * 
 */
function tetraedrMassCenter(a, b, c, d) {
    let Xc = floatMath().divide(
        floatMath().add(
            floatMath().add(a.x, b.x),
            floatMath().add(c.x, d.x)
        ),
        4
    );

    let Yc = floatMath().divide(
        floatMath().add(
            floatMath().add(a.y, b.y),
            floatMath().add(c.y, d.y)
        ),
        4
    );

    let Zc = floatMath().divide(
        floatMath().add(
            floatMath().add(a.z, b.z),
            floatMath().add(c.z, d.z)
        ),
        4
    );

    return new THREE.Vector3(Xc, Yc, Zc);
}
function triangleMassCenter(a, b, c) {
    let Xc = floatMath().divide(
        floatMath().add(
            floatMath().add(a.x, b.x),
            c.x
        ),
        3
    );

    let Yc = floatMath().divide(
        floatMath().add(
            floatMath().add(a.y, b.y),
            c.y
        ),
        3
    );

    let Zc = floatMath().divide(
        floatMath().add(
            floatMath().add(a.z, b.z),
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

    var x = floatMath().divide(floatMath().add(vertex1.x, vertex2.x), 2);
    var y = floatMath().divide(floatMath().add(vertex1.y, vertex2.y), 2);
    var z = floatMath().divide(floatMath().add(vertex1.z, vertex2.z), 2);

    return new THREE.Vector3(x, y, z);
}



/**
 * 
 * @param {vector} l1 
 * @param {vector} l2 
 * @param {vector} point 
 */
function returnYbyLine(l1, l2, z) {
    var z = floatMath().divide(floatMath().subtract(z, l1.z), floatMath().subtract(l2.z, l1.z));

    return floatMath().add(floatMath().multiply(z, floatMath().subtract(l2.y, l1.y)), l1.y);

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
function floatMath() {
    this.add = add;
    this.subtract = subtract;
    this.multiply = multiply;
    this.divide = divide;
    /**
     * subtract
     * @param {*} a 
     * @param {*} b 
     */
    function subtract(a, b) {
        return MathJS.round(Math.round((a - b) * 1e12) / 1e12, 5);

    }

    /**
     * add
     * @param {*} a 
     * @param {*} b 
     */
    function add(a, b) {
        return MathJS.round(Math.round((a + b) * 1e12) / 1e12, 5);
    }

    /**
     * multiply
     * @param {*} a 
     * @param {*} b 
     */
    function multiply(a, b) {
        return MathJS.round(Math.round((a * b) * 1e12) / 1e12, 5);
    }

    /**
     * divide
     * @param {*} a 
     * @param {*} b 
     */
    function divide(a, b) {
        return MathJS.round(Math.round((a / b) * 1e12) / 1e12, 5);
    }

    return {
        subtract: subtract,
        multiply: multiply,
        divide: divide,
        add: add
    }
}
function getRad(deg) {
    var rad = deg * Math.PI / 180;
    return rad;
}


exports.ShapeMath = {
    FloatMath: floatMath,
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