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
          placementKey: PKEY
        }
      }
    ]
}
*/

var SharethroughAdapter = function SharethroughAdapter() {

  function _callBids(params) {
    var bids = params.bids,
        scriptUrl,
        callback = _callback,  // Create callback function
        cacheRequest = false;

    // cycle through bids
    for (var i = 0; i < bids.length; i += 1) {
      scriptUrl = _buildSharethroughCall(bids[i]);
      adloader.loadScript(scriptUrl, callback, cacheRequest);
    }

    return 'foo';
  }

  function _buildSharethroughCall(bid) {
    var pkey = utils.getBidIdParamater('pkey', bid.params),
      uri = '//btlr.sharethrough.com/v4',
      url = document.location.protocol + uri;

    url = utils.tryAppendQueryString(url, 'placement_key', pkey);
    return url;
  }

  function _callback() {
    console.log(arguments);
  }

  return {
    callBids: _callBids
  };
};

module.exports = SharethroughAdapter;

