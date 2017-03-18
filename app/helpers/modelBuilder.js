function Build(callback) {


    var initialTimeout = 10;

    // Outer Voleme Intitalize
    var outerVolume = 0;
    var mirrored = true;
    //Initialize Global iterator 
    var asyncI = 0;
    simpleShpangs = _.map(simpleShpangs, function (spang) {
        return _.reverse(spang);
    });

    async.eachSeries(simpleShpangs, function (thisShpang, eachCallback1) {
        //Initialize iterator for this iteration
        var asyncJ = 0;
        var middleVolume = 0;
        if (asyncI === 0) {
            asyncI++;
            return eachCallback1();
        }
        var beforeShapng = simpleShpangs[asyncI - 1];
        if (thisShpang.length > beforeShapng.length) {
            async.eachSeries(thisShpang, function (thisPoint, eachCallback2) {
                if (asyncJ === 0) {
                    asyncJ++;
                    return eachCallback2();
                }
                var beforePoint = thisShpang[asyncJ - 1];


                var beforeShapngIndex = asyncJ - 1;
                if (asyncJ >= beforeShapng.length) {
                    beforeShapngIndex = beforeShapng.length - 1;
                }

                var bottom = [beforePoint, thisPoint];
                var centerPoint = vertexCenter(beforePoint, thisPoint);

                var minDisArray = minDistanse(centerPoint, beforeShapng);

                var head = [minDisArray[0]];
                var shape = bottom.concat(head);
                // shape.push(proectionX(shape[0]));
                // shape.push(proectionX(shape[1]));
                // shape.push(proectionX(shape[2]));
                // console.log('asyncJ', asyncJ);
                // console.log('bottom', bottom);
                // console.log('head', head);

                var volume = getVolume(bottom, head);
                middleVolume += volume;
                var visible = true;
                if (volume === 0) {
                    visible = false;
                    //console.log('bottom', bottom);
                    // console.log('head', head);
                } else {
                    visible = true;
                }

                addShape(shape, initialTimeout, function () {
                    if (asyncJ >= beforeShapng.length) {

                        asyncJ++;
                        eachCallback2();
                    } else {
                        var bottom2 = [beforeShapng[asyncJ - 1], beforeShapng[asyncJ - 0]];
                        var centerPoint = vertexCenter(beforeShapng[asyncJ - 1], beforeShapng[asyncJ - 0]);
                        var minDisArray = minDistanse(centerPoint, thisShpang, true);
                        var head2 = [minDisArray[0]];
                        if (minDisArray[1]) {
                            console.log('minDisArray J', asyncJ);
                            console.log('minDisArray I', asyncI);
                            console.log('minDisArray', minDisArray);
                            head2 = [minDisArray[1]];
                        }

                        var shape2 = bottom2.concat(head2);
                        // shape.push(proectionX(shape[0]));
                        // shape.push(proectionX(shape[1]));
                        // shape.push(proectionX(shape[2]));
                        var volume2 = getVolume(bottom2, head2);
                        middleVolume += volume2;
                        if (volume2 === 0) {
                            // console.log('bottom', bottom);
                            // console.log('head', head);
                            visible = false;
                        } else {
                            visible = true;
                        }
                        if (isNaN(middleVolume)) {
                            console.log('NAN bottom', bottom2);
                            console.log('NAN head', head2);
                        }
                        addShape(shape2, initialTimeout, function () {
                            asyncJ++;
                            eachCallback2();
                        }, mirrored, visible);
                    }


                }, mirrored, visible);


            }, function (err) {
                if (!err) {
                    outerVolume += middleVolume;
                    asyncI++;
                    eachCallback1();
                }
            });
        } else {
            async.eachSeries(beforeShapng, function (thisPoint, eachCallback2) {
                if (asyncJ === 0) {
                    asyncJ++;
                    return eachCallback2();
                }
                var beforePoint = beforeShapng[asyncJ - 1];

                var thisShpangIndex = asyncJ - 1;


                if (asyncJ >= thisShpang.length) {
                    thisShpangIndex = thisShpang.length - 1;
                }
                var bottom = [beforePoint, thisPoint];
                var centerPoint = vertexCenter(beforePoint, thisPoint);

                var minDisArray = minDistanse(centerPoint, thisShpang);
                //   console.log('centerPoint', centerPoint);
                //  console.log('minDisArray', minDisArray);
                var head = [minDisArray[0]];
                var shape = bottom.concat(head);
                // shape.push(proectionX(shape[0]));
                // shape.push(proectionX(shape[1]));
                // shape.push(proectionX(shape[2]));
                //  console.log('asyncJ', asyncJ);
                //  console.log('bottom', bottom);
                //  console.log('head', head);
                var volume = getVolume(bottom, head);
                middleVolume += volume;
                var visible = true;
                if (volume === 0) {
                    visible = false;
                    //  console.log('bottom', bottom);
                    //   console.log('head', head);
                } else {
                    visible = true;
                }

                addShape(shape, initialTimeout, function () {
                    if (asyncJ >= thisShpang.length) {
                        asyncJ++;
                        eachCallback2();
                    } else {
                        var bottom2 = [thisShpang[asyncJ - 1], thisShpang[asyncJ - 0]];
                        var centerPoint = vertexCenter(thisShpang[asyncJ - 1], thisShpang[asyncJ - 0]);
                        var minDisArray = minDistanse(centerPoint, beforeShapng, true);
                        var head2 = [minDisArray[0]];
                        var head2 = [minDisArray[0]];
                        if (minDisArray[1]) {
                            console.log('minDisArray J', asyncJ);
                            console.log('minDisArray I', asyncI);
                            console.log('minDisArray', minDisArray);
                            head2 = [minDisArray[1]];
                        }
                        var shape2 = bottom2.concat(head2);
                        // shape.push(proectionX(shape[0]));
                        // shape.push(proectionX(shape[1]));
                        // shape.push(proectionX(shape[2]));

                        var volume2 = getVolume(bottom2, head2);
                        middleVolume += volume2;
                        if (volume2 === 0) {
                            //  console.log('bottom2', bottom);
                            //  console.log('head2', head);
                            visible = false;
                        } else {
                            visible = true;
                        }

                        addShape(shape2, initialTimeout, function () {
                            asyncJ++;
                            eachCallback2();
                        }, mirrored, visible);
                    }

                }, mirrored, visible);


            }, function (err) {
                if (!err) {
                    outerVolume += middleVolume;
                    asyncI++;
                    eachCallback1();
                }
            });
        }


    }, function (err) {
        if (!err) {
            console.log('GREAT!!!!!!!!!! VOLUEM=', outerVolume * 2);
            console.log('GROUP', group);
        }
    });


}

