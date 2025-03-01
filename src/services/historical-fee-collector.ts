import { container } from "tsyringe";
import { RawEventLogs } from "../types/types";
import { Constants } from "../utils/constants";
import logger from "../utils/logger";
import { BaseFeeCollector } from "./base-fee-collector";
import fs from 'fs';
import path from 'path';
import { CacheInterface } from "./interfaces/cahce-inerface";

//TODO: Move it to somewhere else
const DATA_LOGS_PATH = path.join("./", 'data');

export class HistoricalFeeCollector extends BaseFeeCollector {
    
    constructor(protected config: any, 
        protected eventEmitter: any, 
        protected web3AdapterInterface: any){
            super(config, eventEmitter, web3AdapterInterface)
    } 

    public async start(cursor: number): Promise<void> {
        this.cursor = cursor;

        if (!fs.existsSync(DATA_LOGS_PATH)) {
            fs.mkdirSync(DATA_LOGS_PATH, { recursive: true });
        }

        //fetch historical fees
        await this.fetchHistoricalFees()
    }

    /**
     * Fetch Historical fees from target blockchain
     */
    private async fetchHistoricalFees(): Promise<void>{
        try{
            if (this.cursor === -1) {
                throw new Error('Cursor not set');
            }

            //fetch events from the blockchain until the seed block
            while(this.cursor > this.config.start_block){
                //fetch events in batches
                const start_block = this.cursor - this.config.block_batch_size;
                await this.collectFee(start_block, this.cursor)
                //update the backward cursor
                this.cursor = start_block;
            }
            
        }catch(error){
            throw error
        }
    }

    /**
    * Save parsed events to a file
    * @param fromBlock
    */
    protected async saveParsedEvents(startBlock: string, rawEvents: RawEventLogs[]): Promise<void> {
        try{
            const filePath = path.join(DATA_LOGS_PATH, `${startBlock}.json`);
            const writerStream = fs.createWriteStream(filePath)

            //save the parsed events to a file
            // if(rawEvents.length > 0){
            const parsedEvents = await this.web3AdapterInterface.parseRawBlocks(rawEvents)
            writerStream.end(JSON.stringify(parsedEvents))
            this.eventEmitter.emit(Constants.EVENT_BLOCKS_SAVED, filePath);
            // }
        }catch(error){
            logger.error(`[saveParsedEvents]: Error saving parsed events: ${error}`)
            throw error
        }
    } 

    /**
     * Stop the fee service and clean up resources
     */
    public stop(): void {
        //No need to stop the service
        logger.info('Stopping historical fee collector service')
    }
    
}