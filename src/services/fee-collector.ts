import ChainConfig from '../types/types';
import FeeCollectorInterface from './interfaces/fee-collector-interface';

/**
 * FeeCollector class
 * @implements FeeCollectorInterface
 */
export class FeeCollector implements FeeCollectorInterface{
    private config: ChainConfig;
    constructor(config: ChainConfig){
        this.config = config;
    }
    
    fetchFees(): Promise<void>{
        throw new Error('Method not implemented.');
    }

}