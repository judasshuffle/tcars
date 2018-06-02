//  TCars/library/carSelector.js
//
//  Responsible for the car selection wheel where the player selects the car
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* CarSelectorWheel = function(selectableCar, wheelIndex) {
    var _this = this;
    _this.selectableCar = selectableCar;
    _this.wheelIndex = wheelIndex;
    var getPositionOffset = function() {
        switch (_this.wheelIndex) {
            case WHEEL_LEFT_FRONT:
                return Vec3.sum(_this.selectableCar.vehicle.frontAxlePos,
                    {x: -_this.selectableCar.vehicle.frontAxleLength / 2});
            case WHEEL_RIGHT_FRONT:
                return Vec3.sum(_this.selectableCar.vehicle.frontAxlePos, {x: _this.selectableCar.vehicle.frontAxleLength / 2});
            case WHEEL_LEFT_BACK:
                return Vec3.sum(_this.selectableCar.vehicle.backAxlePos, {x: -_this.selectableCar.vehicle.backAxleLength / 2});
            case WHEEL_RIGHT_BACK:
                return Vec3.sum(_this.selectableCar.vehicle.backAxlePos, {x: _this.selectableCar.vehicle.backAxleLength / 2});
        }
        return {};
    };
    var getRotationOffset = function() {
        switch (_this.wheelIndex) {
            case WHEEL_LEFT_FRONT:
            case WHEEL_LEFT_BACK:
                return Quat.fromPitchYawRollDegrees(0, 0, 180);
            case WHEEL_RIGHT_FRONT:
            case WHEEL_RIGHT_BACK:
                return Quat.fromPitchYawRollDegrees(0, 0, 0);
        }
        return {};
    };
    var vehicleRegPoint = _this.selectableCar.vehicle.registrationPoint;
    _this.positionOffset = Vec3.sum(getPositionOffset(), {
        x: ((vehicleRegPoint.x - DEFAULT_REGISTRATION_POINT.x) * 4),
        y: ((vehicleRegPoint.y - DEFAULT_REGISTRATION_POINT.y) * 4),
        z: ((vehicleRegPoint.z - DEFAULT_REGISTRATION_POINT.z) * 4)
    });
    _this.rotationOffset = getRotationOffset();
    
    _this.overlay = Overlays.addOverlay("model", {
        url: MODEL_FOLDER_URL + _this.selectableCar.vehicle.wheelModel,
        dimensions: 0, // you cannot change the dimensions
        //position: wheelPos, dimensions: {x: 0.63, y: 0.99, z:0.99},
        //rotation: this.properties.rotation
    });

    _this.update = function(carPosition) {
      // print(JSON.stringify(carPosition));
        Overlays.editOverlay(_this.overlay, {
            position: Vec3.sum(carPosition, Vec3.multiplyQbyV(_this.selectableCar.rotation, _this.positionOffset)),
            rotation: Quat.multiply(_this.selectableCar.rotation, _this.rotationOffset)
        });
    };

    this.cleanup = function() {
        print('cleaning up CarSelector');
        Overlays.deleteOverlay(_this.overlay);
        print('Try selecting a car now! Muahahahaha!')
    };
};*/

