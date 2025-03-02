import { container } from "tsyringe";
import { RawEventLogs } from "../types/types";
import logger from "../utils/logger";
import { BaseFeeCollector } from "./base-fee-collector";
import { CacheInterface } from "./interfaces/cahce-inerface";
import { Constants } from "../utils/constants";

/**
 * Live fee collector service
 */
export class LiveFeeCollector extends BaseFeeCollector{
   
    private fetchHandle: NodeJS.Timeout | null = null;
    
    constructor(protected config: any, 
                    protected eventEmitter: any, 
                    protected web3AdapterInterface: any){
        super(config, eventEmitter, web3AdapterInterface)
    } 

    public start(cursor:number){
        this.cursor = cursor;
        if (this.fetchHandle !== null) clearInterval(this.fetchHandle);

        const update_interval = this.config.live_fee_fetch_interval_in_seconds || Constants.DEFAULT_LIVE_BLOCK_FETCH_INTERVAL_SEC;
        this.fetchHandle = setInterval(this.fetchLiveFees.bind(this), update_interval * 1000);
    }

    /**
     * Fetch live fees from target blockchain
     */
    private async fetchLiveFees(): Promise<void>{
        try{
            if (this.cursor === -1) {
                throw new Error('Cursor not set');
            }

            //Get live block number
            const latestBlock = await this.web3AdapterInterface.getLatestBlockNumber()
            if (latestBlock < this.cursor) {
                logger.info('No new blocks found')
                return
            }

            console.log(`Fetching live fees from ${this.cursor} to ${latestBlock}`)
            //fetch live blocks from the blockchain
            await this.collectFee(this.cursor,latestBlock)
            this.cursor = latestBlock + 1
        }catch(error){
            throw error
        }
    }

    /**
     * 
     * @param startBlock method to save parsed events
     * @param rawEvents 
     */
    protected async saveParsedEvents(startBlock: string, rawEvents: RawEventLogs[]): Promise<void> {
        try{
            const parsedEvents = await this.web3AdapterInterface.parseRawBlocks(rawEvents)

            //Save the parsed events to a database and then store the cursor in cache
            await this.feeRepository.storeFee(parsedEvents)
            
            //TODO: Save the parsed events to a database and then store the cursor in cache
            const cache = container.resolve<CacheInterface>('CacheInterface');
            await cache.setValue(Constants.FORWARD_CURSOR_REDIS_KEY,startBlock);
    
        }catch(error){
            throw error
        }
    }

    /**
     * Stop the fee service and clean up resources
     */
    public stop(): void {
        logger.info('Stopping live fee collector service')
        if (this.fetchHandle !== null) clearInterval(this.fetchHandle);

    }
}