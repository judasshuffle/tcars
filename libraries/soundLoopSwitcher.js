//  TCars/library/soundLoopSwitcher.js
//
//  The engine requires the changing of sound files, the SoundLoopSwitcher makes this possible.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

SoundLoopSwitcher = function() {
    var _this = this;
    _this.sound = null;
    _this.injector = null;
    _this.position = MyAvatar.position;
    _this.setSound = function(sound) {
        if (!SOUND) {
            return;
        }
        if (_this.sound !== sound) {
            _this.stopSound();
            _this.sound = sound;
            _this.injector = Audio.playSound(_this.sound, {
                position: _this.position, //MyAvatar.position,
                volume: 0.2,
                loop: true
            });
        }
    };

    _this.stopSound = function() {
        if (_this.injector !== null) {
            _this.injector.stop();
            _this.sound = null;
            _this.injector = null;
        }
    };

    _this.updatePosition = function(newPosition) {
        if (_this.injector !== null) {
            var currentOptions = _this.injector.options;
            currentOptions.position = newPosition;
            _this.injector.options = currentOptions;
            //_this.injector.setOptions({position: newPosition});
            //print(JSON.stringify(_this.injector.getOptions()));
        }
        _this.position = newPosition
    };
};
