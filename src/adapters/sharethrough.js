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
const STR_BIDDER_CODE = "sharethrough";
//   uri = '//btlr.sharethrough.com/v4?',
const STR_VERSION = "0.1.0";

var SharethroughAdapter = function SharethroughAdapter() {
  const xmlHttp = new XMLHttpRequest();
  var str = new Object();
  str.STR_BTLR_HOST = document.location.protocol + "//btlr.sharethrough.com";//http://localhost:3001"; 
  str.STR_BEACON_HOST = document.location.protocol + "//b.sharethrough.com/butler?";
  str.placementCodeSet = new Set();//placement codes we are competing in

  function _callBids(params) {
    var bids = params.bids,
        scriptUrl,
        cacheRequest = false;

    pbjs.onEvent('bidWon', str.bidWon);

    if (window.addEventListener){
      addEventListener("message", _receiveMessage, false)
    } else {
      attachEvent("onmessage", _receiveMessage)
    }

    // cycle through bids
    for (var i = 0; i < bids.length; i += 1) {
      var bidRequest = bids[i];
      str.placementCodeSet.add(bidRequest.placementCode);
      scriptUrl = _buildSharethroughCall(bidRequest);
      str.loadIFrame(scriptUrl);
    }
  }

  function _buildSharethroughCall(bid) {
    var pkey = utils.getBidIdParamater('pkey', bid.params);

    var url = str.STR_BTLR_HOST + "/header-bid/v1?";
    url = utils.tryAppendQueryString(url, 'bidId', bid.bidId);
    url = utils.tryAppendQueryString(url, 'placement_key', pkey);
    url = utils.tryAppendQueryString(url, 'ijson', '$$PREBID_GLOBAL$$.strcallback');
    url = appendEnvFields(url);

    return url;
  }

  str.loadIFrame = function(url) {
    var iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.cssText = 'display:none;'
    iframe.onload = function() {
      console.log("loaded");
    };    

    document.body.appendChild(iframe);
  }

  function _receiveMessage(event) {
    if(event.origin == str.STR_BTLR_HOST) {
      $$PREBID_GLOBAL$$.strcallback(JSON.parse(event.data).response);
    }
  }

  $$PREBID_GLOBAL$$.strcallback = function(bidResponse) {
    var bidId = bidResponse.bidId;
    let bidObj = utils.getBidRequest(bidId);

    try {
      let bid = bidfactory.createBid(1, bidObj);

      bid.bidderCode = 'sharethrough';
      bid.cpm = bidResponse.creatives[0].cpm;
      const size = bidObj.sizes[0];
      bid.width = size[0];
      bid.height = size[1];
      bid.adserverRequestId = bidResponse.adserverRequestId;
      bid.winId = bidResponse.creatives[0].auctionWinId;

      var pkey = utils.getBidIdParamater('pkey', bidObj.params);
      bid.pkey = pkey;

      var windowLocation = `str_response_${bidId}`;
      var bidJsonString = JSON.stringify(bidResponse);

      bid.ad = `<div data-str-native-key="${pkey}" data-stx-response-name='${windowLocation}'>
                </div>
                <script>var ${windowLocation} = ${bidJsonString}</script>
                <script src="//localhost:3000/assets/sfp-set-targeting.js"></script>
                <script type='text/javascript'>
                (function() {
                    var sfp_js = document.createElement('script');
                    sfp_js.src = "//localhost:3000/assets/sfp.js";
                    sfp_js.type = 'text/javascript';
                    sfp_js.charset = 'utf-8';
                    window.top.document.getElementsByTagName('body')[0].appendChild(sfp_js);
                })();
                </script>`;

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

  str.bidWon = function() { //need pkey, adserverRequestId, bidId
    var curBidderCode = arguments[0].bidderCode;
    if(curBidderCode != STR_BIDDER_CODE && str.placementCodeSet.has(arguments[0].adUnitCode)) {
      str.fireLoseBeacon(curBidderCode, arguments[0].cpm, "headerBidLose");
      return;
    } else if(curBidderCode != STR_BIDDER_CODE) {
      return;
    }

    str.fireWinBeacon(arguments[0].adserverRequestId, arguments[0].winId, "headerBidWin");
  }

  str.fireLoseBeacon = function(winningBidderCode, winningCPM, type) {
    var loseBeaconUrl = str.STR_BEACON_HOST;
    loseBeaconUrl = utils.tryAppendQueryString(loseBeaconUrl, "winnerBidderCode", winningBidderCode);
    loseBeaconUrl = utils.tryAppendQueryString(loseBeaconUrl, "winnerCpm", winningCPM);
    loseBeaconUrl = utils.tryAppendQueryString(loseBeaconUrl, "type", type);
    loseBeaconUrl = appendEnvFields(loseBeaconUrl);

    str.httpGetAsync(loseBeaconUrl, function(response) {console.log("lose beacon sent successfully")});
  }

  str.fireWinBeacon = function(adserverRequestId, adWinId, type) {
    var winBeaconUrl = str.STR_BEACON_HOST;
    winBeaconUrl = utils.tryAppendQueryString(winBeaconUrl, "arid", adserverRequestId);
    winBeaconUrl = utils.tryAppendQueryString(winBeaconUrl, "awid", adWinId);
    winBeaconUrl = utils.tryAppendQueryString(winBeaconUrl, "type", type);
    winBeaconUrl = appendEnvFields(winBeaconUrl);

    str.httpGetAsync(winBeaconUrl, function(response) {console.log("win beacon sent successfully")});
  }


  function appendEnvFields(url) {
    url = utils.tryAppendQueryString(url, 'hbVersion', '$prebid.version$');
    url = utils.tryAppendQueryString(url, 'strVersion', STR_VERSION);
    url = utils.tryAppendQueryString(url, 'hbSource', 'prebid');

    return url;
  }

  str.httpGetAsync = function(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
      if (xmlHttp.readyState == 4) {// && xmlHttp.status == 200) {
        callback(xmlHttp.responseText);
      }
    }
    console.log(theUrl);
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
  }

  return {
    callBids: _callBids,
    str : str,
  };
};

module.exports = SharethroughAdapter;

