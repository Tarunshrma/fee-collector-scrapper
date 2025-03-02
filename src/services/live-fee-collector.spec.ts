import "reflect-metadata"
import EventEmitter from 'events';
import { LiveFeeCollector } from './live-fee-collector';
import { MockCache, MockFeeRepository, MockFeesCollectorAdapter, MockLiveFeeCollector } from '../test-helpers/mock-classes';
import { container } from "tsyringe";
import { FeeRepositoryInterface } from "./interfaces/fee-repository-interface";
import { CacheInterface } from "./interfaces/cahce-inerface";


describe('LiveFeeCollector', () => {
    let mockFeeCollectorAdapter: MockFeesCollectorAdapter;
    let liveFeeCollector: MockLiveFeeCollector;

  beforeEach(() => {
    const dummyConfig = {} as any; 

    // Clear previous registrations to avoid side effects
    container.clearInstances();
    // Register the mock implementation for FeeRepositoryInterface
    container.registerInstance<FeeRepositoryInterface>('FeeRepositoryInterface', new MockFeeRepository());
    container.registerInstance<CacheInterface>('CacheInterface', new MockCache());


    mockFeeCollectorAdapter = new MockFeesCollectorAdapter(dummyConfig);

    const eventEmitter = new EventEmitter();
    liveFeeCollector = new MockLiveFeeCollector(dummyConfig,eventEmitter,mockFeeCollectorAdapter);
  });

  afterEach(() => {
    // Stop any asynchronous operations (e.g., interval timers)
    liveFeeCollector.stop();
  });

  it('should instantiate liveFeeCollector correctly', () => {
      expect(liveFeeCollector).toBeInstanceOf(LiveFeeCollector);
  });

  it('should update the forward cursor on start', () => {
    //Given
    const forwardCursor = 1000; 

    //When
    liveFeeCollector.start(forwardCursor);
    
    //Then
    expect((liveFeeCollector as any).cursor).toBe(forwardCursor);
  });

  //Fixme: This test is not working as expected
  // it('should call `feeRepository storeFee` and cache setValue on calling saveParsedEvents', async () => {
    
  //   //Given
  //   const storeFeeSpy = jest.spyOn(container.resolve<FeeRepositoryInterface>('FeeRepositoryInterface'), 'storeFee');
  //   const cacheSetValueSpy = jest.spyOn(container.resolve<CacheInterface>('CacheInterface'), 'setValue');
  //   const parsedEvents = [] as any;
  //   const start_block = "1";

  //   //When
  //   await liveFeeCollector.saveParsedEvents(start_block, parsedEvents);

  //   //Then
  //   expect(storeFeeSpy).toHaveBeenCalled();
  //   expect(cacheSetValueSpy).toHaveBeenCalled();
  // });

});
