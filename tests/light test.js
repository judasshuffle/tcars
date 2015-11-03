//snippet for getting entity properties by id:
//JSON.stringify(Entities.getEntityProperties("{fd3a1d1f-8590-4c6b-a621-d0b4eb94b6a1}"))
// Delete existing light entities in the city
var entities = Entities.findEntities({x:7162.57,y:8015.87,z:8128.13},100);
for(var entity in entities) {
    //print(Entities.getEntityProperties(entity).type);
    if (Entities.getEntityProperties(entities[entity]).type === "Light") {
	    Entities.deleteEntity(entities[entity]);
		print("light deleted");
	}
}

var LAMP_SIZE = {"x":25.0,"y":30.0,"z":25.0};
var CONE_ANGLE = 90;
var INTENSITY = 1.0;
var SOFTNESS = 0;//10;
var points = [];
//var verticalOffset = 23.6;
var verticalOffset = 19.6;
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
{red: 212, green: 20, blue: 22},
{red: 100, green: 100, blue: 200},
{red: 170, green: 40, blue: 23},
{"red":212,"green":190,"blue":100}
];

var prevPoint = null;
for (var i = 0; i < points.length; i++) {
    point = points[i];
    if (prevPoint != null) {
        Entities.addEntity({
            type: 'Light',
            name: 'test light ' + (i+1) + '/' + points.length,
            dimensions: LAMP_SIZE,//{x: 1, y: 1, z: 1/* Vec3.length(Vec3.subtract(point, prevPoint))*/},
            position: Vec3.sum({x:7162.57,y:8015.87 -verticalOffset,z:8128.13}, Vec3.mix(prevPoint, point, 0)),
			registration: {x: 0.5, y: 1.0, z: 0.5},
		   
		   

            //rotation: rotateBetween(prevPoint, point),
            rotation: {"x":-0.525482714176178,"y":0.47314679622650146,"z":0.47314679622650146,"w":0.525482714176178},
           // lineWidth: 4,
            //color: colorTable[i % colorTable.length],
			 color: {red: (Math.random()*100)+150, green: (Math.random()*100)+50, blue: (Math.random()*50)+50},
            "glowLevel":0,"isSpotlight":1,
			intensity: (Math.random() * 0.4) + 0.8, //(Math.random()*95)+5,
			"exponent":(Math.random() * 0.1),//SOFTNESS,
            "cutoff":CONE_ANGLE,
       // linePoints: points,
            visible: true
    });
//{"dimensions":{"x":13.611613273620605,"y":13.611613273620605,"z":13.611613273620605},"rotation":{"x":-0.525482714176178,"y":0.47314679622650146,"z":0.47314679622650146,"w":0.525482714176178}, "color":{"red":212,"green":23,"blue":23}, "glowLevel":0,"isSpotlight":1,"intensity":8,"exponent":1,"cutoff":90,
    }
    print(i + "ha");
    prevPoint = point;
    
}
Script.stop();
