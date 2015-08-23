//snippet for getting entity properties by id:
//JSON.stringify(Entities.getEntityProperties("{fd3a1d1f-8590-4c6b-a621-d0b4eb94b6a1}"))

var points = [];

var req = new XMLHttpRequest();
req.open("GET", "https://dl.dropboxusercontent.com/u/10483952/tcar/streettrackscaled.obj", false);
req.send();
//print(req.response);
//print("before return");
var lines = req.response.split("\n");
for (var i = 0; i < lines.length; i++) {
    if (lines[i][0] === 'v' && lines[i][1] === ' ') {
        var parsedLine = lines[i].split(' ');
        if (parsedLine.length === 4) {
            points.push({x: parseFloat(parsedLine[1]), y: parseFloat(parsedLine[2]), z: parseFloat(parsedLine[3])});
        }
        //print(i);
    }
}
//return;

/*var points = [
{x: 9.646905, y: 1.171018, z: -22.617397},
{x: 16.620483, y: 1.094949, z: -23.411173},
{x: 22.917461, y: 0.721924, z: -22.629061},
{x: 28.321377, y: 0.267842, z: -20.230616},
{x: 32.337147, y: -0.096679, z: -16.374313},
{x: 34.414246, y: -0.325050, z: -11.355231},
{x: 34.281517, y: -0.440925, z: -5.707033},
{x: 32.227268, y: -0.475227, z: -0.273366},
{x: 28.720936, y: -0.443954, z: 4.190904},
{x: 24.032082, y: -0.333011, z: 7.409465},
{x: 18.482208, y: -0.112455, z: 9.414189},
{x: 12.706549, y: 0.242662, z: 10.336749},
{x: 7.384052, y: 0.694860, z: 10.380392},
{x: 2.940060, y: 1.096120, z: 9.803972},
{x: -0.491640, y: 1.269542, z: 8.848616},
{x: -3.057487, y: 1.103633, z: 7.665016},
{x: -4.939501, y: 0.643203, z: 6.304461},
{x: -6.120178, y: 0.153678, z: 4.726598},
{x: -6.476252, y: -0.077062, z: 2.911054},
{x: -5.900541, y: 0.057711, z: 0.962852},
{x: -4.375897, y: 0.487890, z: -0.947809},
{x: -2.037442, y: 1.000876, z: -2.658201},
{x: 0.834339, y: 1.368302, z: -4.044284},
{x: 3.848735, y: 1.466504, z: -5.045992},
{x: 6.753151, y: 1.242287, z: -5.674790},
{x: 9.650597, y: 0.671813, z: -6.014260},
{x: 12.695449, y: -0.194372, z: -6.168943},
{x: 15.792006, y: -1.193743, z: -6.213139},
{x: 18.842747, y: -2.174428, z: -6.191030},
{x: 21.995586, y: -3.109962, z: -6.123194},
{x: 25.331631, y: -3.974890, z: -6.025528},
{x: 28.566189, y: -4.617104, z: -5.926177},
{x: 31.442371, y: -4.836614, z: -5.850043},
{x: 34.122345, y: -4.473940, z: -5.802481},
{x: 36.862301, y: -3.388417, z: -5.777242},
{x: 39.658276, y: -1.435103, z: -5.766163},
{x: 42.316212, y: 1.461827, z: -5.762285},
{x: 44.558144, y: 5.230152, z: -5.762004},
{x: 46.065075, y: 9.611437, z: -5.764369},
{x: 46.524025, y: 14.145389, z: -5.770042},
{x: 45.779102, y: 18.338585, z: -5.779947},
{x: 43.963711, y: 21.835882, z: -5.793800},
{x: 41.340187, y: 24.434258, z: -5.807992},
{x: 38.131832, y: 26.077084, z: -5.814287},
{x: 34.571987, y: 26.810465, z: -5.807557},
{x: 30.964127, y: 26.737043, z: -5.792978},
{x: 27.634998, y: 25.982586, z: -5.778872},
{x: 24.874165, y: 24.665133, z: -5.769039},
{x: 22.844852, y: 22.877455, z: -5.764313},
{x: 21.511444, y: 20.675978, z: -5.765029},
{x: 20.762344, y: 18.121927, z: -5.773409},
{x: 20.536736, y: 15.321054, z: -5.795815},
{x: 20.795200, y: 12.397471, z: -5.843832},
{x: 21.481640, y: 9.465399, z: -5.934988},
{x: 22.554947, y: 6.645741, z: -6.091020},
{x: 24.022415, y: 4.079587, z: -6.336952},
{x: 25.920773, y: 1.866044, z: -6.710870},
{x: 28.289242, y: 0.006009, z: -7.272826},
{x: 31.115417, y: -1.519170, z: -8.094563},
{x: 34.288521, y: -2.670625, z: -9.250307},
{x: 37.653900, y: -3.425957, z: -10.837426},
{x: 41.067520, y: -3.855488, z: -12.995039},
{x: 44.349358, y: -4.070398, z: -15.872314},
{x: 47.229816, y: -4.163095, z: -19.582664},
{x: 49.327206, y: -4.198231, z: -24.067419},
{x: 50.148087, y: -4.210090, z: -28.981405},
{x: 49.285206, y: -4.213215, z: -33.888229},
{x: 46.610462, y: -4.213641, z: -38.464607},
{x: 42.221092, y: -4.213078, z: -42.485085},
{x: 36.362553, y: -4.212131, z: -45.787556},
{x: 29.365726, y: -4.210963, z: -48.265873},
{x: 21.589233, y: -4.209660, z: -49.867836},
{x: 13.399519, y: -4.208286, z: -50.621452},
{x: 5.159697, y: -4.206904, z: -50.658077},
{x: -2.731480, y: -4.205583, z: -50.177719},
{x: -9.821697, y: -4.204393, z: -49.404819},
{x: -15.847922, y: -4.203384, z: -48.507401},
{x: -20.959305, y: -4.202527, z: -47.523605},
{x: -25.479851, y: -4.201769, z: -46.399242},
{x: -29.647888, y: -4.201071, z: -45.034222},
{x: -33.583160, y: -4.200411, z: -43.308796},
{x: -37.281597, y: -4.199788, z: -41.106754},
{x: -40.658955, y: -4.199202, z: -38.330254},
{x: -43.591038, y: -4.198607, z: -34.920322},
{x: -45.871994, y: -4.197694, z: -30.943321},
{x: -47.184494, y: -4.195454, z: -26.669550},
{x: -47.271896, y: -4.188004, z: -22.506836},
{x: -46.105568, y: -4.165663, z: -18.910324},
{x: -43.802738, y: -4.104463, z: -16.199436},
{x: -40.514381, y: -3.957778, z: -14.398226},
{x: -36.263828, y: -3.654948, z: -13.402982},
{x: -30.820675, y: -3.106367, z: -13.168895},
{x: -23.977642, y: -2.266497, z: -13.760328},
{x: -15.846778, y: -1.197607, z: -15.350206},
{x: -6.945959, y: -0.082920, z: -17.847170},
{x: 1.796495, y: 0.782390, z: -20.560627}];
*/
/*
Entities.addEntity({
    type: 'Line',
    name: 'some test track line',
    dimensions: {x: 200, y: 200, z: 200},
    position: MyAvatar.position,
    lineWidth: 4,
    color: {red: 20, green: 20, blue: 20},
    linePoints: points,
    visible: true
});
*/

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


