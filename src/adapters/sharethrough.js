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

var SharethroughAdapter = function SharethroughAdapter() {

  function _callBids(params) {
    var bids = params.bids,
        scriptUrl,
        cacheRequest = false;

    // cycle through bids
    for (var i = 0; i < bids.length; i += 1) {
      var bidRequest = bids[i];
      scriptUrl = _buildSharethroughCall(bidRequest);
      adloader.loadScript(scriptUrl);
    }
  }

  // TODO: change to STX endpoint once it exists
  function _buildSharethroughCall(bid) {
    // var pkey = utils.getBidIdParamater('pkey', bid.params),
    //   uri = '//btlr.sharethrough.com/v4?',
    //   url = document.location.protocol + uri;

    var url = "http://localhost:9292/prebid/v1?";
    url = utils.tryAppendQueryString(url, 'bid_id', bid.bidId);
    // url = utils.tryAppendQueryString(url, 'placement_key', pkey);
    // url = utils.tryAppendQueryString(url, 'bidId', bidId);
    url = utils.tryAppendQueryString(url, 'callback', '$$PREBID_GLOBAL$$.strcallback');
    // url = utils.tryAppendQueryString(url, 'v', '$prebid.version$');
    // url = url.slice(0, -1);
    return url;
  }

  $$PREBID_GLOBAL$$.strcallback = function(bidResponse) {
    var bidJson = JSON.parse(bidResponse);
    var bidId = bidJson.creatives[0].bidId;
    let bid, bidObj = utils.getBidRequest(bidId);
    console.log(bidJson);
      try {
        var windowLocation = `str_response_${bidId}`;
        var pkey = utils.getBidIdParamater('pkey', bidObj.params);
        console.log("pkey" + pkey);
        bid = bidfactory.createBid(1, bidObj);
        bid.bidderCode = 'sharethrough';
        bid.cpm = bidJson.creatives[0].cpm;
        const size = bidObj.sizes[0];
        bid.width = size[0];
        bid.height = size[1];
        bid.ad = `<div data-str-native-key="${pkey}" data-stx-response-name='${windowLocation}'></div><script>var ${windowLocation} = ${bidResponse}</script><script src="//native.sharethrough.com/assets/sfp.js"></script>`;
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

