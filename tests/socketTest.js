var webSocketServer = new WebSocketServer({port: 17171});
if (!webSocketServer.listening) {
    print("Failed listening");
}
webSocketServer.newConnection.connect(function(newSocket) {
    newSocket.onmessage = function(event) {
        newSocket.send("Thank you! " + event.data + " too!!!");
        print(event.data);
    };
});