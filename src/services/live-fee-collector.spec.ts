import EventEmitter from 'events';
import { MockFeesCollectorAdapter } from '../test-helpers/mock-fee-collector';
import { LiveFeeCollector } from './live-fee-collector';


describe('LiveFeeCollector', () => {
    let mockFeeCollectorAdapter: MockFeesCollectorAdapter;
    let liveFeeCollector: LiveFeeCollector;

  beforeEach(() => {
    const dummyConfig = {} as any; 

    mockFeeCollectorAdapter = new MockFeesCollectorAdapter(dummyConfig);

    const eventEmitter = new EventEmitter();
    liveFeeCollector = new LiveFeeCollector(dummyConfig,eventEmitter,mockFeeCollectorAdapter);
  });

  // const mockFeeCollector = new MockFeesCollectorAdapter(dummyConfig);

  it('should instantiate liveFeeCollector correctly', () => {
    expect(liveFeeCollector).toBeInstanceOf(LiveFeeCollector);
  });
});
