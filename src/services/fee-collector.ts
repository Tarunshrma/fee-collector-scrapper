import { BlockTag } from '@ethersproject/abstract-provider';
import {ChainConfig} from '../types/types';
import FeeCollectorInterface from './interfaces/fee-collector-interface';
import { ethers } from 'ethers';
import {FeeCollector__factory} from '../../lifi-contract-types'

/**
 * FeeCollector class
 * @implements FeeCollectorInterface
 */
export class FeeCollector implements FeeCollectorInterface{
    private config: ChainConfig;
    private jsonProvider: ethers.JsonRpcProvider;

    constructor(config: ChainConfig){
        this.config = config;
        this.jsonProvider = new ethers.JsonRpcProvider(this.config.rpc_url)
    }
    
    public async fetchFees(): Promise<void>{
        await this.fetchHistoricalBlocks()
    }

    /**
     * Fetch historical blocks from target blockchain
    */
    private async fetchHistoricalBlocks(): Promise<void>{
        //const current_block = ethers
        const current_block = await this.jsonProvider.getBlockNumber();
        const start_block = current_block - this.config.block_batch_size;
        console.log(`Fetching fees from block ${start_block} to ${current_block}`);
        const events = await this.loadFeeCollectorEvents(start_block, current_block)
        console.log(events)
    }

    /**
     * For a given block range all `FeesCollected` events are loaded from the Polygon FeeCollector
     * @param fromBlock
     * @param toBlock
     */
     private async loadFeeCollectorEvents (fromBlock: BlockTag, toBlock: BlockTag): Promise<ethers.EventLog[]>  {

        // const blockNumber = await provider.getBlockNumber();
        // console.log(blockNumber)
        const interfaces = new ethers.Interface(FeeCollector__factory.abi)
        const feeCollector = new ethers.Contract(this.config.contract_address, interfaces, this.jsonProvider)
        const filter = feeCollector.filters.FeesCollected()
        let events = await feeCollector.queryFilter(filter, fromBlock, toBlock)
        return events as ethers.EventLog[]
     }
  

}