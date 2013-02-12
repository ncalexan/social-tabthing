const tabs = require("tabs");

const { Cu } = require("chrome");
var Social = Cu.import("resource://gre/modules/Social.jsm", {}).Social;

function _dataForTab(tab) {
  return { url: tab.url,
           title: tab.title,
           faviconURL: tab.favicon
         };
}

function _filterTab(tab) {
  return (tab.url == "about:blank" || tab.url == "about:newtab");
}

function _broadcastTabEvent(socialProvider, type, tab) {
  let port = socialProvider.getWorkerPort();
  if (!port) {
    console.log("Couldn't get social provider port.");
    return;
  }

  if (_filterTab(tab))
    return;

  // Fine-grained.
  port.postMessage({ topic: "tab." + type,
                     data: _dataForTab(tab) });

  // Coarse-grained.
  let allTabs = [];
  for each (var atab in tabs) {
      allTabs.push(_dataForTab(atab));
  }
  port.postMessage({ topic: "tabs",
                     data: allTabs });

  console.log("Broadcast tab events.");
}

function broadcastTabEvent(type, tab) {
  if (!Social.enabled || Social.provider === null) {
    console.log("Social not enabled or no provider.");
    return;
  }

  _broadcastTabEvent(Social.provider, type, tab);
}

function startBroadcastingTabEvents() {
  for each (var event in ["ready", "close", "activate", "deactivate"]) {
    tabs.on(event, broadcastTabEvent.bind(undefined, event));
  };
  console.log("social-tabthing broadcasting tab events.");
}

startBroadcastingTabEvents();

console.log("social-tabthing add-on started with Social " + Social);
