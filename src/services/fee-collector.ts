import {ChainConfig, ParsedFeeCollectedEvents, RawEventLogs} from '../types/types';
import FeeCollectorInterface from './interfaces/fee-collector-interface';
import logger from '../utils/logger';
import EventEmitter from 'node:events';
import Web3AdapterInterface from './interfaces/web3-adapter-interface';
import { LiveFeeCollector } from './live-fee-collector';
import { HistoricalFeeCollector } from './historical-fee-collector';

/**
 * FeeCollector class
 * @implements FeeCollectorInterface
 */
export class FeeCollector implements FeeCollectorInterface{
    private backwardCursor: number = 0;
    private forwardCursor: number = 0;

    private setup_complete: boolean = false;

    private liveFeeCollector:LiveFeeCollector;
    private historicalFeeCollector:HistoricalFeeCollector;

    constructor(private config: ChainConfig,
        private eventEmitter: EventEmitter,
        private web3AdapterInterface:Web3AdapterInterface<RawEventLogs, ParsedFeeCollectedEvents>){

        this.liveFeeCollector = new LiveFeeCollector(this.config, this.eventEmitter, this.web3AdapterInterface)
        this.historicalFeeCollector = new HistoricalFeeCollector(this.config, this.eventEmitter, this.web3AdapterInterface)
    }

    public async setup(): Promise<void>{
        try{
            //
            //TODO: Implement redis cache & Load the forward and backward cursors from redis cache
            //WORKAROUND: Setting up cursors to start from the current block
            const current_block = await this.web3AdapterInterface.getLatestBlockNumber();
            this.backwardCursor = current_block;
            this.forwardCursor = current_block + 1;

            this.setup_complete = true;
        }catch(error){
            logger.error(`Error setting up fee collector: ${error}`)
        }
    }
    
    /**
     * Fetch fees from target blockchain
     */
    public async fetchFees(): Promise<void>{
        if(!this.setup_complete){
            throw new Error('Fee collector setup not complete');
        }
        await Promise.all(
            [
                this.fetchHistoricalBlocks(),
                this.fetchLiveBlocks()
            ]
        )
    }


    /**
     * Fetch live blocks from target blockchain
    */
    private async fetchLiveBlocks(): Promise<void>{
        try{
            if(!this.setup_complete){
                throw new Error('Fee collector setup not complete');
            }
            
            this.liveFeeCollector.start(this.forwardCursor)

        }catch(error){
            logger.error(`[fetchLiveBlocks]: Error fetching live blocks: ${error}`)
            throw error
        }
    }

    /**
     * Fetch historical blocks from target blockchain
    */
    private async fetchHistoricalBlocks(): Promise<void>{
        try{

            if(!this.setup_complete){
                throw new Error('Fee collector setup not complete');
            }
            this.historicalFeeCollector.start(this.backwardCursor)
        }catch(error){
            logger.error(`[fetchHistoricalBlocks]: Error fetching historical blocks: ${error}`)
            throw error
        }
    }
    

    //TODO: Implement stop method
    /**
     * Stop the fee collector service and clean up resources
     */
    public stop(): void {
        if(!this.setup_complete){
            throw new Error('Fee collector setup not complete');
        }
        logger.info('Stopping fee collector service')
        this.historicalFeeCollector.stop();
        this.liveFeeCollector.stop();
    }
}