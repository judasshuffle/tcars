//  TCars/library/clientManager.js
//
//  A client manager class for the TCars AssignmentClients
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

ClientManager = function(listeningChannel) {
    var _this = this;

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

    _this.getClient = function(clientID) {
        //print("CID = "  + clientID);
        //print(JSON.stringify(clients));
        return clients[clientID];
    };

    _this.deleteClient = function(clientID) {
        var client = clients[clientID];
        if (client === undefined) {
            return false;
        }
        //if (client.socket.readyState !== client.socket.CLOSED) {
        //    client.socket.close(1000, 'Closed by ClientManager.');
        //}
        delete clients[clientID];
        return true;
    };

    _this.doForAllClients = function(callback) {
        for (var clientID in clients) {
            if (clients.hasOwnProperty(clientID)) {
                callback.call(this, clientID, clients[clientID]);
            }
        }
    };

    _this.send = function(clientID, data) {
        var stringData = JSON.stringify(data);
        var client = _this.getClient(clientID);
        if (client !== undefined) {
            //print('sending ' + listeningChannel + '_' + clientID + ': ' + stringData);
            Messages.sendMessage(listeningChannel + '_' + clientID, stringData);
            //client.socket.send(stringData);
        }
    };

    // Finds a client in the clients list by the WebSocket.
   /* _this.findClientByWebSocket = function(socket) {
        for (client in clients) {
            if (clients[client].socket === socket) {
                return clients[client];
            }
        }
        return null;
    };*/

    _this.sendToAllActiveClients = function(data, exceptUUID) {
        //var stringData = JSON.stringify(data);
        for (var client in clients) {
            if (clients.hasOwnProperty(client)) {
                var clientObj = clients[client];
                if (clientObj.id !== exceptUUID) {
                    //clientObj.socket.send(stringData);
                    _this.send(data);
                }
            }
        }
    };

    // We start a WebSocketServer on the given port.
    /*var webSocketServer = new WebSocketServer({port: port});
    webSocketServer.newConnection.connect(function(newClient) {
        print("incomming connection");
        var newClientID = nextClientID++;
        clients[newClientID] = {socket: newClient, id: newClientID};

        newClient.onmessage = function(event) {
            var data = JSON.parse(event.data);
            if (_this.onClientAction !== undefined) {
                _this.onClientAction.call(this, newClientID, data.action, data);
            }
        };
        newClient.onerror = function(event) {
            print("error");
            if (_this.onClientDisconnect !== undefined) {
                _this.onClientDisconnect.call(this, newClientID);
            }
            delete clients[newClientID];
        };
        newClient.onclose = function(event) {
            if (_this.onClientDisconnect !== undefined) {
                _this.onClientDisconnect.call(this, newClientID);
            }
            delete clients[newClientID];
        };
        if (_this.onClientConnect !== undefined) {
            _this.onClientConnect.call(this, newClientID);
        }
    });*/
    Messages.subscribe(listeningChannel);
    Messages.messageReceived.connect(function (channel, message, senderID) {
        if (senderID === Agent.sessionUUID || channel !== listeningChannel) {
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
};
