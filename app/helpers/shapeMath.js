var MathJS = require('mathjs');


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
function getVolume(bottom, head) {

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

    // h must be fixed by default
    var vectorAH = new THREE.Vector3(0, 0, bottom[0].z);
    var vectorBH = new THREE.Vector3(0, 0, head[0].z);
    var fixedH = distanceVector(vectorAH, vectorBH);

    var buttomA = distanceVector(bottom[0], bottom[2]);
    var buttomB = distanceVector(bottom[1], bottom[3]);
    var buttomC = distanceVector(bottom[0], bottom[1]);
    var buttomD = distanceVector(bottom[2], bottom[3]);



    var triangleA = distanceVector(bottom[2], bottom[3]);
    var triangleB = distanceVector(head[1], bottom[3]);
    var triangleC = distanceVector(bottom[2], head[1]);


    var trapezeSqueareV1 = trapezeSqueare(buttomA, buttomB, buttomC, buttomD);
    var triangleSqueareV2 = triangleSqueare(triangleA, triangleB, triangleC)

    var pyramid2H = distanceVector(head[0], head[1]);

    var V1 = pyramidVolume(trapezeSqueareV1, fixedH);
    var V2 = pyramidVolume(triangleSqueareV2, pyramid2H);

    return V1 + V2;
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



    //  var buttomA = distanceVector(bottom[0], bottom[2]);
    //  var buttomB = distanceVector(bottom[1], bottom[3]);
    //  var buttomC = distanceVector(bottom[0], bottom[1]);
    //  var buttomD = distanceVector(bottom[2], bottom[3]);
    // console.log('getMassCenter bottom', bottom);
    // console.log('getMassCenter head', head);
    //First Pyramid Mass Centers
    var trapezeMassCenter1 = {};
    if (bottom[2].x === bottom[3].x && bottom[2].y === bottom[3].y && bottom[2].z === bottom[3].z) {
        //  console.log('TRIANGLE');
        trapezeMassCenter1 = triangleMassCenter(bottom[0], bottom[1], bottom[2]);
    } else {
        //  console.log('TRAPEZE');
        trapezeMassCenter1 = trapezeMassCenter([bottom[0], bottom[2]], [bottom[1], bottom[3]]);
    }

    var triangleFirstMassCenter = triangleMassCenter(bottom[0], bottom[1], head[0]);
    var FirstPyramidMassCenter = {};
    if (bottom[2].x === bottom[3].x && bottom[2].y === bottom[3].y && bottom[2].z === bottom[3].z) {
        FirstPyramidMassCenter = intersection(triangleFirstMassCenter, bottom[3], trapezeMassCenter1, head[0]);
    } else {
        FirstPyramidMassCenter = intersectionPlaneLine([triangleFirstMassCenter, bottom[2], bottom[3]], [trapezeMassCenter1, head[0]]);
    }
    //  Second Pyramid Mass Center
    var triangleFirstMassCenter1 = triangleMassCenter(bottom[2], bottom[3], head[1]);
    var triangleFirstMassCenter2 = triangleMassCenter(bottom[2], bottom[3], head[0]);

    var SecondPyramidMassCenter = intersection(triangleFirstMassCenter1, head[0], triangleFirstMassCenter2, head[1]);
    // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!SecondPyramidMassCenter', SecondPyramidMassCenter)
    return {
        FirstPyramidMassCenter: FirstPyramidMassCenter,
        SecondPyramidMassCenter: SecondPyramidMassCenter
    };
}
/**
 * 
 * @param {array} plane 
 * @param {array} line 
 */
function intersectionPlaneLine(plane, line, debug) {
    // console.log('intersectionPlaneLine START')
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
    if (divideT === 0 || isNaN(divideT)) {
        divideT = 0.000001;
    }

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
        // console.log('divideT', divideT);
        // console.log('tB_y', tB_y);
        // console.log('t', t);
        // console.log('plane', plane);
        // console.log('line', line);

        throw new Error('No intersection LinePlane');
        //return new THREE.Vector3();
    }

}


