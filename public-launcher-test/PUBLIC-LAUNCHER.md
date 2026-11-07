# Permanent public TCARS launcher (experimental)

1. In a domain where you have permission to rez permanent entities, create a Text or Box entity using Create. Name it TCARS; make it visible and position it where visitors can click it. Set its lifetime to unlimited/permanent and do not make it local or temporary.
2. In the entity Properties, under Scripts/Behavior, set **Script** (the client script, not Server Script) to:
   `https://judasshuffle.github.io/tcars/public-launcher-test/entity.js`
3. Save the entity. Click it: the independent TCARS interface script should appear in Running Scripts and open its tablet. Clicking again should reopen the same menu without starting a second copy. Quit TCARS; the entity should remain. Clicking it again should start a fresh session.
4. Log the owner out. Have a second visitor enter the domain with no TCARS script running and click the entity. Confirm that their menu opens and their own TCARS script appears in Running Scripts. Two visitors should be able to run and quit independently. The domain must permit the entity to persist and visitors must be allowed to load its public client script.

The client entity script requests the independent interface script through DarkRide's ScriptDiscoveryService. DarkRide source exposes that service to its client entity engine and includes an entity-script example using it, although the API documentation lists only interface and avatar scripts. Actual viewer and domain behavior must be tested. A 60-second local retry guard prevents repeated clicks from racing while the interface script downloads; after a failed load, wait a minute before retrying. TCARS session cleanup does not own or delete this permanent entity.
