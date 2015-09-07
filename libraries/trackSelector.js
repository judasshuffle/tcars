TrackSelector = function() {
    var _this = this;
    _this.selectedTrack = 0;
    _this.trackTitleOverlay = null;
    _this.init = function() {
        print("Track selector initializing...");
       /* for (var i = 0; i < TRACKS.length; i++) {
            var selectableCar = {vehicle: VEHICLES[i], rotation: {x: 0, y: 0, z: 0, w: 1}, currentDegrees: 0};
            selectableCar.overlay = Overlays.addOverlay("model", {
                url: MODEL_FOLDER_URL + selectableCar.vehicle.modelFile + "?v=" + (new Date()).getTime(),
                position: Vec3.sum(CAR_SELECTOR_CENTER, {x: 0, y: selectableCar.vehicle.dimensions.y / 2, z: 0}),
                dimensions: selectableCar.vehicle.dimensions,
                visible: true
                //scale: 0.01///alpha: 0.5
            });
            selectableCar.wheels = [];
            for (var j = 0; j < WHEEL_COUNT; j++) {
                //var wheelPos = Vec3.sum(this.properties.position, Vec3.multiplyQbyV(this.properties.rotation, getPositionOffset(i)));
                selectableCar.wheels[j] = new CarSelectorWheel(selectableCar, j);
            }            
            _this.selectableCars.push(selectableCar);
        }*/
        _this.trackTitleOverlay = Overlays.addOverlay("text", {
            x: 200,
            y: 200,
            width: 1000,
            height: 200,
            textColor: {red: 0, green: 0, blue: 0},
            alpha: 1,
            backgroundAlpha: 0,
            visible: true
        });
        _this.updateSelectionText();
    };

    _this.nextTrack = function() {
        _this.selectedTrack = (_this.selectedTrack + 1) % TRACKS.length;
        _this.updateSelectionText();
    };

    _this.prevTrack = function() {
        _this.selectedTrack = (_this.selectedTrack + (TRACKS.length - 1)) % TRACKS.length;
        _this.updateSelectionText();
    };

    _this.updateSelectionText = function() {
        _this.setSelectionText(TRACKS[_this.selectedTrack].name)
    };

    _this.setSelectionText = function(text) {
        Overlays.editOverlay(_this.trackTitleOverlay, {text: text});
    };

    _this.update = function(time) {
        /*
        var radiusOffset = {x: 0, y: 0, z: CAR_SELECTOR_RADIUS};
        var degreesPerCar = MAX_DEGREES / _this.selectableCars.length;

        _this.carouselTargetRot = (_this.selectedCar * degreesPerCar) + CAR_SELECTOR_ROT_OFFSET;
        _this.carouselRot = mixDegreesTowards(_this.carouselRot, _this.carouselTargetRot, time * CAR_SELECTOR_ROT_SPEED);

        _this.selectableCars.forEach(function(selectableCar, index, object) {
            var rotationOffset = Quat.fromPitchYawRollDegrees(0.0, (index * degreesPerCar) - _this.carouselRot, 0.0);
            var newProperties = {
                position: Vec3.sum(Vec3.sum(CAR_SELECTOR_CENTER, Vec3.multiplyQbyV(rotationOffset, radiusOffset)), {x: 0, y: selectableCar.vehicle.dimensions.y / 2, z: 0})
            };
            if (index == _this.selectedCar) {
                selectableCar.rotation = Quat.multiply(selectableCar.rotation, Quat.fromVec3Degrees({x: 0, y: CAR_SELECTOR_TURN_SPEED * time, z: 0}));
                newProperties.rotation = selectableCar.rotation;
            }
            Overlays.editOverlay(selectableCar.overlay, newProperties);
            for (var i = 0; i < selectableCar.wheels.length; i++) {
                selectableCar.wheels[i].update(newProperties.position);
            }            
        });*/
    };

    _this.cleanup = function() {
      /*  _this.selectableCars.forEach(function(selectableCar, index, object) {
            Overlays.deleteOverlay(selectableCar.overlay);
            for (var i = 0; i < selectableCar.wheels.length; i++) {
                selectableCar.wheels[i].cleanup();
            }  
        });*/
        Overlays.deleteOverlay(_this.trackTitleOverlay);
       // _this.selectableCars = [];
    };
};