//return;
var colorTable = [
{red: 200, green: 20, blue: 20},
{red: 20, green: 200, blue: 20},
{red: 20, green: 20, blue: 200},
];

var prevPoint = null;
for (var i = 0; i < points.length; i++) {
    point = points[i];
    if (prevPoint != null) {
        Entities.addEntity({
            type: 'Light',
            name: 'test light ' + (i+1) + '/' + points.length,
            dimensions: {"x":13.611613273620605,"y":13.611613273620605,"z":13.611613273620605},//{x: 1, y: 1, z: 1/* Vec3.length(Vec3.subtract(point, prevPoint))*/},
            position: Vec3.sum(MyAvatar.position, Vec3.mix(prevPoint, point, 0.5)),
            //rotation: rotateBetween(prevPoint, point),
            rotation: {"x":-0.525482714176178,"y":0.47314679622650146,"z":0.47314679622650146,"w":0.525482714176178},
           // lineWidth: 4,
            color: {"red":212,"green":23,"blue":23},//colorTable[i % colorTable.length],
            "glowLevel":0,"isSpotlight":1,"intensity":8,"exponent":1,"cutoff":90,
       // linePoints: points,
            visible: true
    });
//{"dimensions":{"x":13.611613273620605,"y":13.611613273620605,"z":13.611613273620605},"rotation":{"x":-0.525482714176178,"y":0.47314679622650146,"z":0.47314679622650146,"w":0.525482714176178}, "color":{"red":212,"green":23,"blue":23}, "glowLevel":0,"isSpotlight":1,"intensity":8,"exponent":1,"cutoff":90,
    }
    print(i + "ha");
    prevPoint = point;
    
}