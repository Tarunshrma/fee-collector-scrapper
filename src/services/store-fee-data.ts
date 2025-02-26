/**
 * FeeCollector class
 * @implements HistoricalFeeCollector
 */

import EventEmitter from "node:events";
import { Constants } from "../utils/constants";
import logger from "../utils/logger";

export class StoreFeeData {
    constructor(private eventEmitter: EventEmitter){
        this.subscribeEvents()
    }

    private subscribeEvents(){
        this.eventEmitter.on(Constants.EVENT_BLOCKS_SAVED, (data: any) => {
            logger.info(`Received event: ${data}`);
        });
    }
}