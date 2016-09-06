import Adapter from '../../../src/adapters/sharethrough';
import adloader from '../../../src/adloader';

describe('sharethrough adapter', () => {

  let adapter;
  let sandbox;

  const bidderRequest = {
    bids: [
      {
        bidder: 'sharethrough',
        params: {
          pkey: 'aaaa1111'
        }
      },
      {
        bidder: 'sharethrough',
        params: {
          pkey: 'bbbb2222'
        }
      }
    ]
  };

  beforeEach(() => {
    adapter = new Adapter();
    sandbox = sinon.sandbox.create();
  });

  describe('callBids', () => {

    let firstBidUrl;
    let secondBidUrl;

    beforeEach(() => {
      sandbox.stub(adloader, 'loadScript');


    });

    it('should call loadScript on the adloader for each bid', () => {

      adapter.callBids(bidderRequest);

      firstBidUrl = adloader.loadScript.firstCall.args[0];
      secondBidUrl = adloader.loadScript.secondCall.args[0];

      sinon.assert.calledTwice(adloader.loadScript);

      expect(firstBidUrl).to.contain('http://btlr.sharethrough.com/v4?placement_key=aaaa1111');
      expect(secondBidUrl).to.contain('http://btlr.sharethrough.com/v4?placement_key=bbbb2222');
    });
  });
});
