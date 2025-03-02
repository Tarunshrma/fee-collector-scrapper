// fee-collector.spec.ts
import "reflect-metadata"
import EventEmitter from 'node:events';
import { FeeCollector } from './fee-collector';
import { MockCache, MockFeeRepository, MockFeesCollectorAdapter } from '../test-helpers/mock-classes';
import { container } from "tsyringe";
import { FeeRepositoryInterface } from "./interfaces/fee-repository-interface";
import { CacheInterface } from "./interfaces/cahce-inerface";

describe('FeeCollector', () => {

  let mockFeeCollector: MockFeesCollectorAdapter;
  let feeCollector: FeeCollector;

  beforeEach(() => {
    const dummyConfig = {} as any; 

    // Clear previous registrations to avoid side effects
    container.clearInstances();
    // Register the mock implementation for FeeRepositoryInterface
    container.registerInstance<FeeRepositoryInterface>('FeeRepositoryInterface', new MockFeeRepository());
    container.registerInstance<CacheInterface>('CacheInterface', new MockCache());

    mockFeeCollector = new MockFeesCollectorAdapter(dummyConfig);

    const eventEmitter = new EventEmitter();
    feeCollector = new FeeCollector(dummyConfig,eventEmitter,mockFeeCollector);
    (feeCollector as any).setup_complete = true;

  });

  afterEach(() => {
    // Stop any asynchronous operations (e.g., interval timers)
    (feeCollector as any).setup_complete = true;
    feeCollector.stop();
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
  // it('should throw "Fee collector setup not complete" calling stop without setup', async () => {
  //   (feeCollector as any).setup_complete = true;
  //   await expect(feeCollector.stop()).rejects.toThrow('Fee collector setup not complete');
  // });

});
