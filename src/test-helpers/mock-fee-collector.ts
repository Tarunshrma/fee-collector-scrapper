import Web3AdapterInterface from "../services/interfaces/web3-adapter-interface";
import { ChainConfig, ParsedFeeCollectedEvents, RawEventLogs } from "../types/types";

// Mocking the Web3AdapterInterface
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
  