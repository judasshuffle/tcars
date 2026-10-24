// Player class definition.
module.exports = {
    Player: function (id, name, role) {
        var _this = this;

        // Attaching the properties to the object.
        _this.id = id;
        _this.name = name;
        _this.role = role;
        /* _this.position = null;
         _this.positionBox = null;

         // Function to create PositionBox overlay.
         _this.createPositionBox = function() {
             _this.positionBox = Overlays.addOverlay("cube", BOX_OVERLAY_PROPS);
         };

         // Updates the avatars Position(Box).
         _this.updatePosition = function(position) {
             if (_this.positionBox === null) {
                 _this.createPositionBox();
             }
             _this.position = position;
             Overlays.editOverlay(_this.positionBox, {position: _this.position});
         };

         // Cleanup the position box if existing.
         _this.cleanup = function() {
             if (_this.positionBox !== null) {
                 Overlays.deleteOverlay(_this.positionBox);
             }
         };*/

        print('added player ' + name + ' with ID: ' + id);
    }
};
