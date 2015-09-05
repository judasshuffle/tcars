// Here you can put a script that will be run by an assignment-client (AC)
// For examples, please go to http://public.highfidelity.io/scripts
// The directory named acScripts contains assignment-client specific scripts you can try.

print("hello world");

var elementCount = 0;

var y = 7910.02;
var vantagePoint = {x: 8060.22, y: y, z: 7708.39}; //{x: 8000, y: 8000, z: 8000};

function updateAvatarPos() {
    Avatar.position = EntityViewer.getPosition();
    Avatar.orientation = EntityViewer.getOrientation();
    //print(JSON.stringify(EntityViewer.getPosition()));
//    print("hifi://" + Avatar.position.x + "," + Avatar.position.y + "," + Avatar.position.z);
}

function setDisplayName(newDisplayName) {
    if (newDisplayName != Avatar.displayName) {
        Avatar.displayName = newDisplayName;
    }
}

Agent.isAvatar = true;//8060.22,7910.02,7708.39/0,0.678913,0,0.734219
Avatar.scale = 1;// 75;
Avatar.position = vantagePoint;

for (i in Entities) { print(i); }
Entities.setPacketsPerSecond(2000);
EntityViewer.setPosition(vantagePoint);
EntityViewer.setOrientation(Quat.fromPitchYawRollDegrees(0, 90, 0));
//EntityViewer.getBoundaryLevelAdjust(20000);
EntityViewer.queryOctree();
Avatar.displayName = "Bot initialized";


Entities.addingEntity.connect(function(EntityItemID) {
    if (EntityItemID == "{87387ebb-adb8-4f23-b6eb-3c65581bc936}") { 
        setDisplayName("FOUND!");
    }
    if (Entities.getEntityProperties(EntityItemID).name == "TrackingBox") {
        setDisplayName("TrackingBox found!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    }
    print("adding: " + EntityItemID + " " + Entities.getEntityProperties(EntityItemID).name);
});

Entities.deletingEntity.connect(function(EntityItemID) {
  print("deleting: " + EntityItemID);
});
//for(i in Entities) { print(i) }
var i = 0;

function updating(deltaTime) {
 //   EntityViewer.setPosition({x: 8040.73046875, y: y, z: 7730.63916015625});
//    y -= deltaTime;
    updateAvatarPos();
    EntityViewer.queryOctree();
    entityID = Entities.findClosestEntity(Avatar.position, 1000);
    if (entityID) {
      var props = Entities.getEntityProperties(entityID);
      setDisplayName("nearby: " + props.name + " (" + Vec3.distance(Avatar.position, props.position) + "m)");
    }
    var newCount = EntityViewer.getOctreeElementsCount();
    if (newCount !== elementCount) {
        elementCount = newCount;
        print("elementCount:" + elementCount);
    }
    //print(EntityViewer.getVoxelSizeScale() + " " + EntityViewer.getBoundaryLevelAdjust() + " " + EntityViewer.getMaxPacketsPerSecond());
}

Script.update.connect(updating);
