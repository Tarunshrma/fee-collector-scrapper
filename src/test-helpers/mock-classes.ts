import { CacheInterface } from "../services/interfaces/cahce-inerface";
import { FeeRepositoryInterface } from "../services/interfaces/fee-repository-interface";
import Web3AdapterInterface from "../services/interfaces/web3-adapter-interface";
import { ChainConfig, ParsedFeeCollectedEvents, RawEventLogs } from "../types/types";

/**
 * MockFeesCollectorAdapter class
 */
export class MockFeesCollectorAdapter implements Web3AdapterInterface<RawEventLogs, ParsedFeeCollectedEvents>{
    constructor(private feeCollectorconfig: ChainConfig){}
  
    public async fetchRawFeesCollectedEvents(_from:number ,_to :number): Promise<RawEventLogs[]>{
        return [];
    }
  
    public async parseRawBlocks(_rawBlocksEvent:RawEventLogs[]): Promise<ParsedFeeCollectedEvents[]>{
        return []
    }
  
    public async getLatestBlockNumber(): Promise<number> {
        return -111;
    }
}

/**
 * MockFeeRepository class
 */
export class MockFeeRepository implements FeeRepositoryInterface {
    public async connect(): Promise<void> {
        return Promise.resolve();
    }
  
    public async disconnect(): Promise<void> {
        return Promise.resolve();
    }
  
    public async storeFee(_fee:ParsedFeeCollectedEvents[]): Promise<boolean> {
        return Promise.resolve(true);
    }
  
    public async getFee(_integrator: string, _page_index: number, _page_size: number): Promise<ParsedFeeCollectedEvents[]> {
        return Promise.resolve([]);;
    }
}

/**
 * MockCache class
 */
export class MockCache implements CacheInterface {
    connect(url: string): Promise<void> {
        return Promise.resolve();
    }
    disconnect(): Promise<void> {
        return Promise.resolve();
    }
    setValue(key: string, value: any): Promise<void> {
        return Promise.resolve();
    }
    deleteValue(key: string): Promise<void> {
        return Promise.resolve();
    }
    getValue(key: string): Promise<string> {
        return Promise.resolve('');
    }
}  