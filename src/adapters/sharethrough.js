var utils = require('../utils.js');
var adloader = require('../adloader.js');
var bidmanager = require('../bidmanager.js');
var bidfactory = require('../bidfactory.js');

/*  params:
{
    bids: [
      {
        bidder: "sharethrough",
        params: {
          pkey: PKEY
        }
      },
      {
        bidder: "sharethrough",
        params: {
          foo: bar
        }
      }
    ]
}
*/
const BEACON_HOST = document.location.protocol + "//b.sharethrough.com/butler?" //{arid}{awid}{type}
const BIDDER_CODE = "sharethrough";
const BTLR_HOST = "http://localhost:3001";   // TODO: change to STX endpoint once it exists
//   uri = '//btlr.sharethrough.com/v4?',
const STR_VERSION = "0.1.0";

var SharethroughAdapter = function SharethroughAdapter() {
  const xmlHttp = new XMLHttpRequest();
  var placementCodeSet = new Set(); //placement codes we are competing in
  var bidIdToPlacementCode = new Object();

  function _callBids(params) {
    var bids = params.bids,
        scriptUrl,
        cacheRequest = false;

    pbjs.onEvent('bidWon', bidWon);

    if (window.addEventListener){

      addEventListener("message", receiveMessage, false)

    } else {

      attachEvent("onmessage", receiveMessage)

    }

    // cycle through bids
    for (var i = 0; i < bids.length; i += 1) {
      var bidRequest = bids[i];
      placementCodeSet.add(bidRequest.placementCode);
      bidIdToPlacementCode[bidRequest.bidId] = bidRequest;

      scriptUrl = _buildSharethroughCall(bidRequest);
      loadIFrame(scriptUrl);
    }
  }

  function _buildSharethroughCall(bid) {
    var pkey = utils.getBidIdParamater('pkey', bid.params);

    var url = BTLR_HOST + "/header-bid/v1?";
    console.log(bid.bidId)
    url = utils.tryAppendQueryString(url, 'bidId', bid.bidId);
    url = utils.tryAppendQueryString(url, 'placement_key', pkey);
    url = utils.tryAppendQueryString(url, 'ijson', '$$PREBID_GLOBAL$$.strcallback');
    url = appendEnvFields(url);

    return url;
  }

  function loadIFrame(url) {
    var iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.cssText = 'display:none;'
    iframe.onload = function() {
      console.log("loaded");
    };    

    document.body.appendChild(iframe);
  }

  function receiveMessage(event) {
    if(event.origin == BTLR_HOST) {
      strcallback(JSON.parse(event.data).response);
    }

  }

  function strcallback(bidResponse) {
    var bidId = bidResponse.bidId;
    let bidObj = bidIdToPlacementCode[bidId];
    console.log(bidResponse);
    try {
      let bid = bidfactory.createBid(1, bidObj);

      bid.bidderCode = 'sharethrough';
      bid.cpm = bidResponse.creatives[0].cpm + 10; //remove +10 eventually
      const size = bidObj.sizes[0];
      bid.width = size[0];
      bid.height = size[1];
      bid.adserverRequestId = bidResponse.adserverRequestId;
      bid.winId = bidResponse.creatives[0].auctionWinId;

      var pkey = utils.getBidIdParamater('pkey', bidObj.params);
      bid.pkey = pkey;

      var windowLocation = `str_response_${bidId}`;
      var bidJsonString = JSON.stringify(bidResponse);

      bid.ad = `<div data-str-native-key="${pkey}" data-stx-response-name='${windowLocation}'></div><script>var ${windowLocation} = ${bidJsonString}</script><script src="//native.sharethrough.com/assets/sfp.js"></script>`;

      bidmanager.addBidResponse(bidObj.placementCode, bid);
    } catch (e) {
      _handleInvalidBid(bidObj);
    }

    // If the bid is valid: Use bidfactory.createBid(1) to create the bidObject.
    // If the bid is invalid (no fill or error): Use bidfactory.createBid(2) to create the bidObject.
    // bidmanager.addBidResponse(adUnitCode, bidObject);
  }

  function _handleInvalidBid(bidObj) {
    const bid = bidfactory.createBid(2, bidObj);
    bidmanager.addBidResponse(bidObj.placementCode, bid);
  }

  var bidWon = function() { //need pkey, adserverRequestId, bidId
    var curBidderCode = arguments[0].bidderCode;
    console.log("winner biddercode: ", curBidderCode);
    if(curBidderCode != BIDDER_CODE && placementCodeSet.has(arguments[0].adUnitCode)) {
      fireLoseBeacon(curBidderCode, arguments[0].cpm, "headerBidLose");
      return;
    } else if(curBidderCode != BIDDER_CODE) {
      return;
    }

    fireWinBeacon(arguments[0].adserverRequestId, arguments[0].winId, "headerBidWin");
  }

  function fireLoseBeacon(winningBidderCode, winningCPM, type)
  {
    var loseBeaconUrl = BEACON_HOST;
    loseBeaconUrl = utils.tryAppendQueryString(loseBeaconUrl, "winnerBidderCode", winningBidderCode);
    loseBeaconUrl = utils.tryAppendQueryString(loseBeaconUrl, "winnerCpm", winningCPM);
    loseBeaconUrl = utils.tryAppendQueryString(loseBeaconUrl, "type", type);
    loseBeaconUrl = appendEnvFields(loseBeaconUrl);

    httpGetAsync(loseBeaconUrl, function(response) {console.log("lose beacon sent successfully")});
  }

  function fireWinBeacon(adserverRequestId, adWinId, type) {
    var winBeaconUrl = BEACON_HOST;// + "arid=" + adserverRequestId + "&awid=" + adWinId + "&type=" + type + "&foo=bar";
    winBeaconUrl = utils.tryAppendQueryString(winBeaconUrl, "arid", adserverRequestId);
    winBeaconUrl = utils.tryAppendQueryString(winBeaconUrl, "awid", adWinId);
    winBeaconUrl = utils.tryAppendQueryString(winBeaconUrl, "type", type);
    winBeaconUrl = utils.tryAppendQueryString(winBeaconUrl, "foo", "bar");
    winBeaconUrl = appendEnvFields(winBeaconUrl);

    httpGetAsync(winBeaconUrl, function(response) {console.log("win beacon sent successfully")});
  }


  function appendEnvFields(url) {
    url = utils.tryAppendQueryString(url, 'hbVersion', '$prebid.version$');
    url = utils.tryAppendQueryString(url, 'strVersion', STR_VERSION);
    url = utils.tryAppendQueryString(url, 'hbSource', 'prebid');

    return url;
  }

  function httpGetAsync(theUrl, callback)
  {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
      console.log("ready state: " + xmlHttp.readyState);
      console.log("status: " + xmlHttp.status);
      if (xmlHttp.readyState == 4) {// && xmlHttp.status == 200) {
        callback(xmlHttp.responseText);
      }
    }
    console.log(theUrl);
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
  }

  return {
    callBids: _callBids
  };
};

module.exports = SharethroughAdapter;

