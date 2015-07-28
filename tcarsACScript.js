// Here you can put a script that will be run by an assignment-client (AC)
// For examples, please go to http://public.highfidelity.io/scripts
// The directory named acScripts contains assignment-client specific scripts you can try.

print("hello world");

var elementCount = 0;

var y = 8103.1005859375;
var vantagePoint = {"x":8040.73046875,"y":y,"z":7730.63916015625}; //{x: 8000, y: 8000, z: 8000};

EntityViewer.setPosition(vantagePoint);
EntityViewer.setOrientation(Quat.fromPitchYawRollDegrees(0, 0, 0));
EntityViewer.getBoundaryLevelAdjust(20000);
EntityViewer.queryOctree();


Entities.addingEntity.connect(function(EntityItemID) {
  print("adding: " + EntityItemID);
  
});

Entities.deletingEntity.connect(function(EntityItemID) {
  print("deleting: " + EntityItemID);
});
//for(i in Entities) { print(i) }


Script.update.connect(function (deltaTime) {
  EntityViewer.setPosition({"x":8040.73046875,"y":y,"z":7730.63916015625});
 // y -= 0.2;
	EntityViewer.queryOctree();
	var newCount = EntityViewer.getOctreeElementsCount();
	if (newCount !== elementCount) {
		elementCount = newCount;
		print("elementCount:" + elementCount);
	}
	//print(EntityViewer.getVoxelSizeScale() + " " + EntityViewer.getBoundaryLevelAdjust() + " " + EntityViewer.getMaxPacketsPerSecond());
});
