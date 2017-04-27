
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
    console.log('bottom[2]', bottom[2]);
    console.log('bottom[2]', bottom[3]);
    console.log('head[1]', head[1]);
    return {
        FirstPyramidMassCenter: triangleMassCenter(bottom[2], bottom[3], head[1]),
        SecondPyramidMassCenter: triangleMassCenter(bottom[0], bottom[1], head[0])
    };



    // var buttomA = distanceVector(bottom[0], bottom[2]);
    //  var buttomB = distanceVector(bottom[1], bottom[3]);
    //  var buttomC = distanceVector(bottom[0], bottom[1]);
    //  var buttomD = distanceVector(bottom[2], bottom[3]);
    if (head[0].x === head[1].x && head[0].y === head[1].y && head[0].z === head[1].z) {
        //First Pyramid Mass Centers
        //   var trapezeMassCenter1 = trapezeMassCenter([bottom[0], bottom[2]], [bottom[1], bottom[3]]);
        //   var triangleFirstMassCenter = triangleMassCenter(bottom[0], bottom[1], head[0]);

        //   var FirstPyramidMassCenter = intersection(trapezeMassCenter1, head[0], triangleFirstMassCenter, bottom[3]);

        //Second Pyramid Mass Center
        //  var triangleFirstMassCenter1 = triangleMassCenter(bottom[2], bottom[3], head[1]);
        //   var triangleFirstMassCenter2 = triangleMassCenter(bottom[2], bottom[3], head[0]);

        // var SecondPyramidMassCenter = intersection(triangleFirstMassCenter1, head[0], triangleFirstMassCenter2, head[1]);

        return {
            //  FirstPyramidMassCenter:FirstPyramidMassCenter,
            SecondPyramidMassCenter: triangleMassCenter(bottom[2], bottom[3], head[1])
        };
    } else {
        //First Pyramid Mass Centers
        //   var trapezeMassCenter1 = trapezeMassCenter([bottom[0], bottom[2]], [bottom[1], bottom[3]]);
        //   var triangleFirstMassCenter = triangleMassCenter(bottom[0], bottom[1], head[0]);

        //   var FirstPyramidMassCenter = intersection(trapezeMassCenter1, head[0], triangleFirstMassCenter, bottom[3]);

        //Second Pyramid Mass Center
        var triangleFirstMassCenter1 = triangleMassCenter(bottom[2], bottom[3], head[1]);
        var triangleFirstMassCenter2 = triangleMassCenter(bottom[2], bottom[3], head[0]);

        var SecondPyramidMassCenter = intersection(triangleFirstMassCenter1, head[0], triangleFirstMassCenter2, head[1]);

        return {
            //  FirstPyramidMassCenter:FirstPyramidMassCenter,
            SecondPyramidMassCenter: SecondPyramidMassCenter
        };
    }




}
/**
 * 
 * @param {array} plane 
 * @param {array} line 
 */
function intersectionPlaneLine(plane, line) {

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

    var A_x = floatMath().multiply(A, floatMath().subtract(l1.x, p1.x));
    var B_y = floatMath().multiply(B, floatMath().subtract(l1.y, p1.y));
    var C_z = floatMath().multiply(C, floatMath().subtract(l1.z, p1.z));

    var headT = floatMath().add(C_z, floatMath().subtract(A_x, B_y));

    var t = floatMath().divide(-headT, divideT);


    if (t) {
        var x = floatMath().add(floatMath().multiply(t, floatMath().subtract(l2.x, l1.x)), l1.x);
        var y = floatMath().add(floatMath().multiply(t, floatMath().subtract(l2.y, l1.y)), l1.y);
        var z = floatMath().add(floatMath().multiply(t, floatMath().subtract(l2.z, l1.z)), l1.z);

        return new THREE.Vector3(x, y, z);
    } else {
        throw new Error('Now intersection LinePlane');
    }

}

//Если каноническое уравнение прямой 0:
//(x-xo)/p=(y-yo)/q=(z-zo)/r
//а каноническое уравнение прямой 1:
//(x-x1)/p1=(y-y1)/q1=(z-z1)/r1
//x = (xo * q * p1 - x1 * q1 * p - yo * p * p1 + y1 * p * p1) // //(q * p1 - q1 * p)
//y = (yo * p * q1 - y1 * p1 * q - xo * q * q1 + x1 * q * q1) // //(p * q1 - p1 * q)
//z = (zo * q * r1 - z1 * q1 * r - yo * r * r1 + y1 * r * r1) // //(q * r1 - q1 * r)

function intersection(a, b, c, d) {

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
    }
    if (denominatorMiddle_Y === 0) {
        console.log('================denominatorMiddle_Y is NULL!!!!!!!');
        console.log('a', a);
        console.log('b', b);
        console.log('c', c);
        console.log('d', d);
        console.log('================');
    }
    if (denominatorMiddle_Z === 0) {
        console.log('================denominatorMiddle_Z is NULL!!!!!!!');
        console.log('a', a);
        console.log('b', b);
        console.log('c', c);
        console.log('d', d);
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

    if (bottom[0].x < head[0].x) {

        var m = new Array(head);
        var r = new Array(bottom);
        bottom = m;
        head = r;
    }


    // get centers of bottom and head of trapeze

    var bottomCenter = vertexCenter(bottom[0], bottom[1]);
    var headCenter = vertexCenter(head[0], head[1]);

    var doubleHead = new THREE.Vector3(floatMath().add(bottom[0].x, head[0].x), head[0].y, head[0].z);
    var doubleBottom = new THREE.Vector3(floatMath().subtract(bottom[1].x, floatMath().add(bottom[0].x, head[0].x)), bottom[0].y, bottom[0].z);

    var massCenter = intersection(headCenter, bottomCenter, doubleBottom, doubleHead);

    return massCenter;
}

function triangleMassCenter(pointA, pointB, pointC) {

    var centerAB = vertexCenter(pointA, pointB);
    var centerBC = vertexCenter(pointB, pointC);



    var massCenter = intersection(centerAB, pointC, centerBC, pointA);
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

    var x = (vertex1.x + vertex2.x) / 2;
    var y = (vertex1.y + vertex2.y) / 2;
    var z = (vertex1.z + vertex2.z) / 2;

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











///=========================================  MATH OPERATIONS FOR DOT NUMBERS=====================
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
        return Math.round((a - b) * 1e12) / 1e12;

    }

    /**
     * add
     * @param {*} a 
     * @param {*} b 
     */
    function add(a, b) {
        return Math.round((a + b) * 1e12) / 1e12;
    }

    /**
     * multiply
     * @param {*} a 
     * @param {*} b 
     */
    function multiply(a, b) {
        return Math.round((a * b) * 1e12) / 1e12;
    }

    /**
     * divide
     * @param {*} a 
     * @param {*} b 
     */
    function divide(a, b) {
        return Math.round((a / b) * 1e12) / 1e12;
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
    intersectionPlaneLine: intersectionPlaneLine

};