function intersectionPlane(a, b, c, d) {
    // console.log('intersectionPlane START')
    // at first find x 
    var x = 0;
    var y = 0;

    switch (true) {
        case b.x === a.x && c.x !== d.x:
            x = a.x;
            var B = floatMath().divide(floatMath().subtract(d.y, c.y), floatMath().subtract(d.x, c.x));
            y = floatMath().add(
                floatMath().subtract(
                    floatMath().multiply(x, B),
                    floatMath().multiply(c.x, B)
                ), c.y);
            break;
        case b.x !== a.x && c.x === d.x:
            x = c.x;
            var A = floatMath().divide(floatMath().subtract(b.y, a.y), floatMath().subtract(b.x, a.x));
            y = floatMath().add(
                floatMath().subtract(
                    floatMath().multiply(x, A),
                    floatMath().multiply(a.x, A)
                ), a.y);
            break;

        default:

            var A = floatMath().divide(floatMath().subtract(b.y, a.y), floatMath().subtract(b.x, a.x));
            var B = floatMath().divide(floatMath().subtract(d.y, c.y), floatMath().subtract(d.x, c.x));

            var head = floatMath().add(
                floatMath().subtract(
                    floatMath().multiply(a.x, A), a.y),
                floatMath().subtract(
                    c.y,
                    floatMath().multiply(c.x, B)));

            x = floatMath().divide(head, floatMath().subtract(A, B));
            y = floatMath().add(
                floatMath().subtract(
                    floatMath().multiply(x, A),
                    floatMath().multiply(a.x, A)
                ), a.y);
            break;
    }

    return ({
        x: x,
        y: y
    });

}

//Если каноническое уравнение прямой 0:
//(x-xo)/p=(y-yo)/q=(z-zo)/r
//а каноническое уравнение прямой 1:
//(x-x1)/p1=(y-y1)/q1=(z-z1)/r1
//x = (xo * q * p1 - x1 * q1 * p - yo * p * p1 + y1 * p * p1) // //(q * p1 - q1 * p)
//y = (yo * p * q1 - y1 * p1 * q - xo * q * q1 + x1 * q * q1) // //(p * q1 - p1 * q)
//z = (zo * q * r1 - z1 * q1 * r - yo * r * r1 + y1 * r * r1) // //(q * r1 - q1 * r)

