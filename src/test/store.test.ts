import Store from '../lib/store';
import * as should from 'should';
import * as sinon from 'sinon';
const sandbox = sinon.sandbox.create();

describe('Store', function () {
  let store: Store;

  beforeEach(function () {
    store = new Store();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('expiration', function () {
    it('should respect store expiration', async function () {
      store = new Store(1000);
      await store.append('1', { id: '1', test: true }, { body: true });
      const aggregation: any = await store.getById('1');
      aggregation.expireAt.should.be.greaterThan(new Date(new Date().getTime() + 999 * 1000));
      aggregation.expireAt.should.be.below(new Date(new Date().getTime() + 1001 * 1000));
    });

    it('should only update expireAt on create not on update', async function () {
      await store.append('1', { id: '1', test: true }, { body: true });
      sandbox.stub(store, 'getExpireAt').returns(Date.now());
      await store.append('1', { id: '1', test: true }, { body: true });
      const aggregation: any = await store.getById('1');
      aggregation.expireAt.should.be.greaterThan(new Date(new Date().getTime() + 60 * 59 * 1000));
      aggregation.expireAt.should.be.below(new Date(new Date().getTime() + 60 * 61 * 1000));
    });
  });

  describe('append', function () {
    it('should append to new store', async function () {
      await store.append('1', { id: '1', test: true }, { body: true });
      const aggregation: any = await store.getById('1');
      aggregation.expireAt.should.be.greaterThan(new Date(new Date().getTime() + 60 * 59 * 1000));
      aggregation.expireAt.should.be.below(new Date(new Date().getTime() + 60 * 61 * 1000));
      aggregation.should.containDeep({
        headers: { id: '1', test: true, status: 'INITIAL', timeoutNum: 0, aggregationNum: 0 },
        body: [{ body: true }]
      });
    });

    it('should append and add headers to existing store', async function () {
      await store.append('1', { id: '1', test: true, another: false }, { body: true });
      await store.append('1', { id: '1', test: false, test2: true }, { body2: true });
      (await store.getById('1')).should.containDeep({
        headers: { id: '1', test: false, status: 'INITIAL', test2: true, another: false },
        body: [{ body: true }, { body2: true }]
      });
    });
  });

  describe('setStatus', function () {
    it('should throw error for non existing record', async function () {
      await store.setStatus('1', 'TEST')
        .then(async d => {
          should.equal(undefined, d);
          should.equal(undefined, await store.getById('1'));
        });
    });

    it('should update status and return', async function () {
      await store.append('1', { id: '1', test: true }, { body: true });
      const cache = await store.setStatus('1', 'TEST');
      cache.should.containDeep({
        headers: { id: '1', test: true, status: 'TEST', aggregationNum: 1, timeoutNum: 0 },
        body: [{ body: true }]
      });
      (await store.getById('1')).should.containDeep(cache);
    });

    it('should update status and timeoutNum', async function () {
      await store.append('1', { id: '1', test: true }, { body: true });
      const cache = await store.setStatus('1', 'TIMEOUT');
      cache.should.containDeep({
        headers: { id: '1', test: true, status: 'TIMEOUT', aggregationNum: 1, timeoutNum: 1 },
        body: [{ body: true }]
      });
      (await store.getById('1')).should.containDeep(cache);
    });

    it('should update status to COMPLETED', async function () {
      await store.append('1', { id: '1', test: true }, { body: true });
      const cache = await store.setStatus('1', 'COMPLETED');
      cache.should.containDeep({
        headers: { id: '1', test: true, status: 'COMPLETED', aggregationNum: 1, timeoutNum: 0 },
        body: [{ body: true }]
      });
    });
  });
});