CarSelector = function () {
    var _this = this;
    _this.selectedCar = 0;
    _this.selectableCars = [];
    _this.carouselRot = 0;
    _this.carouselTargetRot = 0;
    _this.carTitleOverlay = null;
    _this.init = function (allowedVehicles) {
        print("Car selector initializing...");
        for (var vehicleKey in VEHICLES) {
            if (VEHICLES.hasOwnProperty(vehicleKey) && allowedVehicles.indexOf(vehicleKey) !== -1) {
                var selectableCar = {vehicle: VEHICLES[vehicleKey], rotation: {x: 0, y: 0, z: 0, w: 1}, currentDegrees: 0};
                selectableCar.overlay = Overlays.addOverlay("model", {
                    url: MODEL_FOLDER_URL + selectableCar.vehicle.selectormodel + "?v=" + (new Date()).getTime(),
                    position: Vec3.sum(CAR_SELECTOR.CENTER, {x: 0, y: selectableCar.vehicle.dimensions.y / 2, z: 0}),
                    dimensions: selectableCar.vehicle.selectorDimensions,
                    visible: true
                    // scale: 0.01///alpha: 0.5
                });
                /*  selectableCar.wheels = [];
                for (var j = 0; j < WHEEL_COUNT; j++) {
                    // var wheelPos = Vec3.sum(this.properties.position,
                    //     Vec3.multiplyQbyV(this.properties.rotation,getPositionOffset(i)));
                    selectableCar.wheels[j] = new CarSelectorWheel(selectableCar, j);
                }  */
                _this.selectableCars.push(selectableCar);
            }
        }
        _this.carTitleOverlay = Overlays.addOverlay("text", {
            x: 200,
            y: 200,
            width: 1000,
            height: 200,
            textColor: {red: 0, green: 0, blue: 0},
            alpha: 1,
            backgroundAlpha: 0,
            visible: true
        });
        _this.updateCarSelectionText();
    };

    _this.nextCar = function() {
        _this.selectedCar = (_this.selectedCar + 1) % _this.selectableCars.length;
        _this.updateCarSelectionText();
    };

    _this.prevCar = function() {
        _this.selectedCar = (_this.selectedCar + (_this.selectableCars.length - 1)) % _this.selectableCars.length;
        _this.updateCarSelectionText();
    };

    _this.updateCarSelectionText = function() {
        _this.setSelectionText(_this.selectableCars[_this.selectedCar].vehicle.name);
    };

    _this.setSelectionText = function(text) {
        Overlays.editOverlay(_this.carTitleOverlay, {text: text});
    };

    function normalizeDegrees(degrees) {
        return (degrees + MAX_DEGREES) % MAX_DEGREES;
    }

    function mixDegreesTowards(currentRotation, targetRotation, mixValue) {
        if (mixValue > 1.0) {
            mixValue = 1.0;
        }
        currentRotation = normalizeDegrees(currentRotation);
        var leftDistance = normalizeDegrees(currentRotation - targetRotation);
        var rightDistance = normalizeDegrees(targetRotation - currentRotation);
        if (leftDistance < rightDistance) {
            return currentRotation - (leftDistance * mixValue);
        }
        return currentRotation + (rightDistance * mixValue);
    }  

    _this.update = function(time) {
        var radiusOffset = {x: 0, y: 0, z: CAR_SELECTOR.RADIUS};
        var degreesPerCar = MAX_DEGREES / _this.selectableCars.length;

        _this.carouselTargetRot = (_this.selectedCar * degreesPerCar) + CAR_SELECTOR.ROT_OFFSET;
        _this.carouselRot = mixDegreesTowards(_this.carouselRot, _this.carouselTargetRot, time * CAR_SELECTOR.ROT_SPEED);

        _this.selectableCars.forEach(function(selectableCar, index) {
            var rotationOffset = Quat.fromPitchYawRollDegrees(0.0, (index * degreesPerCar) - _this.carouselRot, 0.0);
            var newProperties = {
                position: Vec3.sum(Vec3.sum(CAR_SELECTOR.CENTER, Vec3.multiplyQbyV(rotationOffset, radiusOffset)),
                    {x: 0, y: selectableCar.vehicle.dimensions.y / 2, z: 0})
            };
            if (index === _this.selectedCar) {
                selectableCar.rotation = Quat.multiply(selectableCar.rotation,
                    Quat.fromVec3Degrees({x: 0, y: CAR_SELECTOR.TURN_SPEED * time, z: 0}));
                newProperties.rotation = selectableCar.rotation;
            }
            Overlays.editOverlay(selectableCar.overlay, newProperties);
            /*  for (var i = 0; i < selectableCar.wheels.length; i++) {
                selectableCar.wheels[i].update(newProperties.position);
            }            */
        });
    };

    _this.cleanup = function() {
        _this.selectableCars.forEach(function (selectableCar) {
            Overlays.deleteOverlay(selectableCar.overlay);
            /*  for (var i = 0; i < selectableCar.wheels.length; i++) {
                selectableCar.wheels[i].cleanup();
            } */ 
        });
        Overlays.deleteOverlay(_this.carTitleOverlay);
        _this.selectableCars = [];
    };
};