function intersection2(a, b, c, d) {


    if (a.x === d.x && a.y === d.y && a.z === d.z) {
        return a;
    }
    if (a.x === c.x && a.y === c.y && a.z === c.z) {
        return a;
    }
    if (b.x === d.x && b.y === d.y && b.z === d.z) {
        return a;
    }
    if (b.x === c.x && b.y === c.y && b.z === c.z) {
        return c;
    }

    if (b.x === c.x && c.y === b.y) {
        var per = d;
        d = c;
        c = per;
    }




    if (a.y === b.y && b.y === c.y && c.y === d.y) {


        var res = intersectionPlane(
            {
                x: a.x,
                y: a.z
            }, {
                x: b.x,
                y: b.z
            }, {
                x: c.x,
                y: c.z
            }, {
                x: d.x,
                y: d.z
            });
        if (isNaN(res.x) || isNaN(res.y)) {
            console.log('Y PROBLEM')
            console.log('a', a);
            console.log('b', b);
            console.log('c', c);
            console.log('d', d);
            console.log('================');
        }
        return new THREE.Vector3(res.x, a.y, res.y);
    }
    if (a.x === b.x && b.x === c.x && c.x === d.x) {

        var res = intersectionPlane(
            {
                x: a.y,
                y: a.z
            }, {
                x: b.y,
                y: b.z
            }, {
                x: c.y,
                y: c.z
            }, {
                x: d.y,
                y: d.z
            });
        //console.log('res', res);
        if (isNaN(res.x) || isNaN(res.y)) {
            console.log('X PROBLEM')
            console.log('a', a);
            console.log('b', b);
            console.log('c', c);
            console.log('d', d);
            console.log('================');
        }
        return new THREE.Vector3(a.x, res.x, res.y);
    }
    if (a.z === b.z && b.z === c.z && c.z === d.z) {


        var res = intersectionPlane(a, b, c, d);
        if (isNaN(res.x) || isNaN(res.y)) {
            console.log('Z PROBLEM')
            console.log('a', a);
            console.log('b', b);
            console.log('c', c);
            console.log('d', d);
            console.log('================');
        }
        return new THREE.Vector3(res.x, res.y, a.z);
    }

    //Line ab
    // x2-x1
    var p = floatMath().subtract(b.x, a.x); // - p
    var q = floatMath().subtract(b.y, a.y); // - q
    var r = floatMath().subtract(b.z, a.z); // - r

    //Line cd 
    // x2-x1
    var p1 = floatMath().subtract(d.x, c.x); // - p1
    var q1 = floatMath().subtract(d.y, c.y); // - q1
    var r1 = floatMath().subtract(d.z, c.z); // - r1

    // Middle denominators
    var denominatorMiddle_X = floatMath().subtract(floatMath().multiply(q, p1), floatMath().multiply(q1, p));

    var denominatorMiddle_Y = floatMath().subtract(floatMath().multiply(p, q1), floatMath().multiply(p1, q));

    var denominatorMiddle_Z = floatMath().subtract(floatMath().multiply(q, r1), floatMath().multiply(q1, r));


    //Check for 0 in denominator

    if (denominatorMiddle_X === 0) {
        console.log('================denominatorMiddle_X is NULL!!!!!!!');
        console.log('a', a);
        console.log('b', b);
        console.log('c', c);
        console.log('d', d);
        console.log('================');
        console.log('p', p);
        console.log('q1', q1);
        console.log('p1', p1);
        console.log('q', q);
        console.log('================');
    }
    if (denominatorMiddle_Y === 0) {
        console.log('================denominatorMiddle_Y is NULL!!!!!!!');
        console.log('a', a);
        console.log('b', b);
        console.log('c', c);
        console.log('d', d);
        console.log('================');
        console.log('p', p);
        console.log('q1', q1);
        console.log('p1', p1);
        console.log('q', q);
        console.log('================');
    }
    if (denominatorMiddle_Z === 0) {
        console.log('================denominatorMiddle_Z is NULL!!!!!!!');
        console.log('a', a);
        console.log('b', b);
        console.log('c', c);
        console.log('d', d);
        console.log('================');
        console.log('r', r);
        console.log('q1', q1);
        console.log('r1', r1);
        console.log('q', q);
        console.log('================');
    }

    //Middle Multiplys
    //X
    var x0qp1 = floatMath().multiply(floatMath().multiply(a.x, q), p1);
    var x1q1p = floatMath().multiply(floatMath().multiply(c.x, q1), p);
    var y0pp1 = floatMath().multiply(floatMath().multiply(a.y, p), p1);
    var y1pp1 = floatMath().multiply(floatMath().multiply(c.y, p), p1);
    //Y
    var y0pq1 = floatMath().multiply(floatMath().multiply(a.y, p), q1);
    var y1p1q = floatMath().multiply(floatMath().multiply(c.y, p1), q);
    var x0qq1 = floatMath().multiply(floatMath().multiply(a.x, q), q1);
    var x1qq1 = floatMath().multiply(floatMath().multiply(c.x, q), q1);
    //Z
    var z0qr1 = floatMath().multiply(floatMath().multiply(a.z, q), r1);
    var z1q1r = floatMath().multiply(floatMath().multiply(c.z, q1), r);
    var y0rr1 = floatMath().multiply(floatMath().multiply(a.y, r), r1);
    var y1rr1 = floatMath().multiply(floatMath().multiply(c.y, r), r1);

    var x = floatMath()
        .divide(floatMath().add(floatMath().subtract(floatMath().subtract(x0qp1, x1q1p), y0pp1), y1pp1),
        denominatorMiddle_X
        );
    var y = floatMath()
        .divide(floatMath().add(floatMath().subtract(floatMath().subtract(y0pq1, y1p1q), x0qq1), x1qq1),
        denominatorMiddle_Y
        );
    var z = floatMath()
        .divide(floatMath().add(floatMath().subtract(floatMath().subtract(z0qr1, z1q1r), y0rr1), y1rr1),
        denominatorMiddle_Z
        );



    return new THREE.Vector3(x, y, z);
}

