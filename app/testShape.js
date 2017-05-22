var TestShape = {
    name: 'TestShape',
    base: [
        {
            SpangNum: 0,
            ShpangX: -10,
            points: [
                { z: 1, y: 2 },
                { z: 2, y: 3 },
                { z: 4, y: 5 },
                { z: 4, y: 6 },

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
                { z: 7.5, y: 3 },
                { z: 8, y: 4 },
            ]
        },
        {
            SpangNum: 3,
            ShpangX: 15,
            points: [
                { z: 1, y: 5 },
                { z: 2, y: 7 },
                { z: 3, y: 5 },
                { z: 7, y: 3 },
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