//===================FUNCTION FOR CREATING NEW SHAPE=========
function addShape(points, timeout, callback, mirrored, visible) {
    var pointsGeometry = new THREE.Geometry();

    if (mirrored) {
        var mirroredPoints = _.map(points, function (point) {
            return new THREE.Vector3(-point.x, point.y, point.z);
        });
        points = points.concat(mirroredPoints);
    }

    pointsGeometry.vertices = points;

    var pointsMaterial = new THREE.PointsMaterial({
        color: '#5DB03D',
        map: texture,
        size: 1,
        alphaTest: 0.6
    });
    var points = new THREE.Points(pointsGeometry, pointsMaterial);


    var meshGeometry = new THREE.ConvexGeometry(pointsGeometry.vertices);

    var meshMaterial = new THREE.MeshLambertMaterial({
        color: '#5DB03D',
        opacity: 0.1,
        transparent: visible ? false : true
    });
    // mesh = new THREE.Mesh(meshGeometry, meshMaterial);
    // mesh.material.side = THREE.BackSide; // back faces
    // mesh.renderOrder = 0;
    // group.add(mesh);
    if (timeout) {
        setTimeout(function () {
            group.add(points);
            mesh = new THREE.Mesh(meshGeometry, meshMaterial.clone());
            mesh.material.side = THREE.FrontSide; // front faces
            mesh.renderOrder = 1;
            group.add(mesh);
            // console.log('Shape added!');
            callback();
        }, timeout);
    } else {
        group.add(points);
        mesh = new THREE.Mesh(meshGeometry, meshMaterial.clone());
        mesh.material.side = THREE.FrontSide; // front faces
        mesh.renderOrder = 1;
        group.add(mesh);
        callback();
    }

}
module.exports = Build;