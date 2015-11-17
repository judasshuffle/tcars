//  TCars/library/keys.js
//
//  Definition of all keys used in TCars
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

KEY = {
    UP: 16777235,
    DOWN: 16777237,
    LEFT: 16777234,
    RIGHT: 16777236,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    C: 67,
    R: 82,
    B: 66,
    SPACE: 32,
    DEL: 16777223
};

ALL_KEYS = [
    KEY.UP,
    KEY.DOWN,
    KEY.LEFT,
    KEY.RIGHT,
    KEY.W,
    KEY.A,
    KEY.S,
    KEY.D,
    KEY.C,
    KEY.R,
    KEY.B,
    KEY.SPACE,
    KEY.DEL
];

KeyCapturer = function() {
    var _this = this;
    var keysCaptured = false;

    _this.areKeysCaptured = function() {
        return keysCaptured;
    };

    _this.captureKeys = function() {
        if (!keysCaptured) {
            for (var i = 0; i < ALL_KEYS.length; i++) {
                Controller.captureKeyEvents({key: ALL_KEYS[i]});
            }
            keysCaptured = true;
        }
    };

    _this.releaseKeys = function() {
        if (keysCaptured) {
            for (var i = 0; i < ALL_KEYS.length; i++) {
                Controller.releaseKeyEvents({key: ALL_KEYS[i]});
            }
            keysCaptured = false;
        }
    };
};
