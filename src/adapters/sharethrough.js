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
var BEACON_HOST = "//b.sharethrough.com/butler?" //{arid}{awid}{type}
var BIDDER_CODE = "sharethrough"

var SharethroughAdapter = function SharethroughAdapter() {
  const xmlHttp = new XMLHttpRequest();

  function fireWinBeacon(adserverRequestId, adWinId, type) {
    var beaconUrl = document.location.protocol + BEACON_HOST + "arid=" + adserverRequestId + "&awid=" + adWinId + "&type=" + type;
    httpGetAsync(beaconUrl, function(response) {console.log("response: " + response)});
  }

  function httpGetAsync(theUrl, callback)
  {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() { 
          console.log(xmlHttp.status);
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {}
              callback(xmlHttp.responseText);
      }
      console.log(theUrl);
      xmlHttp.open("GET", theUrl, true); // true for asynchronous 
      // xmlHttp.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:9999");
      xmlHttp.send(null);
  }

  var bidWon = function() { //need pkey, adserverRequestId, bidId
    var curBidderCode = arguments[0].bidderCode;
    console.log("winner biddercode: ", curBidderCode);
    console.log(arguments[0]);
    if(curBidderCode != BIDDER_CODE) {
      return;
    }

    fireWinBeacon(arguments[0].adserverRequestId, arguments[0].winId, "prebidWin");
  }

  // var anybidwin = function() {
  //       var curBidderCode = arguments[0].bidderCode;
  //   console.log("winner biddercode: ", curBidderCode);
  // }

  function _callBids(params) {
    var bids = params.bids,
        scriptUrl,
        cacheRequest = false;

    // cycle through bids
    pbjs.onEvent('bidWon', bidWon);
    for (var i = 0; i < bids.length; i += 1) {
      console.log("index " + i);
      var bidRequest = bids[i];
      // pbjs.onEvent('bidWon', anybidwin);
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
    // url = utils.tryAppendQueryString(url, 'v', '$prebid.version$');
    // url = url.slice(0, -1);
    return url;
  }

  $$PREBID_GLOBAL$$.strcallback = function(bidResponse) {
    var bidJson = bidResponse;//JSON.parse(bidResponse);
    var bidId = bidJson.bidId;
    let bidObj = utils.getBidRequest(bidId);
    console.log(bidJson);
      try {
        var windowLocation = `str_response_${bidId}`;
        var pkey = utils.getBidIdParamater('pkey', bidObj.params);
        let bid = bidfactory.createBid(1, bidObj);
        bid.bidderCode = 'sharethrough';
        bid.cpm = 100;//bidJson.creatives[0].cpm;
        const size = bidObj.sizes[0];
        bid.width = size[0];
        bid.height = size[1];
        var bidJsonString = JSON.stringify(bidResponse);
        bid.ad = `<div data-str-native-key="${pkey}" data-stx-response-name='${windowLocation}'></div><script>var ${windowLocation} = ${bidJsonString}</script><script src="//native.sharethrough.com/assets/sfp.js"></script>`;
        bid.adserverRequestId = bidJson.adserverRequestId;
        bid.winId = bidJson.creatives[0].auctionWinId;
        bid.pkey = pkey;
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

