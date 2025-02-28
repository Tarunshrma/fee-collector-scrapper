import {ChainConfig, ParsedFeeCollectedEvents, RawEventLogs} from '../types/types';
import FeeCollectorInterface from './interfaces/fee-collector-interface';
import logger from '../utils/logger';
import EventEmitter from 'node:events';
import fs from 'fs';
import path from 'path';
import { Constants } from '../utils/constants';
import Web3AdapterInterface from './interfaces/web3-adapter-interface';
import { LiveFeeCollector } from './live-fee-collector';


const DATA_LOGS_PATH = path.join("./", 'data');

/**
 * FeeCollector class
 * @implements FeeCollectorInterface
 */
export class FeeCollector implements FeeCollectorInterface{
    private backwardCursor: number = 0;
    private forwardCursor: number = 0;

    private setup_complete: boolean = false;

    private liveFeeCollector:LiveFeeCollector;

    constructor(private config: ChainConfig,
        private eventEmitter: EventEmitter,
        private web3AdapterInterface:Web3AdapterInterface<RawEventLogs, ParsedFeeCollectedEvents>){
        this.config = config;

        this.liveFeeCollector = new LiveFeeCollector(this.config, this.eventEmitter, this.web3AdapterInterface)
    }

    public async setup(): Promise<void>{
        try{
            //
            //TODO: Implement redis cache & Load the forward and backward cursors from redis cache
            //WORKAROUND: Setting up cursors to start from the current block
            const current_block = await this.web3AdapterInterface.getLatestBlockNumber();
            this.backwardCursor = current_block;
            this.forwardCursor = current_block + 1;

            if (!fs.existsSync(DATA_LOGS_PATH)) {
                fs.mkdirSync(DATA_LOGS_PATH, { recursive: true });
            }

            this.setup_complete = true;
        }catch(error){
            logger.error(`Error setting up fee collector: ${error}`)
        }
    }
    
    public async fetchFees(): Promise<void>{
        if(!this.setup_complete){
            throw new Error('Fee collector setup not complete');
        }
        //<------- backward cursor
        //await this.fetchHistoricalBlocks()

        //foward cursor ------->
        await this.fetchLiveBlocks()
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

            //fetch events from the blockchain until the seed block
            while(this.backwardCursor > this.config.start_block){
                //fetch events in batches
                const start_block = this.backwardCursor - this.config.block_batch_size;

                //fetch events from the blockchain
                const rawEvents = await this.web3AdapterInterface.fetchRawFeesCollectedEvents(start_block, this.backwardCursor) as RawEventLogs[]
                
                //if events are found, parse and save them
                if(rawEvents.length > 0){
                    this.saveParsedEvents(start_block.toString(), rawEvents)
                }
                
                //update the backward cursor
                this.backwardCursor = start_block;
            }
        }catch(error){
            logger.error(`[fetchHistoricalBlocks]: Error fetching historical blocks: ${error}`)
            throw error
        }
    }

    /**
    * Save parsed events to a file
    * @param fromBlock
    */
    private async  saveParsedEvents (fromBlock: string,rawEvents : RawEventLogs[]): Promise<void> {
        try{
            const filePath = path.join(DATA_LOGS_PATH, `${fromBlock}.json`);
            const writerStream = fs.createWriteStream(filePath)
            const parsedEvents = await this.web3AdapterInterface.parseRawBlocks(rawEvents)
            writerStream.end(JSON.stringify(parsedEvents))
            this.eventEmitter.emit(Constants.EVENT_BLOCKS_SAVED, filePath);
        }catch(error){
            logger.error(`[saveParsedEvents]: Error saving parsed events: ${error}`)
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
    }
}