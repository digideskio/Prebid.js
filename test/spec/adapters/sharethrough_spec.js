import Adapter from '../../../src/adapters/sharethrough';

describe('sharethrough adapter', () => {

  let adapter;
  //let sandbox;

  beforeEach(() => {
    adapter = new Adapter();
    //sandbox = sinon.sandbox.create();
  });

  describe('callBids', () => {
    it('should return foo', () => {
      let result = adapter.callBids();
      expect(result).to.equal('foo');
    });
  });
});
