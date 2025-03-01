import EventEmitter from 'events';
import { ProcessHistoricalFeeData } from './process-historical-fee-data';


describe('ProcessHistoricalFeeData', () => {
    let processHistoricalFeeCollector: ProcessHistoricalFeeData;

  beforeEach(() => {
    const eventEmitter = new EventEmitter();
    processHistoricalFeeCollector = new ProcessHistoricalFeeData(eventEmitter);
  });

  it('should instantiate processHistoricalFeeCollector correctly', () => {
    expect(processHistoricalFeeCollector).toBeInstanceOf(ProcessHistoricalFeeData);
  });
});
