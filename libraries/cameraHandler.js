//  TCars/library/cameraHandler.js
//
//  This library is responsible for the camera handling in the TCars project.
//  From follow cam till track selection view. This library will bring you the vision!
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

CameraHandler = function() {
    var _this = this;
    _this.cameraList = [CAMERA_CAR_FROM_USER_AUTOFOCUS, CAMERA_CAR_TOPVIEW, /*CAMERA_HOOD, */ CAMERA_CAR_BEHIND_CLOSE, /*CAMERA_BEHIND_MEDIUM, CAMERA_BEHIND_FAR, */ CAMERA_CAR_FIXED_WORLD];
    _this.stance = CAMERA_CAR_FIXED_WORLD;
    _this.position = Camera.position;
    _this.orientation = Camera.orientation;

    if (HMD.orientation === undefined) {
        HMD.orientation = {x: 0, y: 0, z: 0, w: 1};
    }

    if (HMD.position === undefined) {
        HMD.position = {x: 0, y: 0, z: 0};
    }

    _this.shutdown = function() {
        print('shutting down CameraHandler');
        Camera.mode = _this.oldCameraMode;
        MyAvatar.audioListenerMode = _this.oldAudioListenerMode;
        print('CameraHandler was scoped and fired at, did it die?');
    };

    var cameraLookAt = function(cameraPos, lookAtPos) {
        var lookAtRaw = Quat.lookAt(cameraPos, lookAtPos, WORLD_UP_DIRECTION);
        lookAtRaw.w = -lookAtRaw.w;
        return lookAtRaw;
    }

    _this.updateCamera = function(updateTime, carProps) {
        var applyHMDOffsets = true;
        if (_this.stance === CAMERA_CAR_TOPVIEW) {
            var targetPos = Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 13, z: 13}));
            _this.position = Vec3.mix(_this.position, targetPos, updateTime);
            _this.orientation = Quat.mix(_this.orientation, cameraLookAt(_this.position, carProps.position), updateTime * 4);
        } else if (_this.stance === CAMERA_CAR_BEHIND_CLOSE) {
            _this.position = Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 2, z: 5}));
            _this.orientation = carProps.rotation;
        } else if (_this.stance === CAMERA_CAR_FIXED_WORLD) {
            _this.position = Vec3.sum(carProps.position, {x: 15, y: 20 + (Vec3.length(carProps.velocity) * 2), z: 0});
            _this.orientation = cameraLookAt(_this.position, carProps.position);
        } else if (_this.stance === CAMERA_CAR_SELECTOR) {
            _this.position = CAR_SELECTOR_CAM_POS;
            _this.orientation = cameraLookAt(_this.position, CAR_SELECTOR_CENTER);
        } else if (_this.stance === CAMERA_TRACK_SELECTOR) {
            var track = TRACKS[trackSelector.selectedTrack];
            _this.position = track.previewPosition;
            _this.orientation = track.previewOrientation;
        } else if (_this.stance === CAMERA_CAR_FROM_USER_AUTOFOCUS) {
            _this.position = MyAvatar.getEyePosition();
            _this.orientation = cameraLookAt(_this.position, carProps.position);
            applyHMDOffsets = false; // do not apply the HMD here, since it already effects the avatar
        }
        if (HMD.active && applyHMDOffsets) {
            Camera.position = Vec3.sum(_this.position, Vec3.subtract(HMD.position, MyAvatar.position));
            Camera.orientation = Quat.multiply(_this.orientation, Quat.multiply(Quat.inverse(MyAvatar.orientation), HMD.orientation));
            return;
        }
        Camera.position = _this.position;
        Camera.orientation = _this.orientation;
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
    };

    _this.oldCameraMode = Camera.mode;
    _this.oldAudioListenerMode = MyAvatar.audioListenerMode;
    Camera.mode = "independent";
    MyAvatar.audioListenerMode = MyAvatar.FROM_CAMERA;
};
