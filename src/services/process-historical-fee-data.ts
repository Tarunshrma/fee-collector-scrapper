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
import { ChainConfig } from "../types/types";

/**
 * ProcessHistoricalFeeData class
 */
export class ProcessHistoricalFeeData {

    private pendingOperations:string[] = []
    private fetchHandle: NodeJS.Timeout | null = null;
    private feeRepository: FeeRepositoryInterface;
    private cache: CacheInterface;
    private updateInterval:number;

    constructor(private eventEmitter: EventEmitter, private chainConfig: ChainConfig){
        this.feeRepository = container.resolve<FeeRepositoryInterface>('FeeRepositoryInterface');
        this.cache = container.resolve<CacheInterface>('CacheInterface');

        this.updateInterval = this.chainConfig.historicalFeeBatchInsertIntervalInSeconds || Constants.HISTORICAL_BATCH_INSERT_INTERVAL_SEC;
        this.subscribeEvents()
        this.loadDownloadedFilesForProcessing()
    }

    /**
     * load downloaded files for processing if there is any pending files in data folder
     * This is to handle the case where the service is restarted
     */
    private loadDownloadedFilesForProcessing(){
        try{
            const files = fs.readdirSync(Constants.DATA_LOGS_PATH)
            //extract block number from the file name and add to pending operations
            files.map((file) => {
                const blockNumber = file.split('.')[0]
                this.pendingOperations.push(blockNumber)

                console.log(`Adding block ${blockNumber} to pending operations`)
            });
        }catch(e){
            logger.warn("[loadDownloadedFilesForProcessing]:error loading downloaded files for processing", e)
        }
    }

    /**
     * Subscribe to events
     */
    private subscribeEvents(){
        this.eventEmitter.on(Constants.EVENT_BLOCKS_SAVED, (filePath: any) => {
            this.pendingOperations.push(filePath)
        });

        if (this.fetchHandle !== null) clearInterval(this.fetchHandle);
        this.fetchHandle = setInterval(this.processPendingOperations.bind(this), this.updateInterval * 1000);

        if (!fs.existsSync(Constants.BACKUP_DATA_PATH)) {
            fs.mkdirSync(Constants.BACKUP_DATA_PATH, { recursive: true });
        }
    }

    /**
     * Process pending operations
     */
    private async processPendingOperations(){
        if(this.pendingOperations.length > 0){
            
            const blockNumber = this.pendingOperations.pop();
            const filePath = path.join(Constants.DATA_LOGS_PATH, `${blockNumber}.json`);

            if (filePath === undefined) return;

            //FIXME: Need to investigate why the file is not getting created
            if (fs.existsSync(filePath) === false) {
                logger.error(`file ${filePath} does not exist`)
                return
            }

            const readerStream = fs.createReadStream(filePath,'utf8')
            let parsedData:any = ""

            readerStream.on('data', (chunk: any) => {
                if (chunk !== undefined){
                    parsedData = parsedData + chunk
                }
            });

            readerStream.on('close', async () => {
                // delete the file
                let data = []
                try{
                    data = JSON.parse(parsedData)
                }catch(e){
                    logger.error(`error parsing json ${filePath} adding back to process queue to retry`, e)
                    this.pendingOperations.push(blockNumber!)
                    return
                }
                
                await this.feeRepository.storeFee(data)   
                //save the backward cursor in cache
                await this.cache.setValue(Constants.BACKWARD_CURSOR_REDIS_KEY,blockNumber);
                
                logger.debug(`Block file ${blockNumber} processed successfully`)
                //TODO: For now we are moving the file to backup, in production we can move it to S3 bucket
                fs.rename(filePath, path.join(Constants.BACKUP_DATA_PATH, `backup-${path.basename(filePath)}`), (err) => {
                    if (err) throw err;
                    //logger.debug('File moved to backup');
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