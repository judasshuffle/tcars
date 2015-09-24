CameraHandler = function() {
    var _this = this;
    _this.cameraList = [CAMERA_CAR_FROM_USER_AUTOFOCUS, CAMERA_CAR_TOPVIEW, /*CAMERA_HOOD, */ CAMERA_CAR_BEHIND_CLOSE, /*CAMERA_BEHIND_MEDIUM, CAMERA_BEHIND_FAR, */ CAMERA_CAR_FIXED_WORLD];
    _this.stance = CAMERA_CAR_FIXED_WORLD;

    _this.shutdown = function() {
        print('shutting down CameraHandler');
        Camera.mode = _this.oldCameraMode;
        MyAvatar.audioListenerMode = _this.oldAudioListenerMode;
        print('CameraHandler was scoped and fired at, did it die?');
    };

    _this.updateCamera = function(updateTime, carProps) {
        if (_this.stance === CAMERA_CAR_TOPVIEW) {
            var targetPos = Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 13, z: 13}));
            Camera.position = Vec3.mix(Camera.position, targetPos, updateTime);
            var previousOrientation = Camera.orientation;
            Camera.lookAt(Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 2, z: -13})));
            Camera.orientation = Quat.mix(previousOrientation, Camera.orientation, updateTime * 2);
        } else if (_this.stance === CAMERA_CAR_BEHIND_CLOSE) {
            Camera.position = Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 2, z: 5}));
            Camera.orientation = carProps.rotation;
        } else if (_this.stance === CAMERA_CAR_FIXED_WORLD) {
            Camera.position = Vec3.sum(carProps.position, {x: 15, y: 20 + (Vec3.length(carProps.velocity) * 2), z: 0});
            Camera.lookAt(carProps.position);
        } else if (_this.stance === CAMERA_CAR_SELECTOR) {
            Camera.position = CAR_SELECTOR_CAM_POS;
            Camera.lookAt(CAR_SELECTOR_CENTER);
        } else if (_this.stance === CAMERA_TRACK_SELECTOR) {
            var track = TRACKS[trackSelector.selectedTrack];
            Camera.position = track.previewPosition;
            Camera.orientation = track.previewOrientation;
            //Camera.lookAt(CAR_SELECTOR_CENTER);
        } else if (_this.stance === CAMERA_CAR_FROM_USER_AUTOFOCUS) {
            Camera.position = MyAvatar.getEyePosition();//Vec3.mix(Camera.position, targetPos, updateTime);
            Camera.lookAt(carProps.position);
        }
    };

    _this.setCameras = function(cameraList) {
        _this.cameraList = cameraList;
        _this.firstCamera();
    };

    _this.nextCamera = function() {
        _this.stance = _this.cameraList[(_this.cameraList.indexOf(_this.stance) + 1) % _this.cameraList.length];
    };

    _this.prevCamera = function() {
        _this.stance = _this.cameraList[(_this.cameraList.indexOf(_this.stance) + (_this.cameraList.length - 1)) % _this.cameraList.length];
    };

    _this.firstCamera = function() {
        _this.stance = _this.cameraList[0];
    }

    _this.oldCameraMode = Camera.mode;
    _this.oldAudioListenerMode = MyAvatar.audioListenerMode;
    Camera.mode = "independent";
    MyAvatar.audioListenerMode = MyAvatar.FROM_CAMERA;
};
