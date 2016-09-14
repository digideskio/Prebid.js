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
var BEACON_HOST = document.location.protocol + "//b.sharethrough.com/butler?" //{arid}{awid}{type}
var BIDDER_CODE = "sharethrough"

var SharethroughAdapter = function SharethroughAdapter() {
  const xmlHttp = new XMLHttpRequest();
  var placementCodeSet = new Set(); //placement codes we are competing in

  function fireWinBeacon(adserverRequestId, adWinId, type) {
    var winBeaconUrl = BEACON_HOST;// + "arid=" + adserverRequestId + "&awid=" + adWinId + "&type=" + type + "&foo=bar";
    winBeaconUrl = utils.tryAppendQueryString(winBeaconUrl, "arid", adserverRequestId);
    winBeaconUrl = utils.tryAppendQueryString(winBeaconUrl, "awid", adWinId);
    winBeaconUrl = utils.tryAppendQueryString(winBeaconUrl, "type", type);
    winBeaconUrl = utils.tryAppendQueryString(winBeaconUrl, "foo", "bar");

    httpGetAsync(winBeaconUrl, function(response) {console.log("win beacon sent successfully")});
  }

  function fireLoseBeacon(winningBidderCode, winningCPM, type)
  {
    var loseBeaconUrl = BEACON_HOST;
    loseBeaconUrl = utils.tryAppendQueryString(loseBeaconUrl, "winner_bidder_code", winningBidderCode);
    loseBeaconUrl = utils.tryAppendQueryString(loseBeaconUrl, "winner_cpm", winningCPM);
    loseBeaconUrl = utils.tryAppendQueryString(loseBeaconUrl, "type", type);

    httpGetAsync(loseBeaconUrl, function(response) {console.log("lose beacon sent successfully")});
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

  var bidWon = function() { //need pkey, adserverRequestId, bidId
    var curBidderCode = arguments[0].bidderCode;
    console.log(arguments[0]);
    console.log("winner biddercode: ", curBidderCode);
    if(curBidderCode != BIDDER_CODE && placementCodeSet.has(arguments[0].adUnitCode)) {
      fireLoseBeacon(curBidderCode, arguments[0].cpm, "headerBidLose");
      return;
    } else if(curBidderCode != BIDDER_CODE) {
      return;
    }

    fireWinBeacon(arguments[0].adserverRequestId, arguments[0].winId, "headerBidWin");
  }

  function _callBids(params) {
    var bids = params.bids,
        scriptUrl,
        cacheRequest = false;

    console.log(params);
    pbjs.onEvent('bidWon', bidWon);

    // cycle through bids
    for (var i = 0; i < bids.length; i += 1) {
      var bidRequest = bids[i];
      placementCodeSet.add(bidRequest.placementCode);

      scriptUrl = _buildSharethroughCall(bidRequest);
      adloader.loadScript(scriptUrl);
    }
  }

  // TODO: change to STX endpoint once it exists
  function _buildSharethroughCall(bid) {
    var pkey = utils.getBidIdParamater('pkey', bid.params);
    //   uri = '//btlr.sharethrough.com/v4?',
    //   url = document.location.protocol + uri;

    var url = "http://localhost:3001/prebid/v1?";
    console.log(bid.bidId)
    url = utils.tryAppendQueryString(url, 'bid_id', bid.bidId);
    url = utils.tryAppendQueryString(url, 'placement_key', pkey);
    url = utils.tryAppendQueryString(url, 'ijson', '$$PREBID_GLOBAL$$.strcallback');
    url = utils.tryAppendQueryString(url, 'prebid_v', '$prebid.version$');
    // url = url.slice(0, -1);
    return url;
  }

  $$PREBID_GLOBAL$$.strcallback = function(bidResponse) {
    var bidId = bidResponse.bidId;
    let bidObj = utils.getBidRequest(bidId);
    console.log(bidResponse);
      try {
        let bid = bidfactory.createBid(1, bidObj);

        bid.bidderCode = 'sharethrough';
        bid.cpm = bidResponse.creatives[0].cpm;
        const size = bidObj.sizes[0];
        bid.width = size[0];
        bid.height = size[1];
        bid.adserverRequestId = bidResponse.adserverRequestId;
        bid.winId = bidResponse.creatives[0].auctionWinId;
        bid.pkey = pkey;

        var windowLocation = `str_response_${bidId}`;
        var bidJsonString = JSON.stringify(bidResponse);
        var pkey = utils.getBidIdParamater('pkey', bidObj.params);
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

  return {
    callBids: _callBids
  };
};

module.exports = SharethroughAdapter;

