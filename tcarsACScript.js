// Here you can put a script that will be run by an assignment-client (AC)
// For examples, please go to http://public.highfidelity.io/scripts
// The directory named acScripts contains assignment-client specific scripts you can try.

print("hello world");

var elementCount = 0;

var vantagePoint = {"x":8040.73046875,"y":8203.1005859375,"z":7730.63916015625}; //{x: 8000, y: 8000, z: 8000};
EntityViewer.setPosition(vantagePoint);
EntityViewer.setOrientation(Quat.fromPitchYawRollDegrees(-90, 0, 0));
EntityViewer.queryOctree();

Entities.addingEntity.connect(function(EntityItemID) {
  print("adding: " + EntityItemID);
  
});
//for(i in Entities) { print(i) }


Script.update.connect(function (deltaTime) {
	EntityViewer.queryOctree();
	var newCount = EntityViewer.getOctreeElementsCount();
	if (newCount !== elementCount) {
		elementCount = newCount;
		print("elementCount:" + elementCount);
	}
	print(EntityViewer.getVoxelSizeScale() + " " + EntityViewer.getBoundaryLevelAdjust() + " " + EntityViewer.getMaxPacketsPerSecond());
});
