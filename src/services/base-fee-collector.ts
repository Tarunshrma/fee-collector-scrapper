import { promises } from "dns"
import logger from "../utils/logger"
import { RawEventLogs } from "../types/types"

export abstract class BaseFeeCollector {
  constructor(protected config: any, protected eventEmitter: any, protected web3AdapterInterface: any) {

  } 

    protected async collectFee(from: number, to: number): Promise<void>{
    try{
            //fetch events from the blockchain
            const rawEvents = await this.web3AdapterInterface.fetchRawFeesCollectedEvents(from, to) as RawEventLogs[]
                
            //if events are found, parse and save them
            if(rawEvents.length > 0){
                this.saveParsedEvents(from.toString(), rawEvents)
            }else{
                logger.debug(`No fees collected from block ${from} to ${to}`)
            }
    }catch(error){
        logger.error(`Error setting up fee collector: ${error}`)
        throw error
    }
    }

    /**
     * Abstract method to save parsed events
     * @param startBlock 
     * @param rawEvents 
     */
    protected abstract saveParsedEvents(startBlock: string, rawEvents: RawEventLogs[]): void
}