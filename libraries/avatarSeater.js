//  TCars/library/avatarSeater.js
//
//  Makes sure that the avatar is seated at the right position.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

AvatarSeater = function () {
    var _this = this;
    _this.originalPosition = MyAvatar.position;
    _this.originalOrientation = MyAvatar.orientation;
    _this.originalScale = MyAvatar.scale;

    _this.setSeat = function (seat) {
        MyAvatar.position = seat.position;
        MyAvatar.orientation = seat.rotation;
        MyAvatar.scale = seat.scale;
    };

    _this.cleanup = function () {
        MyAvatar.position = _this.originalPosition;
        MyAvatar.orientation = _this.originalOrientation;
        MyAvatar.scale = _this.originalScale;
    };
};
