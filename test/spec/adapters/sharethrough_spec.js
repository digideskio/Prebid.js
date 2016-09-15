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

  xdescribe('callBids', () => {

    let firstBidUrl;
    let secondBidUrl;

    beforeEach(() => {
      sandbox.spy(adloader, 'loadScript');
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

  describe('strcallback', () => {

    it('should exist and be a function', () => {
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

});
