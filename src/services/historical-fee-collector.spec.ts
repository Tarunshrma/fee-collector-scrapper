import EventEmitter from 'events';
import { MockFeesCollectorAdapter } from '../test-helpers/mock-fee-collector';
import { HistoricalFeeCollector } from './historical-fee-collector';


describe('FeeCollector', () => {
    let mockFeeCollectorAdapter: MockFeesCollectorAdapter;
    let historyFeeCollector: HistoricalFeeCollector;

  beforeEach(() => {
    const dummyConfig = {} as any; 

    mockFeeCollectorAdapter = new MockFeesCollectorAdapter(dummyConfig);

    const eventEmitter = new EventEmitter();
    historyFeeCollector = new HistoricalFeeCollector(dummyConfig,eventEmitter,mockFeeCollectorAdapter);
  });

  // const mockFeeCollector = new MockFeesCollectorAdapter(dummyConfig);

  it('should instantiate historyFeeCollector correctly', () => {
    expect(historyFeeCollector).toBeInstanceOf(HistoricalFeeCollector);
  });

  it('should call protected method `fetchHistoricalFees` on calling start', async () => {
    const fetchHistoricalFeesSpy = jest.spyOn(historyFeeCollector as any, 'fetchHistoricalFees');
    await historyFeeCollector.start(100);
    expect(fetchHistoricalFeesSpy).toHaveBeenCalled();
  }) 
});
