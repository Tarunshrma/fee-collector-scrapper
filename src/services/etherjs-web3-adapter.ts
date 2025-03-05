import { ethers } from "ethers";
import { ChainConfig, RawEventLogs } from "../types/types";
import {FeeCollector__factory} from '../../lifi-contract-types'
import {BigNumber} from '@ethersproject/bignumber';

import Web3AdapterInterface from "./interfaces/web3-adapter-interface";
import logger from "../utils/logger";

/**
 * EtherJSWeb3Adapter class
 * @implements Web3AdapterInterface
 */
//TODO: If time allow try to make it more generic 
export class EtherJSFeesCollectorAdapter<Event extends RawEventLogs,Type> implements Web3AdapterInterface<Event,Type> {
    private jsonProvider: ethers.JsonRpcProvider;
    private feeCollectorContract: ethers.Contract;
    private feeCollectorFilter: ethers.DeferredTopicFilter;

    constructor(private feeCollectorconfig: ChainConfig){

        this.feeCollectorconfig = feeCollectorconfig;
        this.jsonProvider = new ethers.JsonRpcProvider(this.feeCollectorconfig.rpc_url)

        const feeCollectorInterface = new ethers.Interface(FeeCollector__factory.abi)
        this.feeCollectorContract = new ethers.Contract(this.feeCollectorconfig.contract_address, feeCollectorInterface, this.jsonProvider)
        this.feeCollectorFilter = this.feeCollectorContract.filters.FeesCollected()
    }

    public async fetchRawFeesCollectedEvents(from:number ,to :number): Promise<Event[]>{
        try{
            const rawEvents = await this.feeCollectorContract.queryFilter(this.feeCollectorFilter, from, to) as Event[]
            return rawEvents;
        }catch(error){
            logger.error(`[fetchRawFeesCollectedEvents]: Error fetching blocks: ${error}`)
            throw error
        }
    }

    public async parseRawBlocks(rawBlocksEvent:Event[]): Promise<Type[]>{
        try{
            const parsedEvents: Type[] = []
            rawBlocksEvent.forEach(event => {
                const parsedEvent = this.feeCollectorContract.interface.parseLog(event)
                if (parsedEvent !== null) {
                    const feesCollected: Type = {
                        token: parsedEvent.args[0],
                        integrator: parsedEvent.args[1],
                        integratorFee: BigNumber.from(parsedEvent.args[2]).toString(),
                        lifiFee: BigNumber.from(parsedEvent.args[3]).toString(),
                    } as Type
                    parsedEvents.push(feesCollected)
                }
            });
            return parsedEvents
        }catch(error){
            logger.error(`[parseRawBlocks]: Error parsing fee collector events: ${error}`)
            throw error
        }
    }

    public async getLatestBlockNumber(): Promise<number> {
        const currentBlock = await this.jsonProvider.getBlockNumber();
        return currentBlock;
    }
} 