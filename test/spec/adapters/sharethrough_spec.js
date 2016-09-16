import { expect } from 'chai';
import Adapter from '../../../src/adapters/sharethrough';
import adloader from '../../../src/adloader';
import bidManager from '../../../src/bidmanager';

describe('sharethrough adapter', () => {

  let adapter;
  let sandbox;
  let bidsRequestedOriginal;

  const bidderRequest = {
    bidderCode: 'sharethrough',
    bids: [
      {
        bidder: 'sharethrough',
        bidId: 'bidId1',
        sizes: [[600,300]],
        placementCode: 'foo',
        params: {
          pkey: 'aaaa1111'
        }
      },
      {
        bidder: 'sharethrough',
        bidId: 'bidId2',
        sizes: [[700,400]],
        placementCode: 'bar',
        params: {
          pkey: 'bbbb2222'
        }
      }
    ]
  };

  beforeEach(() => {
    adapter = new Adapter();
    sandbox = sinon.sandbox.create();
    bidsRequestedOriginal = pbjs._bidsRequested;
    pbjs._bidsRequested = [];
  });

  afterEach(() => {
    sandbox.restore();

    pbjs._bidsRequested = bidsRequestedOriginal;
  });

  describe('callBids', () => {

    let firstBidUrl;
    let secondBidUrl;

    beforeEach(() => {
      // sandbox.spy(adapter, 'loadIframe');
    });

    it('should call loadIframe on the adloader for each bid', () => {

      adapter.callBids(bidderRequest);

      firstBidUrl = adloader.loadScript.firstCall.args[0];
      secondBidUrl = adloader.loadScript.secondCall.args[0];

      // sinon.assert.calledTwice(adloader.loadScript);

      expect(firstBidUrl).to.not.contain('http://btlr.sharethrough.com/v4?placement_key=aaaa1111');
      // expect(secondBidUrl).to.contain('http://btlr.sharethrough.com/v4?placement_key=bbbb2222');
    });
  });

  describe('strcallback', () => {

    it('should exist and be a function', () => {
      let shit = sandbox.stub(pbjs, 'strcallback');
      expect(pbjs.strcallback).to.exist.and.to.be.a('function');
    });

  });

  describe('bid requests', () => {

    let firstBid;
    let secondBid;

    beforeEach(() => {
      sandbox.stub(bidManager, 'addBidResponse');

      pbjs._bidsRequested.push(bidderRequest);

      // respond

      let bidderReponse1 = {"adserverRequestId":"40b6afd5-6134-4fbb-850a-bb8972a46994","placement":{"articlesBeforeFirstAd":null,"placementAttributes":{"child_placement_key":null,"strOptOutUrl":"https://platform-cdn.sharethrough.com/privacy-policy?language=EN","ad_server_key":"","dfp_path":"","strOptOutIcon":true,"promoted_by_text":"Ad by","site_key":"1ab1a1f102398fe72f2074f5","direct_sell_promoted_by_text":"Promoted by","allow_dynamic_cropping":true,"third_party_partners":[],"ad_server_path":"","template":"&lt;article class=&quot;post has-thumbnail related-article str-adunit&quot; style=&quot;background-color: rgb(238, 238, 238);&quot;&gt; &lt;a name=&quot;&amp;amp;lpos=EarthBox&quot; class=&quot;photo ui-link str-thumbnail&quot; style=&quot;background-image:url({{thumbnail_url}});background-position-x: 50%;&quot; id=&quot;{{creative_key}}-0&quot;&gt; &lt;span&gt;{{title}}&lt;/span&gt; &lt;/a&gt; &lt;div class=&quot;inner-post&quot;&gt; &lt;h3 class=&quot;headline&quot;&gt; &lt;a name=&quot;&amp;amp;lpos=EarthBox&quot; class=&quot;ui-link&quot; id=&quot;{{creative_key}}-1&quot;&gt;{{title}}&lt;/a&gt; &lt;/h3&gt; &lt;div class=&quot;dek&quot;&gt;{{promoted_by_text}} {{advertiser}}&lt;/div&gt; &lt;/div&gt; &lt;!-- #### DO NOT REMOVE #### --&gt; &lt;!-- ~~~~ script tag test ~~~~ --&gt; &lt;script&gt; console.log(&apos;script test from bakery, yo!! ;)&apos;) &lt;/script&gt; &lt;/article&gt;","featured_content":null,"backfillTag":"","enable_link_redirection":false,"publisher_key":"f805d446"},"allowInstantPlay":false,"status":"pre-live","metadata":{},"layout":"multiple_manual","articlesBetweenAds":null},"bidId":"bidId1","creatives":[{"cpm":12.34,"creative":{"advertiser_key":"","force_click_to_play":false,"creative_key":"sam-45217bdd","impression_html":"","campaign_key":"a1aca5e80f272d9a9be1b810","description":"Brands, trading desks and agencies can purchase native ads through the same AppNexus workflow that they currently use for display and video ad buys.","media_url":"http://nativeadvertising.com/an-announcement-for-those-who-said-native-advertising-couldnt-scale/","custom_engagement_action":"","instant_play_mobile_count":null,"share_url":"http://nativeadvertising.com/an-announcement-for-those-who-said-native-advertising-couldnt-scale/","variant_key":"124501","instant_play_mobile_url":null,"advertiser":"Sharethrough","beacons":{"visible":[],"play":[],"completed_silent_play":[],"thirty_second_silent_play":[],"silent_play":[],"fifteen_second_silent_play":[],"click":[],"ten_second_silent_play":[],"impression":[]},"custom_engagement_url":"","thumbnail_url":"//str-assets.imgix.net/m/creative_thumbnails/68973/images/thumb_320/appnexus-image.jpg?w=320&h=250&auto=format&fit=crop","brand_logo_url":"//static.sharethrough.com/sam/campaigns/8496/brand_logos/mobile/sharethrough-mark.png","source_id":"sam","title":"An Announcement For Those Who Said Native Advertising Couldn't Scale","icon_url":null,"custom_engagement_label":"","action":"clickout"},"auctionWinId":"b2882d5e-bf8b-44da-a91c-0c11287b8051","version":1}],"stxUserId":""};
      let bidderReponse2 = {"adserverRequestId":"40b6afd5-6134-4fbb-850a-bb8972a46994","placement":{"articlesBeforeFirstAd":null,"placementAttributes":{"child_placement_key":null,"strOptOutUrl":"https://platform-cdn.sharethrough.com/privacy-policy?language=EN","ad_server_key":"","dfp_path":"","strOptOutIcon":true,"promoted_by_text":"Ad by","site_key":"1ab1a1f102398fe72f2074f5","direct_sell_promoted_by_text":"Promoted by","allow_dynamic_cropping":true,"third_party_partners":[],"ad_server_path":"","template":"&lt;article class=&quot;post has-thumbnail related-article str-adunit&quot; style=&quot;background-color: rgb(238, 238, 238);&quot;&gt; &lt;a name=&quot;&amp;amp;lpos=EarthBox&quot; class=&quot;photo ui-link str-thumbnail&quot; style=&quot;background-image:url({{thumbnail_url}});background-position-x: 50%;&quot; id=&quot;{{creative_key}}-0&quot;&gt; &lt;span&gt;{{title}}&lt;/span&gt; &lt;/a&gt; &lt;div class=&quot;inner-post&quot;&gt; &lt;h3 class=&quot;headline&quot;&gt; &lt;a name=&quot;&amp;amp;lpos=EarthBox&quot; class=&quot;ui-link&quot; id=&quot;{{creative_key}}-1&quot;&gt;{{title}}&lt;/a&gt; &lt;/h3&gt; &lt;div class=&quot;dek&quot;&gt;{{promoted_by_text}} {{advertiser}}&lt;/div&gt; &lt;/div&gt; &lt;!-- #### DO NOT REMOVE #### --&gt; &lt;!-- ~~~~ script tag test ~~~~ --&gt; &lt;script&gt; console.log(&apos;script test from bakery, yo!! ;)&apos;) &lt;/script&gt; &lt;/article&gt;","featured_content":null,"backfillTag":"","enable_link_redirection":false,"publisher_key":"f805d446"},"allowInstantPlay":false,"status":"pre-live","metadata":{},"layout":"multiple_manual","articlesBetweenAds":null},"bidId":"bidId2","creatives":[{"cpm":12.35,"creative":{"advertiser_key":"","force_click_to_play":false,"creative_key":"sam-45217bdd","impression_html":"","campaign_key":"a1aca5e80f272d9a9be1b810","description":"Brands, trading desks and agencies can purchase native ads through the same AppNexus workflow that they currently use for display and video ad buys.","media_url":"http://nativeadvertising.com/an-announcement-for-those-who-said-native-advertising-couldnt-scale/","custom_engagement_action":"","instant_play_mobile_count":null,"share_url":"http://nativeadvertising.com/an-announcement-for-those-who-said-native-advertising-couldnt-scale/","variant_key":"124501","instant_play_mobile_url":null,"advertiser":"Sharethrough","beacons":{"visible":[],"play":[],"completed_silent_play":[],"thirty_second_silent_play":[],"silent_play":[],"fifteen_second_silent_play":[],"click":[],"ten_second_silent_play":[],"impression":[]},"custom_engagement_url":"","thumbnail_url":"//str-assets.imgix.net/m/creative_thumbnails/68973/images/thumb_320/appnexus-image.jpg?w=320&h=250&auto=format&fit=crop","brand_logo_url":"//static.sharethrough.com/sam/campaigns/8496/brand_logos/mobile/sharethrough-mark.png","source_id":"sam","title":"An Announcement For Those Who Said Native Advertising Couldn't Scale","icon_url":null,"custom_engagement_label":"","action":"clickout"},"auctionWinId":"b2882d5e-bf8b-44da-a91c-0c11287b8051","version":1}],"stxUserId":""};

      pbjs.strcallback(bidderReponse1);
      pbjs.strcallback(bidderReponse2);

      firstBid = bidManager.addBidResponse.firstCall.args[1];
      secondBid = bidManager.addBidResponse.secondCall.args[1];
    });

    it('should add a bid object for each bid', () => {
      sinon.assert.calledTwice(bidManager.addBidResponse);
    });

    it('should pass the correct placement code as first param', () => {
      let firstPlacementCode = bidManager.addBidResponse.firstCall.args[0];
      let secondPlacementCode = bidManager.addBidResponse.secondCall.args[0];

      expect(firstPlacementCode).to.eql('foo');
      expect(secondPlacementCode).to.eql('bar');
    });

    it('should include the bid request bidId as the adId', () => {
      expect(firstBid).to.have.property('adId', 'bidId1');
      expect(secondBid).to.have.property('adId', 'bidId2');
    });

    it('should have a good statusCode', () => {
      expect(firstBid.getStatusCode()).to.eql(1);
      expect(secondBid.getStatusCode()).to.eql(1);
    });

    it('should add the CPM to the bid object', () => {
      expect(firstBid).to.have.property('cpm', 12.34);
      expect(secondBid).to.have.property('cpm', 12.35);
    });

    it('should add the bidder code to the bid object', () => {
      expect(firstBid).to.have.property('bidderCode', 'sharethrough');
      expect(secondBid).to.have.property('bidderCode', 'sharethrough');
    });

    it('should include the ad on the bid object', () => {
      expect(firstBid).to.have.property('ad');
      expect(secondBid).to.have.property('ad');
    });

    it('should include the size on the bid object', () => {
      expect(firstBid).to.have.property('width', 600);
      expect(firstBid).to.have.property('height', 300);
      expect(secondBid).to.have.property('width', 700);
      expect(secondBid).to.have.property('height', 400);
    });

    it('should include the pkey', () => {
      expect(firstBid).to.have.property('pkey', 'aaaa1111');
      expect(secondBid).to.have.property('pkey', 'bbbb2222');
    });

  });

  describe('bid won handler', () => {

    let fireWinBeaconStub;
    let fireLoseBeaconStub;

    beforeEach(() => {
      var args = [{"bidderCode":"sharethrough","width":600,"height":300,"statusMessage":"Bid available","adId":"23fbe93a90c924","cpm":3.984986853301525,"adserverRequestId":"0eca470d-fcac-48e6-845a-c86483ccaa0c","winId":"1c404469-f7bb-4e50-b6f6-a8eaf0808999","pkey":"xKcxTTHyndFyVx7T8GKSzxPE","ad":"<div data-str-native-key=\"xKcxTTHyndFyVx7T8GKSzxPE\" data-stx-response-name='str_response_23fbe93a90c924'></div><script>var str_response_23fbe93a90c924 = {\"adserverRequestId\":\"0eca470d-fcac-48e6-845a-c86483ccaa0c\",\"placement\":{\"articlesBeforeFirstAd\":null,\"placementAttributes\":{\"child_placement_key\":null,\"strOptOutUrl\":\"https://platform-cdn.sharethrough.com/privacy-policy?language=EN\",\"ad_server_key\":\"\",\"dfp_path\":\"\",\"strOptOutIcon\":true,\"promoted_by_text\":\"Ad by\",\"site_key\":\"SdinGF6f6TjPmqh74grQSXK5\",\"direct_sell_promoted_by_text\":\"Ad By\",\"allow_dynamic_cropping\":true,\"third_party_partners\":[],\"ad_server_path\":\"\",\"template\":\"&lt;div class=&quot;str-adunit str-adunit-desktop {{action}} str-expanded str-card-exp&quot; style=&quot;overflow: hidden; height: auto; clear: both; cursor: pointer; padding-bottom: 20px; margin: 10px 10px; padding: 20px 0;&quot;&gt; &lt;h4 class=&quot;str-title&quot; style=&quot;padding: 0 10px; font-size: 28px; line-height: 1.3;&quot;&gt;{{title}}&lt;/h4&gt; &lt;div class=&quot;str-thumbnail&quot; style=&quot;height: auto; background-size: cover; background-position: 50%; background-repeat: no-repeat; background-color: #eee; background-image: url(&apos;{{thumbnail_url}}&apos;); margin-bottom: 11px; padding-bottom: 56%; margin: 10px 12px;&quot;&gt;&lt;/div&gt; &lt;p style=&quot;margin-bottom: 8px; padding: 0 10px; line-height: 1.6; color: #333333; font-family: &apos;Lucida Grande&apos;, Arial, &apos;Hiragino Kaku Gothic Pro&apos;, Meiryo, &apos;メイリオ&apos;, sans-serif; font-size: 13px;&quot;&gt;{{description}}&lt;/p&gt; &lt;div class=&quot;str-advertiser&quot; style=&quot;font-size: 0.9em; font-weight: bold; padding: 0 10px; margin-bottom: 0; display: inline-block;&quot;&gt;{{promoted_by_text}} {{advertiser}} &lt;div class=&quot;str-brand-logo&quot; style=&quot;display: inline-block; width: 16px; height: 16px; max-width: 16px; max-height: 16px; background-size: cover; background-position: 50%; background-repeat: no-repeat; vertical-align: middle; border: none; background-color: inherit; background-image: url(&apos;{{brand_logo_url}}&apos;); margin-left: 6px;&quot;&gt;&lt;/div&gt; &lt;/div&gt;&lt;style&gt;.str-adunit-desktop .thumbnail-wrapper{height:auto !important;}.str-adunit-desktop .str-opt-out{margin:17px 12px !important;}&lt;/style&gt;&lt;/div&gt;\",\"featured_content\":null,\"backfillTag\":\"\",\"enable_link_redirection\":false,\"publisher_key\":\"6ffac87e\"},\"allowInstantPlay\":true,\"status\":\"live\",\"metadata\":{},\"layout\":\"single\",\"articlesBetweenAds\":null},\"bidId\":\"23fbe93a90c924\",\"creatives\":[{\"cpm\":3.984986853301525,\"creative\":{\"opt_out_text\":\"Will clicking on this just create more ads?\",\"force_click_to_play\":false,\"creative_key\":\"0e8893f90b606c9c5d33f1be-creative-3b\",\"campaign_key\":\"\",\"description\":\"If you can read this you don't need glasses\",\"opt_out_url\":\"http://example.com/opt-out\",\"media_url\":\"http://engineering.sharethrough.com/engineering\",\"share_url\":\"http://engineering.sharethrough.com/engineering\",\"variant_key\":\"\",\"advertiser\":\"Omni Consumer Products\",\"beacons\":{\"play\":[],\"click\":[\"//b-staging.sharethrough.com\",\"//shareth.ru/trackme\"],\"impression\":[],\"visible\":[\"//b-staging.sharethrough.com\"]},\"custom_engagement_url\":\"\",\"thumbnail_url\":\"http://www.cutiekitten.com/uploads/thumbs/6c9c5bc64-1.jpg\",\"brand_logo_url\":\"http://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Gnome-accessories-calculator.svg/48px-Gnome-accessories-calculator.svg.png\",\"source_id\":\"0e8893f90b606c9c5d33f1be\",\"title\":\"Love ads? Then you'll love this!\",\"deal_id\":\"ArgxR5usdJqqXvjL5y1SK7VA\",\"custom_engagement_label\":\"\",\"thumbnail_styles\":[],\"action\":\"clickout\"},\"auctionWinId\":\"1c404469-f7bb-4e50-b6f6-a8eaf0808999\",\"version\":1}],\"stxUserId\":\"\"}</script><script src=\"//native.sharethrough.com/assets/sfp.js\"></script>","requestId":"dd2420bd-cdc2-4c66-8479-f3499ece73da","responseTimestamp":1473983655565,"requestTimestamp":1473983655458,"bidder":"sharethrough","adUnitCode":"div-gpt-ad-1460505748561-0","timeToRespond":107,"pbLg":"3.50","pbMg":"3.90","pbHg":"3.98","pbAg":"3.95","pbDg":"3.95","size":"600x300","adserverTargeting":{"hb_bidder":"sharethrough","hb_adid":"23fbe93a90c924","hb_pb":"3.90","hb_size":"600x300"}}];

      fireWinBeaconStub = sandbox.stub(pbjs, 'fireWinBeacon');
      fireLoseBeaconStub = sandbox.stub(pbjs, 'fireLoseBeacon');

      adapter.bidWon.apply(this, args);
    });

    it('should fire win beacon', () => {
      sinon.assert.notCalled(fireLoseBeaconStub);
      sinon.assert.calledOnce(fireWinBeaconStub);
    });

  });

});
