/**
 * FeeCollector class
 * @implements HistoricalFeeCollector
 */

import EventEmitter from "node:events";
import { Constants } from "../utils/constants";
import logger from "../utils/logger";
import fs from 'fs';
import path from "node:path";
import { FeeRepositoryInterface } from "./interfaces/fee-repository-interface";
import { container } from "tsyringe";
import { CacheInterface } from "./interfaces/cahce-inerface";


const UPDATE_INTERVAL = 1000 * 2; // Every 2 seconds

export class ProcessHistoricalFeeData {

    private pendingOperations:string[] = []
    private fetchHandle: NodeJS.Timeout | null = null;
    private feeRepository: FeeRepositoryInterface;
    private cache: CacheInterface;

    constructor(private eventEmitter: EventEmitter){
        this.feeRepository = container.resolve<FeeRepositoryInterface>('FeeRepositoryInterface');
        this.cache = container.resolve<CacheInterface>('CacheInterface');

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

        if (!fs.existsSync(Constants.BACKUP_DATA_PATH)) {
            fs.mkdirSync(Constants.BACKUP_DATA_PATH, { recursive: true });
        }
    }

    /**
     * Process pending operations
     */
    private async processPendingOperations(){
        if(this.pendingOperations.length > 0){
            
            const block_number = this.pendingOperations.pop();
            const filePath = path.join(Constants.DATA_LOGS_PATH, `${block_number}.json`);

            if (filePath === undefined) return;

            const readerStream = fs.createReadStream(filePath,'utf8')
            let parsed_data:any = ""

            readerStream.on('data', (chunk: any) => {
                if (chunk !== undefined){
                    parsed_data = parsed_data + chunk
                }
            });

            readerStream.on('close', async () => {
                // delete the file
                let data = []
                try{
                    data = JSON.parse(parsed_data)
                }catch(e){
                    logger.error(`error parsing json ${filePath} adding back to process queue to retry`, e)
                    this.pendingOperations.push(block_number!)
                    return
                }
                
                await this.feeRepository.storeFee(data)   
                //save the backward cursor in cache
                await this.cache.setValue(Constants.BACKWARD_CURSOR_REDIS_KEY,block_number);
                
                logger.debug("data reading finished, move the file to backup, a seperate location like S3 bucket")
                //TODO: For now we are moving the file to backup, in production we can move it to S3 bucket
                fs.rename(filePath, path.join(Constants.BACKUP_DATA_PATH, `backup-${path.basename(filePath)}`), (err) => {
                    if (err) throw err;
                    logger.debug('File moved to backup');
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