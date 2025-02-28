import { RawEventLogs } from "../types/types";
import logger from "../utils/logger";
import { BaseFeeCollector } from "./base-fee-collector";

//TODO: Move it to somewhere else
const UPDATE_INTERVAL = 1000 * 5; // Every 5 seconds

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
        this.fetchHandle = setInterval(this.fetchLiveFees.bind(this), UPDATE_INTERVAL);
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
        const parsedEvents = await this.web3AdapterInterface.parseRawBlocks(rawEvents)
        console.log(parsedEvents)
    }

    /**
     * Stop the fee service and clean up resources
     */
    public stop(): void {
        logger.info('Stopping live fee collector service')
        if (this.fetchHandle !== null) clearInterval(this.fetchHandle);

    }
}