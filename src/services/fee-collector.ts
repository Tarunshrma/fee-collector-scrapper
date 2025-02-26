import { BlockTag } from '@ethersproject/abstract-provider';
import {ChainConfig, ParsedFeeCollectedEvents} from '../types/types';
import FeeCollectorInterface from './interfaces/fee-collector-interface';
import { ethers, EventLog } from 'ethers';
import {FeeCollector__factory} from '../../lifi-contract-types'
import logger from '../utils/logger';
import {BigNumber} from '@ethersproject/bignumber';
import fs from 'fs';
import stream from 'stream';
import path from 'path';


const DATA_LOGS_PATH = path.join("./", 'data');
/**
 * FeeCollector class
 * @implements FeeCollectorInterface
 */
export class FeeCollector implements FeeCollectorInterface{
    private config: ChainConfig;
    private jsonProvider: ethers.JsonRpcProvider;

    private backwardCursor: number = 0;
    private forwardCursor: number = 0;

    //TODO: Inject EVM liberary to interact with blockchain as dependency
    constructor(config: ChainConfig){
        this.config = config;
        this.jsonProvider = new ethers.JsonRpcProvider(this.config.rpc_url)
    }

    public async setup(): Promise<void>{
        try{
            //
            //TODO: Implement redis cache & Load the forward and backward cursors from redis cache
            //WORKAROUND: Setting up cursors to start from the current block
            const current_block = await this.jsonProvider.getBlockNumber();
            this.backwardCursor = current_block;
            this.forwardCursor = current_block + 1;

            if (!fs.existsSync(DATA_LOGS_PATH)) {
                fs.mkdirSync(DATA_LOGS_PATH, { recursive: true });
            }
        }catch(error){
            logger.error(`Error setting up fee collector: ${error}`)
        }
    }
    
    public async fetchFees(): Promise<void>{
        //<------- backward cursor
        await this.fetchHistoricalBlocks()
    }

    /**
     * Fetch historical blocks from target blockchain
    */
    private async fetchHistoricalBlocks(): Promise<void>{
        try{

            const interfaces = new ethers.Interface(FeeCollector__factory.abi)
            const feeCollector = new ethers.Contract(this.config.contract_address, interfaces, this.jsonProvider)
            const filter = feeCollector.filters.FeesCollected()

            //fetch events from the blockchain until the seed block
            while(this.backwardCursor > this.config.start_block){
                //fetch events in batches
                const start_block = this.backwardCursor - this.config.block_batch_size;
                logger.debug(`Fetching event from block ${start_block} to ${this.backwardCursor}`);
                
                //fetch events from the blockchain
                const rawEvents = await feeCollector.queryFilter(filter, start_block, this.backwardCursor) as EventLog[]
                
                //if events are found, parse and save them
                if(rawEvents.length > 0){
                    this.saveParsedEvents(start_block.toString(), rawEvents, feeCollector)
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
    * Takes a list of raw events and parses them into ParsedFeeCollectedEvents
    * @param events
    */
    private async  parseFeeCollectorEvents (events: ethers.EventLog[], feeCollectorContract: ethers.Contract): Promise<ParsedFeeCollectedEvents[]> {
        try{
            let parsedEvents: ParsedFeeCollectedEvents[] = []
            events.forEach(event => {
                const parsedEvent = feeCollectorContract.interface.parseLog(event)
                if (parsedEvent !== null) {
                    const feesCollected: ParsedFeeCollectedEvents = {
                        token: parsedEvent.args[0],
                        integrator: parsedEvent.args[1],
                        integratorFee: BigNumber.from(parsedEvent.args[2]),
                        lifiFee: BigNumber.from(parsedEvent.args[3]),
                    }
                    parsedEvents.push(feesCollected)
                }
            });
            return parsedEvents
        }catch(error){
            logger.error(`[parseFeeCollectorEvents]: Error parsing fee collector events: ${error}`)
            throw error
        }
    }

    /**
    * Save parsed events to a file
    * @param fromBlock
    */
    private async  saveParsedEvents (fromBlock: string,rawEvents : ethers.EventLog[], feeCollector: ethers.Contract): Promise<void> {
        try{
            const filePath = path.join(DATA_LOGS_PATH, `${fromBlock}.json`);
            const writerStream = fs.createWriteStream(filePath)
            const parsedEvents = await this.parseFeeCollectorEvents(rawEvents, feeCollector)
            writerStream.end(JSON.stringify(parsedEvents))
        }catch(error){
            logger.error(`[saveParsedEvents]: Error saving parsed events: ${error}`)
            throw error
        }
    } 
}