const WAYPOINT_DATA_URL = "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/backups/waypoinint.obj";
const LAMP_SIZE = {"x":25.0,"y":30.0,"z":25.0};
const CONE_ANGLE = 90;
const INTENSITY = 1.0;
const SOFTNESS_VARIANCE = 0.1;
const points = [];
const verticalOffset = 19.6;
const req = new XMLHttpRequest();
req.open("GET", WAYPOINT_DATA_URL, false);
req.send();
var lines = req.response.split("\n");
for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    if (lines[lineIndex][0] === 'v' && lines[lineIndex][1] === ' ') {
        var parsedLine = lines[lineIndex].split(' ');
        if (parsedLine.length === 4) {
            points.push({x: parseFloat(parsedLine[1]), y: parseFloat(parsedLine[2]), z: parseFloat(parsedLine[3])});
        }
    }
}

function radianToDegree(angle)
{
    return angle * (180.0 / Math.PI);
}

// converted from: http://stackoverflow.com/a/18193005/1587091
function rotateBetween(vec1, vec2)
{
    print("sub = " + JSON.stringify(Vec3.subtract(vec2, vec1)));
    var direction = Vec3.normalize(Vec3.subtract(vec2, vec1));
    var dot = Vec3.dot({x: 0, y: 0, z: 1}, direction);
    if (Math.abs(dot - (-1.0)) < 0.000001) {
        return Quat.angleAxis(radianToDegree(Math.PI), {x: 0, y: 1, z: 0});
    } else if (Math.abs(dot - (1.0)) < 0.000001) {
        return Quat.fromPitchYawRollDegrees(0, 0, 0);
    }
    var angle = -radianToDegree(Math.acos(dot));
    var cross = Vec3.normalize(Vec3.cross({x: 0, y: 0, z: -1}, direction));
    return Quat.angleAxis(angle, cross);
}

function testRotateBetween(vec1, vec2) {
    print("vec 1 = " + JSON.stringify(vec1));
    print("vec 2 = " + JSON.stringify(vec2));
    //print("mix 2 = " + JSON.stringify(vec2));
    var rot = rotateBetween(vec1, vec2);
    print("rot = " + JSON.stringify(rot));
    var length = Vec3.length(vec1, vec2);
    print("vec r = " + JSON.stringify(Vec3.multiplyQbyV(rot, {x: 0, y: 0, z: length})));
}
testRotateBetween({x: 1, y: 2, z: 1}, {x: 2, y: 2, z: 2});

var colorTable = [
    {red: 212, green: 20, blue: 22},
    {red: 100, green: 100, blue: 200},
    {red: 170, green: 40, blue: 23},
    {red: 212, green: 190,blue: 100}
];

var prevPoint = null;

points.reverse();

var cubes = [];
var TRACK_OFFSET = {x: 3006, y: 9057, z: 2999.76};

for (var i = 0; i < 0 /*points.length*/; i++) {
    var point = points[i];
    MyAvatar.position = Vec3.sum(TRACK_OFFSET, point);
    cubes.push(Overlays.addOverlay('cube', {
        position: Vec3.sum(TRACK_OFFSET, point),
        size: {x: 1, y: 1, z: 1},
        color: { red: 255, green: 0, blue: 0},
        alpha: 1,
        solid: false
    }));
    /*if (prevPoint != null) {
        Entities.addEntity({
            type: 'Light',
            name: 'test light ' + (i+1) + '/' + points.length,
            dimensions: LAMP_SIZE,//{x: 1, y: 1, z: 1/* Vec3.length(Vec3.subtract(point, prevPoint))* /},
            position: Vec3.sum({x:7162.57,y:8015.87 -verticalOffset,z:8128.13}, Vec3.mix(prevPoint, point, 0)),
            registration: {x: 0.5, y: 1.0, z: 0.5},
            //rotation: rotateBetween(prevPoint, point),
            rotation: {"x":-0.525482714176178,"y":0.47314679622650146,"z":0.47314679622650146,"w":0.525482714176178},
           // lineWidth: 4,
            //color: colorTable[i % colorTable.length],
             color: {red: (Math.random()*100)+150, green: (Math.random()*100)+50, blue: (Math.random()*50)+50},
            "glowLevel":0,"isSpotlight":1,
            intensity: (Math.random() * 0.4) + 0.8, //(Math.random()*95)+5,
            "exponent":(Math.random() * SOFTNESS_VARIANCE),//SOFTNESS,
            "cutoff":CONE_ANGLE,
       // linePoints: points,
            visible: true
    });
//{"dimensions":{"x":13.611613273620605,"y":13.611613273620605,"z":13.611613273620605},"rotation":{"x":-0.525482714176178,"y":0.47314679622650146,"z":0.47314679622650146,"w":0.525482714176178}, "color":{"red":212,"green":23,"blue":23}, "glowLevel":0,"isSpotlight":1,"intensity":8,"exponent":1,"cutoff":90,
    }
    print(i + "ha");*/

    

    prevPoint = point;
    
}
var currentPos = 0;
var nextPosition = 1;
Script.setInterval(function() {
    var pointA = Vec3.sum(TRACK_OFFSET, points[currentPos]);
    var pointB = Vec3.sum(TRACK_OFFSET, points[nextPosition]);
    MyAvatar.position = pointA;
    MyAvatar.orientation = rotateBetween(pointB, pointA);
    currentPos = (currentPos + 1) % points.length;
    nextPosition = (currentPos + 1) % points.length;
    
}, 200);

function scriptEnding() {
    for (i = 0; i < cubes.length; i++) {
        Overlays.deleteOverlay(cubes[i]);
    }
}
Script.scriptEnding.connect(scriptEnding);