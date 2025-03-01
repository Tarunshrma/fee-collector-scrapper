import { promises } from "dns"
import logger from "../utils/logger"
import { RawEventLogs } from "../types/types"
import { FeeRepositoryInterface } from "./interfaces/fee-repository-interface";
import { container } from "tsyringe";

export abstract class BaseFeeCollector {
    protected cursor: number = -1;
    protected feeRepository: FeeRepositoryInterface; 
    
    constructor(protected config: any, protected eventEmitter: any, protected web3AdapterInterface: any) {
        this.feeRepository = container.resolve<FeeRepositoryInterface>('FeeRepositoryInterface');
    } 

    protected async collectFee(from: number, to: number): Promise<void>{
        try{
            //fetch events from the blockchain
            const rawEvents = await this.web3AdapterInterface.fetchRawFeesCollectedEvents(from, to) as RawEventLogs[]
                
            //if events are found, parse and save them
            this.saveParsedEvents(from.toString(), rawEvents)
        }catch(error){
            logger.error(`[collectFee]: Error setting up fee collector: ${error}`)
            throw error
        }
    }

    /**
     * Abstract method to save parsed events
     * @param startBlock 
     * @param rawEvents 
     */
    protected abstract saveParsedEvents(startBlock: string, rawEvents: RawEventLogs[]): void

    /**
     * 
     * @param cursor Start the fee service
     */
    public abstract start(cursor:number): void

    /**
     * Stop the fee service and clean up resources
     */
    public abstract stop(): void
}