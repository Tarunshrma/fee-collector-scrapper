import { ethers } from 'ethers';

/**
 * ChainConfig type
 * @typedef {Object} ChainConfig
 * @property {string} contract_address - Contract address to fetch fees from
 * @property {string} rpcUrl - RPC URL to fetch fees from
 * @property {string} secondaryRpcUrl - Secondary RPC URL to use in case primary RPC URL fails
 * @property {string} seedBlock - oldest block number till which to fetch fees
 * @property {number} blockBatchSize - Number of blocks to fetch in a single batch
 * @property {number} liveFeeFetchIntervalInSeconds - Interval in seconds to fetch live fees
 * @property {number} historicalFeeBatchInsertIntervalInSeconds - Interval in seconds to insert historical fees
 */
type ChainConfig = {
    contractAddress: string,
    rpcUrl: string,
    secondaryRpcUrl: string,
    seedBlock: number,
    blockBatchSize: number
    liveFeeFetchIntervalInSeconds: number,
    historicalFeeBatchInsertIntervalInSeconds: number
}

/**
 * ParsedFeeCollectedEvents type
 * @typedef {Object} ParsedFeeCollectedEvents
 * @property {string} token - the address of the token that was collected
 * @property {string} integrator - the integrator that triggered the fee collection
 * @property {string} integratorFee - the share collector for the integrator
 * @property {string} lifiFee - the share collected for lifi
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