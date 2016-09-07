var utils = require('../utils.js');
var adloader = require('../adloader.js');
//var bidmanager = require('../bidmanager.js');
//var bidfactory = require('../bidfactory.js');

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

  function _callBids(params) {
    var bids = params.bids,
        scriptUrl,
        callback = _callback,
        cacheRequest = false;

    // cycle through bids
    for (var i = 0; i < bids.length; i += 1) {
      scriptUrl = _buildSharethroughCall(bids[i]);
      adloader.loadScript(scriptUrl, callback, cacheRequest);
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
    console.log(arguments);


    // If the bid is valid: Use bidfactory.createBid(1) to create the bidObject.
    // If the bid is invalid (no fill or error): Use bidfactory.createBid(2) to create the bidObject.
    // bidmanager.addBidResponse(adUnitCode, bidObject);
  }

  return {
    callBids: _callBids
  };
};

module.exports = SharethroughAdapter;

