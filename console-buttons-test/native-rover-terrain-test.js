// TCARS diagnostic only. Caitlyn's published DarkRide "Car" preset, no terrain modifications.
// Source: caitlynmeeks/darkride-interface/interface/resources/editor/vehicles/car.json
// One native Land Rover-class chassis + 4 wheel entities. Run once near your terrain.
// Automatically clears this test vehicle after 180 seconds; stopping this script also clears it.
(function () {
    "use strict";
    var TAG = "[TCARS ROVER TEST] ";
    var parts = [{"id":"{0ffed0a6-52a6-45ab-ba22-5a2ea670e977}","type":"Box","shape":"Cube","name":"Car","position":{"x":0,"y":1.05,"z":0},"dimensions":{"x":1.68,"y":1.1,"z":3.62},"color":{"red":200,"green":96,"blue":28},"dynamic":true,"collisionless":false,"gravity":{"x":0,"y":-9.8,"z":0},"damping":0.02,"angularDamping":0.1,"friction":0.6,"restitution":0,"grab":{"grabbable":false},"vehicle":{"type":"wheeled","mass":1320,"centerOfMass":{"x":0,"y":-0.3,"z":0},"wheels":"[{\"name\": \"FL\", \"center\": [-0.654, -0.54, -1.1175], \"radius\": 0.37, \"width\": 0.16, \"mass\": 25, \"suspensionDistance\": 0.18, \"targetPosition\": 0.5, \"steer\": 1, \"brake\": 1, \"handBrake\": 0}, {\"name\": \"FR\", \"center\": [0.654, -0.54, -1.1175], \"radius\": 0.37, \"width\": 0.16, \"mass\": 25, \"suspensionDistance\": 0.18, \"targetPosition\": 0.5, \"steer\": 1, \"brake\": 1, \"handBrake\": 0}, {\"name\": \"RL\", \"center\": [-0.654, -0.54, 1.1175], \"radius\": 0.37, \"width\": 0.16, \"mass\": 25, \"suspensionDistance\": 0.18, \"targetPosition\": 0.5, \"steer\": 0, \"brake\": 1, \"handBrake\": 1}, {\"name\": \"RR\", \"center\": [0.654, -0.54, 1.1175], \"radius\": 0.37, \"width\": 0.16, \"mass\": 25, \"suspensionDistance\": 0.18, \"targetPosition\": 0.5, \"steer\": 0, \"brake\": 1, \"handBrake\": 1}]","seats":"[{\"name\": \"driver\", \"position\": [0.42, -0.05, -0.35], \"yaw\": 0, \"driver\": true}, {\"name\": \"passenger\", \"position\": [-0.42, -0.05, -0.35], \"yaw\": 0}, {\"name\": \"rear left\", \"position\": [-0.42, -0.05, 0.75], \"yaw\": 0}, {\"name\": \"rear right\", \"position\": [0.42, -0.05, 0.75], \"yaw\": 0}]","maxSteerAngle":32,"maxTorque":163,"minRPM":700,"maxRPM":4500,"gearRatios":"[3.68, 2.22, 1.5, 1.0]","reverseGearRatio":4.02,"finalDriveRatio":5.3956,"maxBrakeTorque":1500,"maxHandBrakeTorque":2500,"driveType":"rear","suspensionFrequency":1.4,"suspensionDamping":0.6}},{"id":"{431af79f-36be-4edb-9f9c-47cbcf6c0a29}","type":"Shape","shape":"Cylinder","name":"Car wheel FL","parentID":"{0ffed0a6-52a6-45ab-ba22-5a2ea670e977}","position":{"x":-0.654,"y":-0.63,"z":-1.1175},"rotation":{"x":0,"y":0,"z":0.7071067811865475,"w":0.7071067811865476},"dimensions":{"x":0.74,"y":0.16,"z":0.74},"color":{"red":16,"green":16,"blue":22},"dynamic":false,"collisionless":true,"vehicle":{"type":"wheel","wheel":"FL","axle":"y"}},{"id":"{8bfa2212-75b5-4056-8694-57778181cf58}","type":"Shape","shape":"Cylinder","name":"Car wheel FR","parentID":"{0ffed0a6-52a6-45ab-ba22-5a2ea670e977}","position":{"x":0.654,"y":-0.63,"z":-1.1175},"rotation":{"x":0,"y":0,"z":0.7071067811865475,"w":0.7071067811865476},"dimensions":{"x":0.74,"y":0.16,"z":0.74},"color":{"red":16,"green":16,"blue":22},"dynamic":false,"collisionless":true,"vehicle":{"type":"wheel","wheel":"FR","axle":"y"}},{"id":"{42b38268-c652-4764-a8ea-76dd1eaec508}","type":"Shape","shape":"Cylinder","name":"Car wheel RL","parentID":"{0ffed0a6-52a6-45ab-ba22-5a2ea670e977}","position":{"x":-0.654,"y":-0.63,"z":1.1175},"rotation":{"x":0,"y":0,"z":0.7071067811865475,"w":0.7071067811865476},"dimensions":{"x":0.74,"y":0.16,"z":0.74},"color":{"red":16,"green":16,"blue":22},"dynamic":false,"collisionless":true,"vehicle":{"type":"wheel","wheel":"RL","axle":"y"}},{"id":"{3e85ea0e-9207-4fbf-a75c-43a6b99bd572}","type":"Shape","shape":"Cylinder","name":"Car wheel RR","parentID":"{0ffed0a6-52a6-45ab-ba22-5a2ea670e977}","position":{"x":0.654,"y":-0.63,"z":1.1175},"rotation":{"x":0,"y":0,"z":0.7071067811865475,"w":0.7071067811865476},"dimensions":{"x":0.74,"y":0.16,"z":0.74},"color":{"red":16,"green":16,"blue":22},"dynamic":false,"collisionless":true,"vehicle":{"type":"wheel","wheel":"RR","axle":"y"}}];
    var ids = [];
    var cleaned = false;
    function log(s) { print(TAG + s); }
    function cleanup() {
        if (cleaned) { return; }
        cleaned = true;
        for (var i = ids.length - 1; i >= 0; i--) { Entities.deleteEntity(ids[i]); }
        ids = [];
        log("Test vehicle removed.");
    }
    Script.scriptEnding.connect(cleanup);
    try {
        if (typeof Entities.canRez === "function" && !Entities.canRez() &&
            !(typeof Entities.canRezTmp === "function" && Entities.canRezTmp())) {
            throw new Error("You need permission to rez entities here.");
        }
        var facing = Quat.fromPitchYawRollDegrees(0, 0, 0);
        var front = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 0, z: -5 }));
        var ray = Entities.findRayIntersection({
            origin: Vec3.sum(front, { x: 0, y: 12, z: 0 }),
            direction: { x: 0, y: -1, z: 0 }
        }, true);
        if (!ray.intersects || ray.distance > 32) {
            throw new Error("No ground detected 5 m ahead. Stand near clear terrain and try again.");
        }
        var ground = ray.intersection;
        var chassis = parts[0];
        var rotation = MyAvatar.orientation;
        // Use the published spec unchanged, translating only the test preset's starting position.
        var rootProps = JSON.parse(JSON.stringify(chassis));
        delete rootProps.id;
        rootProps.name = "TCARS TEST - Caitlyn's native Car";
        rootProps.position = Vec3.sum(ground, { x: 0, y: chassis.position.y + 0.15, z: 0 });
        rootProps.rotation = rotation;
        rootProps.lifetime = 180;
        rootProps.userData = JSON.stringify({ tcarsNativeVehicleTest: true });
        var root = Entities.addEntity(rootProps, "domain");
        if (!root || root === Uuid.NULL) { throw new Error("Failed to rez native car chassis."); }
        ids.push(root);
        for (var k = 1; k < parts.length; k++) {
            var child = JSON.parse(JSON.stringify(parts[k]));
            delete child.id;
            child.parentID = root;
            child.localPosition = child.position;
            delete child.position;
            child.localRotation = child.rotation;
            delete child.rotation;
            child.lifetime = 180;
            var id = Entities.addEntity(child, "domain");
            if (!id || id === Uuid.NULL) { throw new Error("Failed to rez wheel " + k); }
            ids.push(id);
        }
        log("Spawned Caitlyn's published native Car on ground 5 m ahead, with 4 wheels.");
        log("Physics server ON: watch whether it stays on terrain. Click car to drive if you want.");
        log("This test cleans itself up after 3 minutes or when stopped in Running Scripts.");
        Script.setTimeout(cleanup, 180000);
    } catch (e) {
        log("ERROR " + e.message);
        cleanup();
    }
}());
