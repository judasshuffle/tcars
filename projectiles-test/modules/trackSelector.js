//  TCars/library/trackSelector.js
//
//  Handles the selection of tracks
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

module.exports = {
    TrackSelector: function () {
        var _this = this;
        _this.selectedTrack = 0;
        _this.trackTitleOverlay = null;
        _this.init = function () {
            print('Track selector initializing...');
            _this.trackTitleOverlay = Overlays.addOverlay('text', {
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

        _this.hide = function () {
            Overlays.editOverlay(_this.trackTitleOverlay, {visible: false});
        };

        _this.show = function () {
            Overlays.editOverlay(_this.trackTitleOverlay, {visible: true});
        };

        _this.nextTrack = function () {
            _this.selectedTrack = (_this.selectedTrack + 1) % TRACKS.length;
            _this.updateSelectionText();
        };

        _this.prevTrack = function () {
            _this.selectedTrack = (_this.selectedTrack + (TRACKS.length - 1)) % TRACKS.length;
            _this.updateSelectionText();
        };

        _this.updateSelectionText = function () {
            _this.setSelectionText(TRACKS[_this.selectedTrack].name);
        };

        _this.setSelectionText = function (text) {
            Overlays.editOverlay(_this.trackTitleOverlay, {text: text});
        };

        _this.update = function (time) {
        };

        _this.cleanup = function () {
            print('cleaning up trackSelector');
            Overlays.deleteOverlay(_this.trackTitleOverlay);
            print('cleaned up trackSelector');
        };
    }
};
