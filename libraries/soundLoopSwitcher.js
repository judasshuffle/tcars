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
