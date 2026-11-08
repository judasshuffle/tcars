# TCARS V5: one-car multiplayer experiment

This is a separate test pad, not a replacement for the V4 arcade console. It creates a shared Blues chassis and wheels on the entity script server, pending for 1.5 seconds before physics starts. Each visitor's pad client draws the original Blues body locally as in the supplied vehicle-pad workaround. DarkRide's system `vehicles.js` supplies driver and passenger seating, driving, Space handbrake and F to exit. Four primitive wheels are temporary; their positions, handling and the model alignment need in-world tuning.

## Set up an isolated test

1. Host `pad-client.js` and `pad-server.js` at URLs reachable by the clients and entity script server. Do not replace the V4 scripts. Use a non-production test domain with DarkRide's physics server, entity script server, and the current system vehicle script enabled.
2. Create a separate static pad on a known solid, flat surface, with its top near ground level. Set its `script` to the client URL and `serverScripts` to the server URL. Allow at least 22 m width and 20 m depth around it. Its rotation sets the spawn orientation. Server needs permission to create and delete entities and clients need access to the original Blues model URL.
3. Watch entity server logs for `[TCARS V5] pending`, then `activated`; use each client's script log for errors. Cars expire after 30 minutes. Do not reload/unload the pad while testing: its in-memory allocation and client tokens are lost on reload; existing cars then expire naturally.

## Two-player test

1. With both clients near the pad, A clicks it once. Check both see the body and four wheels, that the car stays still initially, and that the log shows activation after 1.5 seconds. A clicks the car to enter; check both see A seated. Drive, steer and test Space and F.
2. B clicks the pad. Verify a second car appears in a different slot without disturbing A's, and both see both cars and avatars while driving simultaneously. Check passenger seating separately.
3. Both exit with F. A returns to the pad and Ctrl-clicks it. Verify only A's car disappears for both visitors; B can still drive and then remove B's car the same way. Test a seventh request when six slots are occupied: no existing car should be removed.
4. Record client and server versions, logs, asset loading, alignment, handling and any discrepancies. Repeat with a client joining after cars have spawned and with a car driven away from the pad.

The local body scan has a 1 km radius and runs while the visitor has the pad script loaded. Confirm the pad remains loaded over the intended driving area; otherwise visuals can disappear. Control-click cleanup is a test convenience; first exit the car. A session token prevents accidental cross-player cleanup but is supplied by the client, not authenticated by the server. This is not an authorization boundary. Restarting scripts loses the token and allocation; expiration is the fallback. Six slots are a test limit, not a persistent fleet manager. Do not use this experiment on a public production domain.

Rockets, return-to-console behavior, the five-car/four-track arcade integration, and robust authenticated ownership are not implemented in this first-stage test. Left Ctrl firing is therefore not yet available. Two-player behavior has not been verified by automated mocks; complete the in-world test before extending the console. Crompton Moor terrain collision is a separate server issue; use a known solid test surface.

Run the prototype checks with `node --test v5-prototype/pad.test.js`.
