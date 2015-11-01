//  TCars/library/tracks.js
//
//  The tracks in TCars and their properties.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

TRACKS = [
{
    name: "School Classroom",
    seats: [
        {
            position: {x: 7938.66455078125, y: 7875.783203125, z: 7870.95166015625},
            rotation: {x: -0.0000152587890625, y: -0.0000152587890625, z: -0.0000152587890625, w: 1},
            scale: 125.0
        }
    ],
    vehicles: ["BLUES", "CAPRI", "TORINO", "2BEATLE", "DS", "TESTCAR", "BBCAR", "WOLF", "CAT", "HANDVAN", "SHOE", "CHAIR", "SPACE"],
    cameras: [CAMERA.CAR_FIXED_WORLD, CAMERA.CAR_FROM_USER_AUTOFOCUS, CAMERA.CAR_TOPVIEW, CAMERA.CAR_BEHIND_CLOSE],
    startPosition: {x: 7969.8955078125, y: 7909.921875, z: 7788.82763671875},
    startOrientation: {x: 0, y: -0.8411639928817749, z: 0, w: 0.5407801270484924},
    previewPosition: {x: -8.665946960449219, y: 1.948462724685669, z: 5.54997444152832},
    previewOrientation: {x: -0.016121888533234596, y: 0.6953659057617188, z: 0.015607025474309921, w: 0.7183054685592651},
},
{
    name: "School Classroom (new)",
    seats: [
        {
            position: {x: 7938.66455078125, y: 7875.783203125, z: 7870.95166015625},
            rotation: {x: -0.0000152587890625, y: -0.0000152587890625, z: -0.0000152587890625, w: 1},
            scale: 125.0
        }
    ],
    vehicles: ["BLUES", "CAPRI", "TORINO", "2BEATLE", "DS", "TESTCAR", "BBCAR", "WOLF", "CAT", "HANDVAN", "SHOE", "CHAIR", "SPACE"],
    cameras: [CAMERA.CAR_FIXED_WORLD, CAMERA.CAR_FROM_USER_AUTOFOCUS, CAMERA.CAR_TOPVIEW, CAMERA.CAR_BEHIND_CLOSE],
    startPosition: {x: 2046.289794921875, y: 1888.758056640625, z: 2073.35205078125},
    startOrientation: {x: 0, y: -0.7429486513137817, z: 0, w: 0.669348418712616},
    previewPosition: {x: -8.547079086303711, y: 1.9484647512435913, z: 1.88816499710083},
    previewOrientation: {x: -0.016121888533234596, y: 0.6953659057617188, z: 0.015607025474309921, w: 0.7183054685592651},
},
{
    name: "Street Track",
    seats: [
        {
            position: {x: 7184.60107421875, y: 8033.275390625, z: 8160.1328125},
            rotation: {x: -0.0000152587890625, y: -0.0000152587890625, z: -0.0000152587890625, w: 1},
            scale: 10.0
        }
    ],
    vehicles: ["BLUES", "CAPRI", "TORINO", "2BEATLE", "DS", "TESTCAR", "BBCAR", "WOLF", "CAT", "HANDVAN", "SHOE", "CHAIR", "SPACE"],
    cameras: [CAMERA.CAR_TOPVIEW, CAMERA.CAR_BEHIND_CLOSE],
    startPosition: { x: 7111.21044921875, y: 7993.75341796875, z: 8112.84814453125},
    startOrientation: { x: -0.002904998604208231, y: -0.9950630068778992, z: -0.09435316920280457, w: 0.030636562034487724},
    previewPosition: {x: -8.34484577178955, y: 1.9537969827651978, z: -1.680985927581787},
    previewOrientation: {x: -0.0030006752349436283, y: 0.707954466342926, z: 0.003007936989888549, w: 0.7062453031539917},
},
{
    name: "Toy Track",
    seats: [
        {
            position: {x: 7938.66455078125, y: 7875.783203125, z: 7870.95166015625},
            rotation: {x: -0.0000152587890625, y: -0.0000152587890625, z: -0.0000152587890625, w: 1},
            scale: 125.0
        }
    ],
    vehicles: ["BLUES", "CAPRI", "TORINO", "2BEATLE", "DS", "TESTCAR", "BBCAR", "WOLF", "CAT", "HANDVAN", "SHOE", "CHAIR", "SPACE"],
    cameras: [CAMERA.CAR_FIXED_WORLD, CAMERA.CAR_FROM_USER_AUTOFOCUS, CAMERA.CAR_TOPVIEW, CAMERA.CAR_BEHIND_CLOSE],
    startPosition: {x: 8686.42, y: 9298.34, z: 8729.210},
    startOrientation: {x: -0.332059, y: 0, z: 0, w: 0.943259},
    previewPosition: {x: -7.89496374130249, y: 2.093385696411133, z: -9.421926498413086},
    previewOrientation: {x: -0.016021521762013435, y: 0.6992429494857788, z: 0.01567869260907173, w: 0.7145325541496277},
},
{
    name: "Space Track",
    seats: [
        {
            position: {x: 2992.0205078125, y: 9023.591796875, z: 2982.2646484375},
            rotation: {x: 0, y: 0.3675544261932373, z: 0, w: 0.9300020337104797},
            scale: 10.0
        }
    ],
    vehicles: ["CHAIR", "SPACE", "SPACE2"],
    cameras: [CAMERA.CAR_INSIDE, CAMERA.CAR_TOPVIEW, CAMERA.CAR_BEHIND_CLOSE],
    startPosition: {x: 2997.06396484375, y: 9015.869140625, z: 3086.4697265625},
    startOrientation: {x: 0, y: 0.6923482418060303, z: 0, w: 0.7215635180473328},
    previewPosition: {x: -7.653191089630127, y: 2.104630470275879, z: -9.134285926818848},
    previewOrientation: {x: -0.01589319296181202, y: 0.7050438523292542, z: 0.01580876298248768, w: 0.7088093161582947},
    trackJSON: "spacetrack.json"
}
];
