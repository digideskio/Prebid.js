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
      }
    ]
}
*/

var SharethroughAdapter = function SharethroughAdapter() {
  const httpRequest = new XMLHttpRequest();
  let bidId;

  function _callBids(params) {
    var bids = params.bids,
        scriptUrl,
        callback = _callback,
        cacheRequest = false;

    // cycle through bids
    for (var i = 0; i < bids.length; i += 1) {
      bidId = bids[i].bidId;
      scriptUrl = _buildSharethroughCall(bids[i]);
      httpRequest.onreadystatechange = callback;
      httpRequest.open('GET', scriptUrl);
      httpRequest.send();
      //adloader.loadScript(scriptUrl, callback, cacheRequest);
    }
  }

  function _buildSharethroughCall(bid) {
    var pkey = utils.getBidIdParamater('pkey', bid.params),
      uri = '//btlr.sharethrough.com/v4?',
      url = document.location.protocol + uri;

    url = utils.tryAppendQueryString(url, 'placement_key', pkey);
    return url;
  }

  function _callback() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      let bidObj = utils.getBidRequest(bidId),
        bid;
      if (httpRequest.status === 200) {
        try {
          let response = JSON.parse(httpRequest.responseText);
          bid = bidfactory.createBid(1, bidObj);
          bid.bidderCode = 'sharethrough';
          bid.cpm = 1.0;
          bid.width = 700;
          bid.height = 250;
          bid.ad = '<div data-str-native-key="9e987ada"></div><script src="//native.sharethrough.com/assets/sfp.js"></script>';
          bidmanager.addBidResponse(bidObj.placementCode, bid);
        } catch (e) {
        }
      } else {
        console.log('There was a problem with the request.');
      }
    }
    // If the bid is valid: Use bidfactory.createBid(1) to create the bidObject.
    // If the bid is invalid (no fill or error): Use bidfactory.createBid(2) to create the bidObject.
    // bidmanager.addBidResponse(adUnitCode, bidObject);
  }

  function _handleInvalidBid(bidObj) {
    const bid = bidfactory.createBid(2, bidObj);
    bid
  }

  return {
    callBids: _callBids
  };
};

module.exports = SharethroughAdapter;

