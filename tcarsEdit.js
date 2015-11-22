// IMPORT track, JSON

Script.include([
    "libraries/constants.js",
    "libraries/trackZone.js",
    "libraries/trackZoneManager.js"
]);

TrackZoneEditingTools = function() {
    var _this = this;

    var trackZoneManager = new TrackZoneManager();

    _this.selectClosestTrack = function() {
        trackZoneManager.selectNearestTrackZone(Camera.position);
    };

    _this.getRelativePosition = function(globalPosition) {
        trackZoneManager.refreshNearbyTracks(MyAvatar.position);
        _this.selectClosestTrack();
        return Vec3.subtract(trackZoneManager.getSelectedTrackZone().getPosition(), globalPosition);
    };

    _this.exportTrack = function() {
        var exportWindows = new WebWindow('Export window', Script.resolvePath('html/exportTrackZone.html'), 800, 600);
        exportWindows.setVisible(true);
        exportWindows.eventBridge.webEventReceived.connect(function(data) {
            data = JSON.parse(data);
            switch (data.action) {
                case 'page_loaded':
                    trackZoneManager.refreshNearbyTracks(MyAvatar.position);
                    _this.selectClosestTrack();
                    exportWindows.eventBridge.emitScriptEvent(JSON.stringify({
                        action: "export",
                        data: trackZoneManager.getSelectedTrackZone().exportTrack()
                    }));
                    break;
            }
        });
    };


    _this.importTrack = function() {
        var importWindows = new WebWindow('Import window', Script.resolvePath('html/importTrackZone.html'), 800, 600);
        importWindows.setVisible(true);
        importWindows.eventBridge.webEventReceived.connect(function(data) {
            data = JSON.parse(data);
            switch (data.action) {
                case 'import_json':
                    trackZoneManager.importTrack(MyAvatar.position, data.data);
                    break;
            }
        });
    };
    // add respawnable stuff
    
    // add solid stuff
    
    // set start line ( and 4 starting positions)
    _this.setStartLine = function() {
        
    };
    
    // add checkpoints
    _this.addCheckpoint = function() {
        
    };
};
trackZoneEditingTools = new TrackZoneEditingTools();
trackZoneEditingTools.selectClosestTrack();

const MENU_TCARS_EDIT = 'TCars Edit';
const MENUITEM_TCARS_EDIT_SELECT_NEAREST = 'Select Nearest TrackZone';
const MENUITEM_TCARS_EDIT_IMPORT = 'TrackZoneImport';
const MENUITEM_TCARS_EDIT_EXPORT = 'TrackZoneExport';
const MENU_TCARS_EDIT_CHECKPOINTS = MENU_TCARS_EDIT + ' > Checkpoints';
const MENUITEM_TCARS_GET_LOCAL_POS = 'Get Local Position';

Menu.addMenu(MENU_TCARS_EDIT);
Menu.addMenuItem({menuName: MENU_TCARS_EDIT, menuItemName: MENUITEM_TCARS_EDIT_IMPORT});
Menu.addMenuItem({menuName: MENU_TCARS_EDIT, menuItemName: MENUITEM_TCARS_EDIT_EXPORT});
Menu.addMenu(MENU_TCARS_EDIT_CHECKPOINTS);
Menu.addMenuItem({menuName: MENU_TCARS_EDIT, menuItemName: MENUITEM_TCARS_GET_LOCAL_POS});

Menu.menuItemEvent.connect(function(menuItem) {
    if (menuItem === MENUITEM_TCARS_EDIT_EXPORT) {
        trackZoneEditingTools.exportTrack();
    } else if (menuItem === MENUITEM_TCARS_EDIT_IMPORT) {
        trackZoneEditingTools.importTrack();
    } else if (menuItem === MENUITEM_TCARS_GET_LOCAL_POS) {
        print(JSON.stringify(trackZoneEditingTools.getRelativePosition(MyAvatar.position)));
    }
});

Script.scriptEnding.connect(function() {
    Menu.removeMenu(MENU_TCARS_EDIT);
});
