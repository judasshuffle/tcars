 function parseCoordinate(coord) {
    var formatted = [];
    for (var key in coord) {
        formatted.push(key + ': ' + coord[key]);
    }
    return '{' + formatted.join(', ') + '}';
}

function printCoordinate(coord) {
    print(parseCoordinate(coord));
}

function formatCoordinate(name, coord) {
    return name + ': ' + parseCoordinate(coord);
}

var COORD_POSTFIX = ',\r\n';

print(
formatCoordinate('startPosition', MyAvatar.position) + COORD_POSTFIX +
formatCoordinate('startOrientation', MyAvatar.orientation) + COORD_POSTFIX +
formatCoordinate('previewPosition', Camera.position) + COORD_POSTFIX +
formatCoordinate('previewOrientation', Camera.orientation) + COORD_POSTFIX
);
Script.stop();
