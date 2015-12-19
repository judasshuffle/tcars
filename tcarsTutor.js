//would you like to play a game

 Agent.isAvatar = true;

var clipURL = "atp://24d8d613053e2ddf8f893469d7312d068a208a70b3fe844d88bb38280562dfee.hfr";

var playFromCurrentLocation = true;
var useDisplayName = true;
var useAttachments = true;
var useAvatarModel = true;

Recording.setPlayFromCurrentLocation(playFromCurrentLocation);
Recording.setPlayerUseDisplayName(useDisplayName);
Recording.setPlayerUseAttachments(useAttachments);
Recording.setPlayerUseHeadModel(false);
Recording.setPlayerUseSkeletonModel(true);


Recording.setPlayerLoop(true);
Recording.loadRecording(clipURL);
Recording.startPlaying();

function update(deltaTime) {
}

Script.update.connect(update);
