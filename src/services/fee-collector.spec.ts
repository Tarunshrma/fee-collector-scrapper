// fee-collector.spec.ts
import EventEmitter from 'node:events';
import { FeeCollector } from './fee-collector';
// import { EtherJSFeesCollectorAdapter } from './etherjs-web3-adapter';
// import Web3AdapterInterface from './interfaces/web3-adapter-interface';
// import { ChainConfig, ParsedFeeCollectedEvents, RawEventLogs } from '../types/types';
import { MockFeesCollectorAdapter } from '../test-helpers/mock-fee-collector';

describe('FeeCollector', () => {

  let mockFeeCollector: MockFeesCollectorAdapter;
  let feeCollector: FeeCollector;

  beforeEach(() => {
    const dummyConfig = {} as any; 

    mockFeeCollector = new MockFeesCollectorAdapter(dummyConfig);

    const eventEmitter = new EventEmitter();
    feeCollector = new FeeCollector(dummyConfig,eventEmitter,mockFeeCollector);
    (feeCollector as any).setup_complete = true;

  });

  // const mockFeeCollector = new MockFeesCollectorAdapter(dummyConfig);

  it('should instantiate FeeCollector correctly', () => {
    expect(feeCollector).toBeInstanceOf(FeeCollector);
  });

  it('should throw "Fee collector setup not complete" error on fetchFees', async () => {
    (feeCollector as any).setup_complete = false;
    await expect(feeCollector.fetchFees()).rejects.toThrow('Fee collector setup not complete');
  });

  it('internal method fetchHistoricalBlocks should be called on fetchFees ', async () => {
    
    //Setup
    const fetchHistoricalBlocksSpy = jest.spyOn(feeCollector as any, 'fetchHistoricalBlocks');
    const fetchLiveBlocksSpy = jest.spyOn(feeCollector as any, 'fetchLiveBlocks');
    
    await feeCollector.setup();
    await feeCollector.fetchFees();
    
    //Expectations
    expect(fetchHistoricalBlocksSpy).toHaveBeenCalled();
    expect(fetchLiveBlocksSpy).toHaveBeenCalled();
  });

  //FIXME: This test is not working as expected
  it('should throw "Fee collector setup not complete" calling stop without setup', async () => {
    (feeCollector as any).setup_complete = false;
    await expect(feeCollector.stop()).rejects.toThrow('Fee collector setup not complete');
  });

});
