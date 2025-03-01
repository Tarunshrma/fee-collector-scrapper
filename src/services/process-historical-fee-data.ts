/**
 * FeeCollector class
 * @implements HistoricalFeeCollector
 */

import EventEmitter from "node:events";
import { Constants } from "../utils/constants";
import logger from "../utils/logger";
import fs from 'fs';
import path from "node:path";

const BACKUP_DATA_PATH = path.join("./", 'backup');

const UPDATE_INTERVAL = 1000 * 1; // Every 5 seconds

export class ProcessHistoricalFeeData {

    private pendingOperations:string[] = []
    private fetchHandle: NodeJS.Timeout | null = null;

    constructor(private eventEmitter: EventEmitter){
        this.subscribeEvents()
    }



    /**
     * Subscribe to events
     */
    private subscribeEvents(){
        this.eventEmitter.on(Constants.EVENT_BLOCKS_SAVED, (filePath: any) => {
            this.pendingOperations.push(filePath)
        });

        if (this.fetchHandle !== null) clearInterval(this.fetchHandle);
        this.fetchHandle = setInterval(this.processPendingOperations.bind(this), UPDATE_INTERVAL);

        if (!fs.existsSync(BACKUP_DATA_PATH)) {
            fs.mkdirSync(BACKUP_DATA_PATH, { recursive: true });
        }
    }

    /**
     * Process pending operations
     */
    private async processPendingOperations(){
        if(this.pendingOperations.length > 0){
            const filePath = this.pendingOperations.pop();
            if (filePath === undefined) return;

            const readerStream = fs.createReadStream(filePath,'utf8')
            readerStream.on('data', (chunk: any) => {
                console.log("data receieved!")
                // console.log("----------------------------------------------")
                // logger.info(JSON.parse(chunk.toString()))
                // console.log("----------------------------------------------")
            });
            readerStream.on('close', () => {
                // delete the file
                logger.info("data reading finished, move the file to backup, a seperate location like S3 bucket")
                //TODO: For now we are moving the file to backup, in production we can move it to S3 bucket
                fs.rename(filePath, path.join(BACKUP_DATA_PATH, `backup-${path.basename(filePath)}`), (err) => {
                    if (err) throw err;
                    logger.info('File moved to backup');
                });
            })
        }
    }

    /**
     * Stop the fee service and clean up resources
     */
    public stop(): void {
        if (this.fetchHandle !== null) clearInterval(this.fetchHandle);
    }

}