function findNewPoint(a, b) {
    if (a.z !== b.z) {
        var A = floatMath().divide(
            floatMath().subtract(
                10.9999,
                a.z
            ),
            floatMath().subtract(
                b.z,
                a.z
            )
        );
        var x = floatMath().subtract(
            floatMath().multiply(
                floatMath().subtract(
                    b.x,
                    a.x
                ),
                A
            ),
            a.x
        );
        var y = floatMath().subtract(
            floatMath().multiply(
                floatMath().subtract(
                    b.y,
                    a.y
                ),
                A
            ),
            a.y
        );
        return new THREE.Vector3(x, y, 10.9999);
    } else {
        if (a.x !== b.x) {
            var A = floatMath().divide(
                floatMath().subtract(
                    10.9999,
                    a.x
                ),
                floatMath().subtract(
                    b.x,
                    a.x
                )
            );
            var y = floatMath().subtract(
                floatMath().multiply(
                    floatMath().subtract(
                        b.y,
                        a.y
                    ),
                    A
                ),
                a.y
            );
            var z = floatMath().subtract(
                floatMath().multiply(
                    floatMath().subtract(
                        b.z,
                        a.z
                    ),
                    A
                ),
                a.z
            );

            return new THREE.Vector3(10.9999, y, z);
        } else {
            if (a.y !== b.y) {
                var A = floatMath().divide(
                    floatMath().subtract(
                        10.9999,
                        a.y
                    ),
                    floatMath().subtract(
                        b.y,
                        a.y
                    )
                );
                var x = floatMath().subtract(
                    floatMath().multiply(
                        floatMath().subtract(
                            b.x,
                            a.x
                        ),
                        A
                    ),
                    a.x
                );
                var y = floatMath().subtract(
                    floatMath().multiply(
                        floatMath().subtract(
                            b.y,
                            a.y
                        ),
                        A
                    ),
                    a.y
                );
                return new THREE.Vector3(x, 10.9999, z);
            } else {
                throw new Error('Same Points!');
            }
        }
    }
}

