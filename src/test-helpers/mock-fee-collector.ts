import Web3AdapterInterface from "../services/interfaces/web3-adapter-interface";
import { ChainConfig, ParsedFeeCollectedEvents, RawEventLogs } from "../types/types";

// Mocking the Web3AdapterInterface
export class MockFeesCollectorAdapter implements Web3AdapterInterface<RawEventLogs, ParsedFeeCollectedEvents>{
    constructor(private feeCollectorconfig: ChainConfig){}
  
    public async fetchRawFeesCollectedEvents(from:number ,to :number): Promise<RawEventLogs[]>{
        return [];
    }
  
    public async parseRawBlocks(rawBlocksEvent:RawEventLogs[]): Promise<ParsedFeeCollectedEvents[]>{
        return []
    }
  
    public async getLatestBlockNumber(): Promise<number> {
        return -111;
    }
  } 
  