// fee-collector.spec.ts
import EventEmitter from 'node:events';
import { FeeCollector } from './fee-collector';
import { EtherJSFeesCollectorAdapter } from './etherjs-web3-adapter';
import Web3AdapterInterface from './interfaces/web3-adapter-interface';
import { ChainConfig, ParsedFeeCollectedEvents, RawEventLogs } from '../types/types';

// Mocking the Web3AdapterInterface
class MockFeesCollectorAdapter implements Web3AdapterInterface<RawEventLogs, ParsedFeeCollectedEvents>{
  constructor(private feeCollectorconfig: ChainConfig){}

  public async fetchRawFeesCollectedEvents(from:number ,to :number): Promise<RawEventLogs[]>{
      return [];
  }

  public async parseRawBlocks(rawBlocksEvent:RawEventLogs[]): Promise<ParsedFeeCollectedEvents[]>{
      return []
  }

  public async getLatestBlockNumber(): Promise<number> {
      return 0;
  }
} 


describe('FeeCollector', () => {
  const dummyConfig = {} as any; 
  const eventEmitter = new EventEmitter();
  const mockFeeCollector = new MockFeesCollectorAdapter(dummyConfig);

  it('should instantiate FeeCollector correctly', () => {
    const feeCollector = new FeeCollector(dummyConfig,eventEmitter,mockFeeCollector);
    expect(feeCollector).toBeInstanceOf(FeeCollector);
  });

  // it('should throw "Method not implemented." error on fetchFees', async () => {
  //   const feeCollector = new FeeCollector(dummyConfig,eventEmitter,etherJSFeeCollector);
  //   await expect(feeCollector.fetchFees()).rejects.toThrow('Method not implemented.');
  // });
});
