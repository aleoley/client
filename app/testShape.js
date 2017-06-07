var TestShape = {
    name: 'TestShape',
    Weight: 251.73,
    Length: 17.80,
    base: [
        {
            SpangNum: 0,
            ShpangX: -10,
            points: [
                { z: 1, y: 2 },
                { z: 2, y: 3 },
                { z: 4, y: 5 },
                { z: 5, y: 6 },

            ]
        },
        {
            SpangNum: 1,
            ShpangX: 0,
            points: [
                { z: 1, y: 2 },
                { z: 3, y: 7 },
                { z: 5, y: 7 },
                { z: 8, y: 9 },
            ]
        },
        {
            SpangNum: 2,
            ShpangX: 10,
            points: [
                { z: 1, y: 2 },
                { z: 2, y: 4 },
                { z: 3, y: 6 },
                { z: 7.5, y: 10 },
                { z: 8, y: 11 },
            ]
        },
        {
            SpangNum: 3,
            ShpangX: 15,
            points: [
                { z: 1, y: 5 },
                { z: 2, y: 5.5 },
                { z: 3, y: 5.8 },
                { z: 7, y: 6 },
                { z: 8, y: 9 },
            ]
        }

    ],
    Stern: [

    ],
    Bow: [

    ]
}

exports.TestShape = TestShape;