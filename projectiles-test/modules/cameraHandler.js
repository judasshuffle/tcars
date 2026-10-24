//  TCars/library/cameraHandler.js
//
//  This library is responsible for the camera handling in the TCars project.
//  From follow cam till track selection view. This library will bring you the vision!
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var constants = Script.require('./constants.js');
var CAMERA = constants.CAMERA;
var WORLD_UP_DIRECTION = constants.WORLD_UP_DIRECTION;
var CAR_SELECTOR = constants.CAR_SELECTOR;
var TRACKS = constants.TRACKS;

module.exports = {
    CameraHandler: function () {
        var _this = this;
        _this.cameraList = [
            CAMERA.CAR_FROM_USER_AUTOFOCUS,
            CAMERA.CAR_TOPVIEW,
            /*CAMERA.HOOD, */
            CAMERA.CAR_BEHIND_CLOSE,
            /*CAMERA.BEHIND_MEDIUM, CAMERA.BEHIND_FAR, */
            CAMERA.CAR_FIXED_WORLD
        ];

        var initiated = false;

        _this.isInitiated = function () {
            return initiated;
        };

        _this.init = function () {
            if (initiated) {
                return;
            }
            initiated = true;
            _this.stance = CAMERA.CAR_FIXED_WORLD;
            _this.position = Camera.position;
            _this.orientation = Camera.orientation;
            _this.oldCameraMode = Camera.mode;
            _this.oldAudioListenerMode = MyAvatar.audioListenerMode;
            Camera.mode = 'independent';
            MyAvatar.audioListenerMode = MyAvatar.FROM_CAMERA;
        };

        _this.shutdown = function () {
            if (!initiated) {
                return;
            }
            print('shutting down CameraHandler');
            Camera.mode = _this.oldCameraMode;
            MyAvatar.audioListenerMode = _this.oldAudioListenerMode;
            print('CameraHandler was scoped and fired at, did it die?');
            initiated = false;
        };

        var cameraLookAt = function (cameraPos, lookAtPos) {
            return Quat.lookAt(cameraPos, lookAtPos, WORLD_UP_DIRECTION);
        };

        _this.updateCamera = function (updateTime, carProps) {
            var applyHMDOffsets = HMD.active;
            if (_this.stance === CAMERA.CAR_TOPVIEW) {
                var targetPos = Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 13, z: 13}));
                _this.position = Vec3.mix(_this.position, targetPos, updateTime);
                _this.orientation = Quat.mix(_this.orientation, cameraLookAt(_this.position, carProps.position), updateTime * 4);
            } else if (_this.stance === CAMERA.CAR_BEHIND_CLOSE) {
                _this.position = Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 2, z: 5}));
                _this.orientation = carProps.rotation;
            } else if (_this.stance === CAMERA.CAR_FIXED_WORLD) {
                _this.position = Vec3.sum(carProps.position, {x: 15, y: 20 + (Vec3.length(carProps.velocity) * 2), z: 0});
                _this.orientation = cameraLookAt(_this.position, carProps.position);
            } else if (_this.stance === CAMERA.CAR_SELECTOR) {
                _this.position = CAR_SELECTOR.CAM_POS;
                _this.orientation = cameraLookAt(_this.position, CAR_SELECTOR.CENTER);
            } else if (_this.stance === CAMERA.TRACK_SELECTOR) {
                var track = TRACKS[trackSelector.selectedTrack];
                _this.position = track.previewPosition;
                _this.orientation = track.previewOrientation;
            } else if (_this.stance === CAMERA.CAR_FROM_USER_AUTOFOCUS) {
                _this.position = MyAvatar.getEyePosition();
                _this.orientation = cameraLookAt(_this.position, carProps.position);
                applyHMDOffsets = false; // do not apply the HMD here, since it already effects the avatar
            } else if (_this.stance === CAMERA.CAR_INSIDE) {
                _this.position = Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0.5, z: 0}));
                _this.orientation = carProps.rotation;
            }
            if (applyHMDOffsets) {
                Camera.position = Vec3.sum(_this.position, Vec3.subtract(HMD.position, MyAvatar.position));
                Camera.orientation = Quat.multiply(_this.orientation, Quat.multiply(Quat.inverse(MyAvatar.orientation),
                    HMD.orientation));
                return;
            }
            Camera.position = _this.position;
            Camera.orientation = _this.orientation;
        };

        _this.setCameras = function (cameraList) {
            _this.cameraList = cameraList;
            _this.firstCamera();
        };

        _this.nextCamera = function () {
            _this.stance = _this.cameraList[(_this.cameraList.indexOf(_this.stance) + 1) % _this.cameraList.length];
        };

        _this.prevCamera = function () {
            _this.stance = _this.cameraList[(_this.cameraList.indexOf(_this.stance) + (_this.cameraList.length - 1)) %
            _this.cameraList.length];
        };

        _this.firstCamera = function () {
            _this.stance = _this.cameraList[0];
        };

        _this.lastCamera = function () {
            _this.stance = _this.cameraList[_this.cameraList.length - 1];
        };
    }
};
