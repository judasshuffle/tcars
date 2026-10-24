//  TCars/library/client.js
//
//  A client can connect to another clientManager
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


// clientID should be Agent.sessionUUID or MyAvatar.sessionUUID
module.exports = {
    Client: function (sendingChannel, clientID) {
        var _this = this;

        // hook to this event to get the results
        _this.onActionReceived = undefined;

        var listeningChannel = sendingChannel + '_' + clientID;

        _this.send = function (data) {
            Messages.sendMessage(sendingChannel, JSON.stringify(data));
        };

        Messages.subscribe(listeningChannel);
        Messages.messageReceived.connect(function (channel, message, senderID) {
            if (senderID === clientID || channel !== listeningChannel) {
                return;
            }
            print("received " + message);
            var data = JSON.parse(message);
            if (_this.onActionReceived !== undefined && data.action) {
                _this.onActionReceived.call(this, senderID, data.action, data);
            }
        });
    }
};
