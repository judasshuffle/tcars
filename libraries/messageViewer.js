// MessageViewer class definition.
MessageViewer = function(overlayProperties, title, maxMessages) {
    var _this = this;
    _this.maxMessages = maxMessages;
    _this.messages = [];
    _this.overlay = Overlays.addOverlay("text", overlayProperties);
    _this.title = title;

    // Append a message to the MessageViewer.
    _this.append = function(text) {
        _this.messages.push(text);//_this.messages.unshift(text);
        if (_this.messages.length > _this.maxMessages) {
            _this.messages.shift(); //_this.messages.pop();
        }
        Overlays.editOverlay(_this.overlay, {text: _this.title + _this.messages.join("\n")});
    };
    
    // Remove the overlay.
    _this.cleanup = function() {
        Overlays.deleteOverlay(_this.overlay);
    };
};