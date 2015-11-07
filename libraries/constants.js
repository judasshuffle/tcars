//  TCars/library/constants.js
//
//  This file contains all the contants for the TCars project
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

MAX_DEGREES = 360;

GRAVITY = -9.81;

WORLD_UP_DIRECTION = {x: 0, y: 1, z: 0};

// We have different states that the script switches between
STATE = {
    LOBBY: 0,
    TRACK_SELECTION: 1,
    CAR_SELECTION: 2,
    PITSTOP: 3,
    DRIVING: 4,
    RACING: 5,
    GAMEOVER: 6
};

WHEEL = {
    LEFT_FRONT: 0,
    RIGHT_FRONT: 1,
    LEFT_BACK: 2,
    RIGHT_BACK: 3,
    COUNT: 4
};

CAMERA = {
    CAR_TOPVIEW: 0,
    CAR_HOOD: 1,
    CAR_MIRROR: 2,
    CAR_BEHIND_CLOSE: 3,
    CAR_BEHIND_MEDIUM: 4,
    CAR_BEHIND_FAR: 5,
    CAR_FIXED_WORLD: 6,
    CAR_SELECTOR: 7,
    CAR_FROM_USER_AUTOFOCUS: 8,
    CAR_FROM_USER_HMD: 9,
    TRACK_SELECTOR: 10,
    CAR_INSIDE: 11
};

CAR_SELECTOR = {
    CAM_POS: {x: 0, y: -4, z: 14}, //{x: 7942.3974609375, y: 7919.84716796875, z: 7778.14501953125},
    CAM_ROT: {x: -0.030600588768720627, y: 0.9688771367073059, z: 0.18906143307685852, w: 0.15683221817016602},
    CENTER: {x: 0, y: -8, z: -4}, //{x: 7937.99, y: 7913.61, z: 7801.6},
    RADIUS: -9.5,
    ROT_OFFSET: 180,
    TURN_SPEED: 30,
    ROT_SPEED: 2
};

ZERO_ROTATION = {x: 0, y: 0, z: 0, w: 1};

DEFAULT_REGISTRATION_POINT = {x: 0.5, y: 0.5, z: 0.5};

SPEED_FORWARD = 500;
SPEED_BRAKES = 1015;

SOUND_FOLDER_URL = "http://hifi-external.s3.amazonaws.com/tcars/sounds/";

SOUND = true;

MODEL_FOLDER_URL = "http://hifi-external.s3.amazonaws.com/tcars/models/";

TRACK_ZONE_FOLDER_URL = "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/trackzones/";

TRACK_ZONE_DIMENSIONS = {x: 2000, y: 2000, z: 2000};
TRACK_ZONE_SEARCH_DISTANCE = 2000; // search distance of trackzones (in meters)
HALF_UNIT = 0.5;

MAX_PLAYERS = 8;
MAX_SPECTATORS = 10;

VEHICLE_MODEL_PREFIX = "TCarModel-";

ROLE = {
    PLAYER: 1,
    SPECTATOR: 2
};

// Packet types for connection with lobby AC
LOBBY_ACTION = {
    REGISTER_SESSION_REQUEST:   1,
    REGISTER_SESSION_REPLY:     2,
    SESSION_INFORMATION_UPDATE: 3,
    PLAYER_SESSIONS_REQUEST:    4,
    PLAYER_SESSIONS_REPLY:      5
};

SESSION_ACTION = {
    JOIN_REQUEST: 	1,
    JOIN_REPLY:     2,
    UPDATE:         3,
    MESSAGE:        4,
    PLAYER_JOIN:    5,
    PLAYER_LEFT:    6,
    GAME_STATE:     7,
    PING:           8,
    VOTE:           9
};

// Session state
SESSION_STATE = {
    INITIAL:            1,
    VOTE_TRACK:         2,
    LOADING:            3,
    COUNT_DOWN:         4,
    RACE:               5
    //TODO: Another state after race or restart?

};

SESSION_STATE_TEXT = {};
SESSION_STATE_TEXT[SESSION_STATE.INITIAL] = 'Waiting for players';
SESSION_STATE_TEXT[SESSION_STATE.VOTE_TRACK] = 'Track Voting';
SESSION_STATE_TEXT[SESSION_STATE.LOADING] = 'Loading Track';
SESSION_STATE_TEXT[SESSION_STATE.COUNT_DOWN] = 'Count Down';
SESSION_STATE_TEXT[SESSION_STATE.RACE] = 'Race in progress';
