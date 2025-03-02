import EventEmitter from 'events';
import { HistoricalFeeCollector } from './historical-fee-collector';
import { MockCache, MockFeeRepository, MockFeesCollectorAdapter } from '../test-helpers/mock-classes';
import { container } from 'tsyringe';
import { FeeRepositoryInterface } from './interfaces/fee-repository-interface';
import { CacheInterface } from './interfaces/cahce-inerface';


describe('HistoricalFeeCollector', () => {
    let mockFeeCollectorAdapter: MockFeesCollectorAdapter;
    let historyFeeCollector: HistoricalFeeCollector;

  beforeEach(() => {
    const dummyConfig = {} as any; 

    // Clear previous registrations to avoid side effects
    container.clearInstances();
    // Register the mock implementation for FeeRepositoryInterface
    container.registerInstance<FeeRepositoryInterface>('FeeRepositoryInterface', new MockFeeRepository());
    container.registerInstance<CacheInterface>('CacheInterface', new MockCache());

    mockFeeCollectorAdapter = new MockFeesCollectorAdapter(dummyConfig);

    const eventEmitter = new EventEmitter();
    historyFeeCollector = new HistoricalFeeCollector(dummyConfig,eventEmitter,mockFeeCollectorAdapter);
  });

  // const mockFeeCollector = new MockFeesCollectorAdapter(dummyConfig);

  it('should instantiate historyFeeCollector correctly', () => {
    expect(historyFeeCollector).toBeInstanceOf(HistoricalFeeCollector);
  });

  it('should call protected method `fetchHistoricalFees` on calling start', async () => {
    //Given
    const fetchHistoricalFeesSpy = jest.spyOn(historyFeeCollector as any, 'fetchHistoricalFees');
    const backwardCursor = 100;
    
    //When
    await historyFeeCollector.start(backwardCursor);

    //Then
    expect((historyFeeCollector as any).cursor).toBe(backwardCursor);
    expect(fetchHistoricalFeesSpy).toHaveBeenCalled();
  }) 
});
