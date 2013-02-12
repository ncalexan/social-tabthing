const tabs = require("tabs");

const { Cu } = require("chrome");
var Social = Cu.import("resource://gre/modules/Social.jsm", {}).Social;

function _broadcastTabEvent(socialProvider, tab) {
  let port = socialProvider.getWorkerPort();
  if (!port) {
    console.log("Couldn't get social provider port.");
    return;
  }

  let data = { url: tab.url,
               title: tab.title,
               faviconURL: tab.favicon
             };
  port.postMessage({ topic: "tabs",
                     data: data });

  console.log("broadcast tab event with data " + JSON.stringify(data));
}

function broadcastTabEvent(tab) {
  if (!Social.enabled || Social.provider === null) {
    console.log("Social not enabled or no provider.");
    return;
  }

  _broadcastTabEvent(Social.provider, tab);
}

function startBroadcastingTabEvents() {
  tabs.on("ready", broadcastTabEvent);
  tabs.on("close", broadcastTabEvent);
  console.log("social-tabthing broadcasting tab events.");
}

startBroadcastingTabEvents();

console.log("social-tabthing add-on started with Social " + Social);
