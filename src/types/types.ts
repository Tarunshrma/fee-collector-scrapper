import {BigNumber} from '@ethersproject/bignumber';
import { ethers } from 'ethers';

/**
 * ChainConfig type
 * @typedef {Object} ChainConfig
 * @property {string} contract_address - Contract address to fetch fees from
 * @property {string} rpc_url - RPC URL to fetch fees from
 * @property {string} secondary_rpc_url - Secondary RPC URL to use in case primary RPC URL fails
 * @property {string} start_block - Block number to start fetching fees from
 * @property {number} block_batch_size - Number of blocks to fetch in a single batch
 */
type ChainConfig = {
    contract_address: string,
    rpc_url: string,
    secondary_rpc_url: string,
    start_block: number,
    block_batch_size: number
}

/**
 * ParsedFeeCollectedEvents type
 * @typedef {Object} ParsedFeeCollectedEvents
 * @property {string} token - the address of the token that was collected
 * @property {string} integrator - the integrator that triggered the fee collection
 * @property {BigNumber} integratorFee - the share collector for the integrator
 * @property {BigNumber} lifiFee - the share collected for lifi
 * @property {BigNumber} totalFee - the total fee collected
 */
type ParsedFeeCollectedEvents = {
    token: string;
    integrator: string;
    integratorFee: string;
    lifiFee: string;
}


//Here we are defining the type of the raw events that we are fetching from the blockchain
//For other libraries like web3.js, the type of the raw events might be different
//For ethers.js, the type of the raw events is ethers.EventLog
type RawEventLogs  = ethers.EventLog

export {ChainConfig, ParsedFeeCollectedEvents, RawEventLogs};