function intersection3(a, b, c, d) {


    // console.log('================');
    // console.log('a', a);
    // console.log('b', b);
    // console.log('c', c);
    // console.log('d', d);
    // console.log('================');
    var intersect = MathJS.intersect(
        [a.x, a.y, a.z],
        [b.x, b.y, b.z],
        [c.x, c.y, c.z],
        [d.x, d.y, d.z]);
    if (intersect === null) {
        // console.log('NULL 1 intersect');
        intersect = MathJS.intersect(
            [b.x, b.y, b.z],
            [a.x, a.y, a.z],
            [d.x, d.y, d.z],
            [c.x, c.y, c.z]);
        if (intersect === null) {
            // console.log('NULL 2 intersect');
            intersect = MathJS.intersect(
                [a.x, a.y, a.z],
                [b.x, b.y, b.z],
                [d.x, d.y, d.z],
                [c.x, c.y, c.z]);
        }
        if (intersect === null) {
            //console.log('NULL 3 intersect');
            intersect = MathJS.intersect(
                [b.x, b.y, b.z],
                [a.x, a.y, a.z],
                [c.x, c.y, c.z],
                [d.x, d.y, d.z]);
        }
        if (intersect === null) {

            //new -------------
            intersect = difficultSituaction(a, b, c, d);



        }


        if (intersect === null) {

            if (a.x === d.x && a.y === d.y && a.z === d.z) {
                return a;
            }
            if (a.x === c.x && a.y === c.y && a.z === c.z) {
                return a;
            }
            if (b.x === d.x && b.y === d.y && b.z === d.z) {
                return a;
            }
            if (b.x === c.x && b.y === c.y && b.z === c.z) {
                return c;
            }


            if (a.y === b.y && b.y === c.y && c.y === d.y) {


                var res = intersectionPlane(
                    {
                        x: a.x,
                        y: a.z
                    }, {
                        x: b.x,
                        y: b.z
                    }, {
                        x: c.x,
                        y: c.z
                    }, {
                        x: d.x,
                        y: d.z
                    });
                if (isNaN(res.x) || isNaN(res.y)) {
                    console.log('Y PROBLEM')
                    console.log('a', a);
                    console.log('b', b);
                    console.log('c', c);
                    console.log('d', d);
                    console.log('================');
                }
                return new THREE.Vector3(res.x, a.y, res.y);
            }
            if (a.x === b.x && b.x === c.x && c.x === d.x) {

                var res = intersectionPlane(
                    {
                        x: a.y,
                        y: a.z
                    }, {
                        x: b.y,
                        y: b.z
                    }, {
                        x: c.y,
                        y: c.z
                    }, {
                        x: d.y,
                        y: d.z
                    });
                //console.log('res', res);
                if (isNaN(res.x) || isNaN(res.y)) {
                    console.log('X PROBLEM')
                    console.log('a', a);
                    console.log('b', b);
                    console.log('c', c);
                    console.log('d', d);
                    console.log('================');
                }
                return new THREE.Vector3(a.x, res.x, res.y);
            }
            if (a.z === b.z && b.z === c.z && c.z === d.z) {


                var res = intersectionPlane(a, b, c, d);
                if (isNaN(res.x) || isNaN(res.y)) {
                    console.log('Z PROBLEM')
                    console.log('a', a);
                    console.log('b', b);
                    console.log('c', c);
                    console.log('d', d);
                    console.log('================');
                }
                return new THREE.Vector3(res.x, res.y, a.z);
            }
        }

    }
    //console.log('intersect', intersect);
    if (intersect !== null)
        return new THREE.Vector3(intersect[0], intersect[1], intersect[2]);
    else
        throw new Error('FUCK')

    //console.log('================', ray.intersectsBox([[c.x, c.y, c.z], [d.x, d.y, d.z]]));
    console.log('a', a);
    console.log('b', b);
    console.log('c', c);
    console.log('d', d);
    console.log('================');




    var components = {
        a1: floatMath().subtract(b.x, a.x),
        a2: floatMath().subtract(d.x, c.x),
        b1: floatMath().subtract(b.y, a.y),
        b2: floatMath().subtract(d.y, c.y),
        c1: floatMath().subtract(b.z, a.z),
        c2: floatMath().subtract(d.z, c.z),
    }


    var t;
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
        bottom = floatMath().subtract(
            floatMath().multiply(
                components[combinations[i][0] + '1'],
                components[combinations[i][1] + '2']
            ),
            floatMath().multiply(
                floatMath().multiply(
                    components[combinations[i][1] + '1'],
                    components[combinations[i][0] + '2']
                ),
                components[combinations[i][1] + '2']
            )
        );
        if (bottom !== 0 && !isNaN(bottom)) {

            var head = floatMath().add(
                floatMath().subtract(
                    floatMath().multiply(
                        c[combinations[i][2]],
                        components[combinations[i][1] + '2']
                    ),
                    floatMath().multiply(
                        a[combinations[i][2]],
                        components[combinations[i][1] + '2']
                    )
                ),
                floatMath().subtract(
                    floatMath().multiply(
                        a[combinations[i][3]],
                        components[combinations[i][0] + '2']
                    ),
                    floatMath().multiply(
                        c[combinations[i][3]],
                        components[combinations[i][0] + '2']
                    )
                )
            );

            t = floatMath().divide(head, bottom);

            if (!isNaN(t) && t !== 0) {
                // console.log('Break', t);

                iteration = i;
                // console.log('iteration', iteration);
                break;
            }
        }
    }

    if (!isNaN(t) && !isNaN(iteration)) {
        // var p_1 = floatMath().subtract(
        //     floatMath().add(
        //         floatMath().multiply(
        //             t,
        //             components[combinations[iteration][0] + '1'],
        //         ),
        //         a[combinations[i][2]]
        //     ),
        //     c[combinations[i][2]]
        // );
        // var p = floatMath().divide(
        //     p_1,
        //     components[combinations[iteration][0] + '2']
        // );
        // if (!isNaN(p)) {
        //     var x = 
        // }

        var x = floatMath().add(
            floatMath().multiply(
                t,
                components.a1
            ),
            a.x
        );
        var y = floatMath().add(
            floatMath().multiply(
                t,
                components.b1
            ),
            a.y
        );
        var z = floatMath().add(
            floatMath().multiply(
                t,
                components.c1
            ),
            a.z
        );
        return new THREE.Vector3(x, y, z);
    } else {
        throw new Error('NO ITERSECTION!');
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



function difficultSituaction(a, b, c, d) {

    var a1 = floatMath().subtract(MathJS.round(b.x, 4), MathJS.round(a.x, 4));
    var a2 = floatMath().subtract(MathJS.round(d.x, 4), MathJS.round(c.x, 4));
    var b1 = floatMath().subtract(MathJS.round(b.y, 4), MathJS.round(a.y, 4));
    var b2 = floatMath().subtract(MathJS.round(d.y, 4), MathJS.round(c.y, 4));
    var c1 = floatMath().subtract(MathJS.round(b.z, 4), MathJS.round(a.z, 4));
    var c2 = floatMath().subtract(MathJS.round(d.z, 4), MathJS.round(c.z, 4));
    // console.log('a1', a1);
    // console.log('a2', a2);
    // console.log('b1', b1);
    // console.log('b2', b2);
    // console.log('c1', c1);
    // console.log('c2', c2);

    if (b1 === b2 && c1 === c2) {

        var x = floatMath().divide(
            floatMath().subtract(
                floatMath().multiply(
                    a.x,
                    a2
                ),
                floatMath().multiply(
                    c.x,
                    a1
                )
            ),
            floatMath().subtract(
                a2,
                a1
            )
        );
        var y = floatMath().add(
            floatMath().divide(
                floatMath().multiply(
                    floatMath().subtract(
                        x,
                        a.x
                    ),
                    b1
                ),
                a1
            ),
            a.y
        );
        var z = floatMath().add(
            floatMath().divide(
                floatMath().multiply(
                    floatMath().subtract(
                        x,
                        a.x
                    ),
                    c1
                ),
                a1
            ),
            a.z
        );

        return [x, y, z];

    }
    if (a1 === a2 && c1 === c2) {
        var y = floatMath().divide(
            floatMath().subtract(
                floatMath().multiply(
                    a.y,
                    b2
                ),
                floatMath().multiply(
                    c.y,
                    b1
                )
            ),
            floatMath().subtract(
                b2,
                b1
            )
        );
        var z = floatMath().add(
            floatMath().divide(
                floatMath().multiply(
                    floatMath().subtract(
                        y,
                        a.y
                    ),
                    c1
                ),
                b1
            ),
            a.z
        );
        var x = floatMath().add(
            floatMath().divide(
                floatMath().multiply(
                    floatMath().subtract(
                        y,
                        a.y
                    ),
                    a1
                ),
                b1
            ),
            a.x
        );

        return [x, y, z];
    }
    if (a1 == a2 && b1 === b2) {
        var z = floatMath().divide(
            floatMath().subtract(
                floatMath().multiply(
                    a.z,
                    c2
                ),
                floatMath().multiply(
                    c.z,
                    c1
                )
            ),
            floatMath().subtract(
                c2,
                c1
            )
        );
        var y = floatMath().add(
            floatMath().divide(
                floatMath().multiply(
                    floatMath().subtract(
                        z,
                        a.z
                    ),
                    b1
                ),
                c1
            ),
            a.y
        );
        var x = floatMath().add(
            floatMath().divide(
                floatMath().multiply(
                    floatMath().subtract(
                        z,
                        a.z
                    ),
                    a1
                ),
                c1
            ),
            a.x
        );

        return [x, y, z];
    }
    return null;
}











function getProectionOnLine(point1, point2, point3) {

    return ((point3.y - point1.y) / (point2.y - point1.y)) * (point2.x - point1.x) + point1.x;
}

//=================================START MASS CENTERS================================

function trapezeMassCenter(bottom, head) {
    //console.log('trapezeMassCenter START')
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


    if (bottom[0].x < head[0].x) {

        var m = _.cloneDeep(head);
        var r = _.cloneDeep(bottom);
        bottom = m;
        head = r;
    }
    // console.log('bottom', bottom);
    // console.log('head', head);
    // get centers of bottom and head of trapeze

    var bottomCenter = vertexCenter(bottom[0], bottom[1]);
    var headCenter = vertexCenter(head[0], head[1]);

    var doubleHead = new THREE.Vector3(floatMath().add(bottom[0].x, head[0].x), head[0].y, head[0].z);


    var doubleBottom = new THREE.Vector3(floatMath().subtract(0, bottom[0].x), bottom[0].y, bottom[0].z);
    // console.log('bottomCenter', bottomCenter);
    // console.log('headCenter', headCenter);
    // console.log('doubleHead', doubleHead);
    // console.log('doubleBottom', doubleBottom);





    //console.log('Start Trapeze Intersection', massCenter);
    var massCenter = intersection(headCenter, bottomCenter, doubleBottom, doubleHead);
    //  console.log('trapezeMassCenter', massCenter);
    return massCenter;
}

function triangleMassCenter(pointA, pointB, pointC) {

    // console.log('triangleMassCenter START')
    // console.log('pointA', pointA)
    // console.log('pointB', pointB)
    // console.log('pointC', pointC)
    var centerAB = vertexCenter(pointA, pointB);
    var centerBC = vertexCenter(pointB, pointC);
    // console.log('centerAB', centerAB);
    // console.log('centerAB', centerBC);

    // console.log('Start Trinagle Intersection', massCenter);
    var massCenter = intersection(centerAB, pointC, centerBC, pointA);
    //console.log('triangleMassCenter', massCenter);
    return massCenter;
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


exports.ShapeMath = {
    FloatMath: floatMath,
    getMassCenter: getMassCenter,
    returnYbyLine: returnYbyLine,
    intersectionPlaneLine: intersectionPlaneLine,
    trapezeMassCenter: trapezeMassCenter,
    vertexCenter: vertexCenter,
    proectionOnShapng: proectionOnShapng

};