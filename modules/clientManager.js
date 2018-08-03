//  TCars/library/clientManager.js
//
//  A client manager class for the TCars AssignmentClients
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

module.exports = {
    ClientManager: function (listeningChannel) {
        var _this = this;

        var managerSessionUUID = Script.context === 'client' ? MyAvatar.sessionUUID : Agent.sessionUUID;
        // The clients are stored in this object.
        var clients = {};
        /*
            // We add to this number when a new client connects.
            var nextClientID = 0;
        */
        // Events
        _this.onClientConnect = undefined;
        _this.onClientDisconnect = undefined;
        _this.onClientAction = undefined;

        _this.getClient = function (clientID) {
            // print("CID = "  + clientID);
            // print(JSON.stringify(clients));
            return clients[clientID];
        };

        _this.deleteClient = function (clientID) {
            var client = clients[clientID];
            if (client === undefined) {
                return false;
            }
            // if (client.socket.readyState !== client.socket.CLOSED) {
            //     client.socket.close(1000, 'Closed by ClientManager.');
            // }
            delete clients[clientID];
            return true;
        };

        _this.doForAllClients = function (callback) {
            for (var clientID in clients) {
                if (clients.hasOwnProperty(clientID)) {
                    callback.call(this, clientID, clients[clientID]);
                }
            }
        };

        _this.send = function (clientID, data) {
            var stringData = JSON.stringify(data);
            var client = _this.getClient(clientID);
            if (client !== undefined) {
                print('sending ' + listeningChannel + '_' + clientID + ': ' + stringData);
                Messages.sendMessage(listeningChannel + '_' + clientID, stringData);
            }
        };

        _this.sendToAllActiveClients = function (data, exceptUUID) {
            clients.forEach(function (client) {
                if (client.id !== exceptUUID) {
                    _this.send(client.id, data);
                }
            });
        };

        Messages.subscribe(listeningChannel);
        Messages.messageReceived.connect(function (channel, message, senderID) {
            if (senderID === managerSessionUUID || channel !== listeningChannel) {
                return;
            }
            if (clients[senderID] === undefined) {
                clients[senderID] = {id: senderID};
                if (_this.onClientConnect !== undefined) {
                    _this.onClientConnect.call(this, senderID);
                }
            }
            var data = JSON.parse(message);
            if (_this.onClientAction !== undefined && data.action) {
                _this.onClientAction.call(this, senderID, data.action, data);
            }
        });
    }
};
