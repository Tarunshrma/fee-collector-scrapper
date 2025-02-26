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
            while(this.backwardCursor > this.config.start_block){
                const start_block = this.backwardCursor - this.config.block_batch_size;
                logger.debug(`Fetching event from block ${start_block} to ${this.backwardCursor}`);
                const events = await this.loadFeeCollectorEvents(start_block, this.backwardCursor)
                this.backwardCursor = start_block;
            }
        }catch(error){
            logger.error(`[fetchHistoricalBlocks]: Error fetching historical blocks: ${error}`)
            throw error
        }
    }

    /**
     * For a given block range all `FeesCollected` events are loaded from the Polygon FeeCollector
     * @param fromBlock
     * @param toBlock
     */
     private async loadFeeCollectorEvents (fromBlock: BlockTag, toBlock: BlockTag): Promise<void>  {
        const filePath = path.join(DATA_LOGS_PATH, `${fromBlock}.json`);
        const writerStream = fs.createWriteStream(filePath)
        
        if (!writerStream) {
            throw new Error(`[loadFeeCollectorEvents]: Error creating write stream for file: ${filePath}`)
        }

        try{
            const interfaces = new ethers.Interface(FeeCollector__factory.abi)
            const feeCollector = new ethers.Contract(this.config.contract_address, interfaces, this.jsonProvider)
            const filter = feeCollector.filters.FeesCollected()
            const events = await feeCollector.queryFilter(filter, fromBlock, toBlock) as EventLog[]
            writerStream.write(JSON.stringify(events))
        }catch(error){
            logger.error(`[loadFeeCollectorEvents]: Error loading fee collector events: ${error}`)
            throw error
        }finally{
            writerStream.end()
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
        
        // return events.map(async (event) => {
        //     const parsedEvent = feeCollectorContract.interface.parseLog(event)
        //     if (parsedEvent !== null) {
        //         const feesCollected: ParsedFeeCollectedEvents = {
        //             token: parsedEvent.args[0],
        //             integrator: parsedEvent.args[1],
        //             integratorFee: BigNumber.from(parsedEvent.args[2]),
        //             lifiFee: BigNumber.from(parsedEvent.args[3]),
        //         }
        //     }
        // }
    }
  

}