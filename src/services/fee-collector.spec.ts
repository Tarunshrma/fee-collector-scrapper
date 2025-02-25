// fee-collector.spec.ts
import { FeeCollector } from './fee-collector';

describe('FeeCollector', () => {
  const dummyConfig = {} as any; 

  it('should instantiate FeeCollector correctly', () => {
    const feeCollector = new FeeCollector(dummyConfig);
    expect(feeCollector).toBeInstanceOf(FeeCollector);
  });

  it('should throw "Method not implemented." error on fetchFees', async () => {
    const feeCollector = new FeeCollector(dummyConfig);
    await expect(feeCollector.fetchFees()).rejects.toThrow('Method not implemented.');
  